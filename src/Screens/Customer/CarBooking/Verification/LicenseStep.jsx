import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import styles from './styles';
import Steps from './Steps';

const LicenseStep = ({ onNext }) => {
  const [dob, setDob] = useState(null);
  const [expiry, setExpiry] = useState(null);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);

  const formatDate = (date) =>
    date ? date.toLocaleDateString('en-US') : '';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Fixed Header */}
      <View style={styles.headerRow}>
        <Text style={styles.backIcon}>←</Text>
        <Text style={styles.headerTitle}>License Verification</Text>
        <Text style={styles.headerDots}>•••</Text>
      </View>

      {/* Fixed Stepper */}
      <Steps currentStep={1} verifiedStep={true} />

      {/* Scrollable Form */}
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Scan your driver’s license or enter your information exactly as it appears on your license.
        </Text>

        {/* Scan Box */}
        <View style={styles.scanBox}>
          <Text style={styles.scanBoxText}>Scan to Autofill</Text>
        </View>

        {/* Form Inputs */}
        <TextInput placeholder="Country" style={styles.phoneInput} placeholderTextColor="#999" />
        <TextInput placeholder="State" style={styles.phoneInput} placeholderTextColor="#999" />
        <TextInput placeholder="First Name" style={styles.phoneInput} placeholderTextColor="#999" />
        <TextInput placeholder="Middle Name" style={styles.phoneInput} placeholderTextColor="#999" />
        <TextInput placeholder="Last Name" style={styles.phoneInput} placeholderTextColor="#999" />
        <TextInput placeholder="License Number" style={styles.phoneInput} placeholderTextColor="#999" />

        {/* DOB */}
        <Pressable onPress={() => setShowDobPicker(true)} style={styles.phoneInput}>
          <Text style={dob ? styles.dateText : styles.placeholderText}>
            {dob ? formatDate(dob) : 'Date of birth'}
          </Text>
        </Pressable>

        {/* Expiration */}
        <Pressable onPress={() => setShowExpiryPicker(true)} style={styles.phoneInput}>
          <Text style={expiry ? styles.dateText : styles.placeholderText}>
            {expiry ? formatDate(expiry) : 'Expiration Date'}
          </Text>
        </Pressable>

        {/* Date Pickers */}
        {showDobPicker && (
          <DateTimePicker
            value={dob || new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDobPicker(false);
              if (selectedDate) {setDob(selectedDate);}
            }}
          />
        )}

        {showExpiryPicker && (
          <DateTimePicker
            value={expiry || new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowExpiryPicker(false);
              if (selectedDate) {setExpiry(selectedDate);}
            }}
          />
        )}

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={onNext}>
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LicenseStep;
