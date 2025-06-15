import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import styles from './styles';
import Steps from './Steps';

const OtpStep = ({ onNext }) => {
  const [code, setCode] = useState(['', '', '', '']);

  const handleChange = (val, idx) => {
    const updated = [...code];
    updated[idx] = val;
    setCode(updated);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.backIcon}>←</Text>
        <Text style={styles.headerTitle}>Number Verification</Text>
        <Text style={styles.headerDots}>•••</Text>
      </View>

      <Steps currentStep={0} verifiedStep={true} />

      <View style={styles.body}>
        <Text style={styles.title}>Enter verification code</Text>
        <Text style={styles.subtitle}>We have sent a Code to: +100******00</Text>

        <View style={styles.otpRow}>
          {code.map((digit, idx) => (
            <TextInput
              key={idx}
              maxLength={1}
              keyboardType="numeric"
              style={styles.otpInput}
              value={digit}
              onChangeText={(text) => handleChange(text, idx)}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={onNext}>
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>

        <Text style={styles.resendText}>
          Didn’t receive the OTP? <Text style={styles.resendLink}>Resend</Text>
        </Text>
      </View>
    </View>
  );
};

export default OtpStep;
