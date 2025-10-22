import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import styles from './styles';
import Steps from './Steps';
import { SafeAreaView } from 'react-native-safe-area-context';
import MainHeader from '../../../../Components/MainHeader';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Icons } from '../../../../Themes/icons';
import { Checkbox } from 'react-native-paper';
import { Colors } from '../../../../Themes/MyColors';
import { createBooking } from '../../../../Config/firebase';
import useAuthStore from '../../../../store/useAuthStore';
import Loader from '../../../../Components/Loader';

const PaymentStep = ({ onNext }) => { 
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuthStore();
  const [method, setMethod] = useState('Cash payment');
  const [country, setCountry] = useState('United States');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
    zip: ''
  });
  
  // Check if all fields are filled
  const isFormValid = () => {
    return (
      formData.fullName.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.cardNumber.trim() !== '' &&
      formData.expiry.trim() !== '' &&
      formData.cvc.trim() !== '' &&
      formData.zip.trim() !== '' &&
      termsAccepted
    );
  };
  
  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle continue with validation
  const handleContinue = async () => {
    if (!isFormValid()) {
      return;
    }

    setLoading(true);
    
    try {
      // Get car data from route params (passed from CarDetails)
      const { carData, pickupDate, returnDate, where } = route.params || {};
      
      // Prepare booking data
      const bookingData = {
        vehicle: {
          id: carData?.id,
          name: carData?.name,
          model: carData?.model,
          price: carData?.price,
          variant: carData?.variant,
          type: 'car',
          vendorId: carData?.vendorId || '',
        },
        customerId: user?.user?.uid || user?.uid,
        pickupLocation: where,
        pickupDate: pickupDate,
        returnDate: returnDate,
        serviceType: 'Car Rental',
        contactDetails: {
          firstName: formData.fullName.split(' ')[0] || '',
          lastName: formData.fullName.split(' ').slice(1).join(' ') || '',
          email: formData.email,
          phone: '', // Add phone if available
        },
        paymentDetails: {
          method: method,
          cardNumber: formData.cardNumber,
          expiry: formData.expiry,
          cvc: formData.cvc,
          zip: formData.zip,
          country: country,
        },
        amount: carData?.price || 1400,
        serviceFee: 15,
        tax: 0,
        total: (carData?.price || 1400) + 15,
      };

      console.log('Creating booking with data:', bookingData);
      
      // Create booking in Firebase
      const bookingId = await createBooking(bookingData);
      console.log('Booking created with ID:', bookingId);

      // Navigate to BookingSummary with all details
      navigation.navigate('BookingSummary', {
        bookingId,
        contactDetails: bookingData.contactDetails,
        selectedBus: bookingData.vehicle, // Using same structure as bus booking
        searchPreferences: {
          pickupDate,
          returnDate,
          where,
        },
        paymentDetails: bookingData.paymentDetails,
        transactionDetails: {
          id: `#T${Date.now()}B0J1`,
          date: new Date().toLocaleDateString('en-GB') + ' - ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          amount: bookingData.amount,
          serviceFee: bookingData.serviceFee,
          tax: bookingData.tax,
          total: bookingData.total,
        }
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert('Booking Failed', 'Could not create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading && <Loader />}
      <MainHeader 
        // title="Payment Method"
        showBackButton={true}
        // showOptionsButton={true}
        onBackPress={() => navigation.goBack()}
        showOptionsButton={false}
      />
      <Steps currentStep={2} verifiedStep={true} verifiedStep2={true} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Card Preview */}
          <View style={styles.cardPreview}>
            <View style={styles.cardLogos}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ width: 40, height: 25, backgroundColor: '#eb001b', borderRadius: 20, opacity: 0.9 }} />
                <View style={{ width: 40, height: 25, backgroundColor: '#f79e1b', borderRadius: 20, opacity: 0.9, marginLeft: -20 }} />
              </View>
              <Text style={{ fontSize: 24, color: '#fff', fontWeight: 'bold' }}>VISA</Text>
            </View>
            
            <View style={styles.cardChip} />
            
            <View>
              <Text style={styles.cardName}>BENJAMIN JACK</Text>
              <Text style={styles.cardExpire}>Expire: 10-5-2030</Text>
            </View>
            <Text style={styles.cardNumber}>9655   9655   9655   9655</Text>
          </View>

          {/* Payment Method Selection */}
          <Text style={styles.sectionLabel}>select payment method</Text>
          <View style={styles.dropdown}>
            <View style={styles.paymentMethodContainer}>
              <Image source={Icons.card} style={styles.paymentIcon} />
              <Text style={styles.dropdownLabel}>{method}</Text>
            </View>
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>DAFULT</Text>
            </View>
          </View>

          {/* Card Information */}
          <Text style={styles.sectionLabel}>Card information</Text>
          <TextInput 
            placeholder="Full Name" 
            style={styles.phoneInput} 
            placeholderTextColor={Colors.PRIMARY_GREY}
            value={formData.fullName}
            onChangeText={(value) => handleInputChange('fullName', value)}
            color={Colors.BLACK}
          />
          <TextInput 
            placeholder="Email Address" 
            style={styles.phoneInput} 
            placeholderTextColor={Colors.PRIMARY_GREY}
            keyboardType="email-address"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            color={Colors.BLACK}
          />
          
          {/* Card Number with Icons */}
          <View style={styles.inputWithIcons}>
            <TextInput 
              placeholder="Number" 
              style={styles.cardNumberInput} 
              placeholderTextColor={Colors.PRIMARY_GREY}
              keyboardType="number-pad"
              value={formData.cardNumber}
              onChangeText={(value) => handleInputChange('cardNumber', value)}
              color={Colors.BLACK}
            />
            <View style={styles.cardIconsRow}>
              <View style={{ width: 32, height: 20, backgroundColor: '#1434CB', borderRadius: 3, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 8, fontWeight: 'bold' }}>VISA</Text>
              </View>
              <View style={{ width: 32, height: 20, borderRadius: 3, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
                <View style={{ flexDirection: 'row' }}>
                  <View style={{ width: 10, height: 10, backgroundColor: '#eb001b', borderRadius: 5 }} />
                  <View style={{ width: 10, height: 10, backgroundColor: '#f79e1b', borderRadius: 5, marginLeft: -4 }} />
                </View>
              </View>
              <View style={{ width: 32, height: 20, backgroundColor: '#016FD0', borderRadius: 3, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 7, fontWeight: 'bold' }}>AMEX</Text>
              </View>
              <View style={{ width: 32, height: 20, backgroundColor: '#0079BE', borderRadius: 3, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 7, fontWeight: 'bold' }}>DISC</Text>
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <TextInput 
              placeholder="MM / YY" 
              style={[styles.phoneInput, { flex: 1 }]} 
              placeholderTextColor={Colors.PRIMARY_GREY}
              keyboardType="number-pad"
              value={formData.expiry}
              onChangeText={(value) => handleInputChange('expiry', value)}
              color={Colors.BLACK}
            />
            <View style={styles.halfInputWithIcon}>
              <TextInput 
                placeholder="CVC" 
                style={[styles.phoneInput, { flex: 1 }]} 
                placeholderTextColor={Colors.PRIMARY_GREY}
                keyboardType="number-pad"
                secureTextEntry
                value={formData.cvc}
                onChangeText={(value) => handleInputChange('cvc', value)}
                color={Colors.BLACK}
              />
              <Image 
                source={Icons.craditCard} 
                style={styles.cvcIcon} 
              />
            </View>
          </View>

          {/* Country and ZIP */}
          <Text style={styles.sectionLabel}>Country or region</Text>
          <TouchableOpacity style={styles.dropdown}>
            <Text style={styles.dropdownLabel}>{country}</Text>
            <Text style={{ color: Colors.PRIMARY_GREY }}>▼</Text>
          </TouchableOpacity>
          
          <TextInput 
            placeholder="ZIP" 
            style={styles.phoneInput} 
              placeholderTextColor={Colors.PRIMARY_GREY}
            keyboardType="number-pad"
            value={formData.zip}
            onChangeText={(value) => handleInputChange('zip', value)}
            color={Colors.BLACK}
            />

          {/* Terms Checkbox */}
          <View style={styles.termsRow}>
            <Checkbox
              status={termsAccepted ? 'checked' : 'unchecked'}
              uncheckedColor={Colors.LINE_GRAY}
              color={Colors.PRIMARY}
              onPress={() => setTermsAccepted(!termsAccepted)}
            />
            <Text style={styles.termsText}>Trams & continue ⌄</Text>
          </View>

          {/* Continue Button */}
          <TouchableOpacity 
            style={[
              styles.continueButton, 
              (!isFormValid() || loading) && styles.continueButtonDisabled
            ]} 
            onPress={handleContinue}
            disabled={!isFormValid() || loading}
          >
            <Text style={[
              styles.continueText,
              (!isFormValid() || loading) && styles.continueTextDisabled
            ]}>
              {loading ? 'Creating Booking...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PaymentStep;
