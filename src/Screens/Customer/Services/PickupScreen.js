import React, { useRef, useMemo, useCallback, useState } from 'react';
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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../../Themes/MyColors';

const { width: screenWidth } = Dimensions.get('window');

export default function PickupScreen({ navigation }) {
  // Bottom sheet ref
  const bottomSheetRef = useRef(null);
  const insets = useSafeAreaInsets();
  
  // Dummy locations data
  const [dummyLocations] = useState([
    { id: 1, name: 'Home', address: '123 Main Street, Downtown', type: 'home' },
    { id: 2, name: 'Office', address: '456 Business Ave, Financial District', type: 'work' },
    { id: 3, name: 'Airport', address: '789 Airport Blvd, Terminal 1', type: 'airport' },
    { id: 4, name: 'Mall', address: '321 Shopping Center, Westfield', type: 'shopping' },
    { id: 5, name: 'Hospital', address: '654 Medical Drive, City Hospital', type: 'medical' },
  ]);
  
  // Selected location state
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => ['65%', '90%'], []);
  
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

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  const handleConfirmPickup = () => {
    if (selectedLocation) {
      navigation.navigate('Destination');
    } else {
      alert('Please select a pickup location');
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
            <Text style={styles.locationText}>Current Location</Text>
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
        <BottomSheetView style={[styles.bottomSheetContent, { paddingBottom: Math.max(insets.bottom, 20) + 20 }]}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color={Colors.BLACK} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Set your pickup spot</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsText}>Drag map to move pin</Text>
          </View>

          {/* Location Input Field */}
          <View style={styles.locationInputs}>
            <View style={styles.locationInput}>
              <View style={styles.locationIcon}>
                <View style={styles.currentLocationDot} />
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.locationTextInput}
                  placeholder="Current Location?"
                  placeholderTextColor={Colors.PRIMARY_GREY}
                  value={selectedLocation ? selectedLocation.name : ''}
                  editable={false}
                />
                <View style={styles.inputUnderline} />
              </View>
            </View>
          </View>

          {/* Fat Divider Above Locations */}
          <View style={styles.fullWidthContainer}>
            <View style={styles.fatDivider} />
          </View>

          {/* Dummy Locations List */}
          <ScrollView style={styles.locationsList} showsVerticalScrollIndicator={false}>
            <Text style={styles.locationsTitle}>Recent Locations</Text>
            {dummyLocations.map((location) => (
              <TouchableOpacity 
                key={location.id} 
                style={[
                  styles.locationItem,
                  selectedLocation?.id === location.id && styles.selectedLocationItem
                ]}
                onPress={() => handleLocationSelect(location)}
              >
                <View style={[
                  styles.locationIconContainer,
                  selectedLocation?.id === location.id && styles.selectedLocationIcon
                ]}>
                  <Ionicons 
                    name={
                      location.type === 'home' ? 'home' :
                      location.type === 'work' ? 'briefcase' :
                      location.type === 'airport' ? 'airplane' :
                      location.type === 'shopping' ? 'bag' :
                      'medical'
                    } 
                    size={20} 
                    color={selectedLocation?.id === location.id ? Colors.WHITE : Colors.PRIMARY} 
                  />
                </View>
                <View style={styles.locationDetails}>
                  <Text style={[
                    styles.locationName,
                    selectedLocation?.id === location.id && styles.selectedLocationName
                  ]}>
                    {location.name}
                  </Text>
                  <Text style={styles.locationAddress}>{location.address}</Text>
                </View>
                {selectedLocation?.id === location.id ? (
                  <Ionicons name="checkmark-circle" size={20} color={Colors.PRIMARY} />
                ) : (
                  <Ionicons name="chevron-forward" size={16} color={Colors.PRIMARY_GREY} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Fat Divider Above Button */}
          <View style={styles.fullWidthContainer}>
            <View style={styles.fatDivider} />
          </View>

          {/* Confirm Pickup Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmPickup}>
              <Text style={styles.confirmButtonText}>Confirm pickup</Text>
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
  mapText: {
    fontSize: 18,
    color: Colors.PRIMARY_GREY,
    marginBottom: 20,
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
    paddingHorizontal: 20,
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
  instructionsContainer: {
    marginBottom: 20,
  },
  instructionsText: {
    fontSize: 14,
    color: Colors.PRIMARY_GREY,
    textAlign: 'center',
  },
  locationInputs: {
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  locationIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  currentLocationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.PRIMARY_GREY,
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
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
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
    paddingBottom: Platform.OS === 'ios' ? 0 : 10,
  },
});
