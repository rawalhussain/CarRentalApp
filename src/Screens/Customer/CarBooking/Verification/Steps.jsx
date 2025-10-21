import React from 'react';
import { View, Text } from 'react-native';
import styles from './styles';

const Steps = ({ currentStep, verifiedStep = false, verifiedStep2 = false }) => {
  const steps = ['Number Verification', 'License Verification', 'Payment Method'];

  return (
    <View style={styles.stepperContainer}>
      {steps.map((label, index) => {
        const isCurrent = index === currentStep;
        const isCompleted = (verifiedStep && index === 0) || (verifiedStep2 && index === 1);

        return (
          <View key={index} style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                isCurrent && styles.stepActive,
                isCompleted && styles.stepCompleted,
              ]}
            >
              {isCompleted ? <Text style={styles.stepTick}>✓</Text> : null}
            </View>
            <Text
              style={[
                styles.stepLabel,
                isCurrent && styles.stepLabelActive,
              ]}
            >
              {label}
            </Text>
            {index < steps.length - 1 && <View style={styles.stepLine} />}
          </View>
        );
      })}
    </View>
  );
};

export default Steps;
