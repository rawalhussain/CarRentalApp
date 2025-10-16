import React, {useLayoutEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from '../BusBooking/component/styles';
import { useNavigation } from '@react-navigation/native';
import {Colors} from '../../../Themes/MyColors';

const CarBookingDetails = () => {
  const navigation = useNavigation();

  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [deliveryOption, setDeliveryOption] = useState('');
  const [where, setWhere] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
          <View style={styles.headerContainer}>
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.headerBack}
            >
              <Ionicons name="chevron-back" size={24} color={Colors.WHITE} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Payment States</Text>
            <TouchableOpacity style={styles.headerRight} />
          </View>
      ),
    });
  }, [navigation]);


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

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const daysInMonth = (monthIndex) => new Date(2025, monthIndex + 1, 0).getDate();

  const showCalendar = (target) => {
    setCalendarTarget(target);
    setCalendarVisible(true);
  };

  const confirmDate = () => {
    const { day, monthIndex } = selectedDate;
    const fullDate = `${day} ${months[monthIndex]} 2025`;
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
    for (let i = 0; i < 96; i++) {
      slots.push(
        new Date(base.getTime() + i * 15 * 60000).toLocaleTimeString([], {
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
    const firstDayIndex = new Date(2025, currentMonthIndex, 1).getDay(); // 0 = Sun

    // Empty cells before first day
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayBoxEmpty} />);
    }

    for (let day = 1; day <= totalDays; day++) {
      const isSelected =
        selectedDate.day === day && selectedDate.monthIndex === currentMonthIndex;

      days.push(
        <TouchableOpacity
          key={day}
          style={[styles.dayBox, isSelected && styles.dayBoxSelected]}
          onPress={() => setSelectedDate({ day, monthIndex: currentMonthIndex })}
        >
          <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return days;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Where</Text>
        <TextInput
            style={styles.input}
            placeholder="Enter location"
            value={where}
            onChangeText={setWhere}
        />
      </View>


      {/* Dates */}
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
  style={styles.searchButton}
  onPress={() =>
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
            <View style={styles.monthHeader}>
              <TouchableOpacity
                disabled={currentMonthIndex === 0}
                onPress={() => setCurrentMonthIndex((prev) => Math.max(prev - 1, 0))}
              >
                <Ionicons name="chevron-back" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{months[currentMonthIndex]} 2025</Text>
              <TouchableOpacity
                disabled={currentMonthIndex === 11}
                onPress={() => setCurrentMonthIndex((prev) => Math.min(prev + 1, 11))}
              >
                <Ionicons name="chevron-forward" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.weekdayRow}>
              {weekdays.map((d) => (
                <Text key={d} style={styles.weekdayText}>{d}</Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {renderCalendarDays()}
            </View>

            <Text style={styles.selectedDateText}>
              {selectedDate.day !== null
                ? `${selectedDate.day} ${months[selectedDate.monthIndex]} 2025`
                : ''}
            </Text>
            <TouchableOpacity style={styles.nextButton} onPress={confirmDate}>
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <Modal visible={isTimeModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Time</Text>
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
            <Text style={styles.selectedDateText}>{selectedTime || ''}</Text>
            <TouchableOpacity style={styles.nextButton} onPress={confirmTime}>
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CarBookingDetails;
