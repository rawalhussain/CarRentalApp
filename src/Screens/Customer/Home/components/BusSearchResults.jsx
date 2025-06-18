import React, { useLayoutEffect } from 'react';
import {View, Text, FlatList, SafeAreaView, TouchableOpacity, Image, StatusBar} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './styles';
import {Colors} from "../../../../Themes/MyColors";

const BusSearchResults = ({ navigation, route }) => {
  const { pickupAddress, dropoffAddress, pickupDate, pickupTime, hours, buses } = route.params;
  const busList = buses ? Object.entries(buses) : [];

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerBack}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Choose A Vehicle</Text>
          <TouchableOpacity style={styles.headerRight} />
        </View>
      ),
    });
  }, [navigation]);

  return (
    <SafeAreaView style={[styles.container, {padding: 0}]}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.BACKGROUND_GREY} />
      {/* Filters Row (static for now) */}
      {/* <View style={{ flexDirection: 'row', margin: 10, gap: 8 }}>
        <View style={styles.filterButton}><Text style={styles.filterButtonText}>All Filters</Text></View>
        <View style={styles.filterButton}><Text style={styles.filterButtonText}>Name</Text></View>
        <View style={styles.filterButton}><Text style={styles.filterButtonText}>Name</Text></View>
        <View style={styles.filterButton}><Text style={styles.filterButtonText}>Name</Text></View>
      </View> */}
      <FlatList
        data={busList}
        keyExtractor={([id]) => id}
        renderItem={({ item }) => {
          const [id, bus] = item;
          return (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('ContactDetails', {
                selectedBus: bus,
                searchPreferences: {
                  pickupAddress,
                  dropoffAddress,
                  pickupDate,
                  pickupTime,
                  hours,
                },
              })}
            >
              <View style={styles.busCard}>
                <Image
                  source={bus.photo ? { uri: bus.photo } : {uri: 'https://via.placeholder.com/150'}}
                  style={styles.busImage}
                  resizeMode="cover"
                />
                <View style={styles.busDetails}>
                  <Text style={styles.busName}>{bus.make || 'Make'} {bus.model || 'Model'}{bus.variant ? ` (${bus.variant})` : ''}</Text>
                  <View style={styles.busInfoRow}>
                    <View style={styles.busInfoItem}>
                      <Ionicons name="people" size={20} color="red" />
                      <Text style={styles.busInfoText}>{bus.seats || 0}</Text>
                    </View>
                    <View style={styles.busInfoItem}>
                      <Ionicons name="briefcase" size={20} color="red" />
                      <Text style={styles.busInfoText}>{bus.luggage || 0}</Text>
                    </View>
                    <View style={styles.busPriceBox}>
                      <Text style={styles.busPriceLabel}>Price/hour</Text>
                      <Text style={styles.busPriceValue}>${bus.rent || 0}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>No buses found.</Text>}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </SafeAreaView>
  );
};

export default BusSearchResults;
