import React, {useLayoutEffect, useState} from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './styles';
import InputField from '../../../../Components/InputField';
import { Colors } from '../../../../Themes/MyColors';
import Button from '../../../../Components/Button';
import { createBooking } from '../../../../Config/firebase';
import { showMessageAlert } from '../../../../Lib/utils/CommonHelper';
import Loader from '../../../../Components/Loader';
import useAuthStore from '../../../../store/useAuthStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import MainHeader from '../../../../Components/MainHeader';

const ContactDetails = ({ navigation, route }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  // Get selectedBus and searchPreferences from route.params
  const { selectedBus, searchPreferences } = route.params || {};

  const { user } = useAuthStore();

  const handleNext = async () => {
    if (!firstName || !lastName || !email || !phone) {
      showMessageAlert('Missing Information', 'Please fill in all required fields.', 'warning');
      return;
    }
    setLoading(true);
    const contactDetails = {
      firstName,
      lastName,
      email,
      phone,
      comments,
    };
    // Prepare booking data
    const bookingData = {
      contactDetails,
      vehicle: selectedBus,
      searchPreferences,
      customerId: user?.user?.uid || user?.uid,
    };
    // Create booking in Firebase
    let bookingId = null;
    try {
      console.log('Creating booking with data:', bookingData);
      bookingId = await createBooking(bookingData);
      console.log('Booking created with ID:', bookingId);
    } catch (e) {
      showMessageAlert('Booking Failed', 'Could not create booking. Please try again.', 'danger');
      console.error('Booking creation error:', e);
      setLoading(false);
      return;
    }
    setLoading(false);
    navigation.navigate('BookingSummary', {
      bookingId,
      contactDetails,
      selectedBus,
      searchPreferences,
    });
  };

  return (
    <SafeAreaView style={[styles.container, {padding: 0, backgroundColor: '#fff'}]}>
      <MainHeader
        title="Contact Information"
        onBackPress={() => navigation.goBack()}
        showOptionsButton={false}
      />
      {loading && <Loader />}
      <ScrollView contentContainerStyle={{ paddingVertical: 30, paddingHorizontal: 20 }} keyboardShouldPersistTaps="handled">
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: Colors.BLACK, marginBottom: 8, textAlign: 'center' }}>Provide Contact Details</Text>
        <Text style={{ fontSize: 16, color: Colors.PRIMARY_GREY, marginBottom: 20, textAlign: 'center' }}>
          Make Sure to provide the contact details which are reachable and belongs to the person chauffeur needs to pick up.
        </Text>
        <InputField
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
        />
        <InputField
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
        />
        <InputField
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <InputField
          placeholder="Phone No"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <InputField
          placeholder="Comments"
          value={comments}
          onChangeText={setComments}
          multiline
          numberOfLines={4}
          // inputStyle={{ minHeight: 100, textAlignVertical: 'top', paddingTop: 15 ,paddingVertical: 10 }}
        />
        <Button
          title="Next"
          onPress={handleNext}
          style={{ marginTop: 40, backgroundColor: '#D94A47', borderRadius: 30, paddingVertical: 16 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ContactDetails;
