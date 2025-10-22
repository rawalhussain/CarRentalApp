import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import database from '@react-native-firebase/database';

// Local imports
import { Colors } from '../../../Themes/MyColors';
import { getVehiclesWithVendorDetails, updateVehicle, deleteVehicle, uploadVehicleImage } from '../../../Config/firebase';
import useAuthStore from '../../../store/useAuthStore';
import { showMessageAlert } from '../../../Lib/utils/CommonHelper';
import MainHeader from '../../../Components/MainHeader';

// Constants
const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

const VehicleManagement = ({ navigation }) => {
  // Component constants
  const VEHICLE_TYPES = {
    CARS: 'cars',
    BUSES: 'buses'
  };
  
  const STATUS_TYPES = {
    PENDING: 'pending',
    APPROVED: 'approved'
  };
  // State management
  const [vehicles, setVehicles] = useState({ cars: [], buses: [] });
  const [activeTab, setActiveTab] = useState(VEHICLE_TYPES.CARS);
  const [statusTab, setStatusTab] = useState(STATUS_TYPES.PENDING);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vendorNames, setVendorNames] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  
  // Store
  const { user } = useAuthStore();

  // Effects
  useEffect(() => {
    fetchVehicles();
  }, [activeTab, statusTab]);

  // Data fetching
  const fetchVehicles = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const [carsArray, busesArray] = await Promise.all([
        getVehiclesWithVendorDetails({ type: 'cars' }),
        getVehiclesWithVendorDetails({ type: 'buses' }),
      ]);

      const vehiclesData = {
        cars: carsArray || [],
        buses: busesArray || [],
      };
      
      setVehicles(vehiclesData);

      // Update vendor names state
      const vendorNamesMap = {};
      [...(carsArray || []), ...(busesArray || [])].forEach(vehicle => {
        if (vehicle?.vendorId) {
          vendorNamesMap[vehicle.vendorId] = vehicle.vendorName || 'Unknown Vendor';
        }
      });
      setVendorNames(vendorNamesMap);

    } catch (error) {
      console.error('Error fetching vehicles:', error);
      showMessageAlert(
        'Error', 
        'Failed to fetch vehicles. Please check your connection and try again.', 
        'danger'
      );
      setVehicles({ cars: [], buses: [] });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Vehicle actions
  const handleApproveVehicle = useCallback(async (vehicle) => {
    if (!vehicle?.id) {
      showMessageAlert('Error', 'Invalid vehicle data', 'danger');
      return;
    }
    
    setActionLoading(prev => ({ ...prev, [vehicle.id]: true }));
    
    try {
      await updateVehicle(vehicle.id, {
        verified: true,
        approvedAt: database.ServerValue.TIMESTAMP,
        approvedBy: user?.user?.uid,
      }, activeTab);
      
      await fetchVehicles();
      showMessageAlert(
        'Success', 
        `${activeTab === VEHICLE_TYPES.CARS ? 'Car' : 'Bus'} approved successfully`, 
        'success'
      );
    } catch (error) {
      console.error('Error approving vehicle:', error);
      showMessageAlert(
        'Error', 
        'Failed to approve vehicle. Please try again.', 
        'danger'
      );
    } finally {
      setActionLoading(prev => ({ ...prev, [vehicle.id]: false }));
    }
  }, [activeTab, user?.user?.uid, fetchVehicles]);

  const handleDeleteVehicle = useCallback(async (vehicleId) => {
    if (!vehicleId) {
      showMessageAlert('Error', 'Invalid vehicle ID', 'danger');
      return;
    }
    
    setActionLoading(prev => ({ ...prev, [vehicleId]: true }));
    
    try {
      await deleteVehicle(vehicleId, activeTab);
      await fetchVehicles();
      showMessageAlert(
        'Success', 
        `${activeTab === VEHICLE_TYPES.CARS ? 'Car' : 'Bus'} deleted successfully`, 
        'success'
      );
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      showMessageAlert(
        'Error', 
        'Failed to delete vehicle. Please try again.', 
        'danger'
      );
    } finally {
      setActionLoading(prev => ({ ...prev, [vehicleId]: false }));
    }
  }, [activeTab, fetchVehicles]);

  const handleImageUpload = useCallback(async (imageUri, vehicleId) => {
    if (!imageUri || !vehicleId) {
      showMessageAlert('Error', 'Invalid image or vehicle data', 'danger');
      return;
    }
    
    try {
      const path = `${activeTab}/${user?.user?.uid}/${Date.now()}`;
      const imageUrl = await uploadVehicleImage(imageUri, path);
      await updateVehicle(vehicleId, { photo: imageUrl }, activeTab);
      await fetchVehicles();
      return imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      showMessageAlert('Error', 'Failed to upload image. Please try again.', 'danger');
      throw error;
    }
  }, [activeTab, user?.user?.uid, fetchVehicles]);

  // Computed values
  const filteredVehicles = useMemo(() => {
    return vehicles[activeTab]?.filter(vehicle =>
      statusTab === STATUS_TYPES.APPROVED ? vehicle.verified : !vehicle.verified
    ) || [];
  }, [vehicles, activeTab, statusTab]);

  // Utility functions
  const getImageSource = useCallback((photo) => {
    if (!photo) {
      return { uri: 'https://via.placeholder.com/150/cccccc/ffffff?text=No+Image' };
    }

    try {
      // If it's a new upload with uri
      if (photo.uri) {
        return { uri: photo.uri };
      }

      // If it's an existing URL string
      if (typeof photo === 'string' && photo.startsWith('http')) {
        return { uri: photo };
      }

      // If it's an existing URL in an object
      if (photo.url && typeof photo.url === 'string') {
        return { uri: photo.url };
      }
    } catch (error) {
      console.error('Error processing image source:', error);
    }

    return { uri: 'https://via.placeholder.com/150/cccccc/ffffff?text=No+Image' };
  }, []);

  // Render functions
  const renderVehicleItem = useCallback(({ item }) => {
    const isActionLoading = actionLoading[item.id];
    const vehicleType = activeTab === VEHICLE_TYPES.CARS ? 'Car' : 'Bus';
    
    return (
      <View style={styles.carCard}>
        <Image
          source={getImageSource(item.photo)}
          style={styles.carImage}
          resizeMode="cover"
        />
        <View style={styles.carInfo}>
          <View style={styles.mainInfo}>
            <View style={styles.carDetails}>
              <Text style={styles.carName} numberOfLines={1}>
                {item.make} {item.model}
              </Text>
              <Text style={styles.carVariant} numberOfLines={1}>
                {item.variant}
              </Text>
              <View style={styles.verificationStatus}>
                <Ionicons
                  name={item.verified ? 'checkmark-circle' : 'time'}
                  size={16}
                  color={item.verified ? Colors.GREEN : Colors.YELLOW}
                />
                <Text style={[
                  styles.statusText,
                  { color: item.verified ? Colors.GREEN : Colors.YELLOW },
                ]}>
                  {item.verified ? 'Verified' : 'Pending'}
                </Text>
              </View>
              <Text style={styles.vendorName} numberOfLines={1}>
                Vendor: {vendorNames[item.vendorId] || 'Unknown'}
              </Text>
            </View>
            <View style={styles.priceActions}>
              <Text style={styles.carPrice}>${item.rent}/day</Text>
              <View style={styles.actionButtons}>
                {!item.verified && (
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      isActionLoading && styles.disabledButton
                    ]}
                    onPress={() => {
                      Alert.alert(
                        `Approve ${vehicleType}`,
                        `Are you sure you want to approve this ${vehicleType.toLowerCase()}?`,
                        [
                          {
                            text: 'Cancel',
                            style: 'cancel',
                          },
                          {
                            text: 'Approve',
                            onPress: () => handleApproveVehicle(item),
                          },
                        ]
                      );
                    }}
                    disabled={isActionLoading}
                  >
                    {isActionLoading ? (
                      <ActivityIndicator size="small" color={Colors.PRIMARY} />
                    ) : (
                      <Ionicons name="checkmark-circle" size={18} color={Colors.PRIMARY} />
                    )}
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    isActionLoading && styles.disabledButton
                  ]}
                  onPress={() => {
                    Alert.alert(
                      `Delete ${vehicleType}`,
                      `Are you sure you want to delete this ${vehicleType.toLowerCase()}? This action cannot be undone.`,
                      [
                        {
                          text: 'Cancel',
                          style: 'cancel',
                        },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: () => handleDeleteVehicle(item.id),
                        },
                      ]
                    );
                  }}
                  disabled={isActionLoading}
                >
                  {isActionLoading ? (
                    <ActivityIndicator size="small" color={Colors.RED} />
                  ) : (
                    <Ionicons name="trash" size={18} color={Colors.RED} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }, [activeTab, vendorNames, actionLoading, getImageSource, handleApproveVehicle, handleDeleteVehicle]);

  return (
    <SafeAreaView style={styles.container}>
      <MainHeader title="Vehicles Management" showOptionsButton={false} showBackButton={false} />
      <StatusBar barStyle="dark-content" backgroundColor={Colors.WHITE} />
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === VEHICLE_TYPES.CARS && styles.activeTab]}
          onPress={() => setActiveTab(VEHICLE_TYPES.CARS)}
        >
          <Text style={[styles.tabText, activeTab === VEHICLE_TYPES.CARS && styles.activeTabText]}>Cars</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === VEHICLE_TYPES.BUSES && styles.activeTab]}
          onPress={() => setActiveTab(VEHICLE_TYPES.BUSES)}
        >
          <Text style={[styles.tabText, activeTab === VEHICLE_TYPES.BUSES && styles.activeTabText]}>Buses</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statusTabContainer}>
        <TouchableOpacity
          style={[styles.statusTab, statusTab === STATUS_TYPES.PENDING && styles.activeStatusTab]}
          onPress={() => setStatusTab(STATUS_TYPES.PENDING)}
        >
          <Text style={[styles.statusTabText, statusTab === STATUS_TYPES.PENDING && styles.activeStatusTabText]}>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statusTab, statusTab === STATUS_TYPES.APPROVED && styles.activeStatusTab]}
          onPress={() => setStatusTab(STATUS_TYPES.APPROVED)}
        >
          <Text style={[styles.statusTabText, statusTab === STATUS_TYPES.APPROVED && styles.activeStatusTabText]}>Approved</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
          <Text style={styles.loadingText}>Loading {activeTab}...</Text>
        </View>
      ) : filteredVehicles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons 
            name="car-outline" 
            size={64} 
            color={Colors.GRAY} 
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyText}>No {statusTab} {activeTab}</Text>
          <Text style={styles.emptySubText}>
            There are no {statusTab} {activeTab} at the moment
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredVehicles}
          renderItem={renderVehicleItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchVehicles(true)}
              colors={[Colors.PRIMARY]}
              tintColor={Colors.PRIMARY}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_GREY,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.WHITE,
    paddingHorizontal: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LINE_GRAY,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.PRIMARY,
  },
  tabText: {
    fontSize: 16,
    color: Colors.GRAY,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.PRIMARY,
    fontWeight: '600',
  },
  statusTabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.WHITE,
    paddingHorizontal: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LINE_GRAY,
  },
  statusTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeStatusTab: {
    borderBottomColor: Colors.PRIMARY,
  },
  statusTabText: {
    fontSize: 14,
    color: Colors.GRAY,
    fontWeight: '500',
  },
  activeStatusTabText: {
    color: Colors.PRIMARY,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  carCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: Colors.LINE_GRAY,
  },
  carImage: {
    width: 120,
    height: 130,
    resizeMode: 'cover',
    backgroundColor: Colors.LINE_GRAY,
  },
  carInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  mainInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  carDetails: {
    flex: 1,
    marginRight: 12,
  },
  carName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.BLACK,
    marginBottom: 4,
    lineHeight: 22,
  },
  carVariant: {
    fontSize: 14,
    color: Colors.GRAY,
    marginBottom: 8,
    lineHeight: 18,
  },
  verificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
  },
  vendorName: {
    fontSize: 12,
    color: Colors.GRAY,
    marginTop: 4,
    lineHeight: 16,
  },
  priceActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minWidth: 100,
  },
  carPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.PRIMARY,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.BACKGROUND_GREY,
    minWidth: 36,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.BACKGROUND_GREY,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.GRAY,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.BLACK,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 16,
    color: Colors.GRAY,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default VehicleManagement;
