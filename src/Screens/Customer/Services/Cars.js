import React, { useRef, useMemo, useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Image,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { Colors } from '../../../Themes/MyColors';
import { GOOGLE_MAPS_API_KEY } from '../../../Config/constants';

const { width: screenWidth } = Dimensions.get('window');

export default function CarsScreen({ navigation, route }) {
  // Bottom sheet ref
  const bottomSheetRef = useRef(null);
  const mapRef = useRef(null);
  const insets = useSafeAreaInsets();

  // Get route params
  const { currentLocation, destination, currentLocationText, destinationText } = route?.params || {};
  
  // State for route info
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);

  // Debug logging for coordinates
  useEffect(() => {
    console.log('Cars Screen - Route params:', {
      currentLocation,
      destination,
      currentLocationText,
      destinationText,
    });
  }, [currentLocation, destination, currentLocationText, destinationText]);

  // Fit map to show both pickup and destination when they are available
  useEffect(() => {
    if (currentLocation && destination && destination.coordinates && mapRef.current) {
      setTimeout(() => {
        console.log('Fitting map to show both pickup and destination');
        mapRef.current.fitToCoordinates(
          [currentLocation, destination.coordinates],
          {
            edgePadding: { top: 150, right: 80, bottom: 500, left: 80 },
            animated: true,
          }
        );
      }, 500);
    }
  }, [currentLocation, destination]);

  // Dummy ride options data
  const [rideOptions] = useState([
    {
      id: 1,
      name: 'Lowest TransportX',
      capacity: 4,
      price: '$32.90',
      time: '21:12 - 3 min away',
      description: 'Affordable rides all to yourself',
      type: 'economy',
    },
    {
      id: 2,
      name: 'Lowest TransportXL',
      capacity: 6,
      price: '$60.90',
      time: '21:12 - 3 min away',
      description: 'Affordable rides for groups up to 6',
      type: 'xl',
    },
    {
      id: 3,
      name: 'Lowest Transport Premier',
      capacity: 4,
      price: '$67.90',
      time: '21:12 - 3 min away',
      description: 'Luxury rides with highly-rated drivers',
      type: 'premier',
    },
    {
      id: 4,
      name: 'Lowest Transport Pet',
      capacity: 4,
      price: '$38.90',
      time: '21:12 - 3 min away',
      description: 'Pet-friendly rides',
      type: 'pet',
    },
    {
      id: 5,
      name: 'Lowest Transport Green',
      capacity: 4,
      price: '$36.90',
      time: '21:12 - 3 min away',
      description: 'Eco-friendly rides',
      type: 'green',
    },
    {
      id: 6,
      name: 'Lowest Transport Car Seat',
      capacity: 4,
      price: '$40.90',
      time: '21:12 - 3 min away',
      description: 'Child car seat available (5-65 lbs)',
      type: 'car_seat',
      hasTimeSelection: true,
    },
    {
      id: 7,
      name: 'Lowest Transport XXL',
      capacity: 6,
      price: '$70.90',
      time: '21:12 - 3 min away',
      description: 'Extra large rides for groups',
      type: 'xxl',
    },
    {
      id: 8,
      name: 'Lowest Transport Premium SUV',
      capacity: 6,
      price: '$77.90',
      time: '21:12 - 3 min away',
      description: 'Premium SUV with luxury features',
      type: 'premium_suv',
      isPremium: true,
    },
  ]);

  // Selected ride state
  const [selectedRide, setSelectedRide] = useState(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Simulate API loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 second loading simulation

    return () => clearTimeout(timer);
  }, []);

  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => showDetailSheet ? ['85%', '90%'] : ['85%', '90%'], [showDetailSheet]);

  // Handle sheet changes
  const handleSheetChanges = useCallback((index) => {
    if (index === -1) {
      // Sheet is closed, navigate back
      navigation.goBack();
    }
  }, [navigation]);

  // Backdrop component
  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.3}
      />
    ),
    []
  );

  const handleBack = () => {
    bottomSheetRef.current?.close();
  };

  const handleMyLocationPress = async () => {
    // Focus map on current location in upper visible area
    if (currentLocation && mapRef.current) {
      console.log('Focusing on current location:', currentLocation);
      // Animate to current location with offset so marker shows in upper part
      mapRef.current.animateToRegion({
        latitude: currentLocation.latitude - 0.003, // Offset for bottom sheet
        longitude: currentLocation.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      }, 1000);
    }
  };

  const handleMapRegionChange = (region) => {
    // Handle map region changes if needed
    console.log('Map region changed:', region);
  };

  const handleRideSelect = (ride) => {
    setSelectedRide(ride);
    setShowDetailSheet(true);
  };

  const handleBookRide = () => {
    if (selectedRide) {
      // Navigate to next screen with selected ride data
      navigation.navigate('BookingConfirmation', {
        selectedRide,
        currentLocation,
        destination,
        currentLocationText,
        destinationText,
      });
    } else {
      alert('Please select a ride option');
    }
  };

  const handleBackToRideList = () => {
    setShowDetailSheet(false);
    setSelectedRide(null);
  };

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
                console.log('Route calculated:', result);
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
        backdropComponent={renderBackdrop}
        enablePanDownToClose={true}
        handleIndicatorStyle={styles.dragHandle}
        backgroundStyle={styles.bottomSheetBackground}
      >
        <BottomSheetView style={[styles.bottomSheetContent, { paddingBottom: Math.max(insets.bottom, 20) + 40 }]}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={showDetailSheet ? handleBackToRideList : handleBack} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color={Colors.BLACK} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {showDetailSheet ? 'Confirm details' : 'Choose a ride'}
            </Text>
            <View style={styles.placeholder} />
          </View>

          {!showDetailSheet ? (
            <>
              {/* Subtitle */}
              <View style={styles.subtitleContainer}>
                <Text style={styles.subtitleText}>Rides we think you'll like</Text>
              </View>
            </>
          ) : null}

          {/* Ride Options List or Detail View */}
          <ScrollView style={styles.ridesList} showsVerticalScrollIndicator={false}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.PRIMARY} />
                <Text style={styles.loadingText}>Finding available rides...</Text>
              </View>
            ) : showDetailSheet && selectedRide ? (
              // Detail Sheet View
              <View style={styles.detailView}>
                <View style={styles.selectedRideDetail}>
                  <View style={styles.rideIconContainer}>
                    <Image
                      source={require('../../../../assets/car11.png')}
                      style={styles.carImage}
                      resizeMode="contain"
                    />
                    <Text style={styles.capacityText}>{selectedRide.capacity}</Text>
                  </View>

                  <View style={styles.rideDetails}>
                    <Text style={styles.rideName}>{selectedRide.name}</Text>
                    <Text style={styles.rideTime}>{selectedRide.time}</Text>
                    <Text style={styles.rideDescription}>{selectedRide.description}</Text>
                  </View>

                  <View style={styles.ridePricing}>
                    <Text style={styles.ridePrice}>{selectedRide.price}</Text>
                  </View>
                </View>

                {/* Payment Method */}
                <View style={styles.paymentMethodContainer}>
                  <View style={styles.paymentMethod}>
                    <View style={styles.paymentIcon}>
                      <Ionicons name="cash" size={20} color={Colors.WHITE} />
                    </View>
                    <Text style={styles.paymentText}>Personal Cash</Text>
                    <Ionicons name="chevron-forward" size={16} color={Colors.PRIMARY_GREY} />
                  </View>
                </View>
              </View>
            ) : (
              // Ride Options List
              <>
                {rideOptions.map((ride) => (
                  <TouchableOpacity
                    key={ride.id}
                    style={[
                      styles.rideItem,
                      selectedRide?.id === ride.id && styles.selectedRideItem,
                    ]}
                    onPress={() => handleRideSelect(ride)}
                  >
                    <View style={styles.rideIconContainer}>
                      <Image
                        source={require('../../../../assets/car11.png')}
                        style={styles.carImage}
                        resizeMode="contain"
                        onError={(error) => console.log('Image load error:', error)}
                        onLoad={() => console.log('Image loaded successfully')}
                      />
                      <Text style={styles.capacityText}>{ride.capacity}</Text>
                    </View>

                    <View style={styles.rideDetails}>
                      <Text style={[
                        styles.rideName,
                        selectedRide?.id === ride.id && styles.selectedRideName,
                      ]}>
                        {ride.name}
                      </Text>

                      <Text style={styles.rideTime}>{ride.time}</Text>
                      <Text style={styles.rideDescription}>{ride.description}</Text>
                    </View>

                    <View style={styles.ridePricing}>
                      <Text style={styles.ridePrice}>{ride.price}</Text>
                    </View>

                    {selectedRide?.id === ride.id ? (
                      <Ionicons name="checkmark-circle" size={24} color={Colors.PRIMARY} />
                    ) : (
                      <Ionicons name="chevron-forward" size={20} color={Colors.PRIMARY_GREY} />
                    )}
                  </TouchableOpacity>
                ))}

                {/* Payment Method */}
                <View style={styles.paymentMethodContainer}>
                  <View style={styles.paymentMethod}>
                    <View style={styles.paymentIcon}>
                      <Ionicons name="cash" size={20} color={Colors.WHITE} />
                    </View>
                    <Text style={styles.paymentText}>Cash</Text>
                    <Ionicons name="chevron-forward" size={16} color={Colors.PRIMARY_GREY} />
                  </View>
                </View>
              </>
            )}
          </ScrollView>

          {/* Fat Divider Above Button */}
          <View style={styles.fullWidthContainer}>
            <View style={styles.fatDivider} />
          </View>

          {/* <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
           
          </View> */}
        </BottomSheetView>
      </BottomSheet>
      <TouchableOpacity 
              style={[
                styles.buttonContainer,
                !selectedRide && styles.disabledButton
              ]} 
              onPress={handleBookRide}
              disabled={!selectedRide}
            >
              <Text style={[
                styles.bookButtonText,
                !selectedRide && styles.disabledButtonText
              ]}>
                {showDetailSheet ? `Choose ${selectedRide?.name}` : 'Choose Lowest TransportX'}
              </Text>
            </TouchableOpacity>
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
    marginBottom: 8,
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
  destinationCard: {
    marginTop: 8,
  },
  locationText: {
    fontSize: 14,
    color: Colors.BLACK,
    marginRight: 8,
  },
  bottomSheetBackground: {
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  dragHandle: {
    width: 100,
    height: 4,
    backgroundColor: '#777575',
    borderRadius: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingTop: 5,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.BLACK,
  },
  placeholder: {
    width: 40,
  },
  subtitleContainer: {
    marginBottom: 20,
  },
  subtitleText: {
    fontSize: 16,
    color: Colors.PRIMARY_GREY,
  },
  ridesList: {
    maxHeight: 400,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  rideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: Colors.WHITE,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  selectedRideItem: {
    backgroundColor: '#F0F8FF',
    borderWidth: 2,
    borderColor: Colors.PRIMARY,
  },
  rideIconContainer: {
    width: 80,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    position: 'relative',
    overflow: 'visible',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  carImage: {
    width: 70,
    height: 40,
    backgroundColor: 'transparent',
    tintColor: undefined,
  },
  capacityText: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: Colors.PRIMARY,
    color: Colors.WHITE,
    fontSize: 11,
    fontWeight: '600',
    width: 22,
    height: 22,
    borderRadius: 11,
    textAlign: 'center',
    lineHeight: 22,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  rideDetails: {
    flex: 1,
    marginRight: 12,
  },
  ridePricing: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginRight: 8,
  },
  rideName: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.BLACK,
    marginBottom: 2,
  },
  selectedRideName: {
    color: Colors.PRIMARY,
  },
  ridePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.BLACK,
  },
  rideTime: {
    fontSize: 13,
    color: Colors.PRIMARY_GREY,
    marginBottom: 4,
    fontWeight: '500',
  },
  rideDescription: {
    fontSize: 13,
    color: Colors.PRIMARY_GREY,
    fontWeight: '400',
  },
  fullWidthContainer: {
    width: '100%',
    marginLeft: -20,
    marginRight: -20,
  },
  fatDivider: {
    height: 8,
    backgroundColor: 'transparent',
    width: '100%',
  },
  buttonContainer: {
    paddingTop: 10,
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
  bookButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.WHITE,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.PRIMARY_GREY,
    marginTop: 16,
    fontWeight: '500',
  },
  // Detail View Styles
  detailView: {
    paddingVertical: 10,
  },
  selectedRideDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
    backgroundColor: Colors.WHITE,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  // Payment Method Styles
  paymentMethodContainer: {
    marginBottom: 20,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  paymentIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentText: {
    flex: 1,
    fontSize: 16,
    color: Colors.BLACK,
    fontWeight: '500',
  },
  // Disabled Button Styles
  disabledButton: {
    backgroundColor: Colors.PRIMARY_GREY,
    opacity: 0.6,
  },
  disabledButtonText: {
    color: Colors.WHITE,
    opacity: 0.7,
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
