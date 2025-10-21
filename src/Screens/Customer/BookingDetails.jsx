import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MainHeader from '../../Components/MainHeader';
import { Colors } from '../../Themes/MyColors';
import Fonts from '../../Themes/Fonts';
import Metrics from '../../Themes/Metrics';
import Loader from '../../Components/Loader';

const BookingDetails = ({ navigation, route }) => {
  const { bookingId, ...bookingData } = route.params || {};
  const vehicle = bookingData.vehicle || {};
  const searchPreferences = bookingData.searchPreferences || {};
  const customer = bookingData.customer || {};

  const handleBackPress = () => {
    navigation.goBack();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return Colors.GREEN;
      case 'pending':
        return Colors.orange;
      case 'cancelled':
        return Colors.red;
      default:
        return Colors.gray;
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <MainHeader
        title="Booking Details"
        onBackPress={handleBackPress}
        showOptionsButton={false}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Booking Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Icon
              name={getStatusIcon(bookingData.status)}
              size={24}
              color={getStatusColor(bookingData.status)}
            />
            <Text style={[styles.statusText, { color: getStatusColor(bookingData.status) }]}>
              {bookingData.status || 'Pending'}
            </Text>
          </View>
          <Text style={styles.bookingId}>Booking ID: {bookingId}</Text>
        </View>

        {/* Vehicle Image and Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Information</Text>
          <View style={styles.vehicleCard}>
            {vehicle.image && (
              <Image source={{ uri: vehicle.image }} style={styles.vehicleImage} />
            )}
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleTitle}>
                {vehicle.make || 'N/A'} {vehicle.model || ''} {vehicle.variant ? `(${vehicle.variant})` : ''}
              </Text>
              {vehicle.year && (
                <Text style={styles.vehicleSubtitle}>{vehicle.year} • {vehicle.color || 'N/A'}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Detailed Vehicle Specifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Specifications</Text>
          <View style={styles.infoCard}>
            {vehicle.year && (
              <View style={styles.infoRow}>
                <Icon name="calendar" size={20} color={Colors.PRIMARY} />
                <Text style={styles.infoLabel}>Model Year:</Text>
                <Text style={styles.infoValue}>{vehicle.year}</Text>
              </View>
            )}
            
            {vehicle.color && (
              <View style={styles.infoRow}>
                <Icon name="color-palette" size={20} color={Colors.PRIMARY} />
                <Text style={styles.infoLabel}>Color:</Text>
                <Text style={styles.infoValue}>{vehicle.color}</Text>
              </View>
            )}
            
            {vehicle.seats && (
              <View style={styles.infoRow}>
                <Icon name="people" size={20} color={Colors.PRIMARY} />
                <Text style={styles.infoLabel}>Seating Capacity:</Text>
                <Text style={styles.infoValue}>{vehicle.seats} passengers</Text>
              </View>
            )}

            {vehicle.fuelType && (
              <View style={styles.infoRow}>
                <Icon name="car-sport" size={20} color={Colors.PRIMARY} />
                <Text style={styles.infoLabel}>Fuel Type:</Text>
                <Text style={styles.infoValue}>{vehicle.fuelType}</Text>
              </View>
            )}

            {vehicle.transmission && (
              <View style={styles.infoRow}>
                <Icon name="settings" size={20} color={Colors.PRIMARY} />
                <Text style={styles.infoLabel}>Transmission:</Text>
                <Text style={styles.infoValue}>{vehicle.transmission}</Text>
              </View>
            )}

            {vehicle.mileage && (
              <View style={styles.infoRow}>
                <Icon name="speedometer" size={20} color={Colors.PRIMARY} />
                <Text style={styles.infoLabel}>Mileage:</Text>
                <Text style={styles.infoValue}>{vehicle.mileage} km/l</Text>
              </View>
            )}

            {vehicle.engine && (
              <View style={styles.infoRow}>
                <Icon name="construct" size={20} color={Colors.PRIMARY} />
                <Text style={styles.infoLabel}>Engine:</Text>
                <Text style={styles.infoValue}>{vehicle.engine}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Vehicle Features */}
        {vehicle.features && vehicle.features.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vehicle Features</Text>
            <View style={styles.infoCard}>
              <View style={styles.featuresContainer}>
                {vehicle.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Icon name="checkmark-circle" size={16} color={Colors.GREEN} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Booking Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Period</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Icon name="calendar-outline" size={20} color={Colors.PRIMARY} />
              <Text style={styles.infoLabel}>Pickup Date:</Text>
              <Text style={styles.infoValue}>{searchPreferences.pickupDate || 'N/A'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Icon name="calendar-outline" size={20} color={Colors.PRIMARY} />
              <Text style={styles.infoLabel}>Drop-off Date:</Text>
              <Text style={styles.infoValue}>{searchPreferences.dropoffDate || 'N/A'}</Text>
            </View>
            
            {searchPreferences.pickupTime && (
              <View style={styles.infoRow}>
                <Icon name="time-outline" size={20} color={Colors.PRIMARY} />
                <Text style={styles.infoLabel}>Pickup Time:</Text>
                <Text style={styles.infoValue}>{searchPreferences.pickupTime}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Location Information */}
        {(searchPreferences.pickupLocation || searchPreferences.dropoffLocation) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location Details</Text>
            <View style={styles.infoCard}>
              {searchPreferences.pickupLocation && (
                <View style={styles.infoRow}>
                  <Icon name="location" size={20} color={Colors.PRIMARY} />
                  <Text style={styles.infoLabel}>Pickup:</Text>
                  <Text style={styles.infoValue}>{searchPreferences.pickupLocation}</Text>
                </View>
              )}
              
              {searchPreferences.dropoffLocation && (
                <View style={styles.infoRow}>
                  <Icon name="location" size={20} color={Colors.PRIMARY} />
                  <Text style={styles.infoLabel}>Drop-off:</Text>
                  <Text style={styles.infoValue}>{searchPreferences.dropoffLocation}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Customer Information */}
        {customer && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Information</Text>
            <View style={styles.infoCard}>
              {customer.name && (
                <View style={styles.infoRow}>
                  <Icon name="person" size={20} color={Colors.PRIMARY} />
                  <Text style={styles.infoLabel}>Name:</Text>
                  <Text style={styles.infoValue}>{customer.name}</Text>
                </View>
              )}
              
              {customer.email && (
                <View style={styles.infoRow}>
                  <Icon name="mail" size={20} color={Colors.PRIMARY} />
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoValue}>{customer.email}</Text>
                </View>
              )}
              
              {customer.phone && (
                <View style={styles.infoRow}>
                  <Icon name="call" size={20} color={Colors.PRIMARY} />
                  <Text style={styles.infoLabel}>Phone:</Text>
                  <Text style={styles.infoValue}>{customer.phone}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Pricing Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing Details</Text>
          <View style={styles.infoCard}>
            {bookingData.basePrice && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Base Price:</Text>
                <Text style={styles.pricingValue}>${bookingData.basePrice}</Text>
              </View>
            )}
            
            {bookingData.dailyRate && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Daily Rate:</Text>
                <Text style={styles.pricingValue}>${bookingData.dailyRate}/day</Text>
              </View>
            )}
            
            {bookingData.duration && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Duration:</Text>
                <Text style={styles.pricingValue}>{bookingData.duration} days</Text>
              </View>
            )}
            
            {bookingData.tax && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Tax:</Text>
                <Text style={styles.pricingValue}>${bookingData.tax}</Text>
              </View>
            )}
            
            {bookingData.insurance && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Insurance:</Text>
                <Text style={styles.pricingValue}>${bookingData.insurance}</Text>
              </View>
            )}
            
            {bookingData.additionalFees && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Additional Fees:</Text>
                <Text style={styles.pricingValue}>${bookingData.additionalFees}</Text>
              </View>
            )}
            
            <View style={[styles.pricingRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalValue}>
                ${bookingData.totalPrice || bookingData.basePrice || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Booking Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Timeline</Text>
          <View style={styles.infoCard}>
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Booking Created</Text>
                <Text style={styles.timelineDate}>{bookingData.createdAt || 'N/A'}</Text>
              </View>
            </View>
            
            {bookingData.confirmedAt && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.timelineDotConfirmed]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Booking Confirmed</Text>
                  <Text style={styles.timelineDate}>{bookingData.confirmedAt}</Text>
                </View>
              </View>
            )}
            
            {bookingData.pickupDate && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.timelineDotPending]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Pickup Scheduled</Text>
                  <Text style={styles.timelineDate}>{bookingData.pickupDate}</Text>
                </View>
              </View>
            )}
            
            {bookingData.dropoffDate && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.timelineDotPending]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Return Scheduled</Text>
                  <Text style={styles.timelineDate}>{bookingData.dropoffDate}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Provider Information */}
        {vehicle.vendorId && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Provider Information</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Icon name="business" size={20} color={Colors.PRIMARY} />
                <Text style={styles.infoLabel}>Provider ID:</Text>
                <Text style={styles.infoValue}>{vehicle.vendorId}</Text>
              </View>
              
              {vehicle.providerName && (
                <View style={styles.infoRow}>
                  <Icon name="person-circle" size={20} color={Colors.PRIMARY} />
                  <Text style={styles.infoLabel}>Provider Name:</Text>
                  <Text style={styles.infoValue}>{vehicle.providerName}</Text>
                </View>
              )}
              
              {vehicle.providerRating && (
                <View style={styles.infoRow}>
                  <Icon name="star" size={20} color={Colors.ORANGE} />
                  <Text style={styles.infoLabel}>Provider Rating:</Text>
                  <Text style={styles.infoValue}>{vehicle.providerRating}/5.0</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        {/* <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.contactButton}>
            <Icon name="call" size={20} color={Colors.WHITE} />
            <Text style={styles.buttonText}>Contact Provider</Text>
          </TouchableOpacity>
          
          {bookingData.status === 'pending' && (
            <TouchableOpacity style={styles.cancelButton}>
              <Icon name="close" size={20} color={Colors.WHITE} />
              <Text style={styles.buttonText}>Cancel Booking</Text>
            </TouchableOpacity>
          )}
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: Metrics.baseMargin,
  },
  statusCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    ...Fonts.style.semiBold,
    fontSize: 18,
    marginLeft: 8,
    color: Colors.BLACK,
  },
  bookingId: {
    ...Fonts.style.regular,
    fontSize: 14,
    color: Colors.PRIMARY_GREY,
  },
  section: {
    marginVertical: 8,
  },
  sectionTitle: {
    ...Fonts.style.semiBold,
    fontSize: 18,
    color: Colors.BLACK,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    ...Fonts.style.medium,
    fontSize: 14,
    color: Colors.PRIMARY_GREY,
    marginLeft: 8,
    minWidth: 80,
  },
  infoValue: {
    ...Fonts.style.regular,
    fontSize: 14,
    color: Colors.BLACK,
    flex: 1,
    marginLeft: 8,
  },
  priceText: {
    ...Fonts.style.semiBold,
    fontSize: 16,
    color: Colors.PRIMARY,
  },
  actionButtons: {
    marginVertical: 20,
    gap: 12,
  },
  contactButton: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.RED,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...Fonts.style.semiBold,
    fontSize: 16,
    color: Colors.WHITE,
    marginLeft: 8,
  },
  // Vehicle Image and Info Styles
  vehicleCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  vehicleImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  vehicleInfo: {
    padding: 16,
  },
  vehicleTitle: {
    ...Fonts.style.semiBold,
    fontSize: 20,
    color: Colors.BLACK,
    marginBottom: 4,
  },
  vehicleSubtitle: {
    ...Fonts.style.regular,
    fontSize: 14,
    color: Colors.PRIMARY_GREY,
  },
  // Features Styles
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.LIGHT_GREEN,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  featureText: {
    ...Fonts.style.medium,
    fontSize: 12,
    color: Colors.GREEN,
    marginLeft: 4,
  },
  // Pricing Styles
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LIGHT_GREY,
  },
  pricingLabel: {
    ...Fonts.style.medium,
    fontSize: 14,
    color: Colors.PRIMARY_GREY,
  },
  pricingValue: {
    ...Fonts.style.regular,
    fontSize: 14,
    color: Colors.BLACK,
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: Colors.PRIMARY,
    borderBottomWidth: 0,
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    ...Fonts.style.semiBold,
    fontSize: 16,
    color: Colors.BLACK,
  },
  totalValue: {
    ...Fonts.style.semiBold,
    fontSize: 18,
    color: Colors.PRIMARY,
  },
  // Timeline Styles
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.PRIMARY_GREY,
    marginRight: 12,
    marginTop: 4,
  },
  timelineDotConfirmed: {
    backgroundColor: Colors.GREEN,
  },
  timelineDotPending: {
    backgroundColor: Colors.ORANGE,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    ...Fonts.style.semiBold,
    fontSize: 14,
    color: Colors.BLACK,
    marginBottom: 2,
  },
  timelineDate: {
    ...Fonts.style.regular,
    fontSize: 12,
    color: Colors.PRIMARY_GREY,
  },
});

export default BookingDetails;