import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import styles from './styles';
import Steps from './Steps';
import CountryDropdown from './CountryDropdown';

const PhoneStep = ({ onNext }) => {
  const [country, setCountry] = useState(null);
  const [phone, setPhone] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.backIcon}>←</Text>
        <Text style={styles.headerTitle}>Number Verification</Text>
        <Text style={styles.headerDots}>•••</Text>
      </View>

      <Steps currentStep={0} />

      <View style={styles.body}>
        <Text style={styles.title}>Verify your phone number</Text>
        <Text style={styles.subtitle}>
          We have sent you an SMS with a code to number
        </Text>

        {/* 🔽 Manual country picker */}
        <CountryDropdown selected={country} onSelect={setCountry} />

        <TextInput
          placeholder="Phone Number"
          keyboardType="phone-pad"
          style={styles.phoneInput}
          value={phone}
          onChangeText={setPhone}
        />

        <TouchableOpacity style={styles.continueButton} onPress={onNext}>
          <Text style={styles.continueText}>Send Code</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PhoneStep;
