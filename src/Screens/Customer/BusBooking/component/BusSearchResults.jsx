import React, { useLayoutEffect, useState, useEffect } from 'react';
import {View, Text, FlatList, TouchableOpacity, Image, StatusBar, ActivityIndicator} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './styles';
import {Colors} from '../../../../Themes/MyColors';
import {getCars} from '../../../../Config/firebase';
import {showMessageAlert} from '../../../../Lib/utils/CommonHelper';
import MainHeader from '../../../../Components/MainHeader';
import { SafeAreaView } from 'react-native-safe-area-context';

const BusSearchResults = ({ navigation, route }) => {
  const { pickupAddress, dropoffAddress, pickupDate, pickupTime, hours } = route.params;
  
  const [buses, setBuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const busList = buses ? Object.entries(buses) : [];


  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = { type: 'buses' };
      const fetchedBuses = await getCars(filters);
      setBuses(fetchedBuses || {});
    } catch (err) {
      console.error('Error fetching buses:', err);
      setError('Failed to load buses. Please try again.');
      showMessageAlert('Error', 'Failed to load buses. Please try again.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.BACKGROUND_GREY} />
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
        <Text style={{ marginTop: 16, fontSize: 16, color: Colors.PRIMARY_GREY }}>
          Loading buses...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, {padding: 0}]}>
      <MainHeader
        title="Choose A Vehicle"
        onBackPress={() => navigation.goBack()}
        showOptionsButton={false}
      />
        {/* <StatusBar barStyle="dark-content" backgroundColor={Colors.BACKGROUND_GREY} /> */}
      {/* Filters Row */}
      {/* <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingTop: 16, gap: 8 }}>
        <TouchableOpacity style={{ 
          backgroundColor: '#f5f5f5', 
          paddingHorizontal: 16, 
          paddingVertical: 8, 
          borderRadius: 20,
          borderWidth: 1,
          borderColor: '#e0e0e0'
        }}>
          <Text style={{ fontSize: 14, color: '#333' }}>All Filters</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ 
          backgroundColor: '#f5f5f5', 
          paddingHorizontal: 16, 
          paddingVertical: 8, 
          borderRadius: 20,
          borderWidth: 1,
          borderColor: '#e0e0e0'
        }}>
          <Text style={{ fontSize: 14, color: '#333' }}>Name</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ 
          backgroundColor: '#f5f5f5', 
          paddingHorizontal: 16, 
          paddingVertical: 8, 
          borderRadius: 20,
          borderWidth: 1,
          borderColor: '#e0e0e0'
        }}>
          <Text style={{ fontSize: 14, color: '#333' }}>Name</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ 
          backgroundColor: '#f5f5f5', 
          paddingHorizontal: 16, 
          paddingVertical: 8, 
          borderRadius: 20,
          borderWidth: 1,
          borderColor: '#e0e0e0'
        }}>
          <Text style={{ fontSize: 14, color: '#333' }}>Name</Text>
        </TouchableOpacity>
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
                {/* Heart Icon Overlay */}
                <View style={styles.heartIconContainer}>
                  <Ionicons name="heart" size={24} color={Colors.PRIMARY} />
                </View>
                
                {/* Bus Image */}
                {bus.photo && typeof bus.photo === 'string' && bus.photo.startsWith('http') ? (
                  <Image
                    source={{ uri: bus.photo }}
                    style={styles.busImage}
                    resizeMode="cover"
                    defaultSource={require('../../../../../assets/car1.jpg')}
                  />
                ) : (
                  <Image
                    source={require('../../../../../assets/car1.jpg')}
                    style={styles.busImage}
                    resizeMode="cover"
                  />
                )}
                
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
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <Ionicons name="bus-outline" size={64} color={Colors.PRIMARY_GREY} />
            <Text style={[styles.empty, { marginTop: 16, marginBottom: 8 }]}>
              {error ? error : 'No buses found.'}
            </Text>
            {error && (
              <TouchableOpacity
                onPress={fetchBuses}
                style={{
                  backgroundColor: Colors.PRIMARY,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 8,
                  marginTop: 8,
                }}
              >
                <Text style={{ color: Colors.WHITE, fontWeight: '600' }}>Retry</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        contentContainerStyle={{ paddingBottom: 30, flexGrow: 1 }}
      />
    </SafeAreaView>
  );
};

export default BusSearchResults;
