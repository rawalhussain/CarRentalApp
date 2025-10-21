import React, {useLayoutEffect} from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import styles from './styles';
import { Colors } from '../../../../Themes/MyColors';
import SuccessImage from '../../../../../assets/success.png';
import { SafeAreaView } from 'react-native-safe-area-context';
import MainHeader from '../../../../Components/MainHeader';

const BookingSummary = ({ navigation, route }) => {

  const { bookingId, contactDetails, selectedBus, searchPreferences, paymentDetails, transactionDetails } = route.params || {};
  const bus = selectedBus || (route.params?.booking?.bus) || {};
  const contact = contactDetails || (route.params?.booking?.contactDetails) || {};
  const prefs = searchPreferences || (route.params?.booking?.searchPreferences) || {};
  const payment = paymentDetails || {};
  const transaction = transactionDetails || {};

  return (
    <SafeAreaView style={[styles.container, {padding: 0}]}>
      <MainHeader title="Payment States" onBackPress={() => navigation.goBack()} showOptionsButton={true} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Success Icon & Message */}
        <View style={{ alignItems: 'center', marginTop: 24, marginBottom: 16 }}>
          <View style={{ backgroundColor: '#E6F9ED', borderRadius: 60, padding: 24, marginBottom: 12 }}>
            <Image source={SuccessImage} style={{ width: 80, height: 80, resizeMode: 'contain' }} />
          </View>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: Colors.BLACK, marginBottom: 4 }}>Payment successful</Text>
          <Text style={{ fontSize: 15, color: Colors.PRIMARY_GREY, textAlign: 'center' }}>
            Your bus rent Booking has been successfully
          </Text>
        </View>
        {/* Booking Information Card */}
        <View style={{ backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#eee', padding: 16, marginBottom: 24 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 10 }}>Booking information</Text>
          <View style={{ borderBottomWidth: 1, borderBottomColor: '#eee', marginBottom: 10 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: Colors.PRIMARY_GREY }}>Car Model</Text>
            <Text style={{ color: Colors.BLACK }}>{bus.make || 'Name of car'}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: Colors.PRIMARY_GREY }}>Rental Date</Text>
            <Text style={{ color: Colors.BLACK }}>{prefs.pickupDate || '19Jan24'} - {prefs.dropoffDate || '22Jan 24'}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: Colors.PRIMARY_GREY }}>Name</Text>
            <Text style={{ color: Colors.BLACK }}>{contact.firstName || 'Benjamin'} {contact.lastName || 'Jack'}</Text>
          </View>
        </View>
        {/* Transaction Details */}
        <Text style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 10 }}>Transaction detail</Text>
        <View style={{ marginBottom: 18 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: Colors.PRIMARY_GREY }}>Transaction ID</Text>
            <Text style={{ color: Colors.BLACK }}>{transaction.id || '#T000123B0J1'}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: Colors.PRIMARY_GREY }}>Transaction Date</Text>
            <Text style={{ color: Colors.BLACK }}>{transaction.date || '01Jan2024 - 10:30 am'}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <Text style={{ color: Colors.PRIMARY_GREY }}>Payment Method</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialIcons name="credit-card" size={18} color="#FF6B6B" style={{ marginRight: 4 }} />
              <Text style={{ color: Colors.BLACK }}>
                {payment.cardNumber ? `${payment.cardNumber.slice(-4).padStart(15, '*').replace(/(.{3})/g, '$1 ')}` : '123 *** *** ***225'}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: Colors.PRIMARY_GREY }}>Amount</Text>
            <Text style={{ color: Colors.BLACK }}>${transaction.amount || 1400}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: Colors.PRIMARY_GREY }}>Service fee</Text>
            <Text style={{ color: Colors.BLACK }}>${transaction.serviceFee || 15}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: Colors.PRIMARY_GREY }}>Tax</Text>
            <Text style={{ color: Colors.BLACK }}>${transaction.tax || 0}</Text>
          </View>
          <View style={{ borderBottomWidth: 1, borderBottomColor: '#eee', marginVertical: 10 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: 'bold', color: Colors.BLACK }}>Total amount</Text>
            <Text style={{ fontWeight: 'bold', color: Colors.BLACK }}>${transaction.total || 1415}</Text>
          </View>
        </View>
        {/* Buttons */}
        <TouchableOpacity style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 30, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginBottom: 12 }}>
          <Ionicons name="download-outline" size={20} color={Colors.PRIMARY_GREY} style={{ marginRight: 6 }} />
          <Text style={{ color: Colors.PRIMARY_GREY, fontWeight: '600' }}>Download Receipt</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 30, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginBottom: 18 }}>
          <Ionicons name="share-social-outline" size={20} color={Colors.PRIMARY_GREY} style={{ marginRight: 6 }} />
          <Text style={{ color: Colors.PRIMARY_GREY, fontWeight: '600' }}>Shar Your Receipt</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ backgroundColor: Colors.PRIMARY, borderRadius: 30, paddingVertical: 16, alignItems: 'center', marginBottom: 24 }}
          onPress={() => navigation.navigate('CustomerTabs')}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Continue Renting</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BookingSummary;
