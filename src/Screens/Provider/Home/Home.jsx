import React, {useState} from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Colors } from '../../../Themes/MyColors';
import Icon from 'react-native-vector-icons/Feather';
import useUserStore from '../../../store/useUserStore';
import useAuthStore from '../../../store/useAuthStore';
import Loader from '../../../Components/Loader';
import {signOut} from '../../../Config/firebase';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ProviderHome = ({ navigation }) => {
  const {userData, clearUserData} = useUserStore();
  const {clearAuth} = useAuthStore();
  const [loading, setLoading] = useState(false);
  return (
    <View style={styles.container}>
      {loading && <Loader />}
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View>
            <Text style={styles.welcomeText}>WELCOME</Text>
            <Text style={styles.nameText}>{userData?.fullName}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={async () => {
          try {
            setLoading(true);
            clearUserData();
            clearAuth();
            await signOut();
          } catch (e) {
            console.log(e);
          } finally {
            setLoading(false);
          }
        }}>
          <Ionicons name="log-out-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.question}>WHICH SERVICE YOU{'\n'}WANT TO PROVIDE?</Text>
        <TouchableOpacity style={styles.rentalBtn} onPress={() => navigation.navigate('AddCar', { type: 'car' })}>
          <Text style={styles.rentalBtnText}>RENTAL</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.busBtn} onPress={() => navigation.navigate('AddCar', { type: 'bus' })}>
          <Text style={styles.busBtnText}>BUS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    paddingTop: 20, // for status bar
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },

  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },

  welcomeText: {
    fontSize: 12,
    color: Colors.PRIMARY_GREY,
  },

  nameText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.BLACK,
  },

  centeredSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  name: {
    fontSize: 13,
    color: Colors.BLACK,
  },
  bellIcon: {
    marginLeft: 10,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  question: {
    fontSize: 24,
    color: Colors.BLACK,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 50,
  },
  rentalBtn: {
    backgroundColor: Colors.PRIMARY, // blue
    paddingVertical: 20,
    paddingHorizontal: 60,
    borderRadius: 25,
    marginBottom: 25,
    width: 260,
    alignItems: 'center',
  },
  rentalBtnText: {
    color: Colors.WHITE,
    fontSize: 24,
    fontWeight: 'bold',
  },
  busBtn: {
    backgroundColor: Colors.SECONDARY,
    paddingVertical: 20,
    paddingHorizontal: 60,
    borderRadius: 25,
    width: 260,
    alignItems: 'center',
  },
  busBtnText: {
    color: Colors.WHITE,
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default ProviderHome;
