import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../../Themes/MyColors';
import ModalHeader from '../../../Components/ModalHeader';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function TimeSelectionScreen({ navigation, route }) {
  const { 
    currentLocation, 
    destination, 
    currentLocationText, 
    destinationText, 
    serviceType 
  } = route?.params || {};
  
  // Bottom sheet refs
  const pickupTimeBottomSheetRef = useRef(null);
  const dropoffTimeBottomSheetRef = useRef(null);
  
  // State for time selection
  const [selectedPickupTime, setSelectedPickupTime] = useState(null);
  const [selectedDropoffTime, setSelectedDropoffTime] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => ['50%', '90%'], []);
  
  // Generate time slots (every 15 minutes)
  const generateTimeSlots = () => {
    const slots = [];
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 96; i++) { // 24 hours * 4 (15 min intervals)
      const time = new Date(base.getTime() + i * 15 * 60000);
      const timeString = time.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      slots.push({
        value: timeString,
        time: time
      });
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

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

  const handlePickupTimeSelect = (time) => {
    setSelectedPickupTime(time);
    pickupTimeBottomSheetRef.current?.close();
  };

  const handleDropoffTimeSelect = (time) => {
    setSelectedDropoffTime(time);
    dropoffTimeBottomSheetRef.current?.close();
  };

  const handleNext = () => {
    if (!selectedPickupTime) {
      alert('Please select pickup time');
      return;
    }
    
    if (!selectedDropoffTime) {
      alert('Please select dropoff time');
      return;
    }
    
    // Navigate to Cars screen with time information
    navigation.navigate('Cars', {
      currentLocation,
      destination,
      currentLocationText,
      destinationText,
      serviceType,
      selectedPickupTime,
      selectedDropoffTime,
      selectedDate: selectedDate.toISOString(),
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.WHITE} />
      
      {/* Header */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={24} color={Colors.BLACK} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Choose a time</Text>
          <View style={styles.placeholder} />
        </View>
      </SafeAreaView>

      {/* Content */}
      <View style={styles.content}>
        {/* Pickup/Dropoff Selection */}
        <View style={styles.selectionContainer}>
          <TouchableOpacity 
            style={[styles.selectionButton, styles.selectedButton]}
            onPress={() => {}}
          >
            <Text style={[styles.selectionText, styles.selectedText]}>Pickup at</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.selectionButton}
            onPress={() => {}}
          >
            <Text style={styles.selectionText}>Dropoff by</Text>
          </TouchableOpacity>
        </View>

        {/* Date Display */}
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })}
          </Text>
        </View>

        {/* Time Selection */}
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>
            {selectedPickupTime || '11:00'}
          </Text>
          <Text style={styles.dropoffText}>
            {selectedDropoffTime ? `${selectedDropoffTime} am EDT dropoff time` : '11:30 am EDT dropoff time'}
          </Text>
          <Text style={styles.durationText}>
            About 30 min ride
          </Text>
        </View>

        {/* Time Selection Buttons */}
        <View style={styles.timeButtonsContainer}>
          <TouchableOpacity 
            style={styles.timeButton}
            onPress={() => pickupTimeBottomSheetRef.current?.snapToIndex(0)}
          >
            <Text style={styles.timeButtonText}>Pickup Time</Text>
            <Text style={styles.timeButtonValue}>{selectedPickupTime || 'Select time'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.timeButton}
            onPress={() => dropoffTimeBottomSheetRef.current?.snapToIndex(0)}
          >
            <Text style={styles.timeButtonText}>Dropoff Time</Text>
            <Text style={styles.timeButtonValue}>{selectedDropoffTime || 'Select time'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Next Button */}
      <View style={styles.nextButtonContainer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>

      {/* Pickup Time Bottom Sheet */}
      <BottomSheet
        ref={pickupTimeBottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={true}
        handleIndicatorStyle={styles.dragHandle}
        backgroundStyle={styles.bottomSheetBackground}
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          <ModalHeader
            title="Select Pickup Time"
            onBack={() => pickupTimeBottomSheetRef.current?.close()}
            showBackButton={true}
          />
          
          <ScrollView style={styles.timeSlotsContainer}>
            {timeSlots.map((slot, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.timeSlot,
                  selectedPickupTime === slot.value && styles.timeSlotSelected
                ]}
                onPress={() => handlePickupTimeSelect(slot.value)}
              >
                <Text style={[
                  styles.timeSlotText,
                  selectedPickupTime === slot.value && styles.timeSlotTextSelected
                ]}>
                  {slot.value}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </BottomSheetView>
      </BottomSheet>

      {/* Dropoff Time Bottom Sheet */}
      <BottomSheet
        ref={dropoffTimeBottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={true}
        handleIndicatorStyle={styles.dragHandle}
        backgroundStyle={styles.bottomSheetBackground}
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          <ModalHeader
            title="Select Dropoff Time"
            onBack={() => dropoffTimeBottomSheetRef.current?.close()}
            showBackButton={true}
          />
          
          <ScrollView style={styles.timeSlotsContainer}>
            {timeSlots.map((slot, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.timeSlot,
                  selectedDropoffTime === slot.value && styles.timeSlotSelected
                ]}
                onPress={() => handleDropoffTimeSelect(slot.value)}
              >
                <Text style={[
                  styles.timeSlotText,
                  selectedDropoffTime === slot.value && styles.timeSlotTextSelected
                ]}>
                  {slot.value}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
  header: {
    backgroundColor: Colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dividerGray,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.BLACK,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  selectionContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  selectionButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  selectedButton: {
    backgroundColor: Colors.PRIMARY,
  },
  selectionText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.BLACK,
  },
  selectedText: {
    color: Colors.WHITE,
  },
  dateContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.BLACK,
  },
  timeContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.BLACK,
    marginBottom: 10,
  },
  dropoffText: {
    fontSize: 16,
    color: Colors.BLACK,
    marginBottom: 5,
  },
  durationText: {
    fontSize: 14,
    color: Colors.PRIMARY_GREY,
  },
  timeButtonsContainer: {
    gap: 15,
  },
  timeButton: {
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 20,
  },
  timeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.BLACK,
    marginBottom: 5,
  },
  timeButtonValue: {
    fontSize: 18,
    color: Colors.PRIMARY,
  },
  nextButtonContainer: {
    padding: 20,
    backgroundColor: Colors.WHITE,
  },
  nextButton: {
    backgroundColor: Colors.PRIMARY,
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.WHITE,
  },
  bottomSheetBackground: {
    backgroundColor: Colors.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomSheetContent: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  dragHandle: {
    width: 100,
    height: 4,
    backgroundColor: Colors.SLIDER_GREY,
    borderRadius: 2,
  },
  timeSlotsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  timeSlot: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dividerGray,
  },
  timeSlotSelected: {
    backgroundColor: Colors.PRIMARY,
  },
  timeSlotText: {
    fontSize: 16,
    color: Colors.BLACK,
  },
  timeSlotTextSelected: {
    color: Colors.WHITE,
    fontWeight: 'bold',
  },
});
