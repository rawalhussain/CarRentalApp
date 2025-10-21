import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import styles from './styles';
import PhoneStep from './PhoneStep';
import OtpStep from './OtpStep';
import LicenseStep from './LicenseStep';
import PaymentStep from './PaymentStep';
import MainHeader from '../../../../Components/MainHeader';
import Button from '../../../../Components/Button';
import { Icons } from '../../../../Themes/icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';


const steps = [
  { icon: Icons.phone, label: 'Mobile number Verification' },
  { icon: Icons.license, label: 'Verify your license' },
  { icon: Icons.card, label: 'Payment method' },
];

const VerificationScreen = () => {
  const navigation = useNavigation();
  const [currentScreen, setCurrentScreen] = useState('intro');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Move from emoji intro to phone number step
  const handleIntroContinue = () => {
    setCurrentScreen('phone');
  };

  const handleLicenseContinue = () => {
    setCurrentScreen('payment'); // ✅ NEW
  };

  // Move from phone step to OTP input
  const handlePhoneContinue = (phone) => {
    setPhoneNumber(phone);
    setCurrentScreen('otp');
  };

  // Final continue after OTP
  const handleOtpContinue = () => {
    setCurrentScreen('license'); // ✅ Correct logic to go to next screen
  };

  const handlePaymentContinue = () => {
    alert('✅ All verification steps completed!');
  };

  // ===== Render Logic =====
  if (currentScreen === 'phone') {
    return <PhoneStep onNext={handlePhoneContinue} style={styles.phoneStep} />;
  }

  if (currentScreen === 'otp') {
    return <OtpStep onNext={handleOtpContinue} phoneNumber={phoneNumber} style={styles.otpStep} />;
  }
  if (currentScreen === 'license') {
    return <LicenseStep onNext={handleLicenseContinue} style={styles.licenseStep} />;
  }

  if (currentScreen === 'payment') {
    return <PaymentStep onNext={handlePaymentContinue} style={styles.paymentStep} />;
  }


  // ===== Intro screen (emoji steps layout) =====
  return (
    <SafeAreaView style={styles.container}>
      {/* MainHeader */}
      <MainHeader 
        title="Complete Your Profile"
        onBackPress={() => {navigation.goBack()}}
        showOptionsButton={false}
        // showBorder={false}
        showheader={false}
      />

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Get Approved To Drive</Text>
        <Text style={styles.subtitle}>
          Since this is your first trip you'll need to provide us with some information before you can check out.
        </Text>

        {/* Step List */}
        <View style={styles.stepsWrapper}>
          {steps.map((step, index) => {
            // Different icon styles for each step
            let iconStyle;
            if (index === 0) iconStyle = styles.phoneStep; // Phone step
            else if (index === 1) iconStyle = styles.licenseStep; // License step  
            else if (index === 2) iconStyle = styles.paymentStep; // Payment step
            
            return (
              <View key={index} style={styles.stepRow}>
                <View style={styles.iconColumn}>
                  <View style={styles.iconWrapper}>
                    <Image source={step.icon} style={iconStyle} />
                  </View>
                  {index < steps.length - 1 && <View style={styles.verticalLine} />}
                </View>
                <View style={styles.textColumn}>
                  <Text style={styles.stepLabelText}>{step.label}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Continue Button at bottom */}
      <View style={styles.bottomButtonContainer}>
        <Button 
          title="Continue" 
          onPress={handleIntroContinue}
          buttonStyle={styles.continueButton}
        />
      </View>
    </SafeAreaView>
  );
};

export default VerificationScreen;
