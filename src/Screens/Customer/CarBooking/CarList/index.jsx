import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './styles';
import { useNavigation, useRoute } from '@react-navigation/native';

const CarList = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { where, pickupDate, returnDate } = route.params;

  const cars = [
    {
      id: 1,
      name: 'TopGun',
      model: 'Model S',
      image: require('../../../../../assets/car1.jpg'), // ✅ Local image
      reviews: '5.0',
      trips: 14,
      location: where,
      price: 111,
    },
    {
      id: 2,
      name: 'Cultus',
      model: 'Model X',
      image: require('../../../../../assets/car2.jpg'), // ✅ Local image
      reviews: '4.8',
      trips: 22,
      location: where,
      price: 98,
    },
  ];

  const formatDate = (date) => {
    if (!date) return '';
    const parts = date.split(' ');
    return `${parts[0]} ${parts[1]}`;
  };

  return (
    <View style={styles.container}>
      {/* Search-style Top Bar */}
      <View style={styles.searchBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
          <Ionicons name="arrow-back" size={20} color="#000" />
        </TouchableOpacity>
        <View style={styles.searchTextContainer}>
          <Text style={styles.searchLocation}>{where || 'Location'}</Text>
          <Text style={styles.searchDates}>
            {pickupDate && returnDate
              ? `${formatDate(pickupDate)} - ${formatDate(returnDate)}`
              : '14 March - 19 March'}
          </Text>
        </View>
        <Ionicons name="notifications-outline" size={20} color="#000" style={{ marginRight: 10 }} />
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <TouchableOpacity style={styles.filterButton}><Text>All Filters</Text></TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}><Text>Price</Text></TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}><Text>Models</Text></TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}><Text>EVs</Text></TouchableOpacity>
      </View>

      {/* Car List */}
      <ScrollView contentContainerStyle={styles.carList}>
        {cars.map((car) => (
          <TouchableOpacity
            key={car.id}
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
            <Image source={car.image} style={styles.carImage} />
            <TouchableOpacity style={styles.heartIcon}>
              <Ionicons name="heart-outline" size={20} color="red" />
            </TouchableOpacity>

            <View style={styles.cardBottom}>
              <View style={styles.nameRow}>
                <Text style={styles.carName}>{car.name}</Text>
                <Text style={styles.carModel}>{car.model}</Text>
              </View>

              <View style={styles.detailsRow}>
                <View style={styles.metaDetails}>
                  <Text style={styles.metaText}>Reviews {car.reviews}★</Text>
                  <Text style={styles.metaText}>Trips ({car.trips})</Text>
                  <Text style={styles.metaText}>{car.location}</Text>
                </View>
                <View style={styles.priceBox}>
                  <Text style={styles.priceLabel}>Total</Text>
                  <Text style={styles.priceValue}>${car.price}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default CarList;
