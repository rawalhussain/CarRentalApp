import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../Themes/MyColors';

const CustomerProfile = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Profile Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
  },
  text: {
    fontSize: 16,
    color: Colors.BLACK,
  },
});

export default CustomerProfile;
