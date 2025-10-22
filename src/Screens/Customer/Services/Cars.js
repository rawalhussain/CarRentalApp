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
  Dimensions, Alert,
} from 'react-native';
import { createPackageBooking, getRidePackages, getPackagePricing, getPackageCars, calculateFare } from '../../../Config/firebase';
import useAuthStore from '../../../store/useAuthStore';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
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

  // Get user data
  const { user } = useAuthStore();

  // Get route params
  const { currentLocation, destination, currentLocationText, destinationText } = route?.params || {};

  // State for route info
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [packages, setPackages] = useState([]);

  // Fit map to show both pickup and destination when they are available
  useEffect(() => {
    if (currentLocation && destination && destination?.coordinates && mapRef?.current) {
      setTimeout(() => {
        mapRef?.current?.fitToCoordinates(
          [currentLocation, destination?.coordinates],
          {
            edgePadding: { top: 150, right: 80, bottom: 500, left: 80 },
            animated: true,
          }
        );
      }, 500);
    }
  }, [currentLocation, destination]);

  // Load packages from Firebase
  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const packagesData = await getRidePackages();

      const packagesWithDetails = await Promise.all(
        packagesData.map(async (pkg) => {
          const [pricing, cars] = await Promise.all([
            getPackagePricing(pkg.id),
            getPackageCars(pkg.id),
          ]);
          return {
            ...pkg,
            pricing,
            cars,
            ratePerMile: pricing?.ratePerMile || 0,
            baseFare: pricing?.baseFare || 0,
            carIds: cars || [],
          };
        })
      );
      setPackages(packagesWithDetails.filter(pkg => pkg.isActive));
    } catch (error) {
      console.error('Error loading packages:', error);
    }
  };

  // Selected ride state
  const [selectedRide, setSelectedRide] = useState(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [showBookingSummary, setShowBookingSummary] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [isBooking, setIsBooking] = useState(false);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Simulate API loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 second loading simulation

    return () => clearTimeout(timer);
  }, []);

  // Snap points for the bottom sheet - opens at 55%, can expand to 90%
  const snapPoints = useMemo(() => ['55%', '90%'], []);

  // Handle sheet changes
  const handleSheetChanges = useCallback((index) => {
    // Don't navigate back automatically when sheet closes
    console.log('Sheet index changed:', index);
  }, []);

  // No backdrop - allows background interaction
  const renderBackdrop = useCallback(
    () => null,
    []
  );

  const handleBack = () => {
    navigation.goBack();
  };

  const handleMyLocationPress = async () => {
    // Focus map on current location in upper visible area
    if (currentLocation && mapRef?.current) {
      // Animate to current location with offset so marker shows in upper part
      mapRef?.current?.animateToRegion({
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

  const handleBookRide = async () => {
    if (!selectedRide) {
      Alert.alert('Error', 'Please select a ride option');
      return;
    }

    if (!user?.uid && !user?.user?.uid) {
      Alert.alert('Error', 'User not authenticated. Please log in again.');
      return;
    }

    setIsBooking(true);
    try {
      const estimatedFare = distance ? calculateFare(distance, selectedRide.ratePerMile, selectedRide.baseFare || 0) : 0;
      // Create package booking data
      const bookingData = {
        // Package details
        packageId: selectedRide.id || '',
        packageName: selectedRide.name || 'Unknown Package',
        packageImage: selectedRide.image || '',
        packageDescription: selectedRide.description || '',

        // Pricing details
        ratePerMile: selectedRide.ratePerMile || 0,
        baseFare: selectedRide.baseFare || 0,
        distance: distance || 0,
        estimatedFare: estimatedFare,
        totalPrice: `$${estimatedFare.toFixed(2)}`,

        // Customer details
        customerId: user?.uid || user?.user?.uid,

        // Location details
        pickupLocation: currentLocationText || 'Current Location',
        destination: destinationText || 'Destination',
        pickupCoordinates: currentLocation || null,
        destinationCoordinates: destination?.coordinates || null,

        // Service details
        serviceType: route?.params?.serviceType || 'Ride',
        pickupTime: route?.params?.selectedPickupTime || null,
        dropoffTime: route?.params?.selectedDropoffTime || null,
        pickupDate: route?.params?.selectedPickupDate || null,
        dropoffDate: route?.params?.selectedDropoffDate || null,

        // Payment details
        paymentMethod: 'Cash',

        // Package cars info
        carsCount: selectedRide.cars?.length || 0,
        cars: selectedRide.cars || [],
      };
      // Use createPackageBooking function
      const newBookingId = await createPackageBooking(bookingData);
      setBookingId(newBookingId);

      // Show booking summary
      setShowBookingSummary(true);
      setShowDetailSheet(false);

    } catch (error) {
      Alert.alert('Error', `Failed to create booking: ${error.message || 'Please try again.'}`);
    } finally {
      setIsBooking(false);
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
        enablePanDownToClose={false}
        enableDynamicSizing={false}
        animateOnMount={true}
        enableHandlePanningGesture={true}
        enableContentPanningGesture={true}
        handleIndicatorStyle={styles.dragHandle}
        backgroundStyle={styles.bottomSheetBackground}
      >
        <BottomSheetScrollView style={styles.bottomSheetContent}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={styles.backButton} />
            <Text style={styles.modalTitle}>
              {showDetailSheet ? 'Confirm details' : 'Choose a ride'}
            </Text>
            <View style={styles.placeholder} />
          </View>

          {!showDetailSheet && !showBookingSummary ? (
            <>
              {/* Subtitle */}
              <View style={styles.subtitleContainer}>
                <Text style={styles.subtitleText}>Rides we think you'll like</Text>
              </View>
            </>
          ) : null}

          {/* Ride Options List or Detail View */}
          <BottomSheetScrollView
            style={styles.ridesList}
            contentContainerStyle={styles.ridesListContent}
            showsVerticalScrollIndicator={false}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.PRIMARY} />
                <Text style={styles.loadingText}>Finding available rides...</Text>
              </View>
            ) : showDetailSheet && selectedRide ? (
              // Confirm Details View
              <View style={styles.confirmDetailsView}>
                {/* Ride Details Card */}
                <View style={styles.rideDetailsCard}>
                  {/* Package Image */}
                  <View style={styles.packageImageWrapper}>
                    {selectedRide.image ? (
                      <Image
                        source={{ uri: selectedRide.image }}
                        style={styles.carImageLarge}
                        resizeMode="stretch"
                      />
                    ) : (
                      <Image
                        source={require('../../../../assets/car11.png')}
                        style={styles.carImageLarge}
                        resizeMode="contain"
                      />
                    )}
                  </View>

                  {/* Ride Info */}
                  <View style={styles.rideInfoContainer}>
                    <View style={styles.rideNameContainer}>
                      <Text style={styles.rideNameLarge}>{selectedRide.name}</Text>
                      <View style={styles.capacityContainer}>
                        <Ionicons name="car" size={14} color={Colors.WHITE} style={{ marginRight: 4 }} />
                        <Text style={styles.capacityTextLarge}>{selectedRide.cars?.length || 0}</Text>
                      </View>
                    </View>

                    <Text style={styles.estimatedTime}>Available now • Ready to go</Text>

                    {selectedRide.description && (
                      <Text style={styles.rideDescriptionLarge}>
                        {selectedRide.description}
                      </Text>
                    )}

                    {/* Pricing Details */}
                    <View style={styles.pricingDetailsContainer}>
                      {/* <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Base Fare</Text>
                        <Text style={styles.priceValue}>${selectedRide.baseFare || 0}</Text>
                      </View>
                      <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Rate per Mile</Text>
                        <Text style={styles.priceValue}>${selectedRide.ratePerMile}/mile</Text>
                      </View> */}
                      {distance && (
                        <View style={styles.priceRow}>
                          <Text style={styles.priceLabel}>Distance</Text>
                          <Text style={styles.priceValue}>{distance.toFixed(2)} miles</Text>
                        </View>
                      )}
                      <View style={styles.priceDivider} />
                      <View style={styles.priceRow}>
                        <Text style={styles.totalPriceLabel}>Total Price</Text>
                        <Text style={styles.ridePriceLarge}>
                          {distance ? `$${calculateFare(distance, selectedRide.ratePerMile, selectedRide.baseFare).toFixed(2)}` : 'Calculating...'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Payment Method Section */}
                <View style={styles.paymentSection}>
                  <TouchableOpacity style={styles.paymentMethodButton}>
                    <View style={styles.paymentMethodContent}>
                      <View style={styles.paymentIconContainer}>
                        <Ionicons name="cash-outline" size={24} color={Colors.GREEN} />
                      </View>
                      <View style={styles.paymentTextContainer}>
                        <Text style={styles.paymentType}>Cash</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={Colors.BLACK} />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Trip Details */}
                <View style={styles.tripDetailsSection}>
                  <Text style={styles.sectionTitle}>Trip Details</Text>

                  <View style={styles.tripDetailRow}>
                    <View style={styles.tripDetailIcon}>
                      <Ionicons name="location" size={20} color={Colors.PRIMARY} />
                    </View>
                    <View style={styles.tripDetailContent}>
                      <Text style={styles.tripDetailLabel}>Pickup</Text>
                      <Text style={styles.tripDetailText}>{currentLocationText || 'Current Location'}</Text>
                    </View>
                  </View>

                  <View style={styles.tripDetailRow}>
                    <View style={styles.tripDetailIcon}>
                      <Ionicons name="flag" size={20} color={Colors.PRIMARY} />
                    </View>
                    <View style={styles.tripDetailContent}>
                      <Text style={styles.tripDetailLabel}>Destination</Text>
                      <Text style={styles.tripDetailText}>{destinationText || 'Destination'}</Text>
                    </View>
                  </View>

                  {route?.params?.serviceType === 'Reserve' && route?.params?.selectedPickupTime && (
                    <View style={styles.tripDetailRow}>
                      <View style={styles.tripDetailIcon}>
                        <Ionicons name="time" size={20} color={Colors.PRIMARY} />
                      </View>
                      <View style={styles.tripDetailContent}>
                        <Text style={styles.tripDetailLabel}>Pickup Time</Text>
                        <Text style={styles.tripDetailText}>
                          {route?.params?.selectedPickupDate ? new Date(route.params.selectedPickupDate).toLocaleDateString() : 'Today'} at {route.params.selectedPickupTime}
                        </Text>
                      </View>
                    </View>
                  )}

                  {route?.params?.serviceType === 'Reserve' && route?.params?.selectedDropoffTime && (
                    <View style={styles.tripDetailRow}>
                      <View style={styles.tripDetailIcon}>
                        <Ionicons name="time" size={20} color={Colors.PRIMARY} />
                      </View>
                      <View style={styles.tripDetailContent}>
                        <Text style={styles.tripDetailLabel}>Dropoff Time</Text>
                        <Text style={styles.tripDetailText}>
                          {route?.params?.selectedDropoffDate ? new Date(route.params.selectedDropoffDate).toLocaleDateString() : 'Today'} at {route.params.selectedDropoffTime}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            ) : showBookingSummary ? (
              // Booking Summary View
              <View style={styles.bookingSummaryView}>
                {/* Success Message */}
                <View style={styles.successContainer}>
                  <View style={styles.successIconContainer}>
                    <Ionicons name="checkmark-circle" size={80} color={Colors.PRIMARY} />
                  </View>
                  <Text style={styles.successTitle}>Booking Confirmed!</Text>
                  <Text style={styles.successMessage}>
                    A driver will contact you in a while
                  </Text>
                </View>

                {/* Booking Details */}
                <View style={styles.bookingDetailsCard}>
                  <Text style={styles.bookingDetailsTitle}>Booking Details</Text>

                  <View style={styles.bookingDetailRow}>
                    <Text style={styles.bookingDetailLabel}>Booking ID</Text>
                    <Text style={styles.bookingDetailValue}>{bookingId}</Text>
                  </View>

                  <View style={styles.bookingDetailRow}>
                    <Text style={styles.bookingDetailLabel}>Ride</Text>
                    <Text style={styles.bookingDetailValue}>{selectedRide?.name}</Text>
                  </View>

                  <View style={styles.bookingDetailRow}>
                    <Text style={styles.bookingDetailLabel}>Price</Text>
                    <Text style={styles.bookingDetailValue}>{selectedRide?.price}</Text>
                  </View>

                  <View style={styles.bookingDetailRow}>
                    <Text style={styles.bookingDetailLabel}>Pickup</Text>
                    <Text style={styles.bookingDetailValue}>{currentLocationText}</Text>
                  </View>

                  <View style={styles.bookingDetailRow}>
                    <Text style={styles.bookingDetailLabel}>Destination</Text>
                    <Text style={styles.bookingDetailValue}>{destinationText}</Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.summaryButtonsContainer}>
                  <TouchableOpacity
                    style={styles.viewBookingsButton}
                    onPress={() => navigation.navigate('CustomerTabs', { screen: 'Bookings' })}
                  >
                    <Text style={styles.viewBookingsButtonText}>View My Bookings</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.newRideButton}
                    onPress={() => {
                      setShowBookingSummary(false);
                      setSelectedRide(null);
                      navigation.navigate('Services');
                    }}
                  >
                    <Text style={styles.newRideButtonText}>Book Another Ride</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : !showBookingSummary ? (
              // Ride Options List
              <>
                {packages.map((pkg) => {
                  const estimatedFare = distance ? calculateFare(distance, pkg.ratePerMile, pkg.baseFare) : 0;
                  const fareText = distance ? `$${estimatedFare.toFixed(2)}` : 'Calculating...';

                  return (
                    <TouchableOpacity
                      key={pkg.id}
                      style={[
                        styles.rideItem,
                        selectedRide?.id === pkg.id && styles.selectedRideItem,
                      ]}
                      onPress={() => handleRideSelect(pkg)}
                    >
                      <View style={styles.rideIconContainer}>
                        {pkg.image ? (
                          <Image
                            source={{ uri: pkg.image }}
                            style={styles.carImage}
                            resizeMode="stretch"
                          />
                        ) : (
                          <Image
                            source={require('../../../../assets/car11.png')}
                            style={styles.carImage}
                            resizeMode="contain"
                          />
                        )}
                        <Text style={styles.capacityText}>{pkg.cars?.length || 0}</Text>
                      </View>

                      <View style={styles.rideDetails}>
                        <Text style={[
                          styles.rideName,
                          selectedRide?.id === pkg.id && styles.selectedRideName,
                        ]}>
                          {pkg.name}
                        </Text>

                        <Text style={styles.rideTime}>Available now</Text>
                        <Text style={styles.rideDescription}>{pkg.description || 'Professional ride service'}</Text>
                      </View>

                      <View style={styles.ridePricing}>
                        <Text style={styles.ridePrice}>{fareText}</Text>
                        {distance && (
                          <Text style={styles.rateText}>${pkg.ratePerMile}/mile</Text>
                        )}
                      </View>

                      {selectedRide?.id === pkg.id ? (
                        <Ionicons name="checkmark-circle" size={24} color={Colors.PRIMARY} />
                      ) : (
                        <Ionicons name="chevron-forward" size={20} color={Colors.PRIMARY_GREY} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </>
            ) : null}
          </BottomSheetScrollView>

          {/* Fat Divider Above Button */}
          <View style={styles.fullWidthContainer}>
            <View style={styles.fatDivider} />
          </View>

          {/* <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>

          </View> */}
        </BottomSheetScrollView>
      </BottomSheet>
      {!showBookingSummary && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.bookButton,
              (!selectedRide || isBooking) && styles.disabledButton,
            ]}
            onPress={handleBookRide}
            disabled={!selectedRide || isBooking}
          >
            {isBooking ? (
              <View style={styles.buttonLoadingContainer}>
                <ActivityIndicator size="small" color={Colors.WHITE} />
                <Text style={styles.loadingButtonText}>Creating booking...</Text>
              </View>
            ) : (
              <Text style={[
                styles.bookButtonText,
                (!selectedRide || isBooking) && styles.disabledButtonText,
              ]}>
                {showDetailSheet ? 'Confirm and Book' : 'Choose a Package'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
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
    backgroundColor: '#F5F7FA',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  bottomSheetContent: {
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
    fontSize: 22,
    fontWeight: '800',
    color: Colors.BLACK,
    letterSpacing: -0.5,
  },
  placeholder: {
    width: 40,
  },
  subtitleContainer: {
    marginBottom: 20,
  },
  subtitleText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  ridesList: {
    paddingBottom: 120,
    paddingHorizontal: 4,
  },
  ridesListContent: {
    paddingBottom: 20,
  },
  rideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: Colors.WHITE,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  selectedRideItem: {
    backgroundColor: '#F0F8FF',
    borderWidth: 2,
    borderColor: Colors.PRIMARY,
  },
  rideIconContainer: {
    width: 90,
    height: 70,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  carImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    borderRadius: 12,
  },
  capacityText: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: Colors.PRIMARY,
    color: Colors.WHITE,
    fontSize: 10,
    fontWeight: '700',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    borderWidth: 2,
    borderColor: Colors.WHITE,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
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
    fontSize: 18,
    fontWeight: '700',
    color: Colors.BLACK,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  selectedRideName: {
    color: Colors.PRIMARY,
  },
  ridePrice: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.BLACK,
    letterSpacing: -0.5,
  },
  rateText: {
    fontSize: 11,
    color: Colors.PRIMARY_GREY,
    marginTop: 3,
    fontWeight: '500',
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
    lineHeight: 18,
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.WHITE,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  bookButton: {
    backgroundColor: Colors.PRIMARY,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Colors.PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  bookButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.WHITE,
    letterSpacing: -0.3,
  },
  loadingButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.WHITE,
    marginLeft: 8,
  },
  buttonLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  // Confirm Details Styles
  confirmDetailsView: {
    // paddingTop: 10,
  },
  confirmHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.BLACK,
  },
  rideDetailsCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 20,
    padding: 12,
    marginBottom: 8,
    marginHorizontal: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  packageImageWrapper: {
    width: '100%',
    height: 130,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 5,
    backgroundColor: '#F8F9FA',
  },
  carImageLarge: {
    width: '100%',
    height: '100%',
  },
  rideInfoContainer: {
    width: '100%',
  },
  rideNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 6,
  },
  rideNameLarge: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.BLACK,
    flex: 1,
    letterSpacing: -0.5,
  },
  capacityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  capacityTextLarge: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.WHITE,
  },
  estimatedTime: {
    fontSize: 14,
    color: '#10B981',
    marginBottom: 2,
    fontWeight: '600',
  },
  rideDescriptionLarge: {
    fontSize: 14,
    color: Colors.PRIMARY_GREY,
    marginBottom: 5,
    lineHeight: 20,
  },
  pricingDetailsContainer: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 12,
    // marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 14,
    color: Colors.BLACK,
    fontWeight: '600',
  },
  priceDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  totalPriceLabel: {
    fontSize: 16,
    color: Colors.BLACK,
    fontWeight: '700',
  },
  ridePriceLarge: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.PRIMARY,
    letterSpacing: -0.5,
  },
  paymentSection: {
    marginBottom: 8,
    marginHorizontal: 4,
  },
  paymentMethodButton: {
    backgroundColor: Colors.WHITE,
    borderRadius: 16,
    padding: 12,
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
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  paymentTextContainer: {
    flex: 1,
  },
  paymentType: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  tripDetailsSection: {
    backgroundColor: Colors.WHITE,
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    marginHorizontal: 4,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.BLACK,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  tripDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  tripDetailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  tripDetailContent: {
    flex: 1,
  },
  tripDetailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '600',
  },
  tripDetailText: {
    fontSize: 15,
    color: Colors.BLACK,
    fontWeight: '500',
    lineHeight: 21,
  },
  // Booking Summary Styles
  bookingSummaryView: {
    padding: 20,
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.BLACK,
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: Colors.PRIMARY_GREY,
    textAlign: 'center',
  },
  bookingDetailsCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingDetailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.BLACK,
    marginBottom: 16,
  },
  bookingDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dividerGray,
  },
  bookingDetailLabel: {
    fontSize: 14,
    color: Colors.PRIMARY_GREY,
  },
  bookingDetailValue: {
    fontSize: 14,
    color: Colors.BLACK,
    fontWeight: '500',
  },
  summaryButtonsContainer: {
    gap: 12,
  },
  viewBookingsButton: {
    backgroundColor: Colors.PRIMARY,
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewBookingsButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.WHITE,
  },
  newRideButton: {
    backgroundColor: Colors.lightGray,
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newRideButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.BLACK,
  },
});
