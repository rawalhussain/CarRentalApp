import React, {useLayoutEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Modal,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from '../BusBooking/component/styles';
import { useNavigation } from '@react-navigation/native';
import {Colors} from '../../../Themes/MyColors';
import { SafeAreaView } from 'react-native-safe-area-context';
import MainHeader from '../../../Components/MainHeader';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GOOGLE_MAPS_API_KEY } from '../../../Config/constants';


const CarBookingDetails = () => {
  const navigation = useNavigation();

  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [deliveryOption, setDeliveryOption] = useState('');
  const [where, setWhere] = useState('');

 


  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [calendarTarget, setCalendarTarget] = useState(null);
  const [selectedDate, setSelectedDate] = useState({ day: null, monthIndex: 0 });
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [isTimeModalVisible, setTimeModalVisible] = useState(false);
  const [timeTarget, setTimeTarget] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const currentYear = new Date().getFullYear();
  const today = new Date();
  const todayAtMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const daysInMonth = (monthIndex) => new Date(currentYear, monthIndex + 1, 0).getDate();

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
    const fullDate = `${day} ${months[monthIndex]} ${currentYear}`;
    if (calendarTarget === 'pickup') {setPickupDate(fullDate);}
    else {setReturnDate(fullDate);}
    setCalendarVisible(false);
    setSelectedDate({ day: null, monthIndex: 0 });
  };

  const showTimePicker = (target) => {
    setTimeTarget(target);
    setTimeModalVisible(true);
  };

  const confirmTime = () => {
    if (timeTarget === 'pickup') {setPickupTime(selectedTime);}
    else {setReturnTime(selectedTime);}
    setTimeModalVisible(false);
    setSelectedTime(null);
  };

  const generateTimeSlots = () => {
    const slots = [];
    const base = new Date(2025, 0, 1, 0, 0);
    // Generate 24 hourly slots from 12:00 AM to 11:00 PM
    for (let i = 0; i < 24; i++) {
      slots.push(
        new Date(base.getTime() + i * 60 * 60000).toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
        })
      );
    }
    return slots;
  };

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

  const isSearchDisabled = !where || !pickupDate || !returnDate || !deliveryOption;

  return (
    <SafeAreaView style={styles.container}>
      <MainHeader
      title='Payment Status'
      onBackPress={() => navigation.goBack()}
      showOptionsButton={false}

      />
      {/* Header */}
      <View style={styles.subConstainer}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Where</Text>
        <GooglePlacesAutocomplete
            placeholder="Enter location"
            fetchDetails={true}
            onPress={(data, details = null) => {
              const selected = details?.formatted_address || data?.description || '';
              setWhere(selected);
            }}
            query={{
              key: GOOGLE_MAPS_API_KEY,
              language: 'en',
            }}
            enablePoweredByContainer={false}
            debounce={400}
            minLength={2}
            predefinedPlaces={[]}
            predefinedPlacesAlwaysVisible={false}
            currentLocation={false}
            currentLocationLabel=""
            timeout={10000}
            keyboardShouldPersistTaps="handled"
            listViewDisplayed="auto"
            styles={{
              container: { flex: 0, width: '100%', },
              textInput: [
                styles.input,
                { minHeight: 20, maxHeight: 96, textAlignVertical: 'center', paddingVertical: 0 }
              ],
              listView: {
                backgroundColor: Colors.WHITE,
                marginTop: 8,
                borderRadius: 6,
                maxHeight: 280,
                elevation: 8,
              },
              row: { paddingVertical: 10, paddingHorizontal: 12 },
              separator: { height: 1, backgroundColor: '#eee' },
              description: { color: Colors.BLACK },
            }}
            textInputProps={{
              placeholderTextColor: Colors.PRIMARY_GREY,
              value: where,
              onChangeText: (t) => setWhere(t),
              multiline: true,
              numberOfLines: 2,
              returnKeyType: 'done',
              autoCorrect: false,
              autoCapitalize: 'none',
              clearButtonMode: 'while-editing',
            }}
            onFail={(e) => console.log('GooglePlacesAutocomplete error:', e)}
            onNotFound={() => console.log('No results found')}
        />
      </View>
      <View style={styles.row}>
        <Pressable onPress={() => showCalendar('pickup')} style={styles.halfInputContainer}>
          <Text style={styles.label}>Pickup Date</Text>
          <Text style={styles.inputText}>{pickupDate}</Text>
        </Pressable>
        <Pressable onPress={() => showCalendar('return')} style={styles.halfInputContainer}>
          <Text style={styles.label}>Return Date</Text>
          <Text style={styles.inputText}>{returnDate}</Text>
        </Pressable>
      </View>

      {/* Times */}
      <View style={styles.row}>
        <Pressable onPress={() => showTimePicker('pickup')} style={styles.halfInputContainer}>
          <Text style={styles.label}>Pickup Time</Text>
          <Text style={styles.inputText}>{pickupTime}</Text>
        </Pressable>
        <Pressable onPress={() => showTimePicker('return')} style={styles.halfInputContainer}>
          <Text style={styles.label}>Return Time</Text>
          <Text style={styles.inputText}>{returnTime}</Text>
        </Pressable>
      </View>

      {/* Delivery Buttons */}
      <View style={styles.deliveryRow}>
        <TouchableOpacity
          style={[
            styles.deliveryButton,
            deliveryOption === 'delivered' && styles.deliveryButtonSelected,
          ]}
          onPress={() => setDeliveryOption('delivered')}
        >
          <Text
            style={[
              styles.deliveryText,
              deliveryOption === 'delivered' && styles.deliveryTextSelected,
            ]}
          >
            DELIVERED
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.deliveryButton,
            deliveryOption === 'pickup' && styles.deliveryButtonSelected,
          ]}
          onPress={() => setDeliveryOption('pickup')}
        >
          <Text
            style={[
              styles.deliveryText,
              deliveryOption === 'pickup' && styles.deliveryTextSelected,
            ]}
          >
            PICK BY YOURSELF
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <TouchableOpacity
      style={[styles.searchButton, isSearchDisabled && { opacity: 0.6 }]}
      disabled={isSearchDisabled}
  onPress={() =>
    // navigation.navigate('BusSearchResults')
    navigation.navigate('CarList', {
      where,
      pickupDate,
      returnDate,
    })
  }
>
  <Text style={styles.searchText}>Search</Text>
</TouchableOpacity>



      {/* Calendar Modal */}
      <Modal visible={isCalendarVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingVertical:12, paddingHorizontal:18, borderBottomWidth:1, borderBottomColor:"#eee",}}>
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
            <View style={{backgroundColor:Colors.WHITE,}}>
            <TouchableOpacity
              style={[
                styles.nextButton,
                selectedDate.day === null && { opacity: 0.5 },
              ]}
              onPress={confirmDate}
              disabled={selectedDate.day === null}
            >
              <Text
                style={[
                  styles.nextButtonText,
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

      {/* Time Picker Modal */}
      <Modal visible={isTimeModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
          <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingVertical:12, paddingHorizontal:18, borderBottomWidth:1, borderBottomColor:"#eee",}}>
              <TouchableOpacity
                onPress={() => setTimeModalVisible(false)}
                style={{ width:36, height:36, borderRadius:18, backgroundColor: Colors.PRIMARY, alignItems:'center', justifyContent:'center' }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="chevron-back" size={22} color={Colors.WHITE} />
              </TouchableOpacity>
              <Text style={{ fontSize:18, fontWeight:'600', color:'#000' }}>Set Pickup Time</Text>
              <View style={{ width:36, height:36 }} />
            </View>
            <ScrollView horizontal contentContainerStyle={styles.timeGrid}>
              {generateTimeSlots().map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[styles.timeBox, selectedTime === time && styles.timeBoxSelected]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text style={[styles.timeText, selectedTime === time && styles.timeTextSelected]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.selectedDateContainer}>
            <Text style={{ fontSize:12, fontWeight:'400', color:'#000', marginBottom:6, textAlign:'left',opacity:0.8 }}>Pickup Time</Text>
            {selectedTime !== null &&   <Text style={styles.selectedDateText}>{selectedTime || ''}</Text>}
            </View>
            <View style={{backgroundColor:Colors.WHITE}}>
            <TouchableOpacity
              style={[
                styles.nextButton,
                !selectedTime && styles.disabledButton,
              ]}
              onPress={confirmTime}
              disabled={!selectedTime}
            >
              <Text
                style={[
                  styles.nextButtonText,
                  !selectedTime && styles.disabledButtonText,
                ]}
              >
                Next
              </Text>
            </TouchableOpacity>
                </View>
          </View>
        </View>
      </Modal>
      </View>

    </SafeAreaView>
  );
};

export default CarBookingDetails;
