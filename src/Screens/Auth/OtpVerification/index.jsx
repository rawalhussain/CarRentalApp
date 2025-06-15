import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { updateUserData } from '../../../Config/firebase';
import styles from './styles';
import Button from '../../../Components/Button';

const OtpVerification = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user, formData } = route.params;
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleVerification = async () => {
    try {
      setLoading(true);

      // Update user data in the database
      await updateUserData(user.uid, {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        userType: formData.userType,
        emailVerified: true,
      });

      // Navigate based on user type
      switch (formData.userType) {
        case 'customer':
          navigation.reset({
            index: 0,
            routes: [{ name: 'Services' }],
          });
          break;
        case 'vendor':
          navigation.reset({
            index: 0,
            routes: [{ name: 'VendorDashboard' }],
          });
          break;
        case 'admin':
          navigation.reset({
            index: 0,
            routes: [{ name: 'AdminDashboard' }],
          });
          break;
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setLoading(true);
      await user.sendEmailVerification();
      setTimeLeft(60);
      Alert.alert('Success', 'Verification code has been resent to your email');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Sticky Header */}
      <View style={styles.stickyHeader}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconWrapperRed}>
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Complete SignUp</Text>
          <TouchableOpacity style={styles.iconWrapperGray}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={styles.headerDivider} />
      </View>

      {/* Scrollable content */}
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.subtitle}>Verify Your Email</Text>
        <Text style={styles.subText}>ENTER 4 DIGITS PIN</Text>

        {/* OTP Boxes */}
        <View style={styles.otpContainer}>
          {/* OTP Boxes */}
          <View style={styles.otpInput}>
            <Text style={styles.otpDigit}>{formData.otp[0]}</Text>
          </View>
          <View style={styles.otpInput}>
            <Text style={styles.otpDigit}>{formData.otp[1]}</Text>
          </View>
          <View style={styles.otpInput}>
            <Text style={styles.otpDigit}>{formData.otp[2]}</Text>
          </View>
          <View style={styles.otpInput}>
            <Text style={styles.otpDigit}>{formData.otp[3]}</Text>
          </View>
        </View>

        {/* Verify Button */}
        <Button
          title="Verify"
          onPress={handleVerification}
          disabled={loading}
        />

        {/* Resend Text */}
        <Text style={styles.resendText}>
          Didn't receive the OTP? <Text style={styles.resendLink} onPress={handleResendCode} disabled={loading || timeLeft > 0}>
            {timeLeft > 0 ? `Resend in ${timeLeft}s` : 'Resend'}
          </Text>
        </Text>

        {/* Custom Keypad */}
        <View style={styles.keypad}>
          {/* Row 1 */}
          <View style={styles.keypadRow}>
            {['1', '2', '3'].map((digit) => (
              <TouchableOpacity key={digit} style={styles.key} onPress={() => handleDigitPress(digit)}>
                <Text style={styles.keyText}>{digit}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Row 2 */}
          <View style={styles.keypadRow}>
            {['4', '5', '6'].map((digit) => (
              <TouchableOpacity key={digit} style={styles.key} onPress={() => handleDigitPress(digit)}>
                <Text style={styles.keyText}>{digit}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Row 3 */}
          <View style={styles.keypadRow}>
            {['7', '8', '9'].map((digit) => (
              <TouchableOpacity key={digit} style={styles.key} onPress={() => handleDigitPress(digit)}>
                <Text style={styles.keyText}>{digit}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Row 4: empty, 0, backspace */}
          <View style={styles.keypadRow}>
            <View style={[styles.key, { backgroundColor: 'transparent', elevation: 0 }]} /> {/* Empty left space */}
            <TouchableOpacity style={styles.key} onPress={() => handleDigitPress('0')}>
              <Text style={styles.keyText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.key} onPress={handleBackspace}>
              <Ionicons name="backspace-outline" size={24} color="#555" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default OtpVerification;
