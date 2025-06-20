import React, { useState, useEffect } from 'react';
import {View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar} from 'react-native';
import { getDatabaseRef } from '../../../Config/firebase';
import { Colors } from '../../../Themes/MyColors';

const Bookings = ({ navigation }) => {
  const [allBookings, setAllBookings] = useState([]);
  const [todayBookings, setTodayBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('today');

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const fetchAllBookings = async () => {
    try {
      const ref = getDatabaseRef('bookings');
      const snapshot = await ref.once('value');
      const data = snapshot.val() || {};
      const arr = Object.entries(data)
          .map(([id, booking]) => ({ id, ...booking }))
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setAllBookings(arr);
      // Filter today's bookings
      const today = new Date().toDateString();
      const todayArr = arr.filter(booking => new Date(booking.createdAt).toDateString() === today);
      setTodayBookings(todayArr);
    } catch (e) {
      setAllBookings([]);
      setTodayBookings([]);
    }
  };

  const renderBookings = () => {
    const bookings = activeTab === 'today' ? todayBookings : allBookings;
    return bookings.map((booking) => {
      const vehicle = booking.vehicle || {};
      const contact = booking.contactDetails || {};
      return (
          <TouchableOpacity
              key={booking.id}
              style={styles.bookingCard}
              onPress={() => navigation.navigate('BookingSummary', { ...booking, bookingId: booking.id })}
          >
            <Text style={styles.bookingText}>
              <Text style={{ fontWeight: 'bold' }}>{contact.firstName || ''} {contact.lastName || ''}</Text>
              {` booked `}
              <Text style={{ fontWeight: 'bold' }}>{vehicle.make || 'Vehicle'} {vehicle.model || ''}</Text>
              {` on `}
              <Text style={{ color: Colors.PRIMARY_GREY }}>{new Date(booking.createdAt).toLocaleDateString()}</Text>
              {` - `}
              <Text style={{ color: Colors.PRIMARY }}>{booking.status || 'pending'}</Text>
            </Text>
          </TouchableOpacity>
      );
    });
  };

  return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.BACKGROUND_GREY} />
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bookings</Text>
          <View style={styles.tabContainer}>
            <TouchableOpacity
                style={[styles.tab, activeTab === 'today' && styles.activeTab]}
                onPress={() => setActiveTab('today')}
            >
              <Text style={[styles.tabText, activeTab === 'today' && styles.activeTabText]}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.tab, activeTab === 'all' && styles.activeTab]}
                onPress={() => setActiveTab('all')}
            >
              <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>All</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView>
          {renderBookings()}
        </ScrollView>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
  },
  activeTab: {
    backgroundColor: Colors.PRIMARY,
  },
  tabText: {
    fontSize: 14,
    color: Colors.BLACK,
  },
  activeTabText: {
    color: '#fff',
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingText: {
    fontSize: 15,
    color: Colors.BLACK,
  },
});

export default Bookings;
