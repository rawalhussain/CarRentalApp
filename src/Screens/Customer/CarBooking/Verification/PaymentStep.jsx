import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import styles from './styles';
import Steps from './Steps';

const PaymentStep = ({ onNext }) => {
  const [method, setMethod] = useState('Card Payment');
  const [country, setCountry] = useState('United States');

  const paymentMethods = ['Card Payment', 'Cash', 'UPI', 'Wallet'];
  const countries = ['United States', 'India', 'Germany', 'Canada'];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.backIcon}>←</Text>
        <Text style={styles.headerTitle}>Payment Method</Text>
        <Text style={styles.headerDots}>•••</Text>
      </View>

      {/* Stepper */}
      <Steps currentStep={2} verifiedStep={true} verifiedStep2={true} />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Card Preview Placeholder */}
        <View style={styles.cardPreview}>
          <View style={styles.cardLogos}>
            <Text style={{ fontSize: 18 }}>💳</Text>
            <Text style={{ fontSize: 14 }}>VISA</Text>
          </View>
          <View>
            <Text style={styles.cardName}>BENJAMIN JACK</Text>
            <Text style={styles.cardExpire}>Expire: 10-5-2030</Text>
          </View>
          <Text style={styles.cardNumber}>9655   9655   9655   9655</Text>
        </View>

        {/* Payment Method Dropdown */}
        <Text style={styles.sectionLabel}>Select payment method</Text>
        <View style={styles.dropdown}>
          <Text style={styles.dropdownLabel}>{method.toString()}</Text>
        </View>

        {/* Card Info */}
        <Text style={styles.sectionLabel}>Card Information</Text>
        <TextInput placeholder="Full Name" style={styles.phoneInput} placeholderTextColor="#999" />
        <TextInput placeholder="Email Address" style={styles.phoneInput} placeholderTextColor="#999" />
        <TextInput placeholder="Card Number 💳💰💲" style={styles.phoneInput} placeholderTextColor="#999" />

        <View style={styles.row}>
          <TextInput placeholder="MM / YY" style={[styles.phoneInput, { flex: 1, marginRight: 8 }]} placeholderTextColor="#999" />
          <TextInput placeholder="CVC" style={[styles.phoneInput, { flex: 1 }]} placeholderTextColor="#999" />
        </View>

        {/* Country and Zip */}
        <Text style={styles.sectionLabel}>Country or Region</Text>
        <View style={styles.dropdown}>
          <Text style={styles.dropdownLabel}>{country.toString()}</Text>
        </View>
        <TextInput placeholder="ZIP" style={styles.phoneInput} placeholderTextColor="#999" />

        {/* Terms */}
        <View style={styles.termsRow}>
          <Text style={styles.checkbox}>☑</Text>
          <Text style={styles.termsText}>I agree to Terms & Conditions</Text>
        </View>

        {/* Pay with Other */}
        <View style={styles.separatorContainer}>
          <View style={styles.separator} />
          <Text style={styles.separatorText}>Pay with card or</Text>
          <View style={styles.separator} />
        </View>

        <TouchableOpacity style={styles.payButton}>
          <Text style={styles.payText}> Apple Pay</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.payButton}>
          <Text style={styles.payText}>🟢 Google</Text>
        </TouchableOpacity>

        {/* Continue */}
        <TouchableOpacity style={styles.continueButton} onPress={onNext}>
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default PaymentStep;
