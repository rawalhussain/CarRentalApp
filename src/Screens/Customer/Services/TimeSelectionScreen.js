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
  Modal, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetBackdrop, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../../Themes/MyColors';
import ModalHeader from '../../../Components/ModalHeader';
import MainHeader from '../../../Components/MainHeader';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function TimeSelectionScreen({ navigation, route }) {
  const {
    currentLocation,
    destination,
    currentLocationText,
    destinationText,
    serviceType,
  } = route?.params || {};

  // Bottom sheet refs
  const pickupTimeBottomSheetRef = useRef(null);
  const dropoffTimeBottomSheetRef = useRef(null);

  // State for time selection
  const [selectedPickupTime, setSelectedPickupTime] = useState(null);
  const [selectedDropoffTime, setSelectedDropoffTime] = useState(null);
  const [pickupDate, setPickupDate] = useState(() => {
    const now = new Date();
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()];
    const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][now.getMonth()];
    return `${dayName}, ${monthName} ${now.getDate()}`;
  });
  const [returnDate, setReturnDate] = useState(() => {
    const now = new Date();
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()];
    const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][now.getMonth()];
    return `${dayName}, ${monthName} ${now.getDate()}`;
  });
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [calendarTarget, setCalendarTarget] = useState(null);
  const [selectedDate, setSelectedDate] = useState({ day: null, monthIndex: 0 });
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('pickup'); // 'pickup' or 'dropoff'
  // Snap points for the bottom sheet - 90% max height
  const snapPoints = useMemo(() => ['60%', '90%'], []);

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
        hour12: true,
      });
      slots.push({
        value: timeString,
        time: time,
      });
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();


  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const currentYear = new Date().getFullYear();
  const today = new Date();
  const todayAtMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const daysInMonth = (monthIndex) => new Date(currentYear, monthIndex + 1, 0).getDate();

  // Format date as "Fri, May 30"
  const formatDateDisplay = (day, monthIndex, year = currentYear) => {
    const date = new Date(year, monthIndex, day);
    const dayName = dayNames[date.getDay()];
    const monthName = monthsShort[monthIndex];
    return `${dayName}, ${monthName} ${day}`;
  };

  // Get current date formatted
  const getCurrentDateFormatted = () => {
    const now = new Date();
    return formatDateDisplay(now.getDate(), now.getMonth(), now.getFullYear());
  };

  const showCalendar = (target) => {
    setCalendarTarget(target);
    const now = new Date();
    const monthNow = now.getMonth();
    setCurrentMonthIndex(monthNow);
    // preselect today when opening calendar
    setSelectedDate({ day: now.getDate(), monthIndex: monthNow });
    setCalendarVisible(true);
  };

  const confirmDate = () => {
    const { day, monthIndex } = selectedDate;
    const fullDate = formatDateDisplay(day, monthIndex, currentYear);
    if (calendarTarget === 'pickup') {setPickupDate(fullDate);}
    else {setReturnDate(fullDate);}
    setCalendarVisible(false);
    setSelectedDate({ day: null, monthIndex: 0 });
  };

  // Handle sheet changes - removed auto navigation
  const handleSheetChanges = useCallback((index) => {
    // Sheet closed, but don't auto navigate back
    // User can manually use back button if needed
  }, []);

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
  const renderCalendarDays = () => {
    const days = [];
    const totalDays = daysInMonth(currentMonthIndex);
    // getDay(): 0=Sun..6=Sat. We want Monday-first (0=Mon..6=Sun)
    const jsDay = new Date(currentYear, currentMonthIndex, 1).getDay();
    const mondayFirstIndex = (jsDay + 6) % 7; // convert so Mon=0

    // Empty cells before first day (fill from Monday)
    for (let i = 0; i < mondayFirstIndex; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayBoxEmpty} />);
    }

    for (let day = 1; day <= totalDays; day++) {
      const thisDate = new Date(currentYear, currentMonthIndex, day);
      const isPast = thisDate < todayAtMidnight;
      const isSelected =
        selectedDate.day === day && selectedDate.monthIndex === currentMonthIndex;

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayBox,
            isSelected && styles.dayBoxSelected,
            isPast && { opacity: 0.6 },
          ]}
          disabled={isPast}
          onPress={() => setSelectedDate({ day, monthIndex: currentMonthIndex })}
        >
          <Text style={[
            styles.dayText,
            isSelected && styles.dayTextSelected,
            isPast && { color: '#bbb' },
          ]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    // Trailing empty cells to complete the final week (7 columns)
    const totalCells = mondayFirstIndex + totalDays;
    const remaining = (7 - (totalCells % 7)) % 7;
    for (let i = 0; i < remaining; i++) {
      days.push(<View key={`post-empty-${i}`} style={styles.dayBoxEmpty} />);
    }

    return days;
  };


  const handlePickupTimeSelect = (time) => {
    setSelectedPickupTime(time);
    pickupTimeBottomSheetRef.current?.close();
  };

  const handleDropoffTimeSelect = (time) => {
    setSelectedDropoffTime(time);
    dropoffTimeBottomSheetRef.current?.close();
  };

  const handleNext = () => {
    if (!pickupDate) {
      Alert.alert('Please select pickup date');
      return;
    }

    if (!selectedPickupTime) {
      Alert.alert('Please select pickup time');
      return;
    }

    if (!returnDate) {
      Alert.alert('Please select dropoff date');
      return;
    }

    if (!selectedDropoffTime) {
      Alert.alert('Please select dropoff time');
      return;
    }

    // Navigate to Cars screen with time information
    navigation.navigate('Cars', {
      currentLocation,
      destination,
      currentLocationText,
      destinationText,
      serviceType,
      pickupDate,
      returnDate,
      selectedPickupTime,
      selectedDropoffTime,
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // Render item for FlatList
  const renderPickupTimeItem = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.timeSlot,
        selectedPickupTime === item.value && styles.timeSlotSelected,
      ]}
      onPress={() => handlePickupTimeSelect(item.value)}
    >
      <Text style={[
        styles.timeSlotText,
        selectedPickupTime === item.value && styles.timeSlotTextSelected,
      ]}>
        {item.value}
      </Text>
    </TouchableOpacity>
  );

  const renderDropoffTimeItem = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.timeSlot,
        selectedDropoffTime === item.value && styles.timeSlotSelected,
      ]}
      onPress={() => handleDropoffTimeSelect(item.value)}
    >
      <Text style={[
        styles.timeSlotText,
        selectedDropoffTime === item.value && styles.timeSlotTextSelected,
      ]}>
        {item.value}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.WHITE} />

      {/* Main Header */}
      <MainHeader
        title="Choose a time"
        onBackPress={handleBack}
        showOptionsButton={false}
        backgroundColor={Colors.WHITE}
        titleColor={Colors.BLACK}
        backButtonColor={Colors.PRIMARY}
        showBorder={true}
        borderColor={Colors.dividerGray}
      />

      {/* Content */}
      <View style={styles.content}>
        {/* Pickup/Dropoff Selection */}
        <View style={styles.selectionContainer}>
          <TouchableOpacity
            style={[styles.selectionButton, activeTab === 'pickup' && styles.selectedButton]}
            onPress={() => setActiveTab('pickup')}
          >
            <Text style={[styles.selectionText, activeTab === 'pickup' && styles.selectedText]}>Pickup at</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.selectionButton, activeTab === 'dropoff' && styles.selectedButton]}
            onPress={() => setActiveTab('dropoff')}
          >
            <Text style={[styles.selectionText, activeTab === 'dropoff' && styles.selectedText]}>Dropoff by</Text>
          </TouchableOpacity>
        </View>

        {/* Date Selection - Clickable */}
        <TouchableOpacity
          style={styles.dateContainer}
          onPress={() => showCalendar(activeTab === 'pickup' ? 'pickup' : 'dropoff')}
        >
          <Text style={styles.dateText}>
            {activeTab === 'pickup' ? pickupDate : returnDate}
          </Text>
          <View style={styles.dateDivider} />
        </TouchableOpacity>

        {/* Time Display - Clickable */}
        <TouchableOpacity
          style={styles.timeContainer}
          onPress={() => {
            if (activeTab === 'pickup') {
              pickupTimeBottomSheetRef.current?.snapToIndex(0);
            } else {
              dropoffTimeBottomSheetRef.current?.snapToIndex(0);
            }
          }}
        >
          <Text style={styles.timeText}>
            {activeTab === 'pickup'
              ? (selectedPickupTime || '11:00')
              : (selectedDropoffTime || '11:30')}
          </Text>
          <Text style={styles.dropoffText}>
            {activeTab === 'pickup'
              ? (selectedDropoffTime ? `${selectedDropoffTime} dropoff time` : '11:30 am EDT dropoff time')
              : (selectedPickupTime ? `${selectedPickupTime} pickup time` : '11:00 am EDT pickup time')}
          </Text>
          <Text style={styles.durationText}>
            About 30 min ride
          </Text>
        </TouchableOpacity>
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
        enableOverDrag={false}
        enableContentPanningGesture={false}
        enableHandlePanningGesture={true}
        animateOnMount={true}
      >
        <ModalHeader
          title="Select Pickup Time"
          onBack={() => pickupTimeBottomSheetRef.current?.close()}
          showBackButton={true}
        />

        <BottomSheetFlatList
          data={timeSlots}
          renderItem={renderPickupTimeItem}
          keyExtractor={(item, index) => `pickup-${index}`}
          contentContainerStyle={styles.timeSlotsContent}
          showsVerticalScrollIndicator={true}
          bounces={false}
        />
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
        enableOverDrag={false}
        enableContentPanningGesture={false}
        enableHandlePanningGesture={true}
        animateOnMount={true}
      >
        <ModalHeader
          title="Select Dropoff Time"
          onBack={() => dropoffTimeBottomSheetRef.current?.close()}
          showBackButton={true}
        />

        <BottomSheetFlatList
          data={timeSlots}
          renderItem={renderDropoffTimeItem}
          keyExtractor={(item, index) => `dropoff-${index}`}
          contentContainerStyle={styles.timeSlotsContent}
          showsVerticalScrollIndicator={true}
          bounces={false}
        />
      </BottomSheet>


      <Modal visible={isCalendarVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingVertical:12, paddingHorizontal:18, borderBottomWidth:1, borderBottomColor:'#eee'}}>
              <TouchableOpacity
                onPress={() => setCalendarVisible(false)}
                style={{ width:36, height:36, borderRadius:18, backgroundColor: Colors.PRIMARY, alignItems:'center', justifyContent:'center' }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="chevron-back" size={22} color={Colors.WHITE} />
              </TouchableOpacity>
              <Text style={{ fontSize:18, fontWeight:'600', color:'#000' }}>Set Pickup Date</Text>
              <View style={{ width:36, height:36 }} />
            </View>
            <View style={styles.weekdayRow}>
              {weekdays.map((d) => (
                <Text key={d} style={[styles.weekdayText, { color: 'red' }]}>{d}</Text>
              ))}
            </View>
            <View style={styles.monthHeader}>
              <TouchableOpacity
                disabled={currentMonthIndex === 0}
                onPress={() => setCurrentMonthIndex((prev) => Math.max(prev - 1, 0))}
              >
                <Ionicons name="chevron-back" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{months[currentMonthIndex]} {currentYear}</Text>
              <TouchableOpacity
                disabled={currentMonthIndex === 11}
                onPress={() => setCurrentMonthIndex((prev) => Math.min(prev + 1, 11))}
              >
                <Ionicons name="chevron-forward" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.calendarGrid}>
              {renderCalendarDays()}
            </View>
      <View style={styles.selectedDateContainer}>
            <Text style={{ fontSize:12, fontWeight:'400', color:'#000', marginBottom:6, textAlign:'left',opacity:0.8 }}>Pickup Date</Text>
            {selectedDate.day !== null &&   <Text style={styles.selectedDateText}>
              {selectedDate.day !== null
                ? `${selectedDate.day} ${months[selectedDate.monthIndex]} ${currentYear}`
                : ''}
            </Text>}
            </View>
            <View style={{backgroundColor:Colors.WHITE, paddingBottom: 18}}>
            <TouchableOpacity
              style={[
                styles.modalNextButton,
                selectedDate.day === null && styles.disabledButton,
              ]}
              onPress={confirmDate}
              disabled={selectedDate.day === null}
            >
              <Text
                style={[
                  styles.modalNextButtonText,
                  selectedDate.day === null && styles.disabledButtonText,
                ]}
              >
                Next
              </Text>
            </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
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
    paddingVertical: 10,
  },
  dateText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.BLACK,
    marginBottom: 8,
  },
  dateDivider: {
    width: 250,
    height: 1,
    backgroundColor: Colors.BLACK,
    marginTop: 4,
  },
  timeContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  timeText: {
    fontSize: 32,
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
  dragHandle: {
    width: 100,
    height: 4,
    backgroundColor: Colors.SLIDER_GREY,
    borderRadius: 2,
  },
  timeSlotsContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
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

  // Modal Overlay and Content - Critical for bottom sheet appearance
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.BACKGROUND_GREY,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: Colors.gray,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },

  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 5,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 12,
    color: '#777',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems:'center',
    paddingHorizontal:18,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    gap: 16,
    borderBottomColor: '#eee',
    paddingBottom: 9,
  },
  dayBoxEmpty: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  dayBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    // margin: 5,
    // marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  dayBoxSelected: {
    backgroundColor: 'red',
    borderColor: 'red',
  },
  dayText: {
    color: '#000',
  },
  dayTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // Time Picker
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingBottom: 12,
    paddingTop: 12,
  },
  timeBox: {
    width: 80,
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  timeBoxSelected: {
    backgroundColor: 'red',
    borderColor: 'red',
  },

  timeTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // Bottom Display + Next
  selectedDateContainer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    marginTop: 8,
    paddingBottom: 18,
    backgroundColor: 'white',
    alignItems: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  selectedDateText: {
    textAlign: 'left',
    color: 'red',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalNextButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginHorizontal: 18,
    opacity: 1,
  },
  modalNextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    color: '#fff',
  },

  calendar: {
    width: '100%',
    height: 400,
  },
  calendarText: {
    color: '#000',
    fontSize: 16,
  },
  calendarHeaderText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  calendarWeekDaysText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  calendarSelectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
