import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import styles from './styles';
import Steps from './Steps';
import CountryDropdown from './CountryDropdown';
import MainHeader from '../../../../Components/MainHeader';
import Button from '../../../../Components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../../Themes/MyColors';

const PhoneStep = ({ onNext }) => {
  const navigation = useNavigation();
  const [country, setCountry] = useState(null);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isValid, setIsValid] = useState(false);

  // Validate phone number based on selected country
  const validatePhoneNumber = (phoneNumber, selectedCountry) => {
    if (!selectedCountry) {
      return { isValid: false, error: 'Please select a country first' };
    }
    
    if (!phoneNumber.trim()) {
      return { isValid: false, error: 'Phone number is required' };
    }

    // Remove any non-digit characters for validation
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // Check length constraints
    if (cleanPhone.length < selectedCountry.minLength) {
      return { 
        isValid: false, 
        error: `Phone number must be at least ${selectedCountry.minLength} digits` 
      };
    }
    
    if (cleanPhone.length > selectedCountry.maxLength) {
      return { 
        isValid: false, 
        error: `Phone number must be no more than ${selectedCountry.maxLength} digits` 
      };
    }

    // Check pattern
    if (!selectedCountry.pattern.test(cleanPhone)) {
      return { 
        isValid: false, 
        error: `Invalid phone number format for ${selectedCountry.name}` 
      };
    }

    return { isValid: true, error: '' };
  };

  // Update validation when country or phone changes
  useEffect(() => {
    if (country && phone) {
      const validation = validatePhoneNumber(phone, country);
      setPhoneError(validation.error);
      setIsValid(validation.isValid);
    } else {
      setPhoneError('');
      setIsValid(false);
    }
  }, [country, phone]);

  const handleSendCode = () => {
    if (!country) {
      Alert.alert('Error', 'Please select a country first');
      return;
    }

    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    const validation = validatePhoneNumber(phone, country);
    if (!validation.isValid) {
      Alert.alert('Invalid Phone Number', validation.error);
      return;
    }

    // Format phone number for display
    const formattedPhone = `${country.code} ${phone}`;
    Alert.alert(
      'Code Sent', 
      `We have sent a verification code to ${formattedPhone}`,
      [{ text: 'OK', onPress: () => onNext(formattedPhone) }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <MainHeader 
        title="Number Verification"
        showBackButton={true}
        showOptionsButton={false}
        onBackPress={() => navigation.goBack()}
      />

      <Steps currentStep={0} />

      <View style={styles.body}>
        <Text style={styles.title}>Verify your phone number</Text>
        <Text style={styles.subtitle}>
          We have sent you an SMS with a code to number
        </Text>

        <CountryDropdown selected={country} onSelect={setCountry} />

        <TextInput
          placeholder={country ? country.placeholder : "Phone Number"}
          keyboardType="phone-pad"
          style={[
            styles.phoneInput,
            phoneError ? styles.phoneInputError : null,
            isValid ? styles.phoneInputValid : null
          ]}
          value={phone}
          onChangeText={setPhone}
          maxLength={country ? country.maxLength : 15}
          placeholderTextColor={Colors.PRIMARY_GREY}
          color={Colors.BLACK}  
        />
        
        {phoneError ? (
          <Text style={styles.errorText}>{phoneError}</Text>
        ) : null}
        
        {isValid && (
          <Text style={styles.successText}>✓ Valid phone number</Text>
        )}

        <Button 
          title="Send Code"
          onPress={handleSendCode}
          type="primary"
          disabled={!isValid}
        />
      </View>
    </SafeAreaView>
  );
};

export default PhoneStep;
