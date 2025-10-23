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
import {getBookings, updateBookingStatus, getPackageBookings, updatePackageBookingStatus} from '../../Config/firebase';
import useAuthStore from '../../store/useAuthStore';
import Loader from '../../Components/Loader';
import {SafeAreaView} from 'react-native-safe-area-context';
import MainHeader from '../../Components/MainHeader';
import Icon from 'react-native-vector-icons/Ionicons';

const {width} = Dimensions.get('window');

const CustomerBookings = ({ navigation }) => {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [packageBookings, setPackageBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'today', 'tomorrow'
  const [bookingType, setBookingType] = useState('ride'); // 'all', 'ride', 'car' - default to 'ride' (Book Ride)

  useEffect(() => {
    if (user && (user.uid || user.user?.uid)) {
      fetchBookings();
    }
  }, [user]);

  useEffect(() => {
    filterBookings();
  }, [bookings, packageBookings, activeFilter, bookingType]);

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
      // Fetch both regular bookings and package bookings
      const [regularBookingsData, packageBookingsData] = await Promise.all([
        getBookings(userId, 'customer'),
        getPackageBookings(userId, 'customer')
      ]);

      // Process regular bookings
      let regularBookings = [];
      if (regularBookingsData) {
        regularBookings = Object.entries(regularBookingsData)
          .map(([id, booking]) => ({ id, ...booking, bookingType: 'car' }))
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      }
      setBookings(regularBookings);

      // Process package bookings
      let packageBookings = [];
      if (packageBookingsData) {
        packageBookings = packageBookingsData
          .map(booking => ({ ...booking, bookingType: 'ride' }))
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      }
      setPackageBookings(packageBookings);

    } catch (e) {
      console.error('Error fetching bookings:', e);
      setError('Failed to load bookings. Please try again.');
      setBookings([]);
      setPackageBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  const onRefresh = useCallback(() => {
    fetchBookings(true);
  }, [fetchBookings]);

  const filterBookings = useCallback(() => {
    // Combine all bookings based on booking type
    let allBookings = [];
    
    if (bookingType === 'all') {
      allBookings = [...bookings, ...packageBookings];
    } else if (bookingType === 'ride') {
      allBookings = packageBookings;
    } else if (bookingType === 'car') {
      allBookings = bookings;
    }


    // Sort combined bookings by creation date
    allBookings.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    if (activeFilter === 'all') {
      setFilteredBookings(allBookings);
      return;
    }

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Set time to start of day for accurate comparison
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tomorrowStart = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

    const filtered = allBookings.filter(booking => {
      const createdAt = booking.createdAt;
      if (!createdAt) {return false;}

      try {
        // Handle both timestamp formats (number or string)
        let bookingDate;
        if (typeof createdAt === 'number') {
          bookingDate = new Date(createdAt);
        } else if (typeof createdAt === 'string') {
          bookingDate = new Date(createdAt);
        } else {
          // Handle Firebase timestamp object
          bookingDate = new Date(createdAt);
        }
        
        // Check if the date is valid
        if (isNaN(bookingDate.getTime())) {
          return false;
        }
        
        if (activeFilter === 'today') {
          // Check if booking was created today
          const isToday = bookingDate >= todayStart && bookingDate < tomorrowStart;
          return isToday;
        } else if (activeFilter === 'tomorrow') {
          // Check if booking was created tomorrow
          const dayAfterTomorrow = new Date(tomorrowStart);
          dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
          return bookingDate >= tomorrowStart && bookingDate < dayAfterTomorrow;
        }
        
        return false;
      } catch (error) {
        console.error('Error filtering booking date:', error, 'createdAt:', createdAt);
        return false;
      }
    });
    
    
    setFilteredBookings(filtered);
  }, [bookings, packageBookings, activeFilter, bookingType]);

  const handleFilterChange = useCallback((filter) => {
    setActiveFilter(filter);
  }, []);

  const handleBookingTypeChange = useCallback((type) => {
    setBookingType(type);
  }, []);

  const handleCancelBooking = useCallback(async (bookingId, bookingType) => {
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
              if (bookingType === 'ride') {
                await updatePackageBookingStatus(bookingId, 'cancelled');
              } else {
                await updateBookingStatus(bookingId, 'cancelled');
              }
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
    const status = item.status || 'pending';
    const canCancel = status === 'pending' || status === 'confirmed';
    const isPackageBooking = item.bookingType === 'ride';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('BookingDetails', { ...item, bookingId: item.id })}
        activeOpacity={0.7}
      >
        {/* Header with Info and Status */}
        <View style={styles.cardHeader}>
          <View style={styles.vehicleInfo}>
            {isPackageBooking ? (
              <>
                <Text style={styles.model}>
                  {item.packageName || 'Ride Package'}
                </Text>
                <Text style={styles.year}>Package Booking</Text>
                {item.pickupLocation && <Text style={styles.color}>Pickup: {item.pickupLocation}</Text>}
              </>
            ) : (
              <>
                <Text style={styles.model}>
                  {item.vehicle?.make || 'Vehicle'} {item.vehicle?.model || ''} {item.vehicle?.variant ? `(${item.vehicle.variant})` : ''}
                </Text>
                <Text style={styles.year}>{item.vehicle?.year || ''}</Text>
                {item.vehicle?.color && <Text style={styles.color}>Color: {item.vehicle.color}</Text>}
              </>
            )}
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

        {/* Specifications */}
        <View style={styles.specsContainer}>
          <View style={styles.specRow}>
            {isPackageBooking ? (
              <>
                <View style={styles.specItem}>
                  <Icon name="time-outline" size={14} color={Colors.PRIMARY_GREY} />
                  <Text style={styles.specText}>{item.duration || 'N/A'} Days</Text>
                </View>
                <View style={styles.specItem}>
                  <Icon name="people-outline" size={14} color={Colors.PRIMARY_GREY} />
                  <Text style={styles.specText}>{item.passengers || 'N/A'} Passengers</Text>
                </View>
                <View style={styles.specItem}>
                  <Icon name="location-outline" size={14} color={Colors.PRIMARY_GREY} />
                  <Text style={styles.specText}>{item.destination || 'N/A'}</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.specItem}>
                  <Icon name="people-outline" size={14} color={Colors.PRIMARY_GREY} />
                  <Text style={styles.specText}>{item.vehicle?.seats || 'N/A'} Seats</Text>
                </View>
                <View style={styles.specItem}>
                  <Icon name="car-outline" size={14} color={Colors.PRIMARY_GREY} />
                  <Text style={styles.specText}>{item.vehicle?.transmission || 'Auto'}</Text>
                </View>
                <View style={styles.specItem}>
                  <Icon name="car-sport" size={14} color={Colors.PRIMARY_GREY} />
                  <Text style={styles.specText}>{item.vehicle?.fuelType || 'Petrol'}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Date and Time Information */}
        <View style={styles.dateContainer}>
          {isPackageBooking ? (
            <>
              <View style={styles.dateItem}>
                <Icon name="calendar-outline" size={16} color={Colors.PRIMARY_GREY} />
                <Text style={styles.dateLabel}>Start Date</Text>
                <Text style={styles.date}>{formatDate(item.startDate)}</Text>
                {item.startTime && (
                  <Text style={styles.time}>{item.startTime}</Text>
                )}
              </View>
              <View style={styles.dateItem}>
                <Icon name="calendar-outline" size={16} color={Colors.PRIMARY_GREY} />
                <Text style={styles.dateLabel}>End Date</Text>
                <Text style={styles.date}>{formatDate(item.endDate)}</Text>
                {item.endTime && (
                  <Text style={styles.time}>{item.endTime}</Text>
                )}
              </View>
            </>
          ) : (
            <>
              <View style={styles.dateItem}>
                <Icon name="calendar-outline" size={16} color={Colors.PRIMARY_GREY} />
                <Text style={styles.dateLabel}>Pickup</Text>
                <Text style={styles.date}>{formatDate(item.searchPreferences?.pickupDate)}</Text>
                {item.searchPreferences?.pickupTime && (
                  <Text style={styles.time}>{item.searchPreferences.pickupTime}</Text>
                )}
              </View>
              <View style={styles.dateItem}>
                <Icon name="calendar-outline" size={16} color={Colors.PRIMARY_GREY} />
                <Text style={styles.dateLabel}>Return</Text>
                <Text style={styles.date}>{formatDate(item.searchPreferences?.dropoffDate)}</Text>
                {item.searchPreferences?.dropoffTime && (
                  <Text style={styles.time}>{item.searchPreferences.dropoffTime}</Text>
                )}
              </View>
            </>
          )}
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
        {isPackageBooking ? (
          (item.pickupLocation || item.destination) && (
            <View style={styles.locationContainer}>
              {item.pickupLocation && (
                <View style={styles.locationItem}>
                  <Icon name="location-outline" size={14} color={Colors.PRIMARY_GREY} />
                  <Text style={styles.locationLabel}>Pickup Location</Text>
                  <Text style={styles.locationText}>{item.pickupLocation}</Text>
                </View>
              )}
              {item.destination && (
                <View style={styles.locationItem}>
                  <Icon name="location-outline" size={14} color={Colors.PRIMARY_GREY} />
                  <Text style={styles.locationLabel}>Destination</Text>
                  <Text style={styles.locationText}>{item.destination}</Text>
                </View>
              )}
            </View>
          )
        ) : (
          (item.searchPreferences?.pickupLocation || item.searchPreferences?.dropoffLocation) && (
            <View style={styles.locationContainer}>
              <View style={styles.locationItem}>
                <Icon name="location-outline" size={14} color={Colors.PRIMARY_GREY} />
                <Text style={styles.locationLabel}>Pickup Location</Text>
                <Text style={styles.locationText}>{item.searchPreferences?.pickupLocation || '-'}</Text>
              </View>
              <View style={styles.locationItem}>
                <Icon name="location-outline" size={14} color={Colors.PRIMARY_GREY} />
                <Text style={styles.locationLabel}>Return Location</Text>
                <Text style={styles.locationText}>{item.searchPreferences?.dropoffLocation || '-'}</Text>
              </View>
            </View>
          )
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
            <Text style={styles.amount}>${item.totalAmount || item.amount || '0'}</Text>
          </View>
          {isPackageBooking ? (
            item.duration && (
              <View style={styles.durationRow}>
                <Text style={styles.durationLabel}>Duration</Text>
                <Text style={styles.duration}>{item.duration} days</Text>
              </View>
            )
          ) : (
            item.searchPreferences?.pickupDate && item.searchPreferences?.dropoffDate && formatDate(item.searchPreferences.pickupDate) !== '-' && formatDate(item.searchPreferences.dropoffDate) !== '-' && (
              <View style={styles.durationRow}>
                <Text style={styles.durationLabel}>Duration</Text>
                <Text style={styles.duration}>
                  {Math.ceil((new Date(item.searchPreferences.dropoffDate) - new Date(item.searchPreferences.pickupDate)) / (1000 * 60 * 60 * 24))} days
                </Text>
              </View>
            )
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {canCancel && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancelBooking(item.id, item.bookingType)}
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

  const renderPackagesFilterButtons = () => {
    const filters = [
      { key: 'all', label: 'All Bookings', icon: 'list' },
      { key: 'ride', label: 'Book Ride', icon: 'car-sport' },
      { key: 'car', label: 'Rent Vehicle', icon: 'car' },
    ];

    return (
      <View style={styles.filterContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              bookingType === filter.key && styles.activeFilterButton,
            ]}
            onPress={() => handleBookingTypeChange(filter.key)}
            activeOpacity={0.7}
          >
            <Icon
              name={filter.icon}
              size={16}
              color={bookingType === filter.key ? Colors.WHITE : Colors.PRIMARY}
            />
            <Text
              style={[
                styles.filterButtonText,
                bookingType === filter.key && styles.activeFilterButtonText,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderFilterButtons = () => {
    const filters = [
      { key: 'all', label: 'All', icon: 'list' },
      { key: 'today', label: 'Today', icon: 'today' },
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
      if (bookingType === 'ride') {return 'You haven\'t made any ride bookings yet';}
      if (bookingType === 'car') {return 'You haven\'t made any car bookings yet';}
      return 'You haven\'t made any bookings yet';
    };

    const getEmptyTitle = () => {
      if (activeFilter === 'today') {return 'No Bookings Today';}
      if (activeFilter === 'tomorrow') {return 'No Bookings Tomorrow';}
      if (bookingType === 'ride') {return 'No Ride Bookings';}
      if (bookingType === 'car') {return 'No Car Bookings';}
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
      {renderPackagesFilterButtons()} 

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
