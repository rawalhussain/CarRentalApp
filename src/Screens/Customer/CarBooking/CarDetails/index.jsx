import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './styles';
import MainHeader from '../../../../Components/MainHeader';
import InfoBottomSheet from '../../../../Components/InfoBottomSheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../../Themes/MyColors';
import { Icons } from '../../../../Themes/icons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialDesignIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const CarDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Bottom sheet refs
  const reportBottomSheetRef = useRef(null);
  const cancellationBottomSheetRef = useRef(null);
  const [bottomSheetType, setBottomSheetType] = useState('report');
  
  // Get dynamic data from navigation params
  const { carData, pickupDate, returnDate, where } = route.params || {};
  
  // Use dynamic data or fallback to default values
  const carName = carData?.name || 'Unknown Car';
  const model = carData?.model || 'Unknown Model';
  const rating = carData?.reviews || '4.5';
  const trips = carData?.trips || 0;
  const price = { total: carData?.price || 0 };
  const image = carData?.image || { uri: 'https://via.placeholder.com/400x200.png?text=Car+Image' };
  const variant = carData?.variant || 'Unknown Year';
  const verified = carData?.verified || false;
  
  // Default static data for features and other details
  const cancellationPolicy = 'Free cancellation before pickup time';
  const features = ['AWD', 'AC', 'Heated Seats', 'Bluetooth'];
  const convenience = ['Skip the rental counter', 'Add additional drivers', '30-minute grace period'];
  const peaceOfMind = ['No need to wash', 'Free roadside access', '24/7 customer support'];
  const extras = ['Pet Fee $20/trip', 'Prepaid Refuel $60/trip'];
  const rules = ['No smoking', 'Keep vehicle tidy', 'Refuel vehicle', 'No off-roading'];
  const host = {
    name: 'All-Star Host',
    status: `${rating} ⭐ - ${trips} Trips`,
    badge: verified ? 'Top-rated most experienced host' : 'New Host',
  };
  const carBasics = [`${variant} Year`, '5 Seats', '4 Doors', 'Gas (Regular)', '32 MPG'];
  const reviews = [
    { name: 'User A', rating: 5.0, comment: 'Amazing ride and very clean!' },
    { name: 'User B', rating: 5.0, comment: 'Smooth trip, great host.' },
  ];
  const description = `The ${carName} ${model} is a sleek and stylish vehicle that blends advanced features with performance.`;
  
  // Format dates from navigation params
  const formatDate = (date) => {
    if (!date) return '';
    const parts = date.split(' ');
    return `${parts[0]} ${parts[1]}`;
  };

  const getRefundDate = () => {
    // Get today's date and add 2 days
    const today = new Date();
    const refundDate = new Date(today);
    refundDate.setDate(today.getDate() + 2);
    
    // Format the refund date
    const options = { month: 'long', day: 'numeric' };
    const formattedDate = refundDate.toLocaleDateString('en-US', options);
    return `${formattedDate}, 2:00 PM`;
  };
  
  const tripDates = {
    start: pickupDate ? formatDate(pickupDate) : '14 March',
    end: returnDate ? formatDate(returnDate) : '19 March',
    startTime: pickupDate ? `${formatDate(pickupDate)}, 2:00 PM` : 'Mar 14, 2:00 PM',
    endTime: returnDate ? `${formatDate(returnDate)}, 4:00 PM` : 'Mar 19, 4:00 PM',
  };
  
  const address = where || '123 Main Street, City, State';

  // Bottom sheet handlers
  const handleReportPress = () => {
    setBottomSheetType('report');
    reportBottomSheetRef.current?.snapToIndex(0);
  };

  const handleCancellationPress = () => {
    setBottomSheetType('cancellation');
    cancellationBottomSheetRef.current?.snapToIndex(0);
  };

  const handleBottomSheetClose = () => {
    reportBottomSheetRef.current?.close();
    cancellationBottomSheetRef.current?.close();
  };

  return (
    <SafeAreaView style={styles.container}>
      <MainHeader
       title='Car Details'
       onBackPress={() => navigation.goBack()}
       showOptionsButton={false}
     />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}>
        {/* Car Image */}
        <Image source={image} style={styles.carImage} />

        {/* Car Name and Rating */}
        <View style={styles.carInfoSection}>
          <Text style={styles.carName}>{carName}</Text>
          <Text style={styles.carModel}>{model}</Text>
          <Text style={styles.rating}>⭐ {rating} ({trips} Trips)</Text>
        </View>

        {/* Trip Details */}
        <View style={styles.tripDetailsSection}>
          <View style={styles.tripItem}>
            <Ionicons name="calendar-outline" size={20} color={Colors.BLACK} />
            <View style={styles.tripTextContainer}>
              <Text style={styles.tripLabel}>{tripDates.startTime}</Text>
              <Text style={styles.tripLabel}>{tripDates.endTime}</Text>
            </View>
            {/* <TouchableOpacity><Text style={styles.changeText}>CHANGE</Text></TouchableOpacity> */}
          </View>

          <View style={styles.tripItem}>
            <Ionicons name="location-outline" size={20} color={Colors.BLACK} />
            <View style={styles.tripTextContainer}>
              <Text style={styles.tripLabel}>{address}</Text>
            </View>
            {/* <TouchableOpacity><Text style={styles.changeText}>CHANGE</Text></TouchableOpacity> */}
          </View>

          <View style={styles.tripItem}>
            <Ionicons name="thumbs-up-outline" size={20} color={Colors.BLACK} />
            <View style={styles.tripTextContainer}>
              <Text style={styles.tripLabel}>Free Cancellation</Text>
              <Text style={styles.tripSubLabel}>Full refund before {getRefundDate()}</Text>
            </View>
          </View>

          <View style={styles.tripItem}>
            <Ionicons name="card-outline" size={20} color={Colors.BLACK} />
            <View style={styles.tripTextContainer}>
              <Text style={styles.tripLabel}>$0 due now</Text>
        <Text style={styles.mileageText}>$0.00 charge for each additional mile</Text>
            </View>
          </View>
        </View>

        {/* Insurance Section */}
        <View style={styles.sectionInsurance}>
        <View style={styles.insuranceSection}>
        <Text style={styles.sectionTitleInsurance}>Insurance & Protection</Text>
          <Text style={styles.insuranceText}>Insurance via Travelers</Text>
        </View>
          <TouchableOpacity onPress={() => console.log('Read More')} style={styles.readMoreButton}>
            <Text style={styles.readMoreText}>Read More</Text>
          </TouchableOpacity>
        </View>

        {/* Car Basics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Car Basics</Text>
          <View style={styles.basicsGrid}>
            <View style={styles.basicItem}>
              <Image source={Icons.seats} style={styles.basicIcon} />
              <Text style={styles.basicText}>5 Seats</Text>
            </View>
            <View style={styles.basicItem}>
              <Image source={Icons.door} style={styles.basicIcon} />
              <Text style={styles.basicText}>4 Doors</Text>
            </View>
            <View style={styles.basicItem}>
              <Image source={Icons.pump} style={styles.basicIcon} />
              <Text style={styles.basicText}>Petrol</Text>
            </View>
            <View style={styles.basicItem}>
              <Image source={Icons.meter} style={styles.basicIcon} />
              <Text style={styles.basicText}>32 MPG</Text>
            </View>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>All Wheel Drive</Text>
            </View>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.includedText}>Included in the price</Text>
        </View>

        {/* Convenience */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Convenience</Text>
          <View style={styles.convenienceList}>
            <View style={styles.convenienceItem}>
              <Ionicons name="car-outline" size={20} color={Colors.BLACK} />
              <Text style={styles.convenienceText}>Skip the rental counter</Text>
            </View>
            <View style={styles.convenienceItem}>
              <Ionicons name="person-add-outline" size={20} color={Colors.BLACK} />
              <Text style={styles.convenienceText}>Add additional drivers for free</Text>
            </View>
            <View style={styles.convenienceItem}>
              <Ionicons name="time-outline" size={20} color={Colors.BLACK} />
              <Text style={styles.convenienceText}>30-minute return grace period</Text>
            </View>
          </View>
        </View>

        {/* Peace of Mind */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Peace of mind</Text>
          <View style={styles.peaceList}>
            <View style={styles.peaceItem}>
              <Ionicons name="sparkles-outline" size={20} color={Colors.BLACK} />
              <Text style={styles.peaceText}>No need to wash the car before returning it, but please keep the vehicle tidy.</Text>
            </View>
            <View style={styles.peaceItem}>
              <FontAwesome5 name="road" size={20} color={Colors.BLACK} />
              <Text style={styles.peaceText}>Free access to 24/7 roadside</Text>
            </View>
            <View style={styles.peaceItem}>
              <Ionicons name="headset-outline" size={20} color={Colors.BLACK} />
              <Text style={styles.peaceText}>24/7 customer support</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{description}</Text>
        </View>

        {/* Reviews */}
        <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rating</Text>

          <View style={styles.reviewsHeader}>

            <Text style={styles.sectionTitle}>5.0 ⭐ (21 ratings)</Text>
          </View>
          <Text style={styles.basedOnText}>Based on 19 Guest Rating</Text>
        </View>

        {/* Host Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hosted By</Text>
          <View style={styles.hostContainer}>
            <View style={styles.hostAvatarContainer}>
              <View style={styles.hostAvatar}>
                <Ionicons name="person" size={30} color={Colors.BLACK} />
              </View>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>5.0</Text>
                <Ionicons name="star" size={12} color={Colors.WHITE} />
              </View>
            </View>
            <View style={styles.hostInfo}>
              <Text style={styles.hostName}>Maurice</Text>
              <Text style={styles.hostStatus}>All-Star Host</Text>
              <Text style={styles.hostDetails}>51 trips</Text>
              <Text style={styles.hostDetails}>Joined May 2025</Text>
            </View>
          </View>
          <View style={styles.hostBadge}>
            <Ionicons name="ribbon" size={16} color={Colors.PRIMARY} />
            <Text style={styles.badgeText}>All-Star Hosts like Maurice are the top-rated most experienced hosts on Lowest Transport</Text>
          </View>
        </View>

        {/* Extras */}
        <View style={styles.section}>
          <View style={styles.extrasHeader}>
            <Text style={styles.sectionTitle}>Extras (2)</Text>
            <TouchableOpacity><Text style={styles.moreInfoText}>More Info</Text></TouchableOpacity>
          </View>
          <Text style={styles.extrasDescription}>Add optional Extras to your trip at checkout.</Text>
          
          <View style={styles.extrasList}>
            <View style={styles.extraItem}>
              <View style={styles.extraContent}>
                <Text style={styles.extraTitle}>Pet fee</Text>
                <Text style={styles.extraPrice}>$200/trip</Text>
              </View>
              <Text style={styles.extraAvailability}>1 available</Text>
            </View>
            <View style={styles.extraItem}>
              <View style={styles.extraContent}>
                <Text style={styles.extraTitle}>Prepaid refuel</Text>
                <Text style={styles.extraDescription}>Save Time make drop off a breeze and avoid additional fees by adding this extra which allows you to return my car at my fuel level. Price includes up to a full tank od gas.</Text>
                <Text style={styles.extraPrice}>$60/trip</Text>
              </View>
              <Text style={styles.extraAvailability}>1 available</Text>
            </View>
          </View>
        </View>

        {/* Rules of the Road */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rules of the road</Text>
          <View style={styles.rulesList}>
            <View style={styles.ruleItem}>
              <MaterialDesignIcons name="smoking-off" size={20} color={Colors.BLACK} />
              <Text style={styles.ruleText}>No smoking allowed</Text>
            </View>
            <View style={styles.ruleItem}>
              <Ionicons name="sparkles-outline" size={20} color={Colors.BLACK} />
              <Text style={styles.ruleText}>Keep the vehicle tidy</Text>
            </View>
            <View style={styles.ruleItem}>
              <Ionicons name="flash-outline" size={20} color={Colors.BLACK} />
              <Text style={styles.ruleText}>Refuel the vehicle</Text>
            </View>
            <View style={styles.ruleItem}>
              <FontAwesome5 name="road" size={20} color={Colors.BLACK} />
              <Text style={styles.ruleText}>No off-roading</Text>
            </View>
          </View>
        </View>

        {/* Bottom Buttons */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity style={styles.bottomButton} onPress={handleReportPress}>
            <Text style={styles.bottomButtonText}>Report listing</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomButton} onPress={handleCancellationPress}>
            <Text style={styles.bottomButtonText}>Cancellation policy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Fixed Bottom Price Section */}
      <View style={styles.fixedPriceSection}>
        <View style={styles.priceContainer}>
          <Text style={styles.totalPrice}>${price.total} Total</Text>
          <Text style={styles.priceSubtext}>Price before taxes</Text>
          <View style={styles.dueNowButton}>
            <Text style={styles.dueNowText}>$0 due now</Text>
          </View>
        </View>
        <View style={styles.priceButtonsContainer}>
         
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => navigation.navigate('Verification')}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Sheets */}
      <InfoBottomSheet
        bottomSheetRef={reportBottomSheetRef}
        type="report"
        onClose={handleBottomSheetClose}
      />
      <InfoBottomSheet
        bottomSheetRef={cancellationBottomSheetRef}
        type="cancellation"
        onClose={handleBottomSheetClose}
      />
    </SafeAreaView>

  );
};

export default CarDetailsScreen;
