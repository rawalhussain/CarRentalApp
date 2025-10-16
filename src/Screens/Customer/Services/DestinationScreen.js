import React, { useRef, useMemo, useCallback, useState, useEffect } from 'react';
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
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Colors } from '../../../Themes/MyColors';
import ModalHeader from '../../../Components/ModalHeader';
import MapViewComponent from '../../../Components/MapView';
import { GOOGLE_MAPS_API_KEY } from '../../../Config/constants';

const { width: screenWidth } = Dimensions.get('window');

export default function DestinationScreen({ navigation, route }) {
  // Bottom sheet ref
  const bottomSheetRef = useRef(null);
  const mapViewRef = useRef(null);
  const googlePlacesRef = useRef(null);
  
  // Get navigation parameters
  const { currentLocation = null, pickupAddress = '' } = route?.params || {};
  
  // State for selected destination and map region
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [mapRegion, setMapRegion] = useState(
    currentLocation || {
      latitude: 31.5204, 
      longitude: 74.3587,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    }
  );
  
  // State for tracking keyboard and sheet
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
  
  // Route line state
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  
  // Saved destinations data
  const [savedDestinations] = useState([
    { id: 1, name: 'Downtown Mall', address: '789 Shopping Street, Downtown', type: 'shopping', coordinates: { latitude: 29.4050, longitude: 71.6900 } },
    { id: 2, name: 'Central Park', address: '456 Park Avenue, Green District', type: 'park', coordinates: { latitude: 29.3950, longitude: 71.6750 } },
    { id: 3, name: 'City Hospital', address: '321 Medical Center, Health District', type: 'medical', coordinates: { latitude: 29.4100, longitude: 71.6850 } },
  ]);
  
  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => ['50%', '85%', '90%'], []);
  
  // Keyboard listeners
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        console.log('Keyboard will show:', event);
        // Expand bottom sheet to 85% when keyboard opens
        setTimeout(() => {
          bottomSheetRef.current?.snapToIndex(1);
        }, 100);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      (event) => {
        console.log('Keyboard will hide:', event);
        // Keep height at 85% when keyboard closes, don't go back to 50%
        // User can manually drag it down if they want
        setTimeout(() => {
          bottomSheetRef.current?.snapToIndex(1);
        }, 100);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);
  
  // Handle sheet changes
  const handleSheetChanges = useCallback((index) => {
    setCurrentSheetIndex(index);
    if (index === -1) {
      // Sheet is closed, navigate back
      navigation.goBack();
    }
    console.log('Bottom sheet index changed to:', index);
  }, [navigation]);

  const handleBack = () => {
    bottomSheetRef.current?.close();
  };

  const handleMapPress = () => {
    // Close keyboard and return sheet to original size when map is pressed
    Keyboard.dismiss();
    if (currentSheetIndex === 1 || currentSheetIndex === 2) {
      bottomSheetRef.current?.snapToIndex(0);
    }
  };

  // Function to fetch route from Google Directions API
  const fetchRoute = async (origin, destination) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates = route.overview_polyline.points;
        // Decode polyline points
        const decodedCoordinates = decodePolyline(coordinates);
        setRouteCoordinates(decodedCoordinates);
      }
    } catch (error) {
      console.log('Error fetching route:', error);
    }
  };

  // Function to decode polyline
  const decodePolyline = (encoded) => {
    const points = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }
    return points;
  };

  const handleDestinationSelect = (destination) => {
    setSelectedDestination(destination);
    setSearchText(destination.address);
    
    // Update map region to show destination
    if (destination.coordinates && mapViewRef.current) {
      mapViewRef.current.animateToRegion({
        ...destination.coordinates,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }, 1000);
      setMapRegion({
        ...destination.coordinates,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }

    // Fetch route if current location is available
    if (currentLocation) {
      fetchRoute(currentLocation, destination.coordinates);
    }
  };

  const handlePlaceSelect = (data, details = null) => {
    if (details) {
      const { lat, lng } = details.geometry.location;
      const newDestination = {
        name: details.name || data.description,
        address: details.formatted_address || data.description,
        coordinates: { latitude: lat, longitude: lng }
      };
      
      setSelectedDestination(newDestination);
      setSearchText(newDestination.name || newDestination.address);
      
      // Set the text in the GooglePlacesAutocomplete input
      if (googlePlacesRef.current) {
        googlePlacesRef.current.setAddressText(newDestination.name || newDestination.address);
      }
      
      // Update map region
      const newRegion = {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setMapRegion(newRegion);
      
      if (mapViewRef.current) {
        mapViewRef.current.animateToRegion(newRegion, 1000);
      }

      // Fetch route if current location is available
      if (currentLocation) {
        fetchRoute(currentLocation, newDestination.coordinates);
      }
    }
  };

  const handleConfirmDestination = () => {
    if (selectedDestination) {
      // Navigate back to ReserveRideScreen with destination data
      navigation.navigate('ReserveRide', {
        destination: selectedDestination,
        currentLocation: currentLocation,
      });
    } else {
      alert('Please select a destination');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Map Background - Behind Status Bar */}
      <TouchableWithoutFeedback onPress={handleMapPress}>
        <View style={styles.mapContainer} pointerEvents="box-none">
          <MapViewComponent
            ref={mapViewRef}
            style={styles.map}
            initialRegion={mapRegion}
            showCurrentLocationMarker={!!currentLocation}
            currentLocation={currentLocation}
            showUserLocation={true}
            destinationMarker={selectedDestination ? {
              coordinate: selectedDestination.coordinates,
              title: selectedDestination.name,
              description: selectedDestination.address,
            } : null}
            routeCoordinates={routeCoordinates}
            onPress={handleMapPress}
          />
          
          {/* Map Overlay Buttons */}
          <View style={styles.mapOverlay}>
            {/* Back Button - Top Left */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={24} color={Colors.BLACK} />
            </TouchableOpacity>

            {/* Center Location Button - Top Right */}
            <TouchableOpacity 
              style={styles.centerLocationButton}
              onPress={() => {
                if (currentLocation && mapViewRef.current) {
                  const newRegion = {
                    ...currentLocation,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  };
                  mapViewRef.current.animateToRegion(newRegion, 500);
                  setMapRegion(newRegion);
                }
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="locate" size={20} color={Colors.BLACK} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>

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
        android_keyboardInputMode="adjustResize"
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          {/* Modal Header */}
          <ModalHeader 
            title="Set your destination" 
            onBack={handleBack}
            description="Search or select from saved places"
          />

          {/* Google Places Autocomplete */}
          <View style={styles.locationInputs}>
            <View style={styles.locationInput}>
              <View style={styles.locationIcon}>
                <View style={styles.destinationSquare} />
              </View>
              <View style={styles.inputContainer}>
                {selectedDestination ? (
                  <View style={styles.selectedLocationContainer}>
                    <Text style={styles.selectedLocationText} numberOfLines={2}>
                      {selectedDestination.address}
                    </Text>
                    <TouchableOpacity 
                      style={styles.clearButton}
                      onPress={() => {
                        setSelectedDestination(null);
                        setSearchText('');
                        setRouteCoordinates([]);
                        if (googlePlacesRef.current) {
                          googlePlacesRef.current.setAddressText('');
                        }
                      }}
                    >
                      <Ionicons name="close-circle" size={20} color={Colors.PRIMARY_GREY} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <GooglePlacesAutocomplete
                    ref={googlePlacesRef}
                    placeholder="Where to?"
                    onPress={(data, details = null) => {
                      console.log('Place selected:', data, details);
                      handlePlaceSelect(data, details);
                    }}
                    onChangeText={(text) => {
                      setSearchText(text);
                      if (!text) {
                        setSelectedDestination(null);
                        setRouteCoordinates([]);
                      }
                    }}
                    query={{
                      key: GOOGLE_MAPS_API_KEY,
                      language: 'en',
                      components: 'country:pk',
                    }}
                    styles={{
                      container: styles.googlePlacesContainer,
                      textInputContainer: styles.googlePlacesTextInputContainer,
                      textInput: styles.googlePlacesInput,
                      listView: styles.googlePlacesList,
                      row: styles.googlePlacesRow,
                      description: styles.googlePlacesDescription,
                      separator: styles.googlePlacesSeparator,
                      loader: styles.googlePlacesLoader,
                      poweredContainer: styles.googlePlacesPoweredContainer,
                    }}
                    fetchDetails={true}
                    enablePoweredByContainer={false}
                    debounce={500}
                    minLength={3}
                    predefinedPlaces={[]}
                    predefinedPlacesAlwaysVisible={false}
                    currentLocation={false}
                    currentLocationLabel=""
                    renderRow={(rowData) => {
                      const title = rowData.structured_formatting?.main_text || rowData.description;
                      const address = rowData.structured_formatting?.secondary_text || '';
                      return (
                        <View style={styles.searchResultRow}>
                          <View style={styles.searchResultTextContainer}>
                            <Text style={styles.searchResultTitle} numberOfLines={1}>{title}</Text>
                            {address ? (
                              <Text style={styles.searchResultAddress} numberOfLines={2}>{address}</Text>
                            ) : null}
                          </View>
                        </View>
                      );
                    }}
                    listEmptyComponent={() => (
                      <View style={styles.emptyComponent}>
                        <Text style={styles.emptyText}>No results found</Text>
                      </View>
                    )}
                    timeout={10000}
                    textInputProps={{
                      placeholderTextColor: Colors.PRIMARY_GREY,
                      returnKeyType: 'search',
                      autoCorrect: false,
                      autoCapitalize: 'none',
                      clearButtonMode: 'while-editing',
                      multiline: true,
                      numberOfLines: 2,
                      textAlignVertical: 'top',
                      onFocus: () => {
                        console.log('Input focused - expanding sheet to 85%');
                        // Expand bottom sheet to 85% when input is focused
                        setTimeout(() => {
                          bottomSheetRef.current?.snapToIndex(1);
                        }, 100);
                      },
                      onBlur: () => {
                        console.log('Input blurred');
                        // Don't collapse here, let keyboard hide listener handle it
                      },
                    }}
                    onFail={(error) => {
                      console.log('GooglePlacesAutocomplete Error:', error);
                      console.log('API Key being used:', GOOGLE_MAPS_API_KEY ? 'Present' : 'Missing');
                    }}
                    onNotFound={() => console.log('No results found')}
                    onTimeout={() => console.log('Request timeout')}
                    onQueryChange={(query) => {
                      console.log('Query changed:', query);
                      console.log('API Key:', GOOGLE_MAPS_API_KEY ? 'Present' : 'Missing');
                    }}
                  />
                )}
              </View>
            </View>
          </View>

          {/* Fat Divider Above Destinations */}
          <View style={styles.fullWidthContainer}>
            <View style={styles.fatDivider} />
          </View>

          {/* Saved Destinations List */}
          <ScrollView style={styles.destinationsList} showsVerticalScrollIndicator={false}>
            <View style={styles.savedDestinationsHeader}>
              <Ionicons name="star" size={18} color={Colors.SECONDARY} />
              <Text style={styles.destinationsTitle}>Saved Places</Text>
            </View>
            {savedDestinations.map((destination) => (
              <TouchableOpacity 
                key={destination.id} 
                style={[
                  styles.destinationItem,
                  selectedDestination?.id === destination.id && styles.selectedDestinationItem
                ]}
                onPress={() => handleDestinationSelect(destination)}
              >
                <View style={[
                  styles.destinationIconContainer,
                  selectedDestination?.id === destination.id && styles.selectedDestinationIcon
                ]}>
                  <Ionicons 
                    name={
                      destination.type === 'shopping' ? 'bag' :
                      destination.type === 'park' ? 'leaf' :
                      destination.type === 'medical' ? 'medical' :
                      destination.type === 'education' ? 'school' :
                      'restaurant'
                    } 
                    size={20} 
                    color={selectedDestination?.id === destination.id ? Colors.WHITE : Colors.SECONDARY} 
                  />
                </View>
                <View style={styles.destinationDetails}>
                  <Text style={[
                    styles.destinationName,
                    selectedDestination?.id === destination.id && styles.selectedDestinationName
                  ]}>
                    {destination.name}
                  </Text>
                  <Text style={styles.destinationAddress}>{destination.address}</Text>
                </View>
                {selectedDestination?.id === destination.id ? (
                  <Ionicons name="checkmark-circle" size={24} color={Colors.SECONDARY} />
                ) : (
                  <Ionicons name="chevron-forward" size={20} color={Colors.PRIMARY_GREY} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Fat Divider Above Button */}
          <View style={styles.fullWidthContainer}>
            <View style={styles.fatDivider} />
          </View>

          {/* Confirm Destination Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.confirmButton, !selectedDestination && styles.disabledButton]} 
              onPress={handleConfirmDestination}
              disabled={!selectedDestination}
            >
              <Text style={styles.confirmButtonText}>
                Confirm destination
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>
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
  centerLocationButton: {
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
  bottomSheetBackground: {
    backgroundColor: Colors.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomSheetContent: {
    flex: 1,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  dragHandle: {
    width: 100,
    height: 4,
    backgroundColor: Colors.SLIDER_GRAY,
    borderRadius: 2,
  },
  locationInputs: {
    marginBottom: 15,
    marginTop: 15,
    backgroundColor: 'transparent',
    position: 'relative',
    zIndex: 1,
    minHeight: 59,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginHorizontal: 20,
    borderRadius: 7,
    paddingHorizontal: 0,
    paddingVertical: 0,
    overflow: 'visible',
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: 8,
    width: '100%',
    backgroundColor: '#EEEEEE',
    borderRadius: 7,
    paddingHorizontal: 10,
  },
  locationIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    marginTop: 8,
  },
  destinationSquare: {
    width: 10,
    height: 10,
    backgroundColor: '#EA4335',
    borderRadius: 2,
  },
  inputContainer: {
    flex: 1,
  },
  locationTextInput: {
    fontSize: 16,
    color: Colors.BLACK,
    paddingVertical: 8,
  },
  inputUnderline: {
    height: 1,
    backgroundColor: '#E0E0E0',
    width: '100%',
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
  confirmButton: {
    backgroundColor: Colors.PRIMARY,
    height: 50,
    maxHeight: 50,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.WHITE,
  },
  destinationsList: {
    flex: 1,
    marginBottom: 10,
    // paddinghorizontal: 20,
    // backgroundColor: 'red',
    marginHorizontal: 20,
  },
  savedDestinationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginBottom: 15,
    gap: 8,
  },
  destinationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.BLACK,
  },
  destinationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  destinationIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  destinationDetails: {
    flex: 1,
  },
  destinationName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.BLACK,
    marginBottom: 2,
  },
  destinationAddress: {
    fontSize: 14,
    color: Colors.PRIMARY_GREY,
  },
  selectedDestinationItem: {
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    marginHorizontal: -8,
    paddingHorizontal: 8,
  },
  selectedDestinationIcon: {
    backgroundColor: Colors.SECONDARY,
  },
  selectedDestinationName: {
    color: Colors.SECONDARY,
    fontWeight: '600',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 0 : 10,
  },
  disabledButton: {
    backgroundColor: Colors.PRIMARY_GREY,
    opacity: 0.5,
  },
  // Google Places Autocomplete Styles
  googlePlacesContainer: {
    flex: 1,
    zIndex: 1,
    position: 'relative',
  },
  googlePlacesTextInputContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    alignItems: 'center',
  },
  googlePlacesInput: {
    fontSize: 16,
    color: Colors.BLACK,
    paddingVertical: 8,
    backgroundColor: 'transparent',
    flex: 1,
    borderWidth: 0,
    margin: 0,
    paddingHorizontal: 0,
    minHeight: 40,
    maxHeight: 80,
    textAlignVertical: 'top',
  },
  googlePlacesList: {
    backgroundColor: 'transparent',
    borderRadius: 7,
    maxHeight: 200,
    position: 'relative',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    borderWidth: 0,
    borderColor: 'transparent',
    marginTop: 8,
    width: '95%',
    alignSelf: 'center',
  },
  googlePlacesRow: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0.5,
    borderBottomColor: '#F5F5F5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    // width: '95%',
    // paddingHorizontal: 16,
  },
  googlePlacesDescription: {
    fontSize: 15,
    color: Colors.BLACK,
    fontWeight: '500',
    lineHeight: 20,
  },
  googlePlacesSeparator: {
    height: 0.5,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 16,
  },
  googlePlacesLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: 40,
    alignItems: 'center',
  },
  googlePlacesPoweredContainer: {
    display: 'none',
  },
  emptyComponent: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.PRIMARY_GREY,
    textAlign: 'center',
  },
  // Custom Search Result Styles
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  searchResultTextContainer: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.BLACK,
    marginBottom: 4,
    lineHeight: 20,
  },
  searchResultAddress: {
    fontSize: 14,
    color: Colors.PRIMARY_GREY,
    lineHeight: 18,
  },
  // Selected Location Display Styles
  selectedLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 0,
    minHeight: 40,
    maxHeight: 80,
  },
  selectedLocationText: {
    fontSize: 16,
    color: Colors.BLACK,
    flex: 1,
    lineHeight: 20,
    paddingRight: 8,
  },
  clearButton: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
