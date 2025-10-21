import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../../Themes/MyColors';
import { getCars } from '../../../../Config/firebase';

const CarList = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { where, pickupDate, returnDate } = route.params;

  const [favoriteCarIds, setFavoriteCarIds] = useState(new Set());
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggleFavorite = useCallback((carId) => {
    setFavoriteCarIds((prev) => {
      const next = new Set(prev);
      if (next.has(carId)) {
        next.delete(carId);
      } else {
        next.add(carId);
      }
      return next;
    });
  }, []);

  // Fetch cars from Firebase
  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        setError(null);
        const carsData = await getCars({ type: 'cars' });
        
        if (carsData) {
          // Convert Firebase data to array format
          const carsArray = Object.entries(carsData).map(([id, carData]) => {
            // Debug: Log the photo data structure
            console.log('Car photo data for', id, ':', carData.photo, 'Type:', typeof carData.photo);
            
            // Handle photo data properly - ensure it's a string URL
            let imageSource;
            if (carData.photo) {
              // If photo is a string URL, use it directly
              if (typeof carData.photo === 'string') {
                imageSource = { uri: carData.photo };
              } else if (typeof carData.photo === 'object' && carData.photo.uri) {
                // If photo is an object with uri property
                imageSource = { uri: carData.photo.uri };
              } else {
                // If photo is an object, try to extract URL or use fallback
                console.warn('Photo data is not a string or object with uri:', carData.photo);
                imageSource = require('../../../../../assets/car1.jpg');
              }
            } else {
              imageSource = require('../../../../../assets/car1.jpg');
            }

            return {
              id,
              ...carData,
              // Map Firebase fields to display format
              name: carData.make || 'Unknown Make',
              model: carData.model || 'Unknown Model',
              image: imageSource,
              price: parseInt(carData.rent) || 0,
              variant: carData.variant || 'Unknown Year',
              verified: carData.verified || false,
              reviews: '4.5', // Default reviews since not in Firebase
              trips: Math.floor(Math.random() * 50) + 10, // Random trips for demo
              location: where,
            };
          });
          setCars(carsArray);
        } else {
          setCars([]);
        }
      } catch (err) {
        console.error('Error fetching cars:', err);
        setError('Failed to load cars. Please try again.');
        Alert.alert('Error', 'Failed to load cars. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [where]);

  const formatDate = (date) => {
    if (!date) {return '';}
    const parts = date.split(' ');
    return `${parts[0]} ${parts[1]}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Top Bar with circular back and pill info */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.searchPill}>
          <Text style={styles.searchLocation} numberOfLines={1}>{where || 'Location'}</Text>
          <Text style={styles.searchDates}>
            {pickupDate && returnDate
              ? `${formatDate(pickupDate)} - ${formatDate(returnDate)}`
              : '14 March - 19 March'}
          </Text>
        </View>
      </View>

      {/* Filters */}
      {/* <View style={styles.filters}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          <TouchableOpacity style={styles.filterChip}>
            <Ionicons name="options-outline" size={16} color="#111" style={styles.filterIcon} />
            <Text style={styles.filterText}>All Filters</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Ionicons name="pricetag-outline" size={16} color="#111" style={styles.filterIcon} />
            <Text style={styles.filterText}>Price</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Ionicons name="car-outline" size={16} color="#111" style={styles.filterIcon} />
            <Text style={styles.filterText}>Models</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Ionicons name="battery-charging-outline" size={16} color="#111" style={styles.filterIcon} />
            <Text style={styles.filterText}>EVs</Text>
          </TouchableOpacity>
        </ScrollView>
      </View> */}

  <Text style={{fontSize:16,fontWeight:500,paddingHorizontal:16,paddingTop:0,color:Colors.BLACK,paddingBottom:12}}> List of vehicles available</Text>
      
      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
          <Text style={styles.loadingText}>Loading cars...</Text>
        </View>
      )}

      {/* Error State */}
      {error && !loading && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Car List */}
      {!loading && !error && (
        <FlatList
          data={cars}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.carList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: car }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate('CarDetails', {
                  carData: car,
                  pickupDate,
                  returnDate, 
                  where,
                })
              }
            >
              <Image 
                source={car.image} 
                style={styles.carImage}
                onError={(error) => {
                  console.log('Image load error for car', car.id, ':', error);
                }}
              />
              <TouchableOpacity
                style={styles.heartIcon}
                onPress={(e) => {
                  if (e?.stopPropagation) { e.stopPropagation(); }
                  toggleFavorite(car.id);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel={favoriteCarIds.has(car.id) ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Ionicons
                  name={favoriteCarIds.has(car.id) ? 'heart' : 'heart-outline'}
                  size={20}
                  color={Colors.WHITE}
                />
              </TouchableOpacity>

              <View style={styles.cardBottom}>
                <View style={styles.nameRow}>
                  <Text style={styles.carName}>{car.name}</Text>
                  <Text style={styles.carModel}>{car.model}</Text>
                </View>
                <View style={{height:1,backgroundColor:Colors.LINE_GRAY,marginBottom:6}}/> 
                <View style={styles.detailsRow}>
                  <View style={styles.metaDetails}>
                    <Text style={styles.metaText}>Reviews {car.reviews}★</Text>
                    <Text style={styles.metaText}>Trips ({car.trips})</Text>
                    <Text style={styles.metaText}>Year: {car.variant}</Text>
                    {car.verified && (
                      <Text style={[styles.metaText, { color: Colors.GREEN }]}>✓ Verified</Text>
                    )}
                  </View>
                  <View style={styles.priceBox}>
                    <Text style={styles.priceLabel}>Total</Text>
                    <Text style={styles.priceValue}>${car.price}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
      {!loading && !error && cars.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No cars available at the moment</Text>
        </View>
      )}

    </SafeAreaView>
  );
};

export default CarList;
