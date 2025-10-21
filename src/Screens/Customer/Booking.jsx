import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Colors } from '../../Themes/MyColors';
import { getBookings } from '../../Config/firebase';
import useAuthStore from '../../store/useAuthStore';
import Loader from '../../Components/Loader';
import { SafeAreaView } from 'react-native-safe-area-context';

const CustomerBookings = ({ navigation }) => {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && (user.uid || user.user?.uid)) {
      fetchBookings();
    } else {
      console.log('User not ready, not fetching bookings');
    }
  }, [user]);

  const fetchBookings = async (manual = false) => {
    setLoading(true);
    if (manual) {
      console.log('Manual refresh triggered');
    }
    console.log('fetchBookings called');
    const userId = user?.user?.uid || user?.uid;
    console.log('Current userId:', userId);
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const data = await getBookings(userId, 'customer');
      console.log('Fetched bookings:', data);
      if (data) {
        // Convert object to array with id
        const arr = Object.entries(data).map(([id, booking]) => ({ id, ...booking }));
        setBookings(arr);
      } else {
        setBookings([]);
      }
    } catch (e) {
      setBookings([]);
    }
    setLoading(false);
  };

  const renderItem = ({ item }) => {
    const vehicle = item.vehicle || {};
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('BookingDetails', { ...item, bookingId: item.id })}
      >
        <Text style={styles.model}>{vehicle.make || 'Vehicle'} {vehicle.model || ''} {vehicle.variant ? `(${vehicle.variant})` : ''}</Text>
        <Text style={styles.date}>{item.searchPreferences?.pickupDate || '-'} - {item.searchPreferences?.dropoffDate || '-'}</Text>
        <Text style={styles.status}>Status: {item.status || 'pending'}</Text>
        <Text style={styles.vendor}>Vendor ID: {vehicle.vendorId || '-'}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>My Bookings</Text>
      {loading && <View style={styles.loaderOverlay}><Loader /></View>}
      <FlatList
        data={bookings}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={!loading && <Text style={styles.text}>No bookings found.</Text>}
        contentContainerStyle={{ paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
    marginHorizontal: 2,
  },
  model: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.BLACK,
    marginBottom: 4,
  },
  date: {
    fontSize: 15,
    color: Colors.PRIMARY_GREY,
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    color: Colors.PRIMARY,
    fontWeight: 'bold',
  },
  vendor: {
    fontSize: 13,
    color: Colors.PRIMARY_GREY,
    marginTop: 2,
  },
  text: {
    fontSize: 16,
    color: Colors.BLACK,
    textAlign: 'center',
    marginTop: 40,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.BLACK,
    marginBottom: 18,
    // marginTop: 30,
    textAlign: 'left',
  },
});

export default CustomerBookings;
