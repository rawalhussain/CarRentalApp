import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Colors } from '../../../Themes/MyColors';
import BottomNavigationBar from '../../../Components/BottomNavigationBar';
import Ionicons from 'react-native-vector-icons/Ionicons';

const RideBookingScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Home');

  const handleTabPress = (tabId) => {
    setActiveTab(tabId);

    // Handle navigation based on tab selection
    switch (tabId) {
      case 'Home':
        // Already on home, do nothing
        break;
      case 'Services':
        navigation.navigate('Services');
        break;
      case 'Activity':
        navigation.navigate('CustomerTabs', { screen: 'Bookings' });
        break;
      case 'Account':
        navigation.navigate('Profile');
        break;
      default:
        break;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Home':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.welcomeText}>Welcome to Ride Booking</Text>
            <Text style={styles.subtitle}>Choose your preferred service</Text>

            <View style={styles.serviceCards}>
              <TouchableOpacity
                style={styles.serviceCard}
                onPress={() => navigation.navigate('ReserveRide')}
              >
                <Ionicons name="car" size={40} color={Colors.PRIMARY} />
                <Text style={styles.serviceTitle}>Book a Ride</Text>
                <Text style={styles.serviceDescription}>Quick and convenient rides</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.serviceCard}
                onPress={() => navigation.navigate('Services')}
              >
                <Ionicons name="grid" size={40} color={Colors.SECONDARY} />
                <Text style={styles.serviceTitle}>All Services</Text>
                <Text style={styles.serviceDescription}>Explore all available services</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'Services':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.welcomeText}>Services</Text>
            <Text style={styles.subtitle}>Available transportation services</Text>

            <View style={styles.serviceList}>
              <TouchableOpacity style={styles.serviceItem}>
                <Ionicons name="car" size={24} color={Colors.PRIMARY} />
                <Text style={styles.serviceItemText}>Car Rental</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.PRIMARY_GREY} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.serviceItem}>
                <Ionicons name="bus" size={24} color={Colors.PRIMARY} />
                <Text style={styles.serviceItemText}>Bus Hire</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.PRIMARY_GREY} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.serviceItem}>
                <Ionicons name="bicycle" size={24} color={Colors.PRIMARY} />
                <Text style={styles.serviceItemText}>Bike Rental</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.PRIMARY_GREY} />
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'Activity':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.welcomeText}>Activity</Text>
            <Text style={styles.subtitle}>Your recent bookings and activity</Text>

            <View style={styles.activityList}>
              <View style={styles.activityItem}>
                <Ionicons name="time" size={24} color={Colors.PRIMARY} />
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Recent Booking</Text>
                  <Text style={styles.activityDescription}>Car rental - Yesterday</Text>
                </View>
              </View>

              <View style={styles.activityItem}>
                <Ionicons name="checkmark-circle" size={24} color={Colors.SECONDARY} />
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Completed Ride</Text>
                  <Text style={styles.activityDescription}>Bus hire - 2 days ago</Text>
                </View>
              </View>
            </View>
          </View>
        );

      case 'Account':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.welcomeText}>Account</Text>
            <Text style={styles.subtitle}>Manage your account settings</Text>

            <View style={styles.accountList}>
              <TouchableOpacity style={styles.accountItem}>
                <Ionicons name="person" size={24} color={Colors.PRIMARY} />
                <Text style={styles.accountItemText}>Profile</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.PRIMARY_GREY} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.accountItem}>
                <Ionicons name="settings" size={24} color={Colors.PRIMARY} />
                <Text style={styles.accountItemText}>Settings</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.PRIMARY_GREY} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.accountItem}>
                <Ionicons name="help-circle" size={24} color={Colors.PRIMARY} />
                <Text style={styles.accountItemText}>Help & Support</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.PRIMARY_GREY} />
              </TouchableOpacity>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.WHITE} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.BLACK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ride Booking</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigationBar
        activeTab={activeTab}
        onTabPress={handleTabPress}
        tabs={[
          { id: 'Home', icon: 'home', label: 'Home' },
          { id: 'Services', icon: 'grid', label: 'Services' },
          { id: 'Activity', icon: 'document-text', label: 'Activity' },
          { id: 'Account', icon: 'person', label: 'Account' },
        ]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.BLACK,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.BLACK,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.PRIMARY_GREY,
    marginBottom: 30,
  },
  serviceCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  serviceCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.BLACK,
    marginTop: 10,
    marginBottom: 5,
  },
  serviceDescription: {
    fontSize: 12,
    color: Colors.PRIMARY_GREY,
    textAlign: 'center',
  },
  serviceList: {
    marginTop: 10,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  serviceItemText: {
    flex: 1,
    fontSize: 16,
    color: Colors.BLACK,
    marginLeft: 15,
  },
  activityList: {
    marginTop: 10,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  activityContent: {
    flex: 1,
    marginLeft: 15,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.BLACK,
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: Colors.PRIMARY_GREY,
  },
  accountList: {
    marginTop: 10,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  accountItemText: {
    flex: 1,
    fontSize: 16,
    color: Colors.BLACK,
    marginLeft: 15,
  },
});

export default RideBookingScreen;
