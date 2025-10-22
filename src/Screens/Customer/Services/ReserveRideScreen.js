import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  TextInput,
  Dimensions,
  Image,
  AsyncStorage, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { Colors } from '../../../Themes/MyColors';
import MapViewComponent from '../../../Components/MapView';
import ModalHeader from '../../../Components/ModalHeader';
import PickupTimeBottomSheet from '../../../Components/PickupTimeModal';
import PassengerBottomSheet from '../../../Components/PassengerBottomSheet';
import LocationService from '../../../services/LocationService';
import DestinationItem from '../../../Components/DestinationItem';
import { GOOGLE_MAPS_API_KEY } from '../../../Config/constants';
import { ScrollView } from 'react-native-gesture-handler';

const { width: screenWidth } = Dimensions.get('window');

export default function ReserveRideScreen({ navigation, route }) {
  // Get service type from route params
  const { serviceType = 'Ride' } = route?.params || {};

  // Bottom sheet refs
  const bottomSheetRef = useRef(null);
  const pickupTimeBottomSheetRef = useRef(null);
  const passengerBottomSheetRef = useRef(null);
  const mapRef = useRef(null);

  // State for current location
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentLocationText, setCurrentLocationText] = useState('Detecting location...');
  const [currentLocationCoordinates, setCurrentLocationCoordinates] = useState('');
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);
  const [locationWatchId, setLocationWatchId] = useState(null);

  // State for destination
  const [destination, setDestination] = useState(null);
  const [destinationText, setDestinationText] = useState('');

  // State for route info
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);

  // State for pickup time
  const [selectedPickupTime, setSelectedPickupTime] = useState(serviceType === 'Ride' ? 'now' : 'later');

  // State for passenger selection
  const [selectedPassenger, setSelectedPassenger] = useState('for_me');

  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => ['62%', '95%'], []);

  // Load saved destinations from AsyncStorage
  useEffect(() => {
    loadSavedDestinations();
  }, []);

  const loadSavedDestinations = async () => {
    try {
      const saved = await AsyncStorage.getItem('savedDestinations');
      if (saved) {
        const parsedDestinations = JSON.parse(saved);
        setSavedDestinations(parsedDestinations);
      }
    } catch (error) {
      console.log('Error loading saved destinations:', error);
    }
  };

  // Get current location on component mount and start real-time tracking
  // This implementation provides dynamic location fetching with automatic updates
  // when the user's location changes, and real-time polyline drawing between markers
  useEffect(() => {
    const initializeLocation = async () => {
      setIsLoadingAddress(true);
      setCurrentLocationText('Detecting location...');

      try {
        // Get initial location (detect once)
        const location = await LocationService.getCurrentLocation();
        if (location) {
          setCurrentLocation(location);

          // Set coordinates for display
          const coordText = `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
          setCurrentLocationCoordinates(coordText);

          // Get the actual address using reverse geocoding
          const address = await LocationService.getCurrentLocationAddress();
          setCurrentLocationText(address);
          setIsLoadingAddress(false);

          // Animate map to current location after a short delay to ensure map is loaded
          // Offset the latitude slightly so marker shows in upper part (not hidden by bottom sheet)
          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.animateToRegion({
                latitude: location.latitude - 0.003, // Offset to show marker in upper visible area
                longitude: location.longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.015,
              }, 1000);
            }
          }, 500);
        } else {
          console.warn('Location not available');
          setCurrentLocationText('Current Location');
          setIsLoadingAddress(false);
        }

      } catch (error) {
        console.warn('Failed to initialize location:', error);
        setCurrentLocationText('Current Location');
        setIsLoadingAddress(false);
      }
    };

    initializeLocation();
  }, []);

  // Start real-time location tracking
  useEffect(() => {
    const startLocationWatching = () => {
      const watchId = LocationService.watchLocation(
        (newLocation) => {
          setCurrentLocation(newLocation);

          // Update coordinates display
          const coordText = `${newLocation.latitude.toFixed(6)}, ${newLocation.longitude.toFixed(6)}`;
          setCurrentLocationCoordinates(coordText);

          // Update address periodically (not on every location update to avoid API calls)
          if (Math.random() < 0.1) { // 10% chance to update address
            LocationService.getCurrentLocationAddress().then(address => {
              setCurrentLocationText(address);
            });
          }
        },
        (error) => {
          console.warn('Real-time location tracking error:', error);
        }
      );

      if (watchId) {
        setLocationWatchId(watchId);
      }
    };

    // Start watching after initial location is set
    const timer = setTimeout(startLocationWatching, 2000);

    return () => {
      clearTimeout(timer);
      if (locationWatchId) {
        LocationService.stopWatchingLocation(locationWatchId);
      }
    };
  }, []);


  // Handle route params - destination from DestinationScreen
  useEffect(() => {
    if (route?.params?.destination) {
      const dest = route.params.destination;
      setDestination(dest);
      setDestinationText(dest.address || dest.name);
      // Fit map to show both pickup and destination in upper visible area
      if (currentLocation && dest.coordinates && mapRef.current) {
        setTimeout(() => {
          mapRef?.current?.fitToCoordinates(
            [currentLocation, dest.coordinates],
            {
              edgePadding: { top: 150, right: 80, bottom: 500, left: 80 },
              animated: true,
            }
          );
        }, 500);
      }
    }
  }, [route?.params?.destination, currentLocation]);

  // Handle updated pickup location from PickupScreen
  useEffect(() => {
    if (route?.params?.updatedPickupLocation) {
      const updatedLocation = route.params.updatedPickupLocation;
      const updatedAddress = route.params.updatedPickupAddress || 'Selected Location';
      setCurrentLocation(updatedLocation);
      setCurrentLocationText(updatedAddress);
      setCurrentLocationCoordinates(`${updatedLocation.latitude.toFixed(6)}, ${updatedLocation.longitude.toFixed(6)}`);

      // Animate to new location in upper visible area
      if (mapRef.current) {
        setTimeout(() => {
          if (destination && destination.coordinates) {
            // If destination exists, fit both points in upper visible area
            mapRef.current?.fitToCoordinates(
              [updatedLocation, destination.coordinates],
              {
                edgePadding: { top: 150, right: 80, bottom: 500, left: 80 },
                animated: true,
              }
            );
          } else {
            // Otherwise just center on new pickup with offset for bottom sheet
            mapRef.current?.animateToRegion({
              latitude: updatedLocation.latitude - 0.003,
              longitude: updatedLocation.longitude,
              latitudeDelta: 0.015,
              longitudeDelta: 0.015,
            }, 1000);
          }
        }, 300);
      }
    }
  }, [route?.params?.updatedPickupLocation]);

  // Update map region when current location changes
  useEffect(() => {
    if (currentLocation && mapRef.current) {
      // Only update if no destination is selected to avoid conflicts
      if (!destination || !destination.coordinates) {
        setTimeout(() => {
          mapRef.current?.animateToRegion({
            latitude: currentLocation.latitude - 0.003,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          }, 1000);
        }, 500);
      }
    }
  }, [currentLocation]);


  // Cleanup location watching on component unmount
  useEffect(() => {
    return () => {
      if (locationWatchId) {
        LocationService.stopWatchingLocation(locationWatchId);
      }
    };
  }, [locationWatchId]);

  // Handle sheet changes
  const handleSheetChanges = useCallback((index) => {
    // Remove automatic navigation when sheet is closed
    // Users should explicitly use the back button to navigate back
    console.log('Bottom sheet index changed to:', index);
  }, []);


  const handleBack = () => {
    // Navigate back when back button is explicitly pressed
    navigation.goBack();
  };

  const handleMyLocationPress = async () => {
    // Focus map on current location in upper visible area
    if (currentLocation && mapRef.current) {
      // Animate to current location with offset so marker shows in upper part
      mapRef.current?.animateToRegion({
        latitude: currentLocation.latitude - 0.003, // Offset for bottom sheet
        longitude: currentLocation.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      }, 1000);
    } else {
      // If no current location, try to get it again
      setIsLoadingAddress(true);
      setCurrentLocationText('Detecting location...');

      try {
        const location = await LocationService.getCurrentLocation();
        if (location) {
          setCurrentLocation(location);
          // Set coordinates for display
          const coordText = `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
          setCurrentLocationCoordinates(coordText);
          // Get the actual address using reverse geocoding
          const address = await LocationService.getCurrentLocationAddress();
          setCurrentLocationText(address);
          setIsLoadingAddress(false);

          // Now animate to the new location with offset
          if (mapRef.current) {
            mapRef.current?.animateToRegion({
              latitude: location.latitude - 0.003,
              longitude: location.longitude,
              latitudeDelta: 0.015,
              longitudeDelta: 0.015,
            }, 1000);
          }
        } else {
          setCurrentLocationText('Current Location');
          setIsLoadingAddress(false);
        }
      } catch (error) {
        console.warn('Failed to get current location:', error);
        setCurrentLocationText('Current Location');
        setIsLoadingAddress(false);
      }
    }
  };

  const handleMapRegionChange = (region) => {
    // Handle map region changes if needed
    console.log('Map region changed:', region);
  };

  const handleNext = () => {
    if (!destination) {
      Alert.alert('Please select a destination');
      return;
    }

    if (!currentLocation) {
      Alert.alert('Current location is required to proceed');
      return;
    }

    // Check selected pickup time to determine navigation
    if (selectedPickupTime === 'later') {
      // Navigate to TimeSelection screen for later pickup
      navigation.navigate('TimeSelection', {
        currentLocation,
        destination,
        currentLocationText,
        destinationText,
        serviceType,
      });
    } else {
      // Navigate to Cars screen for immediate pickup
      navigation.navigate('Cars', {
        currentLocation,
        destination,
        currentLocationText,
        destinationText,
        serviceType,
        selectedPickupTime: selectedPickupTime,
      });
    }
  };

  const handleCurrentLocationPress = () => {
    // Navigate to PickupScreen to edit current location
    navigation.navigate('Pickup', {
      showCurrentLocation: true,
      currentLocation: currentLocation,
      currentLocationText: currentLocationText,
    });
  };

  const handleDestinationPress = () => {
    // Navigate to DestinationScreen
    navigation.navigate('Destination', {
      currentLocation: currentLocation,
      pickupAddress: currentLocationText,
    });
  };

  const handlePickupTimePress = () => {
    pickupTimeBottomSheetRef.current?.snapToIndex(0);
  };

  const handlePickupTimeSelect = (timeOption) => {
    setSelectedPickupTime(timeOption);

    // Close the time selection modal
    pickupTimeBottomSheetRef.current?.close();

    // No immediate navigation - user must click "Next" to proceed
  };

  const handlePassengerPress = () => {
    passengerBottomSheetRef.current?.snapToIndex(0);
  };

  const handlePassengerSelect = (passengerOption) => {
    setSelectedPassenger(passengerOption);
  };

  const handleSavedDestinationSelect = (selectedDestination) => {
    // Set the destination
    setDestination(selectedDestination);
    setDestinationText(selectedDestination.address || selectedDestination.title);
    // Fit map to show both pickup and destination
    if (currentLocation && selectedDestination.coordinates && mapRef.current) {
      setTimeout(() => {
        mapRef.current.fitToCoordinates(
          [currentLocation, selectedDestination.coordinates],
          {
            edgePadding: { top: 150, right: 80, bottom: 500, left: 80 },
            animated: true,
          }
        );
      }, 300);
    }
  };


  const [savedDestinations, setSavedDestinations] = useState([]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.WHITE} />


      {/* Map Background */}
      <View style={styles.mapContainer} pointerEvents="box-none">
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={currentLocation ? {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          } : {
            latitude: 0, // Will be set dynamically when location is available
            longitude: 0,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={true}
          loadingEnabled={true}
          onRegionChangeComplete={handleMapRegionChange}
        >
          {/* Current Location Marker */}
          {currentLocation && (
            <Marker
              coordinate={currentLocation}
              title="Current Location"
              description={currentLocationText}
            >
              <View style={styles.currentLocationMarker}>
                <View style={styles.currentLocationIconBackground}>
                  <Ionicons name="location" size={24} color={Colors.WHITE} />
                </View>
              </View>
            </Marker>
          )}

          {/* Destination Marker */}
          {destination && destination.coordinates && (
            <Marker
              coordinate={destination.coordinates}
              title="Destination"
              description={destination.address || destination.name}
            >
              <View style={styles.destinationMarkerContainer}>
                <View style={styles.destinationIconBackground}>
                  <Ionicons name="flag" size={24} color={Colors.WHITE} />
                </View>
              </View>
            </Marker>
          )}

          {/* Route Directions */}
          {currentLocation && destination && destination.coordinates && (
            <MapViewDirections
              origin={currentLocation}
              destination={destination.coordinates}
              apikey={GOOGLE_MAPS_API_KEY}
              strokeWidth={4}
              strokeColor={Colors.PRIMARY}
              onReady={(result) => {
                setDistance(result.distance);
                setDuration(result.duration);
              }}
              onError={(errorMessage) => {
                console.warn('Directions error:', errorMessage);
              }}
            />
          )}
        </MapView>

        {/* Map Overlay Buttons */}
        <View style={styles.mapOverlay}>
          {/* Back Button - Top Left */}
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={24} color={Colors.BLACK} />
          </TouchableOpacity>

          {/* My Location Button - Top Right */}
          <TouchableOpacity style={styles.myLocationButton} onPress={handleMyLocationPress}>
            <Ionicons name="locate" size={20} color={Colors.BLACK} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose={false}
        handleIndicatorStyle={styles.dragHandle}
        backgroundStyle={styles.bottomSheetBackground}
        enableOverDrag={false}
        enableHandlePanningGesture={false}
        enableContentPanningGesture={false}
        enableDynamicSizing={false}
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          <ModalHeader
            title="Plan your ride"
            // onBack={handleBack}
            showBackButton={false}
          />

          <View style={styles.headerAndButtonsContainer}>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={handlePickupTimePress}>
                <Ionicons name="time" size={20} color={Colors.WHITE} />
                <Text style={styles.actionButtonText}>
                  {selectedPickupTime === 'now' ? 'Pickup now' : 'Pickup later'}
                </Text>
                <Ionicons name="chevron-down" size={16} color={Colors.WHITE} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handlePassengerPress}>
                <Ionicons name="person" size={20} color={Colors.WHITE} />
                <Text style={styles.actionButtonText}>
                  {selectedPassenger === 'for_me' ? 'For me' : 'For someone else'}
                </Text>
                <Ionicons name="chevron-down" size={16} color={Colors.WHITE} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Location Input Fields */}
          <View style={styles.locationInputs}>
          <Text style={styles.currentLocationTex}>Current Location:</Text>

            <TouchableOpacity
              style={[styles.locationInput]}
              onPress={handleCurrentLocationPress}
            >
              <View style={styles.locationIcon}>
                <View style={styles.currentLocationDot} />
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.locationTextInput}
                  placeholder="Current Location?"
                  multiline={true}
                  numberOfLines={1}
                  placeholderTextColor={Colors.PRIMARY_GREY}
                  value={currentLocationText}
                  editable={false}
                  pointerEvents="none"
                />
                <View style={styles.inputUnderline} />
              </View>
              {/* <TouchableOpacity
                style={styles.editIcon}
                onPress={handleCurrentLocationPress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="pencil" size={18} color={Colors.SECONDARY} />
              </TouchableOpacity> */}
            </TouchableOpacity>

            <View style={styles.connectingLine} />

            <Text style={styles.currentLocationTex}>Select Destination Location:</Text>

            <TouchableOpacity
              style={styles.locationInput}
              onPress={handleDestinationPress}
            >
              <View style={styles.locationIcon}>
                <View style={styles.destinationSquare} />
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.locationTextInput}
                  placeholder="Destination?"
                  multiline={true}
                  numberOfLines={1}
                  placeholderTextColor={Colors.PRIMARY_GREY}
                  value={destinationText}
                  editable={false}
                  pointerEvents="none"
                />
                {/* <View style={styles.inputUnderline} /> */}
              </View>
            </TouchableOpacity>
          </View>

          {/* Distance and ETA Display */}
          {distance && duration && (
            <View style={styles.routeInfoContainer}>
              <View style={styles.routeInfoCard}>
                <Ionicons name="location" size={18} color={Colors.SECONDARY} />
                <Text style={styles.routeInfoText}>
                  {distance.toFixed(1)} km
                </Text>
              </View>
              <View style={styles.routeInfoCard}>
                <Ionicons name="time" size={18} color={Colors.SECONDARY} />
                <Text style={styles.routeInfoText}>
                  {Math.ceil(duration)} min
                </Text>
              </View>
            </View>
          )}

          {/* Additional Options */}
          {/* <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionItem}>
              <Ionicons name="globe" size={20} color={Colors.SECONDARY} />
              <Text style={styles.optionText}>Search in different city</Text>
            </TouchableOpacity>

            <View style={styles.fullWidthContainer}>
              <View style={styles.fatDivider} />
            </View>

            <TouchableOpacity style={styles.optionItem}>
              <Ionicons name="location" size={20} color={Colors.SECONDARY} />
              <Text style={styles.optionText}>Set location on map</Text>
            </TouchableOpacity>

            <View style={styles.fullWidthContainer}>
              <View style={styles.fatDivider} />
            </View>

            <TouchableOpacity style={styles.optionItem}>
              <Ionicons name="star" size={20} color={Colors.SECONDARY} />
              <Text style={styles.optionText}>Saved places</Text>
            </TouchableOpacity>
          </View> */}

          {/* Fat Divider Below Options */}
          {/* <View style={styles.fullWidthContainer}>
            <View style={styles.fatDivider} />
          </View> */}
        {savedDestinations.length > 0 && (
          <ScrollView showsVerticalScrollIndicator={false} style={styles.destinationsSection}>
            <View style={styles.destinationsTitleContainer}>
              <View style={styles.destinationsTitleIcon}>
                <Ionicons name="star" size={12} color={Colors.WHITE} />
              </View>
               <Text style={styles.destinationsTitle}>Saved Destinations</Text>
            </View>
            {savedDestinations.map((destination, index) => (
              <React.Fragment key={destination.id}>
                <DestinationItem
                  title={destination.title}
                  address={destination.address}
                  icon={destination.icon}
                  onPress={() => handleSavedDestinationSelect(destination)}
                />
                {index < savedDestinations.length - 1 && (
                  <View style={styles.destinationsDivider} />
                )}
              </React.Fragment>
            ))}
          </ScrollView>
        )}
        </BottomSheetView>
      </BottomSheet>

      {/* Fixed Next Button */}
      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            (!destination || !currentLocation) && styles.disabledButton,
          ]}
          onPress={handleNext}
          disabled={!destination || !currentLocation}
        >
          <Text style={[
            styles.nextButtonText,
            (!destination || !currentLocation) && styles.disabledButtonText,
          ]}>
            Next
          </Text>
        </TouchableOpacity>
      </View>

      {/* Pickup Time Bottom Sheet */}
      <PickupTimeBottomSheet
        bottomSheetRef={pickupTimeBottomSheetRef}
        onSelectTime={handlePickupTimeSelect}
        selectedOption={selectedPickupTime}
      />

      {/* Passenger Bottom Sheet */}
      <PassengerBottomSheet
        bottomSheetRef={passengerBottomSheetRef}
        onSelectPassenger={handlePassengerSelect}
        selectedOption={selectedPassenger}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  mapContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapText: {
    fontSize: 18,
    color: Colors.PRIMARY_GREY,
    marginBottom: 20,
  },
  mapImage: {
    flex: 1,
  },
  mapOverlay: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    pointerEvents: 'box-none',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  myLocationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  locationText: {
    fontSize: 14,
    color: Colors.BLACK,
    marginRight: 8,
  },
  bottomSheetBackground: {
    backgroundColor: Colors.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomSheetContent: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_GREY,
    // paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80, // Extra padding for fixed button
  },
  dragHandle: {
    width: 100,
    height: 4,
    backgroundColor: Colors.SLIDER_GRAY,
    borderRadius: 2,
  },
  headerAndButtonsContainer: {
    backgroundColor: Colors.BACKGROUND_GREY,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,

  },

  actionButtons:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // backgroundColor: Colors.WHITE,
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.SECONDARY,
    paddingHorizontal: 10,
    borderRadius: 32,
    width: '47%',
    height: 42,
    maxHeight: 42,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.WHITE,
    marginLeft: 8,
  },
  singleDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    width: '100%',
    marginVertical: 0,
  },
  twoLinesContainer: {
    paddingVertical: 10,
  },
  line: {
    height: 1,
    backgroundColor: '#E0E0E0',
    width: '100%',
  },
  gapLine: {
    height: 8,
    backgroundColor: '#EEEEEE',
    width: '100%',
  },
  locationInputs: {
    marginBottom: 5,
    backgroundColor: Colors.WHITE,
    // marginTop: 5,
    paddingHorizontal: 20,
    position: 'relative',
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dividerGray,
    borderTopWidth: 1,
    borderTopColor: Colors.dividerGray,
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    // paddingVertical: 16,
    paddingBottom: 10,
  },
  locationIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  editIcon: {
    padding: 8,
    marginLeft: 8,
  },
  currentLocationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6B6B6B',
  },
  destinationSquare: {
    width: 11,
    height: 11,
    backgroundColor: Colors.BLACK,
  },
  connectingLine: {
    position: 'absolute',
    width: 2,
    height: 30,
    backgroundColor: '#E0E0E0',
    left: 30,
    top: 70,
    zIndex: 1,
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    width: '100%',
    marginVertical: 10,
    marginHorizontal: -10,
  },
  fullWidthContainer: {
    width: screenWidth,
    marginLeft: -20,
    marginRight: -20,
  },
  fatDivider: {
    height: 8,
    backgroundColor: 'transparent',
    width: screenWidth,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.SLIDER_GRAY,
    width: '100%',
    marginVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',

  },
  inputContainer: {
    flex: 1,
  },
  locationTextInput: {
    fontSize: 16,
    color: Colors.PRIMARY_GREY,
    paddingVertical: 8,
  },
  inputUnderline: {
    height: 1,
    backgroundColor: '#E0E0E0',
    width: '100%',
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  optionText: {
    fontSize: 16,
    color: Colors.BLACK,
    marginLeft: 16,
  },
  optionDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    width: '100%',
    marginLeft: 40,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.WHITE,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  nextButton: {
    backgroundColor: Colors.PRIMARY,
    height: 50,
    maxHeight: 50,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.WHITE,
  },
  disabledButton: {
    backgroundColor: Colors.PRIMARY_GREY,
    opacity: 0.5,
  },
  disabledButtonText: {
    color: Colors.WHITE,
    opacity: 0.7,
  },
  currentLocationTex:{
    textAlign: 'left',
    fontSize: 14,
    color: Colors.BLACK,
    fontWeight: '400',
    marginBottom: 0,
    paddingLeft: 35,
    marginTop: -5,
  },
  destinationsSection: {
    // marginTop: 15,
    paddingHorizontal: 0,
    backgroundColor: Colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dividerGray,
    borderTopWidth: 1,
    borderTopColor: Colors.dividerGray,
    marginBottom: 15,
    marginTop: 8,
    paddingTop:5,
    // backgroundColor: 'red',
  },
  destinationsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: Colors.WHITE,
    marginLeft: 5,
  },
  destinationsTitleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.SECONDARY, // Blue background to match the image
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  destinationsTitle:{
    textAlign: 'left',
    fontSize: 14,
    color: Colors.BLACK,
    fontWeight: '400',
  },
  destinationsDivider: {
    height: 1,
    backgroundColor: Colors.dividerGray,
    // marginLeft: 47,
    marginRight: 20,
    width: '80%',
    alignSelf: 'flex-end',
  },
  // Route Info Styles
  routeInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.WHITE,
    borderTopWidth: 1,
    borderTopColor: Colors.dividerGray,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dividerGray,
    marginBottom: 8,
  },
  routeInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.BACKGROUND_GREY,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  routeInfoText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.BLACK,
  },
  // Google Maps Marker Styles
  currentLocationMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLocationIconBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4285F4', // Google Blue
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  destinationMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  destinationIconBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EA4335', // Google Red
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});
