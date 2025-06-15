import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './styles';

const ServiceScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          {/* <Image
            source={require('../../../assets/profile.jpg')} // Replace with actual image path
            style={styles.profileImage}
          /> */}
          <View>
            <Text style={styles.welcomeText}>WELCOME</Text>
            <Text style={styles.nameText}>NAME HERE</Text>
          </View>
        </View>

        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Center-aligned heading and buttons */}
      <View style={styles.centeredSection}>
        <Text style={styles.title}>
          WHAT SERVICE YOU ARE{'\n'}LOOKING FOR?
        </Text>

        <TouchableOpacity
  style={styles.rentalButton}
  onPress={() => navigation.navigate('BookingDetails')}
>
  <Text style={styles.rentalButtonText}>RENTAL</Text>
</TouchableOpacity>
<TouchableOpacity
  style={styles.busButton}
  onPress={() => navigation.navigate('BookingDetails')}
>
  <Text style={styles.busButtonText}>HIRE A BUS</Text>
</TouchableOpacity>

      </View>
    </View>
  );
};

export default ServiceScreen;
