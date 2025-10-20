import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  TextInput,
  Image,
  AsyncStorage,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../../Themes/MyColors';
import BottomNavigationBar from '../../../Components/BottomNavigationBar';
import DestinationItem from '../../../Components/DestinationItem';
import { Icons } from '../../../Themes/icons';

export default function ServicesScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Services');
  const [selectedCard, setSelectedCard] = useState(null);
  const [destinations, setDestinations] = useState([]);

  // Load destinations and reset selected card when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setSelectedCard(null);
      loadDestinations();
    });
    return unsubscribe;
  }, [navigation]);

  // Load destinations on component mount
  useEffect(() => {
    loadDestinations();
  }, []);

  const loadDestinations = async () => {
    try {
      const saved = await AsyncStorage.getItem('savedDestinations');
      if (saved) {
        const parsedDestinations = JSON.parse(saved);
        // Get the most recent destination (first in the array as it's added at the beginning)
        const lastDestination = parsedDestinations[0];
        if (lastDestination) {
          setDestinations([lastDestination]);
        } else {
          // No saved destinations, show empty array
          setDestinations([]);
        }
      } else {
        // No saved destinations, show empty array
        setDestinations([]);
      }
    } catch (error) {
      console.log('Error loading destinations:', error);
      // On error, show empty array
      setDestinations([]);
    }
  };

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
        navigation.navigate('ReserveRide', { serviceType: 'Ride' });
      } else if (serviceType === 'Reserve') {
        navigation.navigate('ReserveRide', { serviceType: 'Reserve' });
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
          <View style={styles.placeholder} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TouchableOpacity 
            style={styles.searchBar}
            onPress={() => handleServicePress('Ride')}
            activeOpacity={0.6}
          >
            <Ionicons name="search" size={20} color={Colors.BLACK} />
            <TextInput
              style={styles.searchInput}
              placeholder="Where to?"
              placeholderTextColor={Colors.placeholder}
              keyboardType="default"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              autoFocus={false}
              autoCompleteType="off"
              autoCompleteSuggestionsType="off"
              editable={false}
              pointerEvents="none"
            />
            <TouchableOpacity style={styles.laterButton} activeOpacity={0.6}>
              <Ionicons name="time" size={20} color={Colors.BLACK} />
              <Text style={styles.laterText}>Later</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Recent Destinations */}
        <View style={styles.destinationsSection}>
          {destinations.map((destination, index) => (
            <React.Fragment key={destination.id || index}>
              <DestinationItem
                title={destination.name || destination.title}
                address={destination.address}
                icon={destination.icon || 'time'}
                onPress={() => {
                  // Handle destination selection
                  console.log('Selected destination:', destination.name || destination.title);
                }}
              />
              {index < destinations.length - 1 && (
                <View style={styles.divider} />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Two Lines Above Suggestions */}
        {/* <View style={styles.twoLinesContainer}>
          <View style={styles.line} />
          <View style={styles.gapLine} />
          <View style={styles.line} />
        </View> */}

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
            <TouchableOpacity
              style={[
                styles.serviceCard,
              ]}
              onPress={() => handleServicePress('Ride')}
              activeOpacity={0.6}
            >
              <View style={styles.cardIcon}>
                <Image source={Icons.car} style={styles.cardIconImage} />
              </View>
              <Text style={styles.cardText }>Ride</Text>
            </TouchableOpacity>

            {/* Reserve Card */}
            <TouchableOpacity
              style={[
                styles.serviceCard,
              ]}
              onPress={() => handleServicePress('Reserve')}
              activeOpacity={0.6}
            >
              <View style={styles.cardIcon}>
              <Image source={Icons.calendar} style={styles.calendarIconImage} />
              </View>
              <Text style={styles.cardText}>Reserve</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Full Width Divider */}
        {/* <View style={styles.fullWidthDivider} /> */}

          {/* Promotional Banner */}
          <View style={styles.bannerContainer}>
            <View style={styles.banner}>
              <View style={styles.bannerLeft}>
                <Text style={styles.bannerTextFirst}>Welcome to Lowest</Text>
                <Text style={styles.bannerTextSecond}>Transport</Text>
              </View>
              <View style={styles.bannerRight}>
                {/* Circular background elements */}
                <View style={styles.circleContainer}>
                  <View style={styles.outerCircle} />
                  <View style={styles.innerCircle} />
                  <View style={styles.centerCircle} />
                </View>
                <Image source={Icons.car2} style={styles.bannerIconImage} />
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
    backgroundColor: Colors.BACKGROUND_GREY,
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
    paddingHorizontal: 16,
    // paddingVertical: 15,
    paddingTop: 16,
    backgroundColor: Colors.WHITE,
  },
  backButton: {
    width: 41,
    height: 41,
    borderRadius: 20,
    backgroundColor: Colors.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 25,
    fontWeight: '400',
    color: Colors.BLACK,
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 15,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor: Colors.WHITE,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    borderRadius: 26,
    paddingHorizontal: 15,
    height: 56,
    paddingVertical: 8,
    maxHeight:56,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.BLACK,
    textAlign: 'left',
    justifyContent:'center',
    alignItems:'center',
  },
  laterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: Colors.WHITE,
    borderRadius: 47,
    height: 41,
    width: 101,
    marginLeft: 10,
    maxHeight: 41,
    maxWidth: 101,
  },
  laterText: {
    color: Colors.BLACK,
    fontSize: 18,
    fontWeight: '400',
    marginLeft: 4,
  },
  scrollContent: {
    flex: 1,
  },
  destinationsSection: {
    paddingHorizontal: 0,
    backgroundColor: Colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dividerGray,
    // backgroundColor: 'red',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dividerGray,
    // marginLeft: 47,
    marginRight: 20,
    width: '80%',
    alignSelf: 'flex-end',
  },
  suggestionsSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.dividerGray,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dividerGray,
    backgroundColor: Colors.WHITE,
    marginTop: 10,
    // paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 16,

  },
  suggestionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.BLACK,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.BLACK,
    fontWeight: '400',
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',

    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  serviceCard: {
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    height: 95,
    width: '47%',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cardIcon: {
  alignItems: 'flex-end',
  justifyContent: 'flex-end',
  // backgroundColor: 'red'
    // paddingRight: 6,
  },
  cardText: {
  textAlign: 'left',
  paddingLeft: 6,
  paddingTop: 15,
  alignContent:'flex-end',
    fontSize: 20,
    fontWeight: '400',
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
    // paddingBottom: 15,
  },
  banner: {
    flexDirection: 'row',
    // alignItems: 'center',
    backgroundColor: Colors.BANNER_BLUE,
    borderRadius: 16,
    // padding: 20,
    height: 140,
    overflow: 'hidden',
    position: 'relative',
    // borderTopLeftRadius: 30,
    // borderBottomLeftRadius: 30,
    // borderTopRightRadius: 20,
    // borderBottomRightRadius: 15,
  },
  bannerLeft: {
    flex: 1,
    paddingTop: 13,
    paddingLeft: 13,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    // backgroundColor: 'red',
  },
  bannerTextFirst: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.WHITE,
    lineHeight: 22,
  },
  bannerTextSecond: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.WHITE,
    lineHeight: 25,
  },
  bannerRight: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 140,
    height: 120,
  },
  circleContainer: {
    position: 'absolute',
    right: -70,
    top: -20,
    width: 200,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 75,
    backgroundColor: Colors.CIRCLE_RED,
    opacity: 1,
  },
  innerCircle: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 60,
    backgroundColor: Colors.CIRCLE_GREY,
    opacity: 1,
  },
  centerCircle: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.WHITE,
  },
  cardIconImage:{
    width: 84,
    height: 48,
  },
  calendarIconImage:{
    width: 44,
    height: 44,
 marginTop: 5,
  },
  bannerIconImage:{
    width: 213,
    height: 122,
    position: 'absolute',
    right: -10,
    top: 20,
    zIndex: 10,
    // transform: [{ rotate: '5deg' }],
  },

});
