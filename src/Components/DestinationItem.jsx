import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../Themes/MyColors';

const DestinationItem = ({
  title,
  address,
  icon = 'time',
  onPress,
  style = {},
}) => {

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.destinationItem}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.destinationIcon}>
          <Ionicons name={icon} size={16} color={Colors.WHITE} />
        </View>
        <View style={styles.destinationText}>
          <Text style={styles.destinationTitle}>{title}</Text>
          <Text style={styles.destinationAddress}>{address}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

// Static destination data


const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.WHITE,
  },
  destinationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  destinationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.SECONDARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  destinationText: {
    flex: 1,
  },
  destinationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.BLACK,
    marginBottom: 4,
  },
  destinationAddress: {
    fontSize: 14,
    color: Colors.PRIMARY_GREY,
    lineHeight: 18,
  },
});

export default DestinationItem;
