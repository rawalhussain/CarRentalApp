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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../../Themes/MyColors';

export default function CarsScreen({ navigation }) {
  // Bottom sheet ref
  const bottomSheetRef = useRef(null);
  const insets = useSafeAreaInsets();

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
  ]);

  // Selected ride state
  const [selectedRide, setSelectedRide] = useState(null);

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
  const snapPoints = useMemo(() => ['85%', '90%'], []);

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

  const handleRideSelect = (ride) => {
    setSelectedRide(ride);
  };

  const handleBookRide = () => {
    if (selectedRide) {
      alert(`Ride booked: ${selectedRide.name}`);
    } else {
      alert('Please select a ride option');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.WHITE} />

      {/* Map Background */}
      <View style={styles.mapContainer}>
        <Image
          source={require('../../../../assets/image.png')}
          style={styles.mapImage}
        />
        <View style={styles.mapOverlay}>
          <View style={styles.locationCard}>
            <Text style={styles.locationText}>Home</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.BLACK} />
          </View>
          <View style={[styles.locationCard, styles.destinationCard]}>
            <Text style={styles.locationText}>1369 Haight St</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.BLACK} />
          </View>
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
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color={Colors.BLACK} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Choose a ride</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Subtitle */}
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitleText}>Rides we think you'll like</Text>
          </View>

          {/* Ride Options List */}
          <ScrollView style={styles.ridesList} showsVerticalScrollIndicator={false}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.PRIMARY} />
                <Text style={styles.loadingText}>Finding available rides...</Text>
              </View>
            ) : (
              rideOptions.map((ride) => (
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
              ))
            )}
          </ScrollView>

          {/* Fat Divider Above Button */}
          <View style={styles.fullWidthContainer}>
            <View style={styles.fatDivider} />
          </View>

          {/* Book Ride Button */}
          <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <TouchableOpacity style={styles.bookButton} onPress={handleBookRide}>
              <Text style={styles.bookButtonText}>Book Ride</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  mapOverlay: {
    position: 'absolute',
    top: 100,
    right: 20,
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
  bookButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
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
});
