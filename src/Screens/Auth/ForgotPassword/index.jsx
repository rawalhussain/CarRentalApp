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
import { sendPasswordResetEmail } from '../../../Config/firebase';
import { showMessageAlert } from '../../../Lib/utils/CommonHelper';
import Loader from '../../../Components/Loader';

const ForgotPassword = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

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
            <Text style={styles.headerTitle}>Forgot Password</Text>
            <TouchableOpacity style={styles.headerRight} />
          </View>
      ),
    });
  }, [navigation]);

  const handleEmailChange = (value) => {
    // Remove spaces and convert to lowercase
    const processedValue = value.replace(/\s/g, '').toLowerCase();
    setEmail(processedValue);
  };

  const validateEmail = () => {
    if (!email) {
      showMessageAlert('Error', 'Please enter your email address', 'warning');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showMessageAlert('Error', 'Please enter a valid email address', 'warning');
      return false;
    }

    return true;
  };

  const handleResetPassword = async () => {
    if (!validateEmail()) {return;}

    try {
      setLoading(true);
      console.log('Sending reset email to:', email);
      const result = await sendPasswordResetEmail(email);
      console.log('Reset email result:', result);

      showMessageAlert(
        'Reset Email Sent',
        'Please check your email for instructions to reset your password.',
        'success'
      );

      // Navigate back to login screen
      navigation.goBack();
    } catch (error) {
      console.error('Reset password error:', error);
      let errorMessage = 'An error occurred while sending reset email';

      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        default:
          errorMessage = error.message;
      }

      showMessageAlert('Error', errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading && <Loader />}
      <ScrollView
        contentContainerStyle={styles.containerTop}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you instructions to reset your password.
          </Text>

          <InputField
            label="Email"
            value={email}
            onChangeText={handleEmailChange}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Button
            title="Send Reset Link"
            onPress={handleResetPassword}
            loading={loading}
            style={styles.button}
          />

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Remember your password? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ForgotPassword;
