import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // ✅ Import
import styles from './styles';
import carData from './data';

const CarDetailsScreen = () => {
  const navigation = useNavigation(); // ✅ Get navigation object

  const {
    carName,
    rating,
    trips,
    price,
    cancellationPolicy,
    features,
    convenience,
    peaceOfMind,
    extras,
    rules,
    host,
    carBasics,
    reviews,
    description,
    tripDates,
    address,
  } = carData;

  return (
    <ScrollView style={styles.container}>
      {/* Sticky-style header */}
      <View style={styles.stickyHeader}>
        <Text style={styles.headerText}>
          {tripDates.start} - {tripDates.end}
        </Text>
      </View>

      <Image
        source={{ uri: 'https://via.placeholder.com/400x200.png?text=Car+Image' }}
        style={styles.image}
      />

      <Text style={styles.title}>{carName}</Text>
      <Text>⭐ {rating} ({trips} Trips)</Text>

      <View style={styles.section}>
        <Text>From: {tripDates.startTime}</Text>
        <Text>To: {tripDates.endTime}</Text>
        <TouchableOpacity><Text style={styles.link}>Change</Text></TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text>Location: {address}</Text>
        <TouchableOpacity><Text style={styles.link}>Change</Text></TouchableOpacity>
      </View>

      <Text>👍 {cancellationPolicy}</Text>

      <View style={styles.section}>
        <Text style={styles.price}>${price.total} Total</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Verification')}

        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>

      <RenderSection title="Car Basics" items={carBasics} />
      <RenderSection title="Features" items={features} />
      <RenderSection title="Convenience" items={convenience} />
      <RenderSection title="Peace of Mind" items={peaceOfMind} />
      <RenderSection title="Extras" items={extras} />
      <RenderSection title="Rules of the Road" items={rules} />

      <View style={styles.section}>
        <Text style={styles.subtitle}>Hosted By: {host.name}</Text>
        <Text>{host.status}</Text>
        <Text>{host.badge}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Description</Text>
        <Text>{description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Reviews</Text>
        {reviews.map((r, i) => (
          <View key={i}>
            <Text>⭐ {r.rating} - {r.name}</Text>
            <Text>{r.comment}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity><Text style={styles.link}>Report Listing</Text></TouchableOpacity>
        <TouchableOpacity><Text style={styles.link}>Cancellation Policy</Text></TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const RenderSection = ({ title, items }) => (
  <View style={styles.section}>
    <Text style={styles.subtitle}>{title}</Text>
    {items.map((item, idx) => (
      <Text key={idx}>• {item}</Text>
    ))}
  </View>
);

export default CarDetailsScreen;
