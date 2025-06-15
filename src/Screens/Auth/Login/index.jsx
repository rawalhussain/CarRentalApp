import React, { useState } from 'react';
import {View, Text, TouchableOpacity, ScrollView, Alert, StatusBar, Image} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import InputField from '../../../Components/InputField';
import Button from '../../../Components/Button';
import { signIn } from '../../../Config/firebase';
import styles from './styles';
import {Colors} from '../../../Themes/MyColors';
import {Checkbox} from 'react-native-paper';

const Login = () => {
  const navigation = useNavigation();
  const [secure, setSecure] = useState(true);
  const [checked, setChecked] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const userCredential = await signIn(formData.email, formData.password);

      // The navigation will be handled by the AuthContext based on user type
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
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
                }}
            />
            <Text style={styles.forgotPasswordText}>Remember Me</Text>
          </View>
          <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password</Text>
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

        {/* Social */}
        <Button
            title="Continue with Apple"
            type="social"
            icon={'apple'}
        />
        <Button
            title="  Google"
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
  );
};

export default Login;
