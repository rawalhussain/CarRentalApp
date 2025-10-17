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
import BottomSheet, { BottomSheetScrollView, BottomSheetView, BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Colors } from '../../../Themes/MyColors';
import MapViewComponent from '../../../Components/MapView';
import ModalHeader from '../../../Components/ModalHeader';
import LocationService from '../../../services/LocationService';
import { GOOGLE_MAPS_API_KEY } from '../../../Config/constants';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Polyfill for crypto.getRandomValues
if (typeof global.crypto === 'undefined') {
  global.crypto = {
    getRandomValues: (arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }
  };
}

const { width: screenWidth } = Dimensions.get('window');

export default function PickupScreen({ navigation, route }) {
  // Bottom sheet ref
  const bottomSheetRef = useRef(null);
  const mapViewRef = useRef(null);
  const googlePlacesRef = useRef(null);
  
  // Get navigation parameters
  const { showCurrentLocation = false, currentLocation = null } = route?.params || {};
  
  // State for selected location and map region
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [mapRegion, setMapRegion] = useState(
    currentLocation || {
      latitude: 31.5204, 
      longitude: 74.3587,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    }
  );

  useEffect(() => {
    bottomSheetRef.current?.present();
  }, []);
  
  // State for tracking keyboard and sheet
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
  
  // Debug selectedLocation changes
  useEffect(() => {
    console.log('Selected location changed:', selectedLocation);
    if (selectedLocation) {
      console.log('Marker should be displayed at:', selectedLocation.coordinates);
    }
  }, [selectedLocation]);
  
  // Debug mapRegion changes
  useEffect(() => {
    console.log('Map region changed:', mapRegion);
  }, [mapRegion]);
  
  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => ['65%', '85%', '89%'], []);
  
  // Keyboard listeners
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        console.log('Keyboard will show:', event);
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

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  const handlePlaceSelect = (data, details = null) => {
    if (details) {
      const { lat, lng } = details.geometry.location;
      const newRegion = {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setMapRegion(newRegion);
      const selectedLocationData = {
        name: details.name || data.description,
        address: details.formatted_address || data.description,
        coordinates: { latitude: lat, longitude: lng }
      };
      setSelectedLocation(selectedLocationData);
      // Set the search text to show the selected location with multiline support
      setSearchText(details.formatted_address || data.description);
      
      // Set the text in the GooglePlacesAutocomplete input
      if (googlePlacesRef.current) {
        googlePlacesRef.current.setAddressText(details.formatted_address || data.description);
      }
      
      // Close keyboard but keep sheet at expanded size (index 1 - 85%)
      Keyboard.dismiss();
      setTimeout(() => {
        bottomSheetRef.current?.snapToIndex(1);
      }, 100);
      
      // Animate map to the new location
      if (mapViewRef.current) {
        console.log('Animating map to region:', newRegion);
        console.log('Selected location:', selectedLocationData);
        setTimeout(() => {
          mapViewRef.current.animateToRegion(newRegion, 1000);
        }, 300);
      }
    }
  };

  const handleConfirmPickup = () => {
    if (selectedLocation) {
      // Navigate back to ReserveRideScreen with updated pickup location
      navigation.navigate('ReserveRide', {
        updatedPickupLocation: selectedLocation.coordinates,
        updatedPickupAddress: selectedLocation.address,
      });
    } else if (currentLocation) {
      // If no new location selected, use current location
      navigation.navigate('ReserveRide', {
        updatedPickupLocation: currentLocation,
        updatedPickupAddress: 'Current Location',
      });
    } else {
      alert('Please select a pickup location');
    }
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
            showCurrentLocationMarker={true}
            currentLocation={selectedLocation?.coordinates || currentLocation}
            draggableMarker={true}
            destinationMarker={selectedLocation ? {
              coordinate: selectedLocation.coordinates,
              title: selectedLocation.name,
              description: selectedLocation.address
            } : null}
            onMarkerDragEnd={(location) => {
              console.log('Marker dragged to:', location);
              setSelectedLocation({
                name: 'Selected Location',
                address: `Lat: ${location.latitude.toFixed(4)}, Lng: ${location.longitude.toFixed(4)}`,
                coordinates: { latitude: location.latitude, longitude: location.longitude }
              });
              setSearchText(`${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`);
            }}
            onPress={handleMapPress}
            marker={selectedLocation ? {
              coordinate: selectedLocation.coordinates,
              title: selectedLocation.name,
              description: selectedLocation.address
            } : null}
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
            title="Set your pickup spot" 
            // onBack={handleBack} 
            showBackButton={false}
            description="Drag marker or search to set location"
          />
          
          <GooglePlacesAutocomplete
                  ref={googlePlacesRef}
                  placeholderTextColor={Colors.PRIMARY_GREY}
                  placeholder="Search for pickup location..."
                  onPress={(data, details = null) => {
                    console.log('Place selected:', data, details);
                    handlePlaceSelect(data, details);
                  }}
                  onChangeText={(text) => {
                    setSearchText(text);
                    if (!text) {
                      setSelectedLocation(null);
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
                        {/* <View style={styles.searchResultIconContainer}>
                          <Ionicons name="location-outline" size={22} color={Colors.SECONDARY} />
                        </View> */}
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
            </BottomSheetScrollView>
        </BottomSheetModal>
        </BottomSheetModalProvider>

      {/* Bottom Sheet */}
      {/* <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose={false}
        handleIndicatorStyle={styles.dragHandle}
        backgroundStyle={styles.bottomSheetBackground}
        enableOverDrag={false}
        android_keyboardInputMode="adjustResize"
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        enableTouchThrough={true}
      >
        <BottomSheetScrollView style={styles.bottomSheetContent}>
         
        </BottomSheetScrollView>
      </BottomSheet> */}
      <View style={styles.buttonContainer}>
             <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmPickup}>
               <Text style={styles.confirmButtonText}>Confirm pickup</Text>
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
  contentContainer: {
    flex: 1,
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
    minHeight: 300
  },
  dragHandle: {
    width: 100,
    height: 4,
    backgroundColor: Colors.SLIDER_GRAY,
    borderRadius: 2,
  },
  locationInputs: {
    marginBottom: 75,
    // paddingBottom: 100,
    marginTop: 15,
    backgroundColor: '#EEEEEE',
    // position: 'relative',
    // zIndex: 9998,
    maxHeight: 59,
    minHeight: 59,
    // maxHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    borderRadius: 7,
    paddingHorizontal: 10,
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    width: '100%',
    
  },
  locationIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  currentLocationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.PRIMARY_GREY,
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  locationTextInput: {
    fontSize: 16,
    color: Colors.BLACK,
    // paddingVertical: 8,
    textAlign: 'center',
    textAlignVertical: 'center',
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
  locationsList: {
    maxHeight: 200,
    marginBottom: 20,
  },
  locationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.BLACK,
    marginBottom: 15,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  locationIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationDetails: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.BLACK,
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 14,
    color: Colors.PRIMARY_GREY,
  },
  selectedLocationItem: {
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    marginHorizontal: -8,
    paddingHorizontal: 8,
  },
  selectedLocationIcon: {
    backgroundColor: Colors.PRIMARY,
  },
  selectedLocationName: {
    color: Colors.PRIMARY,
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
    // paddingVertical: 8,
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
