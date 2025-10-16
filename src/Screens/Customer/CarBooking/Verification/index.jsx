import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from './styles';
import PhoneStep from './PhoneStep';
import OtpStep from './OtpStep';
import LicenseStep from './LicenseStep';
import PaymentStep from './PaymentStep';


const steps = [
  { emoji: '📞', label: 'Mobile number Verification' },
  { emoji: '🪪', label: 'Verify your license' },
  { emoji: '💳', label: 'Payment method' },
];

const VerificationScreen = () => {
  const [currentScreen, setCurrentScreen] = useState('intro');

  // Move from emoji intro to phone number step
  const handleIntroContinue = () => {
    setCurrentScreen('phone');
  };

  const handleLicenseContinue = () => {
    setCurrentScreen('payment'); // ✅ NEW
  };

  // Move from phone step to OTP input
  const handlePhoneContinue = () => {
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
    return <PhoneStep onNext={handlePhoneContinue} />;
  }

  if (currentScreen === 'otp') {
    return <OtpStep onNext={handleOtpContinue} />;
  }
  if (currentScreen === 'license') {
    return <LicenseStep onNext={handleLicenseContinue} />;
  }

  if (currentScreen === 'payment') {
    return <PaymentStep onNext={handlePaymentContinue} />;
  }


  // ===== Intro screen (emoji steps layout) =====
  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => {}}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Get Approved To Drive</Text>
        <Text style={styles.subtitle}>
          Since this is your first trip you’ll need to provide us with some information before you can check out.
        </Text>
      </View>

      {/* Step List */}
      <View style={styles.stepsWrapper}>
        {steps.map((step, index) => (
          <View key={index} style={styles.stepRow}>
            <View style={styles.iconColumn}>
              <View style={styles.emojiWrapper}>
                <Text style={styles.emoji}>{step.emoji}</Text>
              </View>
              {index < steps.length - 1 && <View style={styles.verticalLine} />}
            </View>
            <View style={styles.textColumn}>
              <Text style={styles.stepLabelText}>{step.label}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Continue Button */}
      <TouchableOpacity style={styles.continueButton} onPress={handleIntroContinue}>
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

export default VerificationScreen;
