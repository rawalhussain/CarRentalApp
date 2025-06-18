import React, {useLayoutEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Modal,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './styles';
import DatePicker from 'react-native-ui-datepicker';
import { showMessageAlert } from '../../../../Lib/utils/CommonHelper';
import moment from 'moment';
import { Colors } from '../../../../Themes/MyColors';
import {getCars} from '../../../../Config/firebase';

const BusBookingDetails = ({ navigation }) => {


  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
          <View style={styles.headerContainer}>
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.headerBack}
            >
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Bus Booking Details</Text>
            <TouchableOpacity style={styles.headerRight} />
          </View>
      ),
    });
  }, [navigation]);


  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [hours, setHours] = useState('');

  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(moment());

  const [isTimeModalVisible, setTimeModalVisible] = useState(false);
  const [selectedHour, setSelectedHour] = useState('');

  const [isHourModalVisible, setHourModalVisible] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const daysInMonth = (monthIndex) => new Date(2025, monthIndex + 1, 0).getDate();

  const defaultStyles = {
    container: {
      backgroundColor: 'white',
    },
    day: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    day_label: {
      fontSize: 14,
    },
  };

  const showCalendar = () => setCalendarVisible(true);
  const handleDateChange = (day) => {
    let date = moment(new Date(day.date)).format('DD-MM-YYYY');
    setPickupDate(date);
    setCalendarVisible(false);
  };

  const showTimePicker = () => setTimeModalVisible(true);
  const confirmTime = () => {
    if (selectedHour) {setPickupTime(selectedHour);}
    setTimeModalVisible(false);
  };
  const generate24HourSlots = () => {
    return Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
  };

  const showHourPicker = () => setHourModalVisible(true);
  const confirmHour = () => {
    if (selectedHour) {setHours(selectedHour);}
    setHourModalVisible(false);
  };
  const hourOptions = ['1 Hour', '2 Hour', '3 Hour', '4 Hour'];

  const handleNext = async () => {
    if (!pickupAddress || !pickupDate || !pickupTime || !hours) {
      showMessageAlert('Error', 'Please fill all required fields.', 'warning');
      return;
    }
    try {
      const filters = { type: 'buses' };
      const buses = await getCars(filters);
      navigation.navigate('BusSearchResults', {
        pickupAddress,
        dropoffAddress,
        pickupDate,
        pickupTime,
        hours,
        buses,
      });
    } catch (error) {
      showMessageAlert('Error', 'Error searching buses. Please try again.', 'danger');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
      <TouchableOpacity style={styles.searchButton} onPress={handleNext}>
        <Text style={styles.searchText}>Next</Text>
      </TouchableOpacity>
      {/* Calendar Modal */}
      <Modal visible={isCalendarVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Pickup Date</Text>
            <DatePicker
              mode="single"
              date={!pickupDate ? moment() : moment(pickupDate, 'DD-MM-YYYY')}
              minDate={moment()}
              styles={{
                container: {
                  backgroundColor: 'white',
                },
                day: {
                  width: 40,
                  height: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                today: {borderColor: Colors.PRIMARY, borderWidth: 1},
                today_label: {color: Colors.PRIMARY},
                selected: {backgroundColor: Colors.PRIMARY},
                selected_label: {color: 'white'},
                day_label: {color: Colors.PRIMARY},
                button_next: {backgroundColor: Colors.PRIMARY, padding: 10, borderRadius: 5},
                button_prev: {backgroundColor: Colors.PRIMARY, padding: 10, borderRadius: 5},
              }}
              onChange={handleDateChange}
            />
            <TouchableOpacity style={styles.nextButton} onPress={() => setCalendarVisible(false)}>
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
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
              {generate24HourSlots().map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeBox,
                    selectedHour === time && styles.timeBoxSelected,
                  ]}
                  onPress={() => setSelectedHour(time)}
                >
                  <Text
                    style={[
                      styles.timeText,
                      selectedHour === time && styles.timeTextSelected,
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.selectedDateText}>{selectedHour ? `Pickup Time: ${selectedHour}` : ''}</Text>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={confirmTime}
              disabled={!selectedHour}
            >
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
