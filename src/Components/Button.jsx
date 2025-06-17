import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Colors} from '../Themes/MyColors';

const Button = ({ title, onPress, type = 'primary', icon, buttonStyle }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
          buttonStyle,
        type === 'outline' && styles.outlineButton,
        type === 'social' && styles.socialButton,
      ]}
    >
      {icon && <MaterialCommunityIcons name={icon} size={20} color={Colors.BLACK} />}
      <Text
        style={[
          styles.text,
          type === 'outline' && styles.outlineText,
          type === 'social' && styles.socialText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 15,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.PRIMARY,
  },
  socialButton: {
    flexDirection: 'row',
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: Colors.BLACK,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 10,
  },
  text: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  outlineText: {
    color: Colors.PRIMARY,
  },
  socialText: {
    color: Colors.BLACK,
    fontSize: 16,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
});

export default Button;
