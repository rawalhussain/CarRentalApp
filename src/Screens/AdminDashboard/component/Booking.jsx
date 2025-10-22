import React, { useState, useEffect, useCallback } from 'react';
import {
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  StatusBar, 
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions
} from 'react-native';
import { getDatabaseRef } from '../../../Config/firebase';
import { Colors } from '../../../Themes/MyColors';
import { SafeAreaView } from 'react-native-safe-area-context';
import MainHeader from '../../../Components/MainHeader';
import Loader from '../../../Components/Loader';
import Fonts from '../../../Themes/Fonts';
import Icon from 'react-native-vector-icons/Ionicons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const Bookings = ({ navigation }) => {
  const [allBookings, setAllBookings] = useState([]);
  const [todayBookings, setTodayBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('today');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const fetchAllBookings = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const ref = getDatabaseRef('bookings');
      const snapshot = await ref.once('value');
      const data = snapshot.val() || {};
      
      const arr = Object.entries(data)
        .map(([id, booking]) => ({ 
          id, 
          ...booking,
          createdAt: booking.createdAt || Date.now()
        }))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      
      setAllBookings(arr);
      
      // Filter today's bookings
      const today = new Date().toDateString();
      const todayArr = arr.filter(booking => {
        try {
          return new Date(booking.createdAt).toDateString() === today;
        } catch (e) {
          return false;
        }
      });
      setTodayBookings(todayArr);
    } catch (e) {
      console.error('Error fetching bookings:', e);
      setError('Failed to load bookings. Please try again.');
      setAllBookings([]);
      setTodayBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    fetchAllBookings(true);
  }, [fetchAllBookings]);

  const openModal = (booking) => {
    setSelectedBooking(booking);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedBooking(null);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return Colors.GREEN;
      case 'pending':
        return Colors.YELLOW;
      case 'cancelled':
        return Colors.RED;
      case 'completed':
        return Colors.PRIMARY;
      default:
        return Colors.PRIMARY_GREY;
    }
  };

  const formatDate = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const renderBookingCard = (booking) => {
    const vehicle = booking.vehicle || {};
    const contact = booking.contactDetails || {};
    const status = booking.status || 'pending';
    const statusColor = getStatusColor(status);
    
    const customerName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Unknown Customer';
    const vehicleName = `${vehicle.make || 'Vehicle'} ${vehicle.model || ''}`.trim() || 'Unknown Vehicle';

    return (
      <TouchableOpacity
        key={booking.id}
        style={styles.bookingCard}
        onPress={() => openModal(booking)}
        activeOpacity={0.7}
        accessibilityLabel={`Booking by ${customerName} for ${vehicleName}`}
        accessibilityHint="Tap to view booking details"
      >
        <View style={styles.bookingHeader}>
          <View style={styles.customerInfo}>
            <Icon name="person-circle-outline" size={20} color={Colors.PRIMARY} />
            <Text style={styles.customerName} numberOfLines={1}>
              {customerName}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{status.toUpperCase()}</Text>
          </View>
        </View>
        
        <View style={styles.vehicleInfo}>
          <Icon name="car-outline" size={18} color={Colors.PRIMARY_GREY} />
          <Text style={styles.vehicleName} numberOfLines={1}>
            {vehicleName}
          </Text>
        </View>
        
        <View style={styles.bookingFooter}>
          <View style={styles.dateInfo}>
            <Icon name="calendar-outline" size={16} color={Colors.PRIMARY_GREY} />
            <Text style={styles.dateText}>{formatDate(booking.createdAt)}</Text>
          </View>
          <Icon name="chevron-forward" size={16} color={Colors.PRIMARY_GREY} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    const isToday = activeTab === 'today';
    const title = isToday ? 'No bookings today' : 'No bookings found';
    const subtitle = isToday 
      ? 'There are no bookings for today yet.' 
      : 'No bookings have been made yet.';

    return (
      <View style={styles.emptyState}>
        <Icon 
          name={isToday ? "calendar-outline" : "receipt-outline"} 
          size={64} 
          color={Colors.PRIMARY_GREY} 
        />
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptySubtitle}>{subtitle}</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={onRefresh}
          activeOpacity={0.7}
        >
          <Icon name="refresh-outline" size={20} color={Colors.WHITE} />
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderErrorState = () => (
    <View style={styles.errorState}>
      <Icon name="alert-circle-outline" size={64} color={Colors.RED} />
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorSubtitle}>{error}</Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={() => fetchAllBookings()}
        activeOpacity={0.7}
      >
        <Icon name="refresh-outline" size={20} color={Colors.WHITE} />
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderBookings = () => {
    const bookings = activeTab === 'today' ? todayBookings : allBookings;
    
    if (error) {
      return renderErrorState();
    }
    
    if (bookings.length === 0) {
      return renderEmptyState();
    }
    
    return bookings.map(renderBookingCard);
  };

  const renderBookingModal = () => {
    if (!selectedBooking) return null;

    const vehicle = selectedBooking.vehicle || {};
    const contact = selectedBooking.contactDetails || {};
    const searchPrefs = selectedBooking.searchPreferences || {};
    const payment = selectedBooking.paymentDetails || {};
    const transaction = selectedBooking.transactionDetails || {};
    const status = selectedBooking.status || 'pending';
    const statusColor = getStatusColor(status);

    const customerName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Unknown Customer';
    const vehicleName = `${vehicle.make || 'Vehicle'} ${vehicle.model || ''}`.trim() || 'Unknown Vehicle';

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
                <Icon name="close" size={24} color={Colors.PRIMARY_GREY} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Booking Status */}
              <View style={styles.modalSection}>
                <View style={styles.sectionHeaderBookingStatus}>
                  <View style={styles.sectionHeaderBookingStatusLeft}>
                    <Icon name="receipt-outline" size={20} color={Colors.PRIMARY} />
                    <Text style={styles.sectionTitle}>Booking Status</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                  <Text style={styles.statusText}>{status.toUpperCase()}</Text>
                </View>
                </View>
                
                <Text style={styles.bookingId}>Booking ID: {selectedBooking.id}</Text>
                <Text style={styles.bookingDate}>{formatDate(selectedBooking.createdAt)}</Text>
              </View>

              {/* Customer Information */}
              <View style={styles.modalSection}>
                <View style={styles.sectionHeader}>
                  <Icon name="person-circle" size={23} color={Colors.PRIMARY} />
                  <Text style={styles.sectionTitle}>Customer Information</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Name</Text>
                  <Text style={styles.detailValue}>{customerName}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailValue}>{contact.email || 'Not provided'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Phone</Text>
                  <Text style={styles.detailValue}>{contact.phone || 'Not provided'}</Text>
                </View>
                {contact.comments && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Comments</Text>
                    <Text style={styles.detailValue}>{contact.comments}</Text>
                  </View>
                )}
              </View>

              {/* Vehicle Information */}
              <View style={styles.modalSection}>
                <View style={styles.sectionHeader}>
                  <Icon name="car-outline" size={20} color={Colors.PRIMARY} />
                  <Text style={styles.sectionTitle}>Vehicle Information</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Vehicle</Text>
                  <Text style={styles.detailValue}>{vehicleName}</Text>
                </View>
                {vehicle.year && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Year</Text>
                    <Text style={styles.detailValue}>{vehicle.year}</Text>
                  </View>
                )}
                {vehicle.color && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Color</Text>
                    <Text style={styles.detailValue}>{vehicle.color}</Text>
                  </View>
                )}
                {vehicle.licensePlate && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>License Plate</Text>
                    <Text style={styles.detailValue}>{vehicle.licensePlate}</Text>
                  </View>
                )}
              </View>

              {/* Trip Details */}
              {(searchPrefs.pickupLocation || searchPrefs.destination || searchPrefs.pickupDate) && (
                <View style={styles.modalSection}>
                  <View style={styles.sectionHeader}>
                    <Icon name="location-outline" size={20} color={Colors.PRIMARY} />
                    <Text style={styles.sectionTitle}>Trip Details</Text>
                  </View>
                  {searchPrefs.pickupLocation && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Pickup Location</Text>
                      <Text style={styles.detailValue}>{searchPrefs.pickupLocation}</Text>
                    </View>
                  )}
                  {searchPrefs.destination && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Destination</Text>
                      <Text style={styles.detailValue}>{searchPrefs.destination}</Text>
                    </View>
                  )}
                  {searchPrefs.pickupDate && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Pickup Date</Text>
                      <Text style={styles.detailValue}>{searchPrefs.pickupDate}</Text>
                    </View>
                  )}
                  {searchPrefs.pickupTime && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Pickup Time</Text>
                      <Text style={styles.detailValue}>{searchPrefs.pickupTime}</Text>
                    </View>
                  )}
                  {searchPrefs.passengers && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Passengers</Text>
                      <Text style={styles.detailValue}>{searchPrefs.passengers}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Payment Information */}
              {(payment.method || transaction.amount) && (
                <View style={styles.modalSection}>
                  <View style={styles.sectionHeader}>
                    <Icon name="card-outline" size={20} color={Colors.PRIMARY} />
                    <Text style={styles.sectionTitle}>Payment Information</Text>
                  </View>
                  {payment.method && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Payment Method</Text>
                      <Text style={styles.detailValue}>{payment.method}</Text>
                    </View>
                  )}
                  {transaction.amount && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Amount</Text>
                      <Text style={styles.detailValue}>${transaction.amount}</Text>
                    </View>
                  )}
                  {transaction.serviceFee && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Service Fee</Text>
                      <Text style={styles.detailValue}>${transaction.serviceFee}</Text>
                    </View>
                  )}
                  {transaction.total && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Total</Text>
                      <Text style={[styles.detailValue, styles.totalAmount]}>${transaction.total}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Additional Information */}
              <View style={styles.modalSection}>
                <View style={styles.sectionHeader}>
                  <Icon name="information-circle-outline" size={20} color={Colors.PRIMARY} />
                  <Text style={styles.sectionTitle}>Additional Information</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Created At</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedBooking.createdAt)}</Text>
                </View>
                {selectedBooking.updatedAt && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Last Updated</Text>
                    <Text style={styles.detailValue}>{formatDate(selectedBooking.updatedAt)}</Text>
                  </View>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.closeModalButton} onPress={closeModal}>
                <Text style={styles.closeModalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <MainHeader title="Bookings" showOptionsButton={false} showBackButton={false} />
        <StatusBar barStyle="dark-content" backgroundColor={Colors.BACKGROUND_GREY} />
        <Loader />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <MainHeader title="Bookings" showOptionsButton={false} showBackButton={false} />
      <StatusBar barStyle="dark-content" backgroundColor={Colors.BACKGROUND_GREY} />
      
      <View style={styles.sectionHeader}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'today' && styles.activeTab]}
            onPress={() => setActiveTab('today')}
            activeOpacity={0.7}
            accessibilityLabel="View today's bookings"
            accessibilityRole="button"
          >
            <Icon 
              name="today-outline" 
              size={16} 
              color={activeTab === 'today' ? Colors.WHITE : Colors.PRIMARY_GREY} 
            />
            <Text style={[styles.tabText, activeTab === 'today' && styles.activeTabText]}>
              Today ({todayBookings.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}
            activeOpacity={0.7}
            accessibilityLabel="View all bookings"
            accessibilityRole="button"
          >
            <Icon 
              name="list-outline" 
              size={16} 
              color={activeTab === 'all' ? Colors.WHITE : Colors.PRIMARY_GREY} 
            />
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
              All ({allBookings.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.PRIMARY]}
            tintColor={Colors.PRIMARY}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderBookings()}
      </ScrollView>
      
      {renderBookingModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_GREY,
  },
  sectionHeader: {
    marginBottom: 16,
    marginHorizontal: 16,
    paddingTop: 8,
  },
  sectionHeaderBookingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // marginBottom: 8,
  },
  sectionHeaderBookingStatusLeft:{
    flexDirection: 'row',
    alignItems: 'center',
  },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: Colors.PRIMARY,
  },
  tabText: {
    ...Fonts.style.medium,
    fontSize: 14,
    color: Colors.PRIMARY_GREY,
    marginLeft: 6,
  },
  activeTabText: {
    color: Colors.WHITE,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  bookingCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  customerName: {
    ...Fonts.style.semiBold,
    fontSize: 16,
    color: Colors.BLACK,
    marginLeft: 8,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    ...Fonts.style.medium,
    fontSize: 12,
    color: Colors.WHITE,
    fontWeight: '600',
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vehicleName: {
    ...Fonts.style.regular,
    fontSize: 14,
    color: Colors.PRIMARY_GREY,
    marginLeft: 8,
    flex: 1,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateText: {
    ...Fonts.style.regular,
    fontSize: 13,
    color: Colors.PRIMARY_GREY,
    marginLeft: 6,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    ...Fonts.style.semiBold,
    fontSize: 18,
    color: Colors.BLACK,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    ...Fonts.style.regular,
    fontSize: 14,
    color: Colors.PRIMARY_GREY,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  refreshButtonText: {
    ...Fonts.style.medium,
    fontSize: 14,
    color: Colors.WHITE,
    marginLeft: 8,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  errorTitle: {
    ...Fonts.style.semiBold,
    fontSize: 18,
    color: Colors.BLACK,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    ...Fonts.style.regular,
    fontSize: 14,
    color: Colors.PRIMARY_GREY,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.RED,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    ...Fonts.style.medium,
    fontSize: 14,
    color: Colors.WHITE,
    marginLeft: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: screenHeight * 0.9,
    minHeight: screenHeight * 0.6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  modalTitle: {
    ...Fonts.style.semiBold,
    fontSize: 18,
    color: Colors.BLACK,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalSection: {
    // marginVertical: 16,
    paddingVertical: 12,
    paddingTop: 6,
    paddingBottom: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    ...Fonts.style.semiBold,
    fontSize: 16,
    color: Colors.BLACK,
    marginLeft: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  detailLabel: {
    ...Fonts.style.medium,
    fontSize: 14,
    color: Colors.PRIMARY_GREY,
    flex: 1,
  },
  detailValue: {
    ...Fonts.style.regular,
    fontSize: 14,
    color: Colors.BLACK,
    flex: 1,
    textAlign: 'right',
  },
  totalAmount: {
    ...Fonts.style.semiBold,
    fontSize: 16,
    color: Colors.PRIMARY,
  },
  bookingId: {
    ...Fonts.style.medium,
    fontSize: 14,
    color: Colors.PRIMARY_GREY,
    marginTop: 8,
  },
  bookingDate: {
    ...Fonts.style.regular,
    fontSize: 13,
    color: Colors.PRIMARY_GREY,
    marginTop: 4,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  closeModalButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeModalButtonText: {
    ...Fonts.style.semiBold,
    fontSize: 16,
    color: Colors.WHITE,
  },
});

export default Bookings;
