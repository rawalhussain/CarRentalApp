import React, {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Colors} from '../../Themes/MyColors';
import {getBookings, updateBookingStatus} from '../../Config/firebase';
import useAuthStore from '../../store/useAuthStore';
import Loader from '../../Components/Loader';
import {SafeAreaView} from 'react-native-safe-area-context';
import MainHeader from '../../Components/MainHeader';
import Icon from 'react-native-vector-icons/Ionicons';

const {width} = Dimensions.get('window');

const CustomerBookings = ({ navigation }) => {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'today', 'tomorrow'

  useEffect(() => {
    if (user && (user.uid || user.user?.uid)) {
      fetchBookings();
    }
  }, [user]);

  useEffect(() => {
    filterBookings();
  }, [bookings, activeFilter]);

  const fetchBookings = useCallback(async (manual = false) => {
    if (manual) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    const userId = user?.user?.uid || user?.uid;
    if (!userId) {
      setLoading(false);
      setRefreshing(false);
      setError('User not authenticated');
      return;
    }

    try {
      const data = await getBookings(userId, 'customer');
      if (data) {
        // Convert object to array with id and sort by creation date
        const arr = Object.entries(data)
          .map(([id, booking]) => ({ id, ...booking }))
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setBookings(arr);
      } else {
        setBookings([]);
      }
    } catch (e) {
      console.error('Error fetching bookings:', e);
      setError('Failed to load bookings. Please try again.');
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  const onRefresh = useCallback(() => {
    fetchBookings(true);
  }, [fetchBookings]);

  const filterBookings = useCallback(() => {
    if (activeFilter === 'all') {
      setFilteredBookings(bookings);
      return;
    }

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const filterDate = activeFilter === 'today' ? today : tomorrow;
    const filterDateStr = filterDate.toISOString().split('T')[0]; // YYYY-MM-DD format

    const filtered = bookings.filter(booking => {
      // Use createdAt (booking creation date) instead of pickupDate
      const createdAt = booking.createdAt;
      if (!createdAt) {return false;}

      try {
        // Convert timestamp to date
        const bookingDate = new Date(createdAt);
        const bookingDateStr = bookingDate.toISOString().split('T')[0];
        return bookingDateStr === filterDateStr;
      } catch (error) {
        return error;
      }
    });
    setFilteredBookings(filtered);
  }, [bookings, activeFilter]);

  const handleFilterChange = useCallback((filter) => {
    setActiveFilter(filter);
  }, []);

  const handleCancelBooking = useCallback(async (bookingId) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateBookingStatus(bookingId, 'cancelled');
              // Refresh bookings after cancellation
              fetchBookings(true);
            } catch (error) {
              console.error('Error cancelling booking:', error);
              Alert.alert('Error', 'Failed to cancel booking. Please try again.');
            }
          },
        },
      ]
    );
  }, [fetchBookings]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return Colors.GREEN;
      case 'cancelled':
        return Colors.RED;
      case 'pending':
        return Colors.PRIMARY_GREY;
      case 'completed':
        return Colors.PRIMARY;
      default:
        return Colors.PRIMARY_GREY;
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'checkmark-circle';
      case 'cancelled':
        return 'close-circle';
      case 'pending':
        return 'time';
      case 'completed':
        return 'checkmark-done-circle';
      default:
        return 'help-circle';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) {return '-';}
    try {
      // Handle different date formats
      let date;
      if (dateString.includes('/')) {
        // Handle MM/DD/YYYY format
        const [month, day, year] = dateString.split('/');
        date = new Date(year, month - 1, day);
      } else if (dateString.includes('-')) {
        // Handle YYYY-MM-DD format
        date = new Date(dateString);
      } else {
        date = new Date(dateString);
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return '-';
      }

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) {return '-';}
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const formatBookingDate = (timestamp) => {
    if (!timestamp) {return '-';}
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  const renderItem = ({ item }) => {
    const vehicle = item.vehicle || {};
    const status = item.status || 'pending';
    const canCancel = status === 'pending' || status === 'confirmed';
    const searchPrefs = item.searchPreferences || {};

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('BookingDetails', { ...item, bookingId: item.id })}
        activeOpacity={0.7}
      >
        {/* Header with Vehicle Info and Status */}
        <View style={styles.cardHeader}>
          <View style={styles.vehicleInfo}>
            <Text style={styles.model}>
              {vehicle.make || 'Vehicle'} {vehicle.model || ''} {vehicle.variant ? `(${vehicle.variant})` : ''}
            </Text>
            <Text style={styles.year}>{vehicle.year || ''}</Text>
            {vehicle.color && <Text style={styles.color}>Color: {vehicle.color}</Text>}
          </View>
          <View style={[styles.statusContainer, { backgroundColor: getStatusColor(status) + '20' }]}>
            <Icon
              name={getStatusIcon(status)}
              size={16}
              color={getStatusColor(status)}
            />
            <Text style={[styles.status, { color: getStatusColor(status) }]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </View>
        </View>

        {/* Vehicle Specifications */}
        <View style={styles.specsContainer}>
          <View style={styles.specRow}>
            <View style={styles.specItem}>
              <Icon name="people-outline" size={14} color={Colors.PRIMARY_GREY} />
              <Text style={styles.specText}>{vehicle.seats || 'N/A'} Seats</Text>
            </View>
            <View style={styles.specItem}>
              <Icon name="car-outline" size={14} color={Colors.PRIMARY_GREY} />
              <Text style={styles.specText}>{vehicle.transmission || 'Auto'}</Text>
            </View>
            <View style={styles.specItem}>
              <Icon name="car-sport" size={14} color={Colors.PRIMARY_GREY} />
              <Text style={styles.specText}>{vehicle.fuelType || 'Petrol'}</Text>
            </View>
          </View>
        </View>

        {/* Date and Time Information */}
        <View style={styles.dateContainer}>
          <View style={styles.dateItem}>
            <Icon name="calendar-outline" size={16} color={Colors.PRIMARY_GREY} />
            <Text style={styles.dateLabel}>Pickup</Text>
            <Text style={styles.date}>{formatDate(searchPrefs.pickupDate)}</Text>
            {searchPrefs.pickupTime && (
              <Text style={styles.time}>{searchPrefs.pickupTime}</Text>
            )}
          </View>
          <View style={[styles.dateItem]}>
            <Icon name="calendar-outline" size={16} color={Colors.PRIMARY_GREY} />
            <Text style={styles.dateLabel}>Return</Text>
            <Text style={styles.date}>{formatDate(searchPrefs.dropoffDate)}</Text>
            {searchPrefs.dropoffTime && (
              <Text style={styles.time}>{searchPrefs.dropoffTime}</Text>
            )}
          </View>
        </View>

        {/* Booking Date Information */}
        <View style={styles.bookingDateContainer}>
          <View style={styles.bookingDateItem}>
            <Icon name="time-outline" size={14} color={Colors.PRIMARY_GREY} />
            <Text style={styles.bookingDateLabel}>Booked On</Text>
            <Text style={styles.bookingDate}>{formatBookingDate(item.createdAt)}</Text>
          </View>
        </View>

        {/* Location Information */}
        {(searchPrefs.pickupLocation || searchPrefs.dropoffLocation) && (
          <View style={styles.locationContainer}>
            <View style={styles.locationItem}>
              <Icon name="location-outline" size={14} color={Colors.PRIMARY_GREY} />
              <Text style={styles.locationLabel}>Pickup Location</Text>
              <Text style={styles.locationText}>{searchPrefs.pickupLocation || '-'}</Text>
            </View>
            <View style={styles.locationItem}>
              <Icon name="location-outline" size={14} color={Colors.PRIMARY_GREY} />
              <Text style={styles.locationLabel}>Return Location</Text>
              <Text style={styles.locationText}>{searchPrefs.dropoffLocation || '-'}</Text>
            </View>
          </View>
        )}

        {/* Booking Details */}
        {/* <View style={styles.bookingDetailsContainer}>
          <View style={styles.bookingRow}>
            <Text style={styles.bookingLabel}>Booking ID</Text>
            <Text style={styles.bookingValue}>{item.id?.substring(0, 8) || '-'}</Text>
          </View>
          <View style={styles.bookingRow}>
            <Text style={styles.bookingLabel}>Created</Text>
            <Text style={styles.bookingValue}>{formatBookingDate(item.createdAt)}</Text>
          </View>
          {item.vendorId && (
            <View style={styles.bookingRow}>
              <Text style={styles.bookingLabel}>Vendor ID</Text>
              <Text style={styles.bookingValue}>{item.vendorId.substring(0, 8)}</Text>
            </View>
          )}
        </View> */}

        {/* Amount and Duration */}
        <View style={styles.amountContainer}>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Total Amount</Text>
            <Text style={styles.amount}>${item.amount || '0'}</Text>
          </View>
          {searchPrefs.pickupDate && searchPrefs.dropoffDate && formatDate(searchPrefs.pickupDate) !== '-' && formatDate(searchPrefs.dropoffDate) !== '-' && (
            <View style={styles.durationRow}>
              <Text style={styles.durationLabel}>Duration</Text>
              <Text style={styles.duration}>
                {Math.ceil((new Date(searchPrefs.dropoffDate) - new Date(searchPrefs.pickupDate)) / (1000 * 60 * 60 * 24))} days
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {canCancel && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancelBooking(item.id)}
              activeOpacity={0.7}
            >
              <Icon name="close-circle-outline" size={16} color={Colors.RED} />
              <Text style={styles.cancelText}>Cancel Booking</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => navigation.navigate('BookingDetails', { ...item, bookingId: item.id })}
            activeOpacity={0.7}
          >
            <Icon name="eye-outline" size={16} color={Colors.PRIMARY} />
            <Text style={styles.detailsText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterButtons = () => {
    const filters = [
      { key: 'all', label: 'All', icon: 'list' },
      { key: 'today', label: 'Today', icon: 'today' },
      { key: 'tomorrow', label: 'Tomorrow', icon: 'calendar' },
    ];

    return (
      <View style={styles.filterContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              activeFilter === filter.key && styles.activeFilterButton,
            ]}
            onPress={() => handleFilterChange(filter.key)}
            activeOpacity={0.7}
          >
            <Icon
              name={filter.icon}
              size={16}
              color={activeFilter === filter.key ? Colors.WHITE : Colors.PRIMARY}
            />
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === filter.key && styles.activeFilterButtonText,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (loading) {return null;}

    const getEmptyMessage = () => {
      if (error) {return 'Unable to load bookings';}
      if (activeFilter === 'today') {return 'No bookings for today';}
      if (activeFilter === 'tomorrow') {return 'No bookings for tomorrow';}
      return 'You haven\'t made any bookings yet';
    };

    const getEmptyTitle = () => {
      if (activeFilter === 'today') {return 'No Bookings Today';}
      if (activeFilter === 'tomorrow') {return 'No Bookings Tomorrow';}
      return 'No Bookings Found';
    };

    return (
      <View style={styles.emptyContainer}>
        <Icon name="calendar-outline" size={64} color={Colors.PRIMARY_GREY} />
        <Text style={styles.emptyTitle}>{getEmptyTitle()}</Text>
        <Text style={styles.emptySubtitle}>{getEmptyMessage()}</Text>
        {error && (
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchBookings()}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <MainHeader title="My Bookings" showOptionsButton={false} showBackButton={false} />

      {renderFilterButtons()}

      {loading && !refreshing && (
        <View style={styles.loaderOverlay}>
          <Loader />
        </View>
      )}

      <FlatList
        data={filteredBookings}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.PRIMARY]}
            tintColor={Colors.PRIMARY}
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_GREY,
    // backgroundColor: 'blue'
  },
  listContainer: {
    // padding: 16,
    paddingTop: 8,
    paddingHorizontal: 16,
    flexGrow: 1,
    // backgroundColor: 'red'
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LINE_GRAY,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    backgroundColor: Colors.WHITE,
  },
  activeFilterButton: {
    backgroundColor: Colors.PRIMARY,
    borderColor: Colors.PRIMARY,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.PRIMARY,
    marginLeft: 6,
  },
  activeFilterButtonText: {
    color: Colors.WHITE,
  },
  separator: {
    height: 12,
  },
  card: {
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.LINE_GRAY,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    // marginBottom: 12,
  },
  vehicleInfo: {
    flex: 1,
    marginRight: 6,
  },
  model: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.BLACK,
    marginBottom: 4,
  },
  year: {
    fontSize: 14,
    color: Colors.PRIMARY_GREY,
  },
  color: {
    fontSize: 12,
    color: Colors.PRIMARY_GREY,
    marginTop: 2,
  },
  specsContainer: {
    marginBottom: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.LINE_GRAY,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LINE_GRAY,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  specText: {
    fontSize: 12,
    color: Colors.PRIMARY_GREY,
    marginLeft: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  borderBottomWidth: 1,
    borderBottomColor: Colors.LINE_GRAY,
    paddingBottom: 8,
  },
  dateItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  dateLabel: {
    fontSize: 12,
    color: Colors.PRIMARY_GREY,
    marginLeft: 6,
    marginRight: 4,
  },
  date: {
    fontSize: 14,
    color: Colors.BLACK,
    fontWeight: '500',
  },
  time: {
    fontSize: 12,
    color: Colors.PRIMARY_GREY,
    marginTop: 2,
  },
  bookingDateContainer: {
    marginBottom: 8,
    paddingVertical: 8,

    backgroundColor: Colors.BACKGROUND_GREY,
    borderRadius: 6,
    paddingHorizontal: 12,
  },
  bookingDateItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingDateLabel: {
    fontSize: 12,
    color: Colors.PRIMARY_GREY,
    marginLeft: 6,
    marginRight: 8,
  },
  bookingDate: {
    fontSize: 13,
    color: Colors.BLACK,
    fontWeight: '600',
  },
  locationContainer: {
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.LINE_GRAY,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  locationLabel: {
    fontSize: 12,
    color: Colors.PRIMARY_GREY,
    marginLeft: 6,
    marginRight: 8,
    minWidth: 100,
  },
  locationText: {
    fontSize: 13,
    color: Colors.BLACK,
    flex: 1,
    flexWrap: 'wrap',
  },
  bookingDetailsContainer: {
    // marginBottom: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.LINE_GRAY,
  },
  bookingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  bookingLabel: {
    fontSize: 12,
    color: Colors.PRIMARY_GREY,
    fontWeight: '500',
  },
  bookingValue: {
    fontSize: 12,
    color: Colors.BLACK,
    fontWeight: '600',
  },
  amountContainer: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.LINE_GRAY,
    // marginBottom: 12,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 14,
    color: Colors.PRIMARY_GREY,
    fontWeight: '500',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
  },
  durationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationLabel: {
    fontSize: 12,
    color: Colors.PRIMARY_GREY,
    fontWeight: '500',
  },
  duration: {
    fontSize: 12,
    color: Colors.BLACK,
    fontWeight: '600',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.LINE_GRAY,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.RED,
    backgroundColor: Colors.RED + '10',
    flex: 1,
    marginRight: 8,
  },
  cancelText: {
    fontSize: 12,
    color: Colors.RED,
    fontWeight: '500',
    marginLeft: 4,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    backgroundColor: Colors.PRIMARY + '10',
    flex: 1,
  },
  detailsText: {
    fontSize: 12,
    color: Colors.PRIMARY,
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.BLACK,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.PRIMARY_GREY,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});

export default CustomerBookings;
