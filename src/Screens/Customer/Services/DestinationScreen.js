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

export default function DestinationScreen({ navigation }) {
  // Bottom sheet ref
  const bottomSheetRef = useRef(null);
  const insets = useSafeAreaInsets();
  
  // Dummy destinations data
  const [dummyDestinations] = useState([
    { id: 1, name: 'Downtown Mall', address: '789 Shopping Street, Downtown', type: 'shopping' },
    { id: 2, name: 'Central Park', address: '456 Park Avenue, Green District', type: 'park' },
    { id: 3, name: 'City Hospital', address: '321 Medical Center, Health District', type: 'medical' },
    { id: 4, name: 'University', address: '654 Education Blvd, Campus Area', type: 'education' },
    { id: 5, name: 'Restaurant Row', address: '987 Food Street, Culinary District', type: 'restaurant' },
  ]);
  
  // Selected destination state
  const [selectedDestination, setSelectedDestination] = useState(null);
  
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

  const handleDestinationSelect = (destination) => {
    setSelectedDestination(destination);
  };

  const handleSearchDestination = () => {
    if (selectedDestination) {
      navigation.navigate('Cars');
    } else {
      alert('Please select a destination');
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
        <BottomSheetView style={[styles.bottomSheetContent, { paddingBottom: Math.max(insets.bottom, 20) + 20 }]}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color={Colors.BLACK} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Set your destination</Text>
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
                <View style={styles.destinationSquare} />
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.locationTextInput}
                  placeholder="Where to?"
                  placeholderTextColor={Colors.PRIMARY_GREY}
                  value={selectedDestination ? selectedDestination.name : ''}
                  editable={false}
                />
                <View style={styles.inputUnderline} />
              </View>
            </View>
          </View>

          {/* Fat Divider Above Destinations */}
          <View style={styles.fullWidthContainer}>
            <View style={styles.fatDivider} />
          </View>

          {/* Dummy Destinations List */}
          <ScrollView style={styles.destinationsList} showsVerticalScrollIndicator={false}>
            <Text style={styles.destinationsTitle}>Popular Destinations</Text>
            {dummyDestinations.map((destination) => (
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
                    color={selectedDestination?.id === destination.id ? Colors.WHITE : Colors.PRIMARY} 
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

          {/* Search Destination Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.searchButton} onPress={handleSearchDestination}>
              <Text style={styles.searchButtonText}>Search Destination</Text>
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
  destinationSquare: {
    width: 8,
    height: 8,
    backgroundColor: Colors.BLACK,
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
  searchButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.WHITE,
  },
  destinationsList: {
    maxHeight: 200,
    marginBottom: 20,
  },
  destinationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.BLACK,
    marginBottom: 15,
  },
  destinationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
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
    backgroundColor: Colors.PRIMARY,
  },
  selectedDestinationName: {
    color: Colors.PRIMARY,
    fontWeight: '600',
  },
  buttonContainer: {
    paddingBottom: Platform.OS === 'ios' ? 0 : 10,
  },
});
