import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { Colors } from '../../../Themes/MyColors';
import { getVehiclesWithVendorDetails, updateVehicle, deleteVehicle, uploadVehicleImage } from '../../../Config/firebase';
import useAuthStore from '../../../store/useAuthStore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { showMessageAlert } from '../../../Lib/utils/CommonHelper';
import Loader from '../../../Components/Loader';
import database from '@react-native-firebase/database';

const VehicleManagement = ({ navigation }) => {
  const [vehicles, setVehicles] = useState({ cars: [], buses: [] });
  const [activeTab, setActiveTab] = useState('cars');
  const [statusTab, setStatusTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [vendorNames, setVendorNames] = useState({});
  const { user } = useAuthStore();

  useEffect(() => {
    fetchVehicles();
  }, [activeTab, statusTab]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const [carsArray, busesArray] = await Promise.all([
        getVehiclesWithVendorDetails({ type: 'cars' }),
        getVehiclesWithVendorDetails({ type: 'buses' })
      ]);

      setVehicles({
        cars: carsArray || [],
        buses: busesArray || []
      });

      // Update vendor names state
      const vendorNamesMap = {};
      [...carsArray, ...busesArray].forEach(vehicle => {
        if (vehicle.vendorId) {
          vendorNamesMap[vehicle.vendorId] = vehicle.vendorName;
        }
      });
      setVendorNames(vendorNamesMap);

    } catch (error) {
      console.error('Error fetching vehicles:', error);
      showMessageAlert('Error', 'Failed to fetch vehicles. Please try again.', 'danger');
      setVehicles({ cars: [], buses: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVehicle = async (vehicle) => {
    try {
      await updateVehicle(vehicle.id, {
        verified: true,
        approvedAt: database.ServerValue.TIMESTAMP,
        approvedBy: user?.user?.uid
      }, activeTab);
      await fetchVehicles();
      showMessageAlert('Success', `${activeTab === 'cars' ? 'Car' : 'Bus'} approved successfully`, 'success');
    } catch (error) {
      console.error('Error approving vehicle:', error);
      showMessageAlert('Error', 'Failed to approve vehicle. Please try again.', 'danger');
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    try {
      setLoading(true);
      await deleteVehicle(vehicleId, activeTab);
      await fetchVehicles();
      showMessageAlert('Success', `${activeTab === 'cars' ? 'Car' : 'Bus'} deleted successfully`, 'success');
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      showMessageAlert('Error', 'Failed to delete vehicle. Please try again.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (imageUri, vehicleId) => {
    try {
      const path = `${activeTab}/${user?.user?.uid}/${Date.now()}`;
      const imageUrl = await uploadVehicleImage(imageUri, path);
      await updateVehicle(vehicleId, { photo: imageUrl }, activeTab);
      await fetchVehicles();
      return imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      showMessageAlert('Error', 'Failed to upload image', 'danger');
      throw error;
    }
  };

  const filteredVehicles = vehicles[activeTab].filter(vehicle =>
    statusTab === 'approved' ? vehicle.verified : !vehicle.verified
  );

  const getImageSource = (photo) => {
    if (!photo) {return { uri: 'https://via.placeholder.com/150' };}

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

    return { uri: 'https://via.placeholder.com/150' };
  };

  const renderVehicleItem = ({ item }) => (
    <View style={styles.carCard}>
      <Image
        source={getImageSource(item.photo)}
        style={styles.carImage}
      />
      <View style={styles.carInfo}>
        <View style={styles.mainInfo}>
          <View style={styles.carDetails}>
            <Text style={styles.carName}>{item.make} {item.model}</Text>
            <Text style={styles.carVariant}>{item.variant}</Text>
            <View style={styles.verificationStatus}>
              <Ionicons
                name={item.verified ? 'checkmark-circle' : 'time'}
                size={16}
                color={item.verified ? Colors.PRIMARY : Colors.GRAY}
              />
              <Text style={[
                styles.statusText,
                { color: item.verified ? Colors.PRIMARY : Colors.GRAY },
              ]}>
                {item.verified ? 'Verified' : 'Pending'}
              </Text>
            </View>
            <Text style={styles.vendorName}>Vendor: {vendorNames[item.vendorId] || 'Unknown'}</Text>
          </View>
          <View style={styles.priceActions}>
            <Text style={styles.carPrice}>${item.rent}/day</Text>
            <View style={styles.actionButtons}>
              {!item.verified && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    Alert.alert(
                      `Approve ${activeTab === 'cars' ? 'Car' : 'Bus'}`,
                      `Are you sure you want to approve this ${activeTab === 'cars' ? 'car' : 'bus'}?`,
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
                >
                  <Ionicons name="checkmark-circle" size={18} color={Colors.PRIMARY} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  Alert.alert(
                    `Delete ${activeTab === 'cars' ? 'Car' : 'Bus'}`,
                    `Are you sure you want to delete this ${activeTab === 'cars' ? 'car' : 'bus'}?`,
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
              >
                <Ionicons name="trash" size={18} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.WHITE} />
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'cars' && styles.activeTab]}
          onPress={() => setActiveTab('cars')}
        >
          <Text style={[styles.tabText, activeTab === 'cars' && styles.activeTabText]}>Cars</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'buses' && styles.activeTab]}
          onPress={() => setActiveTab('buses')}
        >
          <Text style={[styles.tabText, activeTab === 'buses' && styles.activeTabText]}>Buses</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statusTabContainer}>
        <TouchableOpacity
          style={[styles.statusTab, statusTab === 'pending' && styles.activeStatusTab]}
          onPress={() => setStatusTab('pending')}
        >
          <Text style={[styles.statusTabText, statusTab === 'pending' && styles.activeStatusTabText]}>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statusTab, statusTab === 'approved' && styles.activeStatusTab]}
          onPress={() => setStatusTab('approved')}
        >
          <Text style={[styles.statusTabText, statusTab === 'approved' && styles.activeStatusTabText]}>Approved</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
          <Text style={styles.loadingText}>Loading {activeTab}...</Text>
        </View>
      ) : filteredVehicles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No {statusTab} {activeTab}</Text>
          <Text style={styles.emptySubText}>There are no {statusTab} {activeTab} at the moment</Text>
        </View>
      ) : (
        <FlatList
          data={filteredVehicles}
          renderItem={renderVehicleItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
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
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  carImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  carInfo: {
    flex: 1,
    padding: 12,
  },
  mainInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  carDetails: {
    flex: 1,
    marginRight: 8,
  },
  carName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.BLACK,
    marginBottom: 2,
  },
  carVariant: {
    fontSize: 13,
    color: Colors.GRAY,
    marginBottom: 4,
  },
  verificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  vendorName: {
    fontSize: 12,
    color: Colors.GRAY,
    marginTop: 4,
  },
  priceActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  carPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.PRIMARY,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 4,
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
    padding: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.BLACK,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: Colors.GRAY,
    textAlign: 'center',
  },
});

export default VehicleManagement;
