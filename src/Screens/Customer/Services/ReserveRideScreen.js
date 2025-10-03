import React, { useState, useRef, useMemo, useCallback } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../../Themes/MyColors';

const { width: screenWidth } = Dimensions.get('window');

export default function ReserveRideScreen({ navigation }) {
  // Bottom sheet ref
  const bottomSheetRef = useRef(null);
  
  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => ['85%', '95%'], []);
  
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
        appearsOnIndex={1}
        opacity={0.3}
      />
    ),
    []
  );

  const handleBack = () => {
    bottomSheetRef.current?.close();
  };

  const handleNext = () => {
    navigation.navigate('Pickup');
  };

  return (
    <View style={styles.container}>
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
        </View>
      </View>

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={true}
        handleIndicatorStyle={styles.dragHandle}
        backgroundStyle={styles.bottomSheetBackground}
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color={Colors.BLACK} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Plan your ride</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Header and Action Buttons Container */}
          <View style={styles.headerAndButtonsContainer}>
            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="time" size={20} color={Colors.WHITE} />
                <Text style={styles.actionButtonText}>Pickup now</Text>
                <Ionicons name="chevron-down" size={16} color={Colors.WHITE} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="person" size={20} color={Colors.WHITE} />
                <Text style={styles.actionButtonText}>For me</Text>
                <Ionicons name="chevron-down" size={16} color={Colors.WHITE} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Location Input Fields */}
          <View style={styles.locationInputs}>
            <TouchableOpacity 
              style={styles.locationInput}
              onPress={() => navigation.navigate('Pickup')}
            >
              <View style={styles.locationIcon}>
                <View style={styles.currentLocationDot} />
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.locationTextInput}
                  placeholder="Current Location?"
                  placeholderTextColor={Colors.PRIMARY_GREY}
                  editable={false}
                  pointerEvents="none"
                />
                <View style={styles.inputUnderline} />
              </View>
            </TouchableOpacity>

            <View style={styles.connectingLine} />

            <TouchableOpacity 
              style={styles.locationInput}
              onPress={() => navigation.navigate('Destination')}
            >
              <View style={styles.locationIcon}>
                <View style={styles.destinationSquare} />
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.locationTextInput}
                  placeholder="Destination?"
                  placeholderTextColor={Colors.PRIMARY_GREY}
                  editable={false}
                  pointerEvents="none"
                />
                <View style={styles.inputUnderline} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Fat Divider Above Options */}
          <View style={styles.fullWidthContainer}>
            <View style={styles.fatDivider} />
          </View>

          {/* Additional Options */}
          <View style={styles.optionsContainer}>
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
          </View>

          {/* Fat Divider Below Options */}
          <View style={styles.fullWidthContainer}>
            <View style={styles.fatDivider} />
          </View>

          {/* Next Button */}
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
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
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
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
  headerAndButtonsContainer: {
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    marginTop: -10,
    marginHorizontal: -20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 15,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A91C9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#0A91C9',
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
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
    marginTop: 5,
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
  destinationSquare: {
    width: 8,
    height: 8,
    backgroundColor: Colors.BLACK,
  },
  connectingLine: {
    width: 2,
    height: 15,
    backgroundColor: '#E0E0E0',
    marginLeft: 10,
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
    backgroundColor: '#E0E0E0',
    width: '100%',
    marginVertical: 15,
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
  nextButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.WHITE,
  },
});
