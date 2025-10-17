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
  AsyncStorage,
} from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetScrollView, BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Colors } from '../../../Themes/MyColors';
import ModalHeader from '../../../Components/ModalHeader';
import MapViewComponent from '../../../Components/MapView';
import { GOOGLE_MAPS_API_KEY } from '../../../Config/constants';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  
  // Route line state
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  
  // Saved destinations data
  const [savedDestinations, setSavedDestinations] = useState([]);
  
  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => ['65%', '85%', '89%'], []);

  useEffect(() => {
    bottomSheetRef.current?.present();
  }, []);
  
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

  const saveDestination = async (destination) => {
    try {
      const newDestination = {
        ...destination,
        id: Date.now(), // Generate unique ID
        type: 'custom', // Mark as custom saved location
      };
      
      const updatedDestinations = [newDestination, ...savedDestinations];
      setSavedDestinations(updatedDestinations);
      
      await AsyncStorage.setItem('savedDestinations', JSON.stringify(updatedDestinations));
      console.log('Destination saved successfully');
    } catch (error) {
      console.log('Error saving destination:', error);
    }
  };
  
  // Keyboard listeners
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        console.log('Keyboard will show:', event);
        setIsKeyboardVisible(true);
        // Expand bottom sheet to 95% when keyboard opens
        setTimeout(() => {
          bottomSheetRef.current?.snapToIndex(2);
        }, 100);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      (event) => {
        console.log('Keyboard will hide:', event);
        setIsKeyboardVisible(false);
        // Return to original size when keyboard closes (if at index 1 or 2)
        if (currentSheetIndex === 1 || currentSheetIndex === 2) {
          setTimeout(() => {
            bottomSheetRef.current?.snapToIndex(0);
          }, 100);
        }
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [currentSheetIndex]);
  
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
    
    // Update the GooglePlacesAutocomplete input to show the selected destination
    if (googlePlacesRef.current) {
      googlePlacesRef.current.setAddressText(destination.address);
    }
    
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
      
      // Save the destination to AsyncStorage
      saveDestination(newDestination);
      
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
    if (!selectedDestination) {
      alert('Please select a destination');
      return;
    }
 
    
    // Navigate back to ReserveRideScreen with destination data
    navigation.navigate('ReserveRide', {
      destination: selectedDestination,
    });
  };

  return (
    <GestureHandlerRootView style={styles.container}>
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

      {/* Bottom Sheet Modal */}
      <BottomSheetModalProvider>
        <BottomSheetModal
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
        >
        <BottomSheetScrollView 
          style={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Modal Header */}
          <ModalHeader 
            title="Set your destination" 
            // onBack={handleBack} 
            showBackButton={false}
            description="Search or select from saved places"
          />
          
          <GooglePlacesAutocomplete
            ref={googlePlacesRef}
            placeholderTextColor={Colors.PRIMARY_GREY}
            placeholder="Search for destination..."
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
            keyboardShouldPersistTaps="handled"
            listViewDisplayed="auto"
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
              returnKeyType: 'done',
              autoCorrect: false,
              autoCapitalize: 'none',
              clearButtonMode: 'while-editing',
              multiline: true,
              numberOfLines: 2,
              textAlignVertical: 'center',
              onFocus: () => {
                console.log('Input focused - expanding sheet to 95%');
                // Expand bottom sheet to 95% when input is focused
                setTimeout(() => {
                  bottomSheetRef.current?.snapToIndex(2);
                }, 100);
              },
              onBlur: () => {
                console.log('Input blurred');
                // Keep sheet at expanded size when input loses focus
                setTimeout(() => {
                  bottomSheetRef.current?.snapToIndex(1);
                }, 100);
              },
              onSubmitEditing: () => {
                console.log('Done button pressed');
                // Close keyboard and keep sheet at expanded size
                Keyboard.dismiss();
                setTimeout(() => {
                  bottomSheetRef.current?.snapToIndex(1);
                }, 100);
              },
            }}
            onFail={(error) => {
              console.log('GooglePlacesAutocomplete Error:', error);
              console.log('API Key being used:', GOOGLE_MAPS_API_KEY ? 'Present' : 'Missing');
            }}
            onNotFound={() => console.log('No results found')}
            onTimeout={() => console.log('Request timeout')}
            onQueryChange={(query) => {
              console.warn('Query changed:', query);
              console.log('API Key:', GOOGLE_MAPS_API_KEY ? 'Present' : 'Missing');
            }}
          />


          {/* Fat Divider Above Destinations */}
          <View style={styles.fullWidthContainer}>
            <View style={styles.fatDivider} />
          </View>

          {/* Saved Destinations List */}
        { savedDestinations.length > 0 && <View style={styles.destinationsContainer}>
            <View style={styles.savedDestinationsHeader}>
              <Ionicons name="star" size={18} color={Colors.SECONDARY} />
              <Text style={styles.destinationsTitle}>Saved Places</Text>
            </View>
            <ScrollView style={styles.destinationsList} showsVerticalScrollIndicator={false}>
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
                        destination.type === 'custom' ? 'bookmark' :
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
          </View>}

        </BottomSheetScrollView>
        </BottomSheetModal>
      </BottomSheetModalProvider>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[
            styles.confirmButton, 
            !selectedDestination && styles.disabledButton
          ]} 
          onPress={handleConfirmDestination}
          disabled={!selectedDestination}
        >
          <Text style={[
            styles.confirmButtonText,
            !selectedDestination && styles.disabledButtonText
          ]}>
            Confirm destination
          </Text>
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
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
  contentContainer: {
    flex: 1,
  },
  bottomSheetContent: {
    flex: 1,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    minHeight: 300
  },
  dragHandle: {
    width: 100,
    height: 4,
    backgroundColor: Colors.SLIDER_GRAY,
    borderRadius: 2,
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
  destinationsContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  destinationsList: {
    flex: 1,
  },
  savedDestinationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    paddingLeft: 10,
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
  disabledButton: {
    backgroundColor: Colors.PRIMARY_GREY,
    opacity: 0.5,
  },
  disabledButtonText: {
    color: Colors.WHITE,
    opacity: 0.7,
  },
  // Google Places Autocomplete Styles
  googlePlacesContainer: {
    flex: 0,
    width: '100%',
    minHeight: 180
  },
  googlePlacesTextInputContainer: {
    // flexDirection: 'row',
    // backgroundColor: 'transparent',
    // borderWidth: 0,
    // borderBottomWidth: 0,
    // paddingHorizontal: 0,
    // paddingVertical: 0,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  googlePlacesInput: {
    fontSize: 16,
    color: Colors.BLACK,
    paddingVertical: 8,
    backgroundColor: Colors.lightGray,
    flex: 1,
    borderWidth: 0,
    margin: 0,
    paddingHorizontal: 0,
    minHeight: 59,
    maxHeight: 80,
    textAlignVertical: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  googlePlacesList: {
    backgroundColor: Colors.WHITE,
    borderRadius: 7,
    // marginTop: 8,
    // maxHeight: 305,
    // position: 'absolute',
    // top: 35,
    // left: -50,
    right: 0,
    // zIndex: 9999,
    // borderWidth: 1,  
    width: '100%',
    // borderColor: '#E5E5E5',
    // ...Platform.select({
    //   ios: {
    //     shadowColor: '#000',
    //     shadowOffset: { width: 0, height: 6 },
    //     shadowOpacity: 0.12,
    //     shadowRadius: 12,
    //   },
    //   android: {
    //     elevation: 15,
    //   },
    // }),
  },
  googlePlacesRow: {
    // backgroundColor: Colors.WHITE,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F5F5F5',
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
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
    marginHorizontal: 0,
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
    width: '100%',
    paddingVertical: 2,
  },
  searchResultIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    flexShrink: 0,
  },
  searchResultTextContainer: {
    flex: 1,
    // paddingRight: 8,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.BLACK,
    marginBottom: 2,
    lineHeight: 18,
  },
  searchResultAddress: {
    fontSize: 14,
    color: Colors.PRIMARY_GREY,
    lineHeight: 16,
  },
});
