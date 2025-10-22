import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  SectionList,
} from 'react-native';
import { Colors } from '../../Themes/MyColors';
import { getBookings, updateBookingStatus } from '../../Config/firebase';
import useAuthStore from '../../store/useAuthStore';
import Loader from '../../Components/Loader';
import { SafeAreaView } from 'react-native-safe-area-context';
import MainHeader from '../../Components/MainHeader';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ProviderBookings = ({ navigation }) => {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [groupedBookings, setGroupedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (user && (user.uid || user.user?.uid)) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
    setLoading(true);
    }
    setError(null);

    const userId = user?.user?.uid || user?.uid;
    try {
      const data = await getBookings(userId, 'vendor');
      if (data) {
        const arr = Object.entries(data).map(([id, booking]) => ({ id, ...booking }));

        // Sort bookings by pickup date (newest first)
        const sortedBookings = arr.sort((a, b) => {
          const dateA = new Date(a.searchPreferences?.pickupDate || a.createdAt || 0);
          const dateB = new Date(b.searchPreferences?.pickupDate || b.createdAt || 0);
          return dateB - dateA;
        });
        setBookings(sortedBookings);
        setGroupedBookings(groupBookingsByDate(sortedBookings));
      } else {
        setBookings([]);
        setGroupedBookings([]);
      }
    } catch (e) {
      console.error('Error fetching bookings:', e);
      setError('Failed to load bookings. Please try again.');
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    fetchBookings(true);
  }, [user]);

  const handleBookingPress = (booking) => {
    setSelectedBooking(booking);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedBooking(null);
  };

  const handleStatusUpdate = () => {
    if (!selectedBooking) {return;}

    Alert.alert(
      'Update Booking Status',
      'Select new status:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Pending', onPress: () => handleUpdateBookingStatus(selectedBooking.id, 'pending') },
        { text: 'Confirmed', onPress: () => handleUpdateBookingStatus(selectedBooking.id, 'confirmed') },
        { text: 'In Progress', onPress: () => handleUpdateBookingStatus(selectedBooking.id, 'in_progress') },
        { text: 'Completed', onPress: () => handleUpdateBookingStatus(selectedBooking.id, 'completed') },
        { text: 'Cancelled', onPress: () => handleUpdateBookingStatus(selectedBooking.id, 'cancelled') },
      ]
    );
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await updateBookingStatus(bookingId, status);

      // Update the bookings list in the background
      const updatedBookings = bookings.map(booking =>
        booking.id === bookingId
          ? { ...booking, status: status, updatedAt: Date.now() }
          : booking
      );
      setBookings(updatedBookings);
      setGroupedBookings(groupBookingsByDate(updatedBookings));

      // Show success alert and close modal when user clicks OK
      Alert.alert(
        'Success',
        `Booking status updated to ${status}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setModalVisible(false);
              setSelectedBooking(null);
            },
          },
        ]
      );

    } catch (error) {
      console.error('Error updating booking status:', error);
      Alert.alert('Error', 'Failed to update booking status. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return Colors.GREEN;
      case 'in_progress':
        return Colors.YELLOW;
      case 'completed':
        return Colors.PRIMARY;
      case 'cancelled':
        return Colors.RED;
      default:
        return Colors.PRIMARY_GREY;
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'checkmark-circle';
      case 'in_progress':
        return 'time';
      case 'completed':
        return 'checkmark-done-circle';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'time';
    }
  };
  // 'checkmark-circle' : 'time'}
  const formatDate = (dateString) => {
    if (!dateString) {return 'N/A';}
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getDateGroup = (dateString) => {
    if (!dateString) {return 'Other';}

    try {
      const bookingDate = new Date(dateString);

      // Check if the date is valid
      if (isNaN(bookingDate.getTime())) {
        return 'Other';
      }

      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Reset time to compare only dates
      const bookingDateOnly = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

      if (bookingDateOnly.getTime() === todayOnly.getTime()) {
        return 'Today';
      } else if (bookingDateOnly.getTime() === yesterdayOnly.getTime()) {
        return 'Yesterday';
      } else {
        // Check if it's within the current week
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        if (bookingDateOnly >= startOfWeek) {
          return 'This Week';
        } else {
          // Check if it's within the current month
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          if (bookingDateOnly >= startOfMonth) {
            return 'This Month';
          } else {
            return 'Older';
          }
        }
      }
    } catch (error) {
      return 'Other';
    }
  };

  const groupBookingsByDate = (bookingsList) => {
    const groups = {};

    bookingsList.forEach(booking => {
      // Try pickupDate first, then fallback to createdAt
      let dateToUse = booking.searchPreferences?.pickupDate;

      // If pickupDate is invalid or missing, try createdAt
      if (!dateToUse || isNaN(new Date(dateToUse).getTime())) {
        dateToUse = booking.createdAt;
      }

      const groupKey = getDateGroup(dateToUse);

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(booking);
    });

    // Convert to array format for SectionList
    const groupOrder = ['Today', 'Yesterday', 'This Week', 'This Month', 'Older', 'Other'];
    return groupOrder
      .filter(group => groups[group] && groups[group].length > 0)
      .map(group => ({
        title: group,
        data: groups[group],
      }));
  };

  const getVehicleType = (vehicle) => {
    // Check if it's a bus based on common bus indicators
    const busIndicators = ['bus', 'coach', 'star bus', 'volvo', 'daewoo'];
    const vehicleName = `${vehicle.make || ''} ${vehicle.model || ''}`.toLowerCase();

    return busIndicators.some(indicator => vehicleName.includes(indicator)) ? 'Bus' : 'Car';
  };

  const renderItem = ({ item }) => {
    const vehicle = item.vehicle || {};
    const contact = item.contactDetails || {};
    const searchPrefs = item.searchPreferences || {};
    const status = item.status || 'pending';
    const vehicleType = getVehicleType(vehicle);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleBookingPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.vehicleInfo}>
            <View style={styles.vehicleTitleRow}>
              <Text style={styles.model}>
                {vehicle.make || 'Vehicle'} {vehicle.model || ''}
                {vehicle.variant ? ` (${vehicle.variant})` : ''}
              </Text>
              <View style={[styles.vehicleTypeBadge, {
                backgroundColor: vehicleType === 'Bus' ? Colors.SECONDARY + '20' : Colors.PRIMARY + '20',
              }]}>
                <Ionicons
                  name={vehicleType === 'Bus' ? 'bus' : 'car'}
                  size={14}
                  color={vehicleType === 'Bus' ? Colors.SECONDARY : Colors.PRIMARY}
                />
                <Text style={[styles.vehicleTypeText, {
                  color: vehicleType === 'Bus' ? Colors.SECONDARY : Colors.PRIMARY,
                }]}>
                  {vehicleType}
                </Text>
              </View>
            </View>
            <Text style={styles.vehicleYear}>
              {vehicle.year ? `${vehicle.year}` : ''}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) + '20' }]}>
            <Ionicons
              name={getStatusIcon(status)}
              size={16}
              color={getStatusColor(status)}
            />
            <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Ionicons name="person" size={16} color={Colors.PRIMARY_GREY} />
            <Text style={styles.infoText}>
              {contact.firstName || 'N/A'} {contact.lastName || ''}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={16} color={Colors.PRIMARY_GREY} />
            <Text style={styles.infoText}>
              {formatDate(searchPrefs.pickupDate)} - {formatDate(searchPrefs.dropoffDate)}
            </Text>
          </View>

          {searchPrefs.pickupTime && (
            <View style={styles.infoRow}>
              <Ionicons name="time" size={16} color={Colors.PRIMARY_GREY} />
              <Text style={styles.infoText}>
                Pickup Time: {searchPrefs.pickupTime}
              </Text>
            </View>
          )}

          {searchPrefs.pickupAddress && (
            <View style={styles.infoRow}>
              <Ionicons name="location" size={16} color={Colors.PRIMARY_GREY} />
              <Text style={styles.infoText}>
                From: {searchPrefs.pickupAddress}
              </Text>
            </View>
          )}

          {searchPrefs.hours && (
            <View style={styles.infoRow}>
              <Ionicons name="hourglass" size={16} color={Colors.PRIMARY_GREY} />
              <Text style={styles.infoText}>
                Duration: {searchPrefs.hours}
              </Text>
            </View>
          )}

          {vehicle.rent && (
            <View style={styles.infoRow}>
              <Ionicons name="cash" size={16} color={Colors.PRIMARY_GREY} />
              <Text style={styles.amountText}>${vehicle.rent}/day</Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.tapHint}>Tap to view details</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={80} color={Colors.PRIMARY_GREY} />
      <Text style={styles.emptyTitle}>No Bookings Yet</Text>
      <Text style={styles.emptySubtitle}>
        When customers book your vehicles, they'll appear here
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={80} color={Colors.RED} />
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorSubtitle}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => fetchBookings()}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSectionHeader = ({ section }) => {
    const getSectionIcon = (title) => {
      switch (title) {
        case 'Today':
          return 'today';
        case 'Yesterday':
          return 'time';
        case 'This Week':
          return 'calendar';
        case 'This Month':
          return 'calendar-outline';
        case 'Older':
          return 'archive';
        default:
          return 'list';
      }
    };

    return (
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderContent}>
          <Ionicons
            name={getSectionIcon(section.title)}
            size={20}
            color={Colors.PRIMARY}
          />
          <Text style={styles.sectionHeaderText}>{section.title}</Text>
          <View style={styles.sectionCount}>
            <Text style={styles.sectionCountText}>{section.data.length}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderBookingModal = () => {
    if (!selectedBooking) {return null;}

    const vehicle = selectedBooking.vehicle || {};
    const contact = selectedBooking.contactDetails || {};
    const searchPrefs = selectedBooking.searchPreferences || {};
    const status = selectedBooking.status || 'pending';

    return (
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Booking Details</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={Colors.PRIMARY_GREY} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Vehicle Information */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Vehicle Information</Text>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Ionicons name="car" size={20} color={Colors.PRIMARY} />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Vehicle</Text>
                      <Text style={styles.infoValue}>
                        {vehicle.make || 'N/A'} {vehicle.model || ''}
                        {vehicle.variant ? ` (${vehicle.variant})` : ''}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.infoRow}>
                    <Ionicons
                      name={getVehicleType(vehicle) === 'Bus' ? 'bus' : 'car'}
                      size={20}
                      color={getVehicleType(vehicle) === 'Bus' ? Colors.SECONDARY : Colors.PRIMARY}
                    />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Type</Text>
                      <Text style={[styles.infoValue, {
                        color: getVehicleType(vehicle) === 'Bus' ? Colors.SECONDARY : Colors.PRIMARY,
                      }]}>
                        {getVehicleType(vehicle)}
                      </Text>
                    </View>
                  </View>

                  {vehicle.year && (
                    <View style={styles.infoRow}>
                      <Ionicons name="calendar" size={20} color={Colors.PRIMARY} />
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Year</Text>
                        <Text style={styles.infoValue}>{vehicle.year}</Text>
                      </View>
                    </View>
                  )}

                  {vehicle.color && (
                    <View style={styles.infoRow}>
                      <Ionicons name="color-palette" size={20} color={Colors.PRIMARY} />
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Color</Text>
                        <Text style={styles.infoValue}>{vehicle.color}</Text>
                      </View>
                    </View>
                  )}

                  {vehicle.rent && (
                    <View style={styles.infoRow}>
                      <Ionicons name="cash" size={20} color={Colors.PRIMARY} />
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Daily Rate</Text>
                        <Text style={[styles.infoValue, styles.amountValue]}>${vehicle.rent}/day</Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>

              {/* Customer Information */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Customer Information</Text>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Ionicons name="person" size={20} color={Colors.PRIMARY} />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Name</Text>
                      <Text style={styles.infoValue}>
                        {contact.firstName || 'N/A'} {contact.lastName || ''}
                      </Text>
                    </View>
                  </View>
                  {contact.phoneNumber && (
                    <View style={styles.infoRow}>
                      <Ionicons name="call" size={20} color={Colors.PRIMARY} />
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Phone</Text>
                        <Text style={styles.infoValue}>{contact.phoneNumber}</Text>
                      </View>
                    </View>
                  )}
                  {contact.email && (
                    <View style={styles.infoRow}>
                      <Ionicons name="mail" size={20} color={Colors.PRIMARY} />
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoValue}>{contact.email}</Text>
                      </View>
                    </View>
                  )}
                  {contact.comments && (
                    <View style={styles.infoRow}>
                      <Ionicons name="chatbubble" size={20} color={Colors.PRIMARY} />
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Comments</Text>
                        <Text style={styles.infoValue}>{contact.comments}</Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>

              {/* Booking Information */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Booking Information</Text>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={20} color={Colors.PRIMARY} />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Pickup Date</Text>
                      <Text style={styles.infoValue}>{formatDate(searchPrefs.pickupDate)}</Text>
                    </View>
                  </View>

                  <View style={styles.infoRow}>
                    <Ionicons name="calendar" size={20} color={Colors.PRIMARY} />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Drop-off Date</Text>
                      <Text style={styles.infoValue}>{formatDate(searchPrefs.dropoffDate)}</Text>
                    </View>
                  </View>

                  {searchPrefs.pickupTime && (
                    <View style={styles.infoRow}>
                      <Ionicons name="time" size={20} color={Colors.PRIMARY} />
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Pickup Time</Text>
                        <Text style={styles.infoValue}>{searchPrefs.pickupTime}</Text>
                      </View>
                    </View>
                  )}

                  {searchPrefs.pickupAddress && (
                    <View style={styles.infoRow}>
                      <Ionicons name="location" size={20} color={Colors.PRIMARY} />
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Pickup Address</Text>
                        <Text style={styles.infoValue}>{searchPrefs.pickupAddress}</Text>
                      </View>
                    </View>
                  )}

                  {searchPrefs.dropoffAddress && (
                    <View style={styles.infoRow}>
                      <Ionicons name="location-outline" size={20} color={Colors.PRIMARY} />
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Drop-off Address</Text>
                        <Text style={styles.infoValue}>{searchPrefs.dropoffAddress}</Text>
                      </View>
                    </View>
                  )}

                  {searchPrefs.hours && (
                    <View style={styles.infoRow}>
                      <Ionicons name="hourglass" size={20} color={Colors.PRIMARY} />
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Duration</Text>
                        <Text style={styles.infoValue}>{searchPrefs.hours}</Text>
                      </View>
                    </View>
                  )}

                  {selectedBooking.amount && (
                    <View style={styles.infoRow}>
                      <Ionicons name="cash" size={20} color={Colors.PRIMARY} />
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Total Amount</Text>
                        <Text style={[styles.infoValue, styles.amountValue]}>${selectedBooking.amount}</Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>

              {/* Status */}
              <View style={styles.modalSectionBottom}>
                <Text style={styles.sectionTitle}>Current Status</Text>
                <View style={[styles.statusCard, { backgroundColor: getStatusColor(status) + '20' }]}>
                  <View style={styles.statusRow}>
                    <Ionicons
                      name={getStatusIcon(status)}
                      size={24}
                      color={getStatusColor(status)}
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.updateStatusButton}
                onPress={handleStatusUpdate}
              >
                <Ionicons name="create" size={20} color={Colors.WHITE} />
                <Text style={styles.updateStatusButtonText}>Update Status</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <MainHeader title="My Bookings" showOptionsButton={false} showBackButton={false} />
      {loading && <View style={styles.loaderOverlay}><Loader /></View>}

      <View style={styles.content}>
        {error ? (
          renderErrorState()
        ) : (
          <SectionList
            sections={groupedBookings}
        keyExtractor={item => item.id}
        renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.PRIMARY]}
                tintColor={Colors.PRIMARY}
              />
            }
            ListEmptyComponent={!loading && renderEmptyState()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
          />
        )}
       </View>

      {renderBookingModal()}
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_GREY,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContainer: {
    paddingTop: 8,
    // paddingBottom: 20,
  },
  card: {
    backgroundColor: Colors.WHITE,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginHorizontal: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    // marginBottom: 16,
  },
  vehicleInfo: {
    flex: 1,
    marginRight: 12,
  },
  vehicleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  model: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.BLACK,
    flex: 1,
    marginRight: 8,
  },
  vehicleTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  vehicleTypeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  vehicleYear: {
    fontSize: 14,
    color: Colors.PRIMARY_GREY,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  cardBody: {
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.PRIMARY_GREY,
    marginLeft: 8,
    flex: 1,
  },
  amountText: {
    fontSize: 16,
    color: Colors.PRIMARY,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.LINE_GRAY,
    paddingTop: 12,
    alignItems: 'center',
  },
  tapHint: {
    fontSize: 12,
    color: Colors.PRIMARY_GREY,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.BLACK,
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.PRIMARY_GREY,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.BLACK,
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
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
  retryButtonText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    // paddingBottom: 100,
  },
  modalContainer: {
    backgroundColor: Colors.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '85%',
    flexDirection: 'column',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LINE_GRAY,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.BLACK,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 100, // Space for absolute footer
  },
  modalSection: {
    marginVertical: 16,
    // marginBottom: 100,
  },
  modalSectionBottom: {
    // marginVertical: 16,
    marginBottom: 100,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.BLACK,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: Colors.BACKGROUND_GREY,
    borderRadius: 12,
    padding: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.PRIMARY_GREY,
    marginBottom: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    color: Colors.BLACK,
    fontWeight: '500',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
  },
  statusCard: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.LINE_GRAY,
    backgroundColor: Colors.WHITE,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  updateStatusButton: {
    backgroundColor: Colors.PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  updateStatusButtonText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Section Header Styles
  sectionHeader: {
    backgroundColor: Colors.BACKGROUND_GREY,
    paddingHorizontal: 20,
    paddingVertical: 12,
    // marginTop: 16,
    marginBottom: 8,
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.BLACK,
    marginLeft: 8,
    flex: 1,
  },
  sectionCount: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  sectionCountText: {
    color: Colors.WHITE,
    fontSize: 12,
    fontWeight: 'bold',
  },
  updatedIndicator: {
    marginLeft: 8,
  },
});

export default ProviderBookings;
