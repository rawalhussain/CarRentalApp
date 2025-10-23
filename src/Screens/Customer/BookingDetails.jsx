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
  
  // Determine booking type
  const isPackageBooking = bookingData.bookingType === 'ride' || bookingData.bookingType === 'ride_package';
  const isCarBooking = bookingData.bookingType === 'car' || !isPackageBooking;

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

        {/* Vehicle/Package Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isPackageBooking ? 'Package Information' : 'Vehicle Information'}
          </Text>
          <View style={styles.vehicleCard}>
            {isPackageBooking ? (
              // Package booking information
              <>
                {bookingData.packageImage && (
                  <Image source={{ uri: bookingData.packageImage }} style={styles.vehicleImage} />
                )}
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleTitle}>
                    {bookingData.packageName || 'Ride Package'}
                  </Text>
                  <Text style={styles.vehicleSubtitle}>
                    Package Booking • {bookingData.duration || 'N/A'} days
                  </Text>
                  {bookingData.passengers && (
                    <Text style={styles.vehicleSubtitle}>
                      {bookingData.passengers} passengers
                    </Text>
                  )}
                </View>
              </>
            ) : (
              // Car booking information
              <>
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
              </>
            )}
          </View>
        </View>

        {/* Detailed Specifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isPackageBooking ? 'Package Details' : 'Vehicle Specifications'}
          </Text>
          <View style={styles.infoCard}>
            <View style={styles.specsGrid}>
              {isPackageBooking ? (
                // Package booking specifications
                <>
                  {bookingData.duration && (
                    <View style={styles.specItem}>
                      <Icon name="time" size={20} color={Colors.PRIMARY} />
                      <Text style={styles.specLabel}>Duration</Text>
                      <Text style={styles.specValue}>{bookingData.duration} days</Text>
                    </View>
                  )}
                  
                  {bookingData.passengers && (
                    <View style={styles.specItem}>
                      <Icon name="people" size={20} color={Colors.PRIMARY} />
                      <Text style={styles.specLabel}>Passengers</Text>
                      <Text style={styles.specValue}>{bookingData.passengers}</Text>
                    </View>
                  )}
                  
                  {bookingData.destination && (
                    <View style={styles.specItem}>
                      <Icon name="location" size={20} color={Colors.PRIMARY} />
                      <Text style={styles.specLabel}>Destination</Text>
                      <Text style={styles.specValue}>{bookingData.destination}</Text>
                    </View>
                  )}

                  {bookingData.pickupLocation && (
                    <View style={styles.specItem}>
                      <Icon name="location-outline" size={20} color={Colors.PRIMARY} />
                      <Text style={styles.specLabel}>Pickup</Text>
                      <Text style={styles.specValue}>{bookingData.pickupLocation}</Text>
                    </View>
                  )}

                  {bookingData.packageType && (
                    <View style={styles.specItem}>
                      <Icon name="star" size={20} color={Colors.PRIMARY} />
                      <Text style={styles.specLabel}>Package Type</Text>
                      <Text style={styles.specValue}>{bookingData.packageType}</Text>
                    </View>
                  )}

                  {bookingData.inclusions && (
                    <View style={styles.specItem}>
                      <Icon name="checkmark-circle" size={20} color={Colors.PRIMARY} />
                      <Text style={styles.specLabel}>Inclusions</Text>
                      <Text style={styles.specValue}>{bookingData.inclusions}</Text>
                    </View>
                  )}
                </>
              ) : (
                // Car booking specifications
                <>
                  {vehicle.year && (
                    <View style={styles.specItem}>
                      <Icon name="calendar" size={20} color={Colors.PRIMARY} />
                      <Text style={styles.specLabel}>Model Year</Text>
                      <Text style={styles.specValue}>{vehicle.year}</Text>
                    </View>
                  )}
                  
                  {vehicle.color && (
                    <View style={styles.specItem}>
                      <Icon name="color-palette" size={20} color={Colors.PRIMARY} />
                      <Text style={styles.specLabel}>Color</Text>
                      <Text style={styles.specValue}>{vehicle.color}</Text>
                    </View>
                  )}
                  
                  {vehicle.seats && (
                    <View style={styles.specItem}>
                      <Icon name="people" size={20} color={Colors.PRIMARY} />
                      <Text style={styles.specLabel}>Seating</Text>
                      <Text style={styles.specValue}>{vehicle.seats} passengers</Text>
                    </View>
                  )}

                  {vehicle.fuelType && (
                    <View style={styles.specItem}>
                      <Icon name="car-sport" size={20} color={Colors.PRIMARY} />
                      <Text style={styles.specLabel}>Fuel Type</Text>
                      <Text style={styles.specValue}>{vehicle.fuelType}</Text>
                    </View>
                  )}

                  {vehicle.transmission && (
                    <View style={styles.specItem}>
                      <Icon name="settings" size={20} color={Colors.PRIMARY} />
                      <Text style={styles.specLabel}>Transmission</Text>
                      <Text style={styles.specValue}>{vehicle.transmission}</Text>
                    </View>
                  )}

                  {vehicle.mileage && (
                    <View style={styles.specItem}>
                      <Icon name="speedometer" size={20} color={Colors.PRIMARY} />
                      <Text style={styles.specLabel}>Mileage</Text>
                      <Text style={styles.specValue}>{vehicle.mileage} km/l</Text>
                    </View>
                  )}

                  {vehicle.engine && (
                    <View style={styles.specItem}>
                      <Icon name="construct" size={20} color={Colors.PRIMARY} />
                      <Text style={styles.specLabel}>Engine</Text>
                      <Text style={styles.specValue}>{vehicle.engine}</Text>
                    </View>
                  )}

                  {vehicle.licensePlate && (
                    <View style={styles.specItem}>
                      <Icon name="card" size={20} color={Colors.PRIMARY} />
                      <Text style={styles.specLabel}>License Plate</Text>
                      <Text style={styles.specValue}>{vehicle.licensePlate}</Text>
                    </View>
                  )}

                  {vehicle.vin && (
                    <View style={styles.specItem}>
                      <Icon name="shield-checkmark" size={20} color={Colors.PRIMARY} />
                      <Text style={styles.specLabel}>VIN</Text>
                      <Text style={styles.specValue}>{vehicle.vin}</Text>
                    </View>
                  )}
                </>
              )}
            </View>
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
          <Text style={styles.sectionTitle}>
            {isPackageBooking ? 'Trip Period' : 'Booking Period'}
          </Text>
          <View style={styles.infoCard}>
            <View style={styles.dateContainer}>
              {isPackageBooking ? (
                // Package booking dates
                <>
                  <View style={styles.dateItem}>
                    <Icon name="calendar-outline" size={24} color={Colors.PRIMARY} />
                    <View style={styles.dateInfo}>
                      <Text style={styles.dateLabel}>Start Date</Text>
                      <Text style={styles.dateValue}>{bookingData.startDate || 'Not specified'}</Text>
                      {bookingData.startTime && (
                        <Text style={styles.timeValue}>{bookingData.startTime}</Text>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.dateItem}>
                    <Icon name="calendar-outline" size={24} color={Colors.PRIMARY} />
                    <View style={styles.dateInfo}>
                      <Text style={styles.dateLabel}>End Date</Text>
                      <Text style={styles.dateValue}>{bookingData.endDate || 'Not specified'}</Text>
                      {bookingData.endTime && (
                        <Text style={styles.timeValue}>{bookingData.endTime}</Text>
                      )}
                    </View>
                  </View>
                </>
              ) : (
                // Car booking dates
                <>
                  <View style={styles.dateItem}>
                    <Icon name="calendar-outline" size={24} color={Colors.PRIMARY} />
                    <View style={styles.dateInfo}>
                      <Text style={styles.dateLabel}>Pickup Date</Text>
                      <Text style={styles.dateValue}>{searchPreferences.pickupDate || 'Not specified'}</Text>
                      {searchPreferences.pickupTime && (
                        <Text style={styles.timeValue}>{searchPreferences.pickupTime}</Text>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.dateItem}>
                    <Icon name="calendar-outline" size={24} color={Colors.PRIMARY} />
                    <View style={styles.dateInfo}>
                      <Text style={styles.dateLabel}>Return Date</Text>
                      <Text style={styles.dateValue}>{searchPreferences.dropoffDate || 'Not specified'}</Text>
                      {searchPreferences.dropoffTime && (
                        <Text style={styles.timeValue}>{searchPreferences.dropoffTime}</Text>
                      )}
                    </View>
                  </View>
                </>
              )}
            </View>
            
            {/* Duration Calculation */}
            {isPackageBooking ? (
              bookingData.duration && (
                <View style={styles.durationContainer}>
                  <Icon name="time" size={20} color={Colors.PRIMARY} />
                  <Text style={styles.durationLabel}>Trip Duration:</Text>
                  <Text style={styles.durationValue}>{bookingData.duration} days</Text>
                </View>
              )
            ) : (
              searchPreferences.pickupDate && searchPreferences.dropoffDate && (
                <View style={styles.durationContainer}>
                  <Icon name="time" size={20} color={Colors.PRIMARY} />
                  <Text style={styles.durationLabel}>Total Duration:</Text>
                  <Text style={styles.durationValue}>
                    {Math.ceil((new Date(searchPreferences.dropoffDate) - new Date(searchPreferences.pickupDate)) / (1000 * 60 * 60 * 24))} days
                  </Text>
                </View>
              )
            )}
          </View>
        </View>

        {/* Location Information */}
        {((isPackageBooking && (bookingData.pickupLocation || bookingData.destination)) || 
          (!isPackageBooking && (searchPreferences.pickupLocation || searchPreferences.dropoffLocation))) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location Details</Text>
            <View style={styles.infoCard}>
              {isPackageBooking ? (
                // Package booking locations
                <>
                  {bookingData.pickupLocation && (
                    <View style={styles.infoRow}>
                      <Icon name="location" size={20} color={Colors.PRIMARY} />
                      <Text style={styles.infoLabel}>Pickup:</Text>
                      <Text style={styles.infoValue}>{bookingData.pickupLocation}</Text>
                    </View>
                  )}
                  
                  {bookingData.destination && (
                    <View style={styles.infoRow}>
                      <Icon name="location" size={20} color={Colors.PRIMARY} />
                      <Text style={styles.infoLabel}>Destination:</Text>
                      <Text style={styles.infoValue}>{bookingData.destination}</Text>
                    </View>
                  )}
                </>
              ) : (
                // Car booking locations
                <>
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
                </>
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
            <View style={styles.pricingContainer}>
              {isPackageBooking ? (
                // Package booking pricing
                <>
                  {bookingData.packagePrice && (
                    <View style={styles.pricingRow}>
                      <Text style={styles.pricingLabel}>Package Price</Text>
                      <Text style={styles.pricingValue}>${bookingData.packagePrice}</Text>
                    </View>
                  )}
                  
                  {bookingData.duration && (
                    <View style={styles.pricingRow}>
                      <Text style={styles.pricingLabel}>Duration</Text>
                      <Text style={styles.pricingValue}>{bookingData.duration} days</Text>
                    </View>
                  )}
                  
                  {bookingData.passengers && (
                    <View style={styles.pricingRow}>
                      <Text style={styles.pricingLabel}>Passengers</Text>
                      <Text style={styles.pricingValue}>{bookingData.passengers}</Text>
                    </View>
                  )}
                  
                  {bookingData.tax && (
                    <View style={styles.pricingRow}>
                      <Text style={styles.pricingLabel}>Tax</Text>
                      <Text style={styles.pricingValue}>${bookingData.tax}</Text>
                    </View>
                  )}
                  
                  {bookingData.serviceFee && (
                    <View style={styles.pricingRow}>
                      <Text style={styles.pricingLabel}>Service Fee</Text>
                      <Text style={styles.pricingValue}>${bookingData.serviceFee}</Text>
                    </View>
                  )}
                  
                  {bookingData.additionalFees && (
                    <View style={styles.pricingRow}>
                      <Text style={styles.pricingLabel}>Additional Fees</Text>
                      <Text style={styles.pricingValue}>${bookingData.additionalFees}</Text>
                    </View>
                  )}
                </>
              ) : (
                // Car booking pricing
                <>
                  {bookingData.basePrice && (
                    <View style={styles.pricingRow}>
                      <Text style={styles.pricingLabel}>Base Price</Text>
                      <Text style={styles.pricingValue}>${bookingData.basePrice}</Text>
                    </View>
                  )}
                  
                  {bookingData.dailyRate && (
                    <View style={styles.pricingRow}>
                      <Text style={styles.pricingLabel}>Daily Rate</Text>
                      <Text style={styles.pricingValue}>${bookingData.dailyRate}/day</Text>
                    </View>
                  )}
                  
                  {bookingData.duration && (
                    <View style={styles.pricingRow}>
                      <Text style={styles.pricingLabel}>Duration</Text>
                      <Text style={styles.pricingValue}>{bookingData.duration} days</Text>
                    </View>
                  )}
                  
                  {bookingData.tax && (
                    <View style={styles.pricingRow}>
                      <Text style={styles.pricingLabel}>Tax (10%)</Text>
                      <Text style={styles.pricingValue}>${bookingData.tax}</Text>
                    </View>
                  )}
                  
                  {bookingData.insurance && (
                    <View style={styles.pricingRow}>
                      <Text style={styles.pricingLabel}>Insurance</Text>
                      <Text style={styles.pricingValue}>${bookingData.insurance}</Text>
                    </View>
                  )}
                  
                  {bookingData.additionalFees && (
                    <View style={styles.pricingRow}>
                      <Text style={styles.pricingLabel}>Additional Fees</Text>
                      <Text style={styles.pricingValue}>${bookingData.additionalFees}</Text>
                    </View>
                  )}
                  
                  {bookingData.deposit && (
                    <View style={styles.pricingRow}>
                      <Text style={styles.pricingLabel}>Security Deposit</Text>
                      <Text style={styles.pricingValue}>${bookingData.deposit}</Text>
                    </View>
                  )}
                </>
              )}
              
              <View style={styles.pricingDivider} />
              
              <View style={[styles.pricingRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalValue}>
                  ${bookingData.totalAmount || bookingData.amount || bookingData.totalPrice || bookingData.basePrice || '0'}
                </Text>
              </View>
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
        <View style={styles.actionButtons}>
          {isPackageBooking ? (
            // Package booking actions
            <>
              <TouchableOpacity style={styles.contactButton}>
                <Icon name="call" size={20} color={Colors.WHITE} />
                <Text style={styles.buttonText}>Contact Support</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.messageButton}>
                <Icon name="chatbubble" size={20} color={Colors.PRIMARY} />
                <Text style={styles.messageButtonText}>Send Message</Text>
              </TouchableOpacity>
              
              {bookingData.status === 'pending' && (
                <TouchableOpacity style={styles.cancelButton}>
                  <Icon name="close" size={20} color={Colors.WHITE} />
                  <Text style={styles.buttonText}>Cancel Trip</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            // Car booking actions
            <>
              <TouchableOpacity style={styles.contactButton}>
                <Icon name="call" size={20} color={Colors.WHITE} />
                <Text style={styles.buttonText}>Contact Provider</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.messageButton}>
                <Icon name="chatbubble" size={20} color={Colors.PRIMARY} />
                <Text style={styles.messageButtonText}>Send Message</Text>
              </TouchableOpacity>
              
              {bookingData.status === 'pending' && (
                <TouchableOpacity style={styles.cancelButton}>
                  <Icon name="close" size={20} color={Colors.WHITE} />
                  <Text style={styles.buttonText}>Cancel Booking</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
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
    paddingHorizontal: 20,
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
  messageButton: {
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
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
  messageButtonText: {
    ...Fonts.style.semiBold,
    fontSize: 16,
    color: Colors.PRIMARY,
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
  // Vehicle Specifications Grid
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  specItem: {
    width: '48%',
    backgroundColor: Colors.BACKGROUND_GREY,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  specLabel: {
    ...Fonts.style.medium,
    fontSize: 12,
    color: Colors.PRIMARY_GREY,
    marginTop: 4,
    textAlign: 'center',
  },
  specValue: {
    ...Fonts.style.semiBold,
    fontSize: 14,
    color: Colors.BLACK,
    marginTop: 2,
    textAlign: 'center',
  },
  // Date Container Styles
  dateContainer: {
    marginBottom: 16,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.BACKGROUND_GREY,
    borderRadius: 8,
  },
  dateInfo: {
    marginLeft: 12,
    flex: 1,
  },
  dateLabel: {
    ...Fonts.style.medium,
    fontSize: 12,
    color: Colors.PRIMARY_GREY,
    marginBottom: 2,
  },
  dateValue: {
    ...Fonts.style.semiBold,
    fontSize: 16,
    color: Colors.BLACK,
  },
  timeValue: {
    ...Fonts.style.regular,
    fontSize: 14,
    color: Colors.PRIMARY_GREY,
    marginTop: 2,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: Colors.PRIMARY + '10',
    borderRadius: 8,
    marginTop: 8,
  },
  durationLabel: {
    ...Fonts.style.medium,
    fontSize: 14,
    color: Colors.PRIMARY,
    marginLeft: 8,
  },
  durationValue: {
    ...Fonts.style.semiBold,
    fontSize: 16,
    color: Colors.PRIMARY,
    marginLeft: 4,
  },
  // Pricing Styles
  pricingContainer: {
    paddingVertical: 8,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LINE_GRAY,
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
  pricingDivider: {
    height: 1,
    backgroundColor: Colors.PRIMARY,
    marginVertical: 8,
  },
  totalRow: {
    borderBottomWidth: 0,
    marginTop: 8,
    paddingTop: 12,
    backgroundColor: Colors.PRIMARY + '05',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  totalLabel: {
    ...Fonts.style.semiBold,
    fontSize: 16,
    color: Colors.BLACK,
  },
  totalValue: {
    ...Fonts.style.semiBold,
    fontSize: 20,
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