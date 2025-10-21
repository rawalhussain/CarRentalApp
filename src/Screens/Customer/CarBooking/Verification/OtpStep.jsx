import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import styles from './styles';
import Steps from './Steps';
import { SafeAreaView } from 'react-native-safe-area-context';
import MainHeader from '../../../../Components/MainHeader';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../../Themes/MyColors';

const OtpStep = ({ onNext, phoneNumber }) => {
  const navigation = useNavigation();
  const [code, setCode] = useState(['', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);

  // Generate a random 4-digit OTP when component mounts
  useEffect(() => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(otp);
    
    // Show the OTP in an alert
    Alert.alert(
      'Verification Code',
      `Your verification code is: ${otp}`,
      [{ text: 'OK' }]
    );
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleChange = (val, idx) => {
    const updated = [...code];
    updated[idx] = val;
    setCode(updated);
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
    
    // Auto-focus next input when user types a digit
    if (val && idx < 3) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyPress = (e, idx) => {
    // Handle backspace to move to previous input
    if (e.nativeEvent.key === 'Backspace' && !code[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleContinue = () => {
    const enteredCode = code.join('');
    
    if (enteredCode.length !== 4) {
      setError('Please enter all 4 digits');
      return;
    }
    
    if (enteredCode === generatedOtp) {
      setError('');
      onNext();
    } else {
      setError('Invalid verification code. Please try again.');
    }
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    
    // Generate new OTP
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(newOtp);
    
    // Reset the code input
    setCode(['', '', '', '']);
    setError('');
    
    // Set cooldown timer (30 seconds)
    setResendCooldown(30);
    
    // Show new OTP in alert
    Alert.alert(
      'New Verification Code',
      `Your new verification code is: ${newOtp}`,
      [{ text: 'OK' }]
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
      <Steps currentStep={0} verifiedStep={true} />

      <View style={styles.body}>
        <Text style={styles.title}>Enter verification code</Text>
        <Text style={styles.subtitle}>We have sent a Code to: {phoneNumber || '+100******00'}</Text>

        <View style={styles.otpRow}>
          {code.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={(ref) => (inputRefs.current[idx] = ref)}
              maxLength={1}
              keyboardType="numeric"
              style={styles.otpInput}
              value={digit}
              onChangeText={(text) => handleChange(text, idx)}
              onKeyPress={(e) => handleKeyPress(e, idx)}
              selectTextOnFocus
              color={Colors.BLACK}  
              
            />
          ))}
        </View>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>

        <Text style={styles.resendText}>
          Didn't receive the OTP? 
          {resendCooldown > 0 ? (
            <Text style={styles.resendDisabled}>Resend in {resendCooldown}s</Text>
          ) : (
            <Text style={styles.resendLink} onPress={handleResend}>Resend</Text>
          )}
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default OtpStep;
