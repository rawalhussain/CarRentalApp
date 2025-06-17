import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors } from '../../../../Themes/MyColors';
import Button from '../../../../Components/Button';

const SubmissionSuccess = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        {/* You can replace this with an SVG or Lottie for confetti if available */}
        <Image
          source={require('../../../../../assets/success.png')} // Place a green checkmark/confetti image here
          style={styles.successIcon}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.message}>
        YOUR CARS WILL BE LIVE{"\n"}AFTER A REVIEW THANK YOU.
      </Text>
      <View style={styles.buttonWrapper}>
        <Button
          title="Confirm"
          type="primary"
          buttonStyle={styles.confirmButton}
          onPress={() =>  navigation.reset({
            index: 0,
            routes: [{ name: 'ProviderTabs' }],
          })}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconWrapper: {
    marginTop: 40,
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    width: 160,
    height: 160,
  },
  message: {
    fontSize: 18,
    color: Colors.BLACK,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 40,
  },
  buttonWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 32,
    paddingHorizontal: 24,
  },
  confirmButton: {
    borderRadius: 30,
  },
});

export default SubmissionSuccess;
