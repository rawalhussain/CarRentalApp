import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../Themes/MyColors';

const ModalHeader = ({
  title,
  onBack,
  showBackButton = true,
  rightComponent = null,
  titleStyle = {},
  containerStyle = {},
  description = null,
}) => {
  return (
    <View style={[styles.modalHeader, containerStyle]}>
      {showBackButton ? (
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.BLACK} />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
      <View style={styles.titleContainer}>
        <Text style={[styles.modalTitle, titleStyle]}>{title}</Text>
        {description && <Text style={styles.instructionsText}>{description}</Text>}
      </View>
      {rightComponent || <View style={styles.placeholder} />}
    </View>
  );
};

const styles = StyleSheet.create({
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // marginBottom: 15,
    backgroundColor: Colors.WHITE,
    paddingTop: 1,
    paddingBottom: 11,
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    borderBottomColor: Colors.LINE_GRAY,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.BLACK,
    textAlign: 'center',
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 14,
    color: Colors.PRIMARY_GREY,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
});

export default ModalHeader;
