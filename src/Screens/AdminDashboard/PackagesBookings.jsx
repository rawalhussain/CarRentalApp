import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import { Colors } from '../../Themes/MyColors';
import { getPackageBookings, updatePackageBookingStatus, getRidePackages, getUserData } from '../../Config/firebase';
import { showMessageAlert } from '../../Lib/utils/CommonHelper';
import MainHeader from '../../Components/MainHeader';

const PackagesBookings = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [packages, setPackages] = useState({});
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterType, setFilterType] = useState('today'); // 'today' or 'all'

  useEffect(() => {
    fetchBookings();
    fetchPackages();
  }, []);

  const fetchBookings = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // Get all package bookings for admin
      const bookingsData = await getPackageBookings(null, 'admin');
      
      // Get customer details for each booking
      const bookingsWithDetails = await Promise.all(
        bookingsData.map(async (booking) => {
          try {
            const customerData = await getUserData(booking.customerId);
            return {
              ...booking,
              customerName: customerData?.fullName || 'Unknown Customer',
              customerEmail: customerData?.email || 'N/A',
              customerPhone: customerData?.phoneNumber || 'N/A',
            };
          } catch (error) {
            console.error('Error fetching customer details:', error);
            return {
              ...booking,
              customerName: 'Unknown Customer',
              customerEmail: 'N/A',
              customerPhone: 'N/A',
            };
          }
        })
      );
      
      // Sort by creation date (newest first)
      const sortedBookings = bookingsWithDetails.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setBookings(sortedBookings);
    } catch (error) {
      console.error('Error fetching package bookings:', error);
      showMessageAlert('Error', 'Failed to fetch package bookings', 'danger');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchPackages = useCallback(async () => {
    try {
      const packagesData = await getRidePackages();
      const packagesMap = {};
      packagesData.forEach(pkg => {
        packagesMap[pkg.id] = pkg;
      });
      setPackages(packagesMap);
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  }, []);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      setActionLoading(prev => ({ ...prev, [bookingId]: true }));
      await updatePackageBookingStatus(bookingId, newStatus);
      
      // Update local state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: newStatus, updatedAt: Date.now() }
            : booking
        )
      );
      
      showMessageAlert('Success', `Booking ${newStatus} successfully`, 'success');
    } catch (error) {
      console.error('Error updating booking status:', error);
      showMessageAlert('Error', 'Failed to update booking status', 'danger');
    } finally {
      setActionLoading(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const showStatusUpdateAlert = (bookingId, currentStatus) => {
    const statusOptions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': ['confirmed'],
    };

    const availableStatuses = statusOptions[currentStatus] || [];
    
    if (availableStatuses.length === 0) {
      showMessageAlert('Info', 'No status updates available for this booking', 'info');
      return;
    }

    Alert.alert(
      'Update Booking Status',
      'Select new status:',
      [
        { text: 'Cancel', style: 'cancel' },
        ...availableStatuses.map(status => ({
          text: status.charAt(0).toUpperCase() + status.slice(1),
          onPress: () => handleStatusUpdate(bookingId, status),
        })),
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FFA726';
      case 'confirmed':
        return '#42A5F5';
      case 'completed':
        return '#66BB6A';
      case 'cancelled':
        return '#EF5350';
      default:
        return Colors.GRAY;
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const isToday = (timestamp) => {
    if (!timestamp) return false;
    const today = new Date();
    const bookingDate = new Date(timestamp);
    return (
      today.getDate() === bookingDate.getDate() &&
      today.getMonth() === bookingDate.getMonth() &&
      today.getFullYear() === bookingDate.getFullYear()
    );
  };

  const getFilteredBookings = () => {
    if (filterType === 'today') {
      return bookings.filter(booking => isToday(booking.createdAt));
    }
    return bookings;
  };

  const getTodayCount = () => {
    return bookings.filter(booking => isToday(booking.createdAt)).length;
  };

  const getAllCount = () => {
    return bookings.length;
  };

  const openDetailsModal = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setSelectedBooking(null);
    setShowDetailsModal(false);
  };

  const renderBookingCard = ({ item }) => {
    const isActionLoading = actionLoading[item.id];
    const packageData = packages[item.packageId] || {};
    const statusColor = getStatusColor(item.status);

    return (
      <TouchableOpacity 
        style={styles.bookingCard}
        onPress={() => openDetailsModal(item)}
        activeOpacity={0.7}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.bookingInfo}>
            <Text style={styles.bookingId}>#{item.id.slice(-8)}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          </View>
          <Text style={styles.bookingDate}>{formatDate(item.createdAt)}</Text>
        </View>

        {/* Essential Details Only */}
        <View style={styles.cardContent}>
          <View style={styles.essentialInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={16} color={Colors.GRAY} />
              <Text style={styles.infoText} numberOfLines={1}>{item.customerName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="package-outline" size={16} color={Colors.GRAY} />
              <Text style={styles.infoText} numberOfLines={1}>{packageData.name || 'Package Not Found'}</Text>
            </View>
            {item.pickupLocation && (
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={16} color={Colors.GRAY} />
                <Text style={styles.infoText} numberOfLines={1}>{item.pickupLocation}</Text>
              </View>
            )}
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Total:</Text>
              <Text style={styles.pricingAmount}>{formatCurrency(item.totalAmount)}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.statusButton]}
            onPress={() => showStatusUpdateAlert(item.id, item.status)}
            disabled={isActionLoading}
          >
            {isActionLoading ? (
              <ActivityIndicator size="small" color={Colors.WHITE} />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={16} color={Colors.WHITE} />
                <Text style={styles.actionButtonText}>Update Status</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.detailsButton]}
            onPress={() => openDetailsModal(item)}
          >
            <Ionicons name="eye-outline" size={16} color={Colors.PRIMARY} />
            <Text style={styles.detailsButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDetailsModal = () => {
    if (!selectedBooking) return null;
    
    const packageData = packages[selectedBooking.packageId] || {};
    const statusColor = getStatusColor(selectedBooking.status);

    return (
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeDetailsModal}
      >
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeDetailsModal} style={styles.closeModalButton}>
              <Ionicons name="close" size={24} color={Colors.WHITE} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Booking Details</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView 
            style={styles.modalContent} 
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Booking Header */}
            <View style={styles.modalSection}>
              <View style={styles.bookingHeader}>
                <Text style={styles.bookingIdLarge}>#{selectedBooking.id.slice(-8)}</Text>
                <View style={[styles.statusBadgeLarge, { backgroundColor: statusColor }]}>
                  <Text style={styles.statusTextLarge}>
                    {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                  </Text>
                </View>
              </View>
              <Text style={styles.bookingDateLarge}>{formatDate(selectedBooking.createdAt)}</Text>
            </View>

            {/* Customer Details */}
            <View style={styles.modalSection}>
              <Text style={styles.sectionTitle}>Customer Information</Text>
              <View style={styles.detailRow}>
                <Ionicons name="person-outline" size={20} color={Colors.GRAY} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Name</Text>
                  <Text style={styles.detailText}>{selectedBooking.customerName}</Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="mail-outline" size={20} color={Colors.GRAY} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailText}>{selectedBooking.customerEmail}</Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="call-outline" size={20} color={Colors.GRAY} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Phone</Text>
                  <Text style={styles.detailText}>{selectedBooking.customerPhone}</Text>
                </View>
              </View>
            </View>

            {/* Package Details */}
            <View style={styles.modalSection}>
              <Text style={styles.sectionTitle}>Package Information</Text>
              <View style={styles.detailRow}>
                <Ionicons name="car-outline" size={20} color={Colors.GRAY} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Package Name</Text>
                  <Text style={styles.detailText}>{packageData.name || 'Package Not Found'}</Text>
                </View>
              </View>
              {packageData.description && (
                <View style={styles.descriptionContainer}>
                  <Text style={styles.descriptionText}>{packageData.description}</Text>
                </View>
              )}
              {packageData.ratePerMile && (
                <View style={styles.detailRow}>
                  <Ionicons name="speedometer-outline" size={20} color={Colors.GRAY} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Rate per Mile</Text>
                    <Text style={styles.detailText}>${packageData.ratePerMile}</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Trip Details */}
            <View style={styles.modalSection}>
              <Text style={styles.sectionTitle}>Trip Information</Text>
              {selectedBooking.pickupLocation && (
                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={20} color={Colors.GRAY} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Pickup Location</Text>
                    <Text style={styles.detailText}>{selectedBooking.pickupLocation}</Text>
                  </View>
                </View>
              )}
              {selectedBooking.destination && (
                <View style={styles.detailRow}>
                  <Ionicons name="flag-outline" size={20} color={Colors.GRAY} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Destination</Text>
                    <Text style={styles.detailText}>{selectedBooking.destination}</Text>
                  </View>
                </View>
              )}
              {selectedBooking.pickupDate && (
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={20} color={Colors.GRAY} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Pickup Date</Text>
                    <Text style={styles.detailText}>{formatDate(selectedBooking.pickupDate)}</Text>
                  </View>
                </View>
              )}
              {selectedBooking.pickupTime && (
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={20} color={Colors.GRAY} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Pickup Time</Text>
                    <Text style={styles.detailText}>{selectedBooking.pickupTime}</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Pricing Details */}
            <View style={styles.modalSection}>
              <Text style={styles.sectionTitle}>Pricing Details</Text>
              <View style={styles.pricingContainer}>
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>Total Amount</Text>
                  <Text style={styles.pricingAmount}>{formatCurrency(selectedBooking.totalAmount)}</Text>
                </View>
                {selectedBooking.distance && (
                  <View style={styles.pricingRow}>
                    <Text style={styles.pricingLabel}>Distance</Text>
                    <Text style={styles.pricingAmount}>{selectedBooking.distance} km</Text>
                  </View>
                )}
                {packageData.baseFare && (
                  <View style={styles.pricingRow}>
                    <Text style={styles.pricingLabel}>Base Fare</Text>
                    <Text style={styles.pricingAmount}>{formatCurrency(packageData.baseFare)}</Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Modal Footer - Fixed at bottom */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeDetailsModal}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.updateButton, actionLoading[selectedBooking.id] && styles.disabledButton]}
              onPress={() => showStatusUpdateAlert(selectedBooking.id, selectedBooking.status)}
              disabled={actionLoading[selectedBooking.id]}
            >
              {actionLoading[selectedBooking.id] ? (
                <ActivityIndicator size="small" color={Colors.WHITE} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={16} color={Colors.WHITE} />
                  <Text style={styles.updateButtonText}>Update Status</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[
          styles.filterButton,
          filterType === 'today' && styles.filterButtonActive
        ]}
        onPress={() => setFilterType('today')}
      >
        <Ionicons 
          name="calendar-outline" 
          size={16} 
          color={filterType === 'today' ? Colors.WHITE : Colors.GRAY} 
        />
        <Text style={[
          styles.filterButtonText,
          filterType === 'today' && styles.filterButtonTextActive
        ]}>
          Today ({getTodayCount()})
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.filterButton,
          filterType === 'all' && styles.filterButtonActive
        ]}
        onPress={() => setFilterType('all')}
      >
        <Ionicons 
          name="list-outline" 
          size={16} 
          color={filterType === 'all' ? Colors.WHITE : Colors.GRAY} 
        />
        <Text style={[
          styles.filterButtonText,
          filterType === 'all' && styles.filterButtonTextActive
        ]}>
          All ({getAllCount()})
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={64} color={Colors.GRAY} />
      <Text style={styles.emptyText}>
        {filterType === 'today' ? 'No Bookings Today' : 'No Package Bookings Found'}
      </Text>
      <Text style={styles.emptySubText}>
        {filterType === 'today' 
          ? 'No package bookings were made today'
          : 'Package bookings will appear here when customers make reservations'
        }
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <MainHeader
        title="Package Bookings"
        showOptionsButton={false}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      <StatusBar barStyle="dark-content" backgroundColor={Colors.WHITE} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
          <Text style={styles.loadingText}>Loading ride bookings...</Text>
        </View>
      ) : (
        <>
          {renderFilterButtons()}
          {getFilteredBookings().length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={getFilteredBookings()}
              renderItem={renderBookingCard}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => fetchBookings(true)}
                  colors={[Colors.PRIMARY]}
                  tintColor={Colors.PRIMARY}
                />
              }
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}
      
      {renderDetailsModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_GREY,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.GRAY,
  },
  listContainer: {
    padding: 16,
  },
  bookingCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  essentialInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.BLACK,
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LINE_GRAY,
    backgroundColor: Colors.BACKGROUND_GREY,
  },
  bookingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bookingId: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.BLACK,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.WHITE,
  },
  bookingDate: {
    fontSize: 12,
    color: Colors.GRAY,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LINE_GRAY,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.BLACK,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.BLACK,
    flex: 1,
  },
  packageDescription: {
    fontSize: 14,
    color: Colors.GRAY,
    fontStyle: 'italic',
    marginTop: 4,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  pricingLabel: {
    fontSize: 14,
    color: Colors.GRAY,
  },
  pricingAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.PRIMARY,
  },
  actionButtons: {
    flexDirection: 'row',
    // padding: 16,
    // paddingVertical: 12,
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 12,
    backgroundColor: Colors.BACKGROUND_GREY,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  statusButton: {
    backgroundColor: Colors.PRIMARY,
  },
  detailsButton: {
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.WHITE,
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.PRIMARY,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.BLACK,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    color: Colors.GRAY,
    textAlign: 'center',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    // paddingTop: 50, // Add top padding for status bar
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LINE_GRAY,
    backgroundColor: Colors.WHITE,
  },
  closeModalButton:{
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 25,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.BLACK,
  },
  placeholder: {
    width: 24,
  },
  modalContent: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 16,
    // paddingBottom: 120, // Add more padding to prevent content from being hidden behind footer
  },
  modalSection: {
    marginBottom: 8,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  bookingIdLarge: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.BLACK,
  },
  statusBadgeLarge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusTextLarge: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.WHITE,
  },
  bookingDateLarge: {
    fontSize: 14,
    color: Colors.GRAY,
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.GRAY,
    marginBottom: 2,
  },
  descriptionContainer: {
    backgroundColor: Colors.BACKGROUND_GREY,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.BLACK,
    lineHeight: 20,
  },
  pricingContainer: {
    backgroundColor: Colors.BACKGROUND_GREY,
    padding: 16,
    borderRadius: 8,
  },
  modalFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 20, 
    borderTopWidth: 1,
    borderTopColor: Colors.LINE_GRAY,
    gap: 12,
    backgroundColor: Colors.WHITE,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    zIndex: 1000,
  },
  closeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.LINE_GRAY,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: Colors.GRAY,
    fontWeight: '600',
  },
  updateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.PRIMARY,
    gap: 8,
  },
  updateButtonText: {
    fontSize: 16,
    color: Colors.WHITE,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  // Filter buttons styles
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.WHITE,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    backgroundColor: Colors.WHITE,
  },
  filterButtonActive: {
    backgroundColor: Colors.PRIMARY,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.GRAY,
  },
  filterButtonTextActive: {
    color: Colors.WHITE,
  },
});

export default PackagesBookings;
