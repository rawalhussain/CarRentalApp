import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Colors } from '../../Themes/MyColors';
import { getBookings } from '../../Config/firebase';
import useAuthStore from '../../store/useAuthStore';
import Loader from '../../Components/Loader';

const ProviderBookings = ({ navigation }) => {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && (user.uid || user.user?.uid)) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    setLoading(true);
    const userId = user?.user?.uid || user?.uid;
    try {
      const data = await getBookings(userId, 'vendor');
      if (data) {
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
    const contact = item.contactDetails || {};
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('BookingSummary', { ...item, bookingId: item.id })}
      >
        <Text style={styles.model}>{vehicle.make || 'Vehicle'} {vehicle.model || ''} {vehicle.variant ? `(${vehicle.variant})` : ''}</Text>
        <Text style={styles.date}>{item.searchPreferences?.pickupDate || '-'} - {item.searchPreferences?.dropoffDate || '-'}</Text>
        <Text style={styles.status}>Status: {item.status || 'pending'}</Text>
        <Text style={styles.customer}>Customer: {contact.firstName || ''} {contact.lastName || ''}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Bookings</Text>
      {loading && <View style={styles.loaderOverlay}><Loader /></View>}
      <FlatList
        data={bookings}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={!loading && <Text style={styles.text}>No bookings found.</Text>}
        contentContainerStyle={{ paddingTop: 8 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    paddingTop: 50,
    // padding: 16,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: Colors.WHITE,
    marginHorizontal: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    shadowColor: Colors.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
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
  customer: {
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
    marginTop: 8,
    textAlign: 'left',
  },
});

export default ProviderBookings;
