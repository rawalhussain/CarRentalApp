import React, { useState, useEffect } from 'react';
import {View, Text, TouchableOpacity, ScrollView, StatusBar, Image} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import InputField from '../../../Components/InputField';
import Button from '../../../Components/Button';
import { signIn, getUserData, signOut, updateUserData } from '../../../Config/firebase';
import styles from './styles';
import {Colors} from '../../../Themes/MyColors';
import {Checkbox} from 'react-native-paper';
import {showMessageAlert} from '../../../Lib/utils/CommonHelper';
import useAuthStore from '../../../store/useAuthStore';
import useUserStore from '../../../store/useUserStore';
import Loader from '../../../Components/Loader';

const Login = () => {
  const navigation = useNavigation();
  const { credentials, setCredentials, setUser } = useAuthStore();
  const { setUserData } = useUserStore();
  const [secure, setSecure] = useState(true);
  const [checked, setChecked] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  // Load saved credentials if they exist
  useEffect(() => {
    if (credentials) {
      setFormData({
        email: credentials.email || '',
        password: credentials.password || '',
      });
      setChecked(true);
    }
  }, [credentials]);

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      showMessageAlert('Error', 'Please fill in all fields', 'warning');
      return;
    }

    try {
      setLoading(true);
      const userCredential = await signIn(formData.email, formData.password);

      // Check if user exists and email is verified
      if (userCredential?.user && !userCredential.user.emailVerified) {
        // Send verification email again
        await userCredential.user.sendEmailVerification();

        // Sign out the user
        await signOut();

        showMessageAlert(
          'Email Not Verified',
          'Please verify your email before logging in. A new verification email has been sent.',
          'warning'
        );
        return;
      }
      if (userCredential.user.uid) {
        // Get user data from database
        const userData = await getUserData(userCredential.user.uid);

        // Update emailVerified status in database if it's not already true
        if (userData && !userData.emailVerified) {
          await updateUserData(userCredential.user.uid, {
            emailVerified: true,
          });
          userData.emailVerified = true;
        }
        setUserData(userData);
        // Set user data in stores
        setUser(userCredential);

        // Save credentials if Remember Me is checked
        if (checked) {
          setCredentials({
            email: formData.email,
            password: formData.password,
          });
        } else {
          setCredentials(null);
        }
      }
    } catch (error) {
      let errorMessage = 'An error occurred during login';
      switch (error.code) {
        case 'auth/invalid-credential':
          errorMessage = 'Invalid credentials. please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        default:
          errorMessage = error.message;
      }

      showMessageAlert('Error', errorMessage, 'danger');
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 3000);
    }
  };

  return (
    <View style={styles.container}>
      {loading && <Loader />}
      <ScrollView style={styles.scrollView}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.BACKGROUND_GREY} />
        <View style={styles.containerTop}>
          <Image
              source={require('../../../../assets/caricon2.png')}
              style={styles.carIcon}
          />
          <Text style={styles.carTopTitle}>Lowest Transport</Text>
        </View>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back {'\n'}
            Ready to hit the road.</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        <View style={styles.form}>
          <InputField
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <InputField
            label="Password"
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            placeholder="Enter your password"
            secureTextEntry={secure}
            onPressIcon={() => setSecure(!secure)}
            icon={secure ? 'eye-off-outline' : 'eye-outline'}
          />

          <View style={[styles.layoutRemember, {marginBottom: 20}]}>
            <View style={styles.layoutRemember}>
              <Checkbox
                status={checked ? 'checked' : 'unchecked'}
                uncheckedColor={Colors.LINE_GRAY}
                color={Colors.PRIMARY}
                onPress={() => {
                  setChecked(!checked);
                  if (!checked) {
                    setCredentials(null);
                  }
                }}
              />
              <Text style={styles.forgotPasswordText}>Remember Me</Text>
            </View>
            <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Login"
            onPress={handleLogin}
            loading={loading}
            style={styles.button}
          />

          {/* Divider */}
          <View style={styles.orContainer}>
            <View style={styles.line} />
            <Text style={styles.orText}>Or</Text>
            <View style={styles.line} />
          </View>

          <Button
              title=" Continue with Google"
              type="social"
              icon={'google-plus'}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Login;
