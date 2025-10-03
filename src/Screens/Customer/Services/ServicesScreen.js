import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../../Themes/MyColors';
import BottomNavigationBar from '../../../Components/BottomNavigationBar';

export default function ServicesScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Services');
  const [selectedCard, setSelectedCard] = useState(null);

  // Reset selected card when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setSelectedCard(null);
    });
    return unsubscribe;
  }, [navigation]);

  const handleTabPress = (tabId) => {
    setActiveTab(tabId);
    // Handle navigation based on tab
    switch (tabId) {
      case 'Home':
        navigation.navigate('CustomerTabs');
        break;
      case 'Services':
        // Already on Services screen
        break;
      case 'Activity':
        navigation.navigate('CustomerTabs', { screen: 'Bookings' });
        break;
      case 'Account':
        navigation.navigate('Profile');
        break;
      default:
        break;
    }
  };

  const handleServicePress = (serviceType) => {
    setSelectedCard(serviceType);
    // Small delay to show selection before navigation
    setTimeout(() => {
      if (serviceType === 'Ride') {
        navigation.navigate('ReserveRide');
      } else if (serviceType === 'Reserve') {
        navigation.navigate('ReserveRide');
      }
    }, 150);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeAreaTop} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.WHITE} />
        
        {/* Header with Back Button and Logo */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.WHITE} />
          </TouchableOpacity>
          <Text style={styles.logoText}>LOGO</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={Colors.PRIMARY_GREY} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Where to?"
              placeholderTextColor={Colors.PRIMARY_GREY}
            />
            <TouchableOpacity style={styles.laterButton}>
              <Ionicons name="time" size={16} color={Colors.WHITE} />
              <Text style={styles.laterText}>Later</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Destinations */}
        <View style={styles.destinationsSection}>
          <View style={styles.destinationItem}>
            <View style={styles.destinationIcon}>
              <Ionicons name="time" size={16} color={Colors.WHITE} />
            </View>
            <View style={styles.destinationText}>
              <Text style={styles.destinationTitle}>Select Citywalk Mall</Text>
              <Text style={styles.destinationAddress}>Saket Disctrict Center, District Center, Sector 6, Pushp Vihar, New Delhi, Delhi 110017</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.destinationItem}>
            <View style={styles.destinationIcon}>
              <Ionicons name="time" size={16} color={Colors.WHITE} />
            </View>
            <View style={styles.destinationText}>
              <Text style={styles.destinationTitle}>5, Kullar Farms Rd</Text>
              <Text style={styles.destinationAddress}>New Manglapuri, Manglapuri Village, Sultanpur, New Delhi, Delhi</Text>
            </View>
          </View>
        </View>

        {/* Two Lines Above Suggestions */}
        <View style={styles.twoLinesContainer}>
          <View style={styles.line} />
          <View style={styles.gapLine} />
          <View style={styles.line} />
        </View>

        {/* Suggestions Section */}
        <View style={styles.suggestionsSection}>
          <View style={styles.suggestionsHeader}>
            <Text style={styles.suggestionsTitle}>Suggestions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          
          {/* Service Cards */}
          <View style={styles.cardsContainer}>
            {/* Ride Card */}
            <TouchableOpacity
              style={[
                styles.serviceCard,
                selectedCard === 'Ride' && styles.selectedCard
              ]}
              onPress={() => handleServicePress('Ride')}
              activeOpacity={0.8}
            >
              <View style={styles.cardIcon}>
                <Ionicons name="car" size={40} color={selectedCard === 'Ride' ? Colors.WHITE : Colors.BLACK} />
              </View>
              <Text style={[styles.cardText, selectedCard === 'Ride' && styles.selectedCardText]}>Ride</Text>
            </TouchableOpacity>

            {/* Reserve Card */}
            <TouchableOpacity
              style={[
                styles.serviceCard,
                selectedCard === 'Reserve' && styles.selectedCard
              ]}
              onPress={() => handleServicePress('Reserve')}
              activeOpacity={0.8}
            >
              <View style={styles.cardIcon}>
                <Ionicons name="calendar" size={40} color={selectedCard === 'Reserve' ? Colors.WHITE : Colors.BLACK} />
              </View>
              <Text style={[styles.cardText, selectedCard === 'Reserve' && styles.selectedCardText]}>Reserve</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Full Width Divider */}
        <View style={styles.fullWidthDivider} />

          {/* Promotional Banner */}
          <View style={styles.bannerContainer}>
            <View style={styles.banner}>
              <View style={styles.bannerLeft}>
                <Text style={styles.bannerText}>Welcome to</Text>
                <Text style={styles.bannerText}>Lowest Transport</Text>
              </View>
              <View style={styles.bannerRight}>
                <Ionicons name="car-sport" size={70} color={Colors.WHITE} />
              </View>
            </View>
          </View>
      </SafeAreaView>

      {/* Bottom Navigation */}
      <SafeAreaView style={styles.safeAreaBottom} edges={['bottom']}>
        <BottomNavigationBar
          activeTab={activeTab}
          onTabPress={handleTabPress}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  safeAreaTop: {
    flex: 1,
  },
  safeAreaBottom: {
    backgroundColor: Colors.WHITE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.WHITE,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 25,
    fontWeight: '500',
    color: Colors.BLACK,
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEEEEE',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: Colors.BLACK,
  },
  laterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY_GREY,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 10,
  },
  laterText: {
    color: Colors.WHITE,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  scrollContent: {
    flex: 1,
  },
  destinationsSection: {
    paddingHorizontal: 20,
  },
  destinationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  destinationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.SECONDARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  destinationText: {
    flex: 1,
  },
  destinationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.BLACK,
    marginBottom: 4,
  },
  destinationAddress: {
    fontSize: 14,
    color: Colors.PRIMARY_GREY,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginLeft: 47,
    marginRight: 20,
  },
  suggestionsSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.BLACK,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.BLACK,
    fontWeight: '500',
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  serviceCard: {
    backgroundColor: '#EEEEEE',
    borderRadius: 8,
    padding: 20,
    height: 100,
    width: '48%',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardIcon: {
    position: 'absolute',

    right: 15,
  },
  cardText: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    fontSize: 20,
    fontWeight: '500',
    color: Colors.BLACK,
  },
  selectedCard: {
    backgroundColor: Colors.PRIMARY,
    borderWidth: 2,
    borderColor: Colors.PRIMARY,
  },
  selectedCardText: {
    color: Colors.WHITE,
  },
  fullWidthDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    width: '100%',
    marginVertical: 10,
  },
  twoLinesContainer: {
    paddingVertical: 13,
  },
  line: {
    height: 1,
    backgroundColor: '#E0E0E0',
    width: '100%',
  },
  gapLine: {
    height: 8,
    backgroundColor: '#EEEEEE',
    width: '100%',
  },
  bannerContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.SECONDARY,
    borderRadius: 15,
    padding: 20,
    height: 120,
    overflow: 'hidden',
  },
  bannerLeft: {
    flex: 1,
  },
  bannerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.WHITE,
    lineHeight: 24,
  },
  bannerRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
