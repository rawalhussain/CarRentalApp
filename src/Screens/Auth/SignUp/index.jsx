import React, {useLayoutEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './styles';
import InputField from '../../../Components/InputField';
import Button from '../../../Components/Button';
import { signUp, signOut } from '../../../Config/firebase';
import { showMessageAlert } from '../../../Lib/utils/CommonHelper';
import Loader from '../../../Components/Loader';
import { SafeAreaView } from 'react-native-safe-area-context';
import MainHeader from '../../../Components/MainHeader';
import { Colors } from '../../../Themes/MyColors';

const SignUp = () => {
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    userType: 'customer', // Default to customer
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    let processedValue = value;

    switch (field) {
      case 'fullName':
        // Allow letters and spaces, remove other characters
        processedValue = value.replace(/[^a-zA-Z\s]/g, '');
        // Replace multiple spaces with single space
        processedValue = processedValue.replace(/\s+/g, ' ');
        // Don't trim here to allow spaces at start/end while typing
        break;

      case 'email':
        // Remove spaces and convert to lowercase
        processedValue = value.replace(/\s/g, '').toLowerCase();
        break;

      case 'phoneNumber':
        // Remove all non-digit characters except + at the start
        if (value.startsWith('+')) {
          processedValue = '+' + value.slice(1).replace(/\D/g, '');
        } else {
          processedValue = value.replace(/\D/g, '');
        }
        // Limit to 15 digits (international standard)
        processedValue = processedValue.slice(0, 15);
        break;

      case 'password':
      case 'confirmPassword':
        // Remove spaces
        processedValue = value.replace(/\s/g, '');
        break;

      default:
        processedValue = value;
    }

    setFormData(prev => ({
      ...prev,
      [field]: processedValue,
    }));
  };


  const validateForm = () => {
    // Check for empty fields
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword || !formData.phoneNumber) {
      showMessageAlert('Error', 'Please fill in all fields', 'warning');
      return false;
    }

    // Full Name validation
    const trimmedName = formData.fullName.trim();
    if (trimmedName.length < 3) {
      showMessageAlert('Error', 'Full name must be at least 3 characters long', 'warning');
      return false;
    }

    if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
      showMessageAlert('Error', 'Full name should only contain letters and spaces', 'warning');
      return false;
    }

    // Email validation - improved regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      showMessageAlert('Error', 'Please enter a valid email address', 'warning');
      return false;
    }

    // Phone number validation
    if (!/^\+?[\d\s-]{10,}$/.test(formData.phoneNumber)) {
      showMessageAlert('Error', 'Please enter a valid phone number', 'warning');
      return false;
    }

    // Password validation
    if (formData.password.length < 6) {
      showMessageAlert('Error', 'Password must be at least 6 characters long', 'warning');
      return false;
    }

    if (!/(?=.*[A-Z])/.test(formData.password)) {
      showMessageAlert('Error', 'Password must contain at least one uppercase letter', 'warning');
      return false;
    }

    if (!/(?=.*[0-9])/.test(formData.password)) {
      showMessageAlert('Error', 'Password must contain at least one number', 'warning');
      return false;
    }

    if (!/(?=.*[!@#$%^&*])/.test(formData.password)) {
      showMessageAlert('Error', 'Password must contain at least one special character (!@#$%^&*)', 'warning');
      return false;
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      showMessageAlert('Error', 'Passwords do not match', 'warning');
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {return;}

    try {
      setLoading(true);
      await signUp(
          formData.email,
          formData.password,
          {
            fullName: formData.fullName,
            phoneNumber: formData.phoneNumber,
            userType: formData.userType,
          }
      );

      // Sign out the user immediately after signup to prevent auto-login
      await signOut();

      // Stop loading before showing alert
      setLoading(false);

      // Show success message with verification instructions
      showMessageAlert(
          'Verification Required',
          'Please check your email to verify your account before logging in.',
          'success'
      );

      // Navigate back to login screen with a small delay to ensure message is shown
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }, 1500); // 1.5 second delay to allow alert to be seen

    } catch (error) {
      setLoading(false);

      let errorMessage = 'An error occurred during sign up';

      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak';
          break;
        default:
          errorMessage = error.message;
      }

      showMessageAlert('Error', errorMessage, 'danger');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
        <MainHeader
          title="Sign Up"
          onBackPress={() => navigation.goBack()}
          showOptionsButton={false}
        />
        {loading && <Loader />}
        <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
          <InputField
              label="Full Name"
              value={formData.fullName}
              onChangeText={(text) => handleInputChange('fullName', text)}
              placeholder="Enter your full name"
          />

          <InputField
              label="Email"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
          />

          <InputField
              label="Phone Number"
              value={formData.phoneNumber}
              onChangeText={(text) => handleInputChange('phoneNumber', text)}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
          />

          <InputField
              label="Password"
              value={formData.password}
              onChangeText={(text) => handleInputChange('password', text)}
              placeholder="Enter your password"
              secureTextEntry={showPassword}
              onPressIcon={() => setShowPassword(!showPassword)}
              icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
          />

          <InputField
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(text) => handleInputChange('confirmPassword', text)}
              placeholder="Confirm your password"
              secureTextEntry={showConfirmPassword}
              onPressIcon={() => setShowConfirmPassword(!showConfirmPassword)}
              icon={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
          />

          {/* User Type Selection */}
          <View style={styles.userTypeContainer}>
            <Text style={styles.userTypeLabel}>I want to become a</Text>
            <View style={styles.userTypeButtons}>
              <TouchableOpacity
                  style={[
                    styles.userTypeButton,
                    formData.userType === 'customer' && styles.userTypeButtonActive,
                  ]}
                  onPress={() => handleInputChange('userType', 'customer')}
              >
                <Ionicons
                    name="person-outline"
                    size={24}
                    color={formData.userType === 'customer' ? '#fff' : '#000'}
                />
                <Text style={[
                  styles.userTypeButtonText,
                  formData.userType === 'customer' && styles.userTypeButtonTextActive,
                ]}>
                  Customer
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                  style={[
                    styles.userTypeButton,
                    formData.userType === 'provider' && styles.userTypeButtonActive,
                  ]}
                  onPress={() => handleInputChange('userType', 'provider')}
              >
                <Ionicons
                    name="car-outline"
                    size={24}
                    color={formData.userType === 'provider' ? '#fff' : '#000'}
                />
                <Text style={[
                  styles.userTypeButtonText,
                  formData.userType === 'provider' && styles.userTypeButtonTextActive,
                ]}>
                  Provider vehicle
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Button
              title="Sign Up"
              onPress={handleSignUp}
              loading={loading}
              style={styles.button}
          />

          {/* Divider */}
          <View style={styles.orContainer}>
            <View style={styles.line} />
            <Text style={styles.orText}>Or</Text>
            <View style={styles.line} />
          </View>

          {/* <Button
              title=" Continue with Google"
              type="social"
              icon={'google-plus'}
          /> */}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() =>
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                })}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
  );
};

export default SignUp;
