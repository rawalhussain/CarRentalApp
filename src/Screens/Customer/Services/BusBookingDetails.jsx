import React, { useState } from 'react';
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
import styles from '../Booking/styles';

const BusBookingDetails = ({ navigation }) => {
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [hours, setHours] = useState('');

  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState({ day: null, monthIndex: 0 });
  const [currentMonthIndex, setCurrentMonthIndex] = useState(2); // March by default

  const [isTimeModalVisible, setTimeModalVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);

  const [isHourModalVisible, setHourModalVisible] = useState(false);
  const [selectedHour, setSelectedHour] = useState(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const daysInMonth = (monthIndex) => new Date(2025, monthIndex + 1, 0).getDate();

  const showCalendar = () => setCalendarVisible(true);
  const confirmDate = () => {
    const { day, monthIndex } = selectedDate;
    if (day) setPickupDate(`${day} ${months[monthIndex]} 2025`);
    setCalendarVisible(false);
  };

  const showTimePicker = () => setTimeModalVisible(true);
  const confirmTime = () => {
    if (selectedTime) setPickupTime(selectedTime);
    setTimeModalVisible(false);
  };
  const generateTimeSlots = () => ['1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];

  const showHourPicker = () => setHourModalVisible(true);
  const confirmHour = () => {
    if (selectedHour) setHours(selectedHour);
    setHourModalVisible(false);
  };
  const hourOptions = ['1 Hour', '2 Hour', '3 Hour', '4 Hour'];

  const renderCalendarDays = () => {
    const days = [];
    const totalDays = daysInMonth(currentMonthIndex);
    const firstDayIndex = new Date(2025, currentMonthIndex, 1).getDay();
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayBoxEmpty} />);
    }
    for (let day = 1; day <= totalDays; day++) {
      const isSelected = selectedDate.day === day && selectedDate.monthIndex === currentMonthIndex;
      days.push(
        <TouchableOpacity
          key={day}
          style={[styles.dayBox, isSelected && styles.dayBoxSelected]}
          onPress={() => setSelectedDate({ day, monthIndex: currentMonthIndex })}
        >
          <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{day}</Text>
        </TouchableOpacity>
      );
    }
    return days;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#E2282B" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Booking Details</Text>
        <Ionicons name="ellipsis-horizontal" size={24} color="#000" />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Pickup Address:</Text>
        <TextInput
          style={styles.input}
          placeholder="Pickup Address"
          value={pickupAddress}
          onChangeText={setPickupAddress}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Dropoff Address(<Text style={{color:'#aaa'}}>Optional</Text>):</Text>
        <TextInput
          style={styles.input}
          placeholder="Dropoff Address (Optional)"
          value={dropoffAddress}
          onChangeText={setDropoffAddress}
        />
      </View>
      <Pressable onPress={showCalendar} style={styles.inputContainer}>
        <Text style={styles.label}>Pickup Date</Text>
        <Text style={styles.inputText}>{pickupDate}</Text>
      </Pressable>
      <Pressable onPress={showTimePicker} style={styles.inputContainer}>
        <Text style={styles.label}>Pickup Time</Text>
        <Text style={styles.inputText}>{pickupTime}</Text>
      </Pressable>
      <Pressable onPress={showHourPicker} style={styles.inputContainer}>
        <Text style={styles.label}>Set Hours</Text>
        <Text style={styles.inputText}>{hours}</Text>
      </Pressable>
      <TouchableOpacity style={styles.searchButton}>
        <Text style={styles.searchText}>Next</Text>
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
              <Text style={styles.modalTitle}>MARCH 2025</Text>
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
            <View style={styles.calendarGrid}>{renderCalendarDays()}</View>
            <Text style={styles.selectedDateText}>
              {selectedDate.day !== null ? `${selectedDate.day} ${months[selectedDate.monthIndex]} 2025` : ''}
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
            <Text style={styles.modalTitle}>Set Pickup Time</Text>
            <View style={styles.timeGrid}>
              {generateTimeSlots().map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[styles.timeBox, selectedTime === time && styles.timeBoxSelected]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text style={[styles.timeText, selectedTime === time && styles.timeTextSelected]}>{time}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.selectedDateText}>{selectedTime || ''}</Text>
            <TouchableOpacity style={styles.nextButton} onPress={confirmTime}>
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Hour Picker Modal */}
      <Modal visible={isHourModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Hours</Text>
            <View style={styles.timeGrid}>
              {hourOptions.map((hr) => (
                <TouchableOpacity
                  key={hr}
                  style={[styles.timeBox, selectedHour === hr && styles.timeBoxSelected]}
                  onPress={() => setSelectedHour(hr)}
                >
                  <Text style={[styles.timeText, selectedHour === hr && styles.timeTextSelected]}>{hr}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.selectedDateText}>{selectedHour || ''}</Text>
            <TouchableOpacity style={styles.nextButton} onPress={confirmHour}>
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default BusBookingDetails; 