import React from 'react';
import {View, TextInput, StyleSheet, TouchableOpacity} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Colors} from '../Themes/MyColors';

const InputField = (props) => {
  const { placeholder, secureTextEntry, icon, iconColor, onPressIcon } = props;
  return (
    <View style={styles.inputWrapper}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#999"
        secureTextEntry={secureTextEntry}
        {...props}
      />
      {icon && (
        <TouchableOpacity activeOpacity={0.99} onPress={onPressIcon} style={styles.iconWrapper}>
          <MaterialCommunityIcons size={20} color={iconColor || Colors.PRIMARY_GREY} name={icon}  />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    height: 55,
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingRight: 10,
  },
  iconWrapper: {
    paddingLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 30,
    height: '100%',
  },
  icon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#999',
  },
});

export default InputField;
