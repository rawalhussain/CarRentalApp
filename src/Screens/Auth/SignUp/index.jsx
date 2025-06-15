import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './styles';
import InputField from '../../../Components/InputField';
import Button from '../../../Components/Button';
import { signUp } from '../../../Config/firebase';

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
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSignUp = async () => {
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword || !formData.phoneNumber) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const userCredential = await signUp(
        formData.email,
        formData.password,
        {
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          userType: formData.userType,
        }
      );

      // Navigate to OTP verification
      navigation.navigate('OtpVerification', {
        user: userCredential.user,
        formData,
      });
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerBack}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sign Up</Text>
          <TouchableOpacity
            style={styles.headerRight}
          >
            {/*<Ionicons name="ellipsis-horizontal" size={24} color="#000" />*/}
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Scrollable form content */}
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

        {/* Social */}
        {/*<Button*/}
        {/*    title="Continue with Apple"*/}
        {/*    type="social"*/}
        {/*    icon={'apple'}*/}
        {/*/>*/}
        <Button
            title="oogle"
            type="social"
            icon={'google-plus'}
        />

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default SignUp;
