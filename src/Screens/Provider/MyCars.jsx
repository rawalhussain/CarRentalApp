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
import { Colors } from '../../Themes/MyColors';
import { getCars, updateVehicle, deleteVehicle, uploadVehicleImage } from '../../Config/firebase';
import useAuthStore from '../../store/useAuthStore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import { showMessageAlert } from '../../Lib/utils/CommonHelper';
import Loader from '../../Components/Loader';

const MyCars = ({ navigation, route }) => {
  const [vehicles, setVehicles] = useState({ cars: [], buses: [] });
  const [activeTab, setActiveTab] = useState('cars');
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchVehicles();
  }, [activeTab]);

  // Add effect to handle refresh
  useEffect(() => {
    if (route.params?.refresh) {
      fetchVehicles();
      // Clear the refresh flag
      navigation.setParams({ refresh: undefined });
    }
  }, [route.params?.refresh]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await getCars({ type: activeTab, vendorId: user?.user?.uid });

      if (!data) {
        setVehicles(prev => ({ ...prev, [activeTab]: [] }));
        return;
      }

      // Convert the data object to an array of vehicles
      const vehiclesArray = Object.entries(data).map(([id, vehicle]) => ({
        id,
        ...vehicle,
      }));

      setVehicles(prev => ({ ...prev, [activeTab]: vehiclesArray }));
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      showMessageAlert('Error', 'Failed to fetch vehicles', 'danger');
      setVehicles(prev => ({ ...prev, [activeTab]: [] }));
    } finally {
      setLoading(false);
    }
  };

  const deletePreviousImage = async (imageUrl) => {
    if (!imageUrl) {return;}

    try {
      const imageRef = storage().refFromURL(imageUrl);
      await imageRef.delete();
    } catch (error) {
      console.error('Error deleting previous image:', error);
    }
  };

  const handleUpdateVehicle = async (vehicle, updateData) => {
    try {
      setLoading(true);
      await updateVehicle(vehicle.id, updateData, activeTab);
      await fetchVehicles();
      showMessageAlert('Success', 'Vehicle updated successfully', 'success');
    } catch (error) {
      console.error('Error updating vehicle:', error);
      showMessageAlert('Error', 'Failed to update vehicle', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!vehicleId) {
      console.error('No vehicle ID provided for deletion');
      showMessageAlert('Error', 'Invalid vehicle ID', 'danger');
      return;
    }

    try {
      setLoading(true);

      await deleteVehicle(vehicleId, activeTab);

      await fetchVehicles();
      showMessageAlert('Success', 'Vehicle deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      showMessageAlert('Error', 'Failed to delete vehicle: ' + error.message, 'danger');
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
    <View
      style={styles.carCard}
    >
      <Image
        source={getImageSource(item?.photo)}
        style={styles.carImage}
      />
      <View style={styles.carInfo}>
        <View style={styles.mainInfo}>
          <View style={styles.carDetails}>
            <Text style={styles.carName}>{item?.make} {item?.model}</Text>
            <Text style={styles.carVariant}>{item?.variant}</Text>
            <View style={styles.verificationStatus}>
              <Ionicons
                name={item?.verified ? 'checkmark-circle' : 'time'}
                size={16}
                color={item?.verified ? Colors.PRIMARY : Colors.GRAY}
              />
              <Text style={[
                styles.statusText,
                { color: item?.verified ? Colors.PRIMARY : Colors.GRAY },
              ]}>
                {item?.verified ? 'Verified' : 'Pending'}
              </Text>
            </View>
          </View>
          <View style={styles.priceActions}>
            <Text style={styles.carPrice}>${item?.rent}/day</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  try {
                    navigation.navigate('CarDetails', {
                      car: item,
                      type: activeTab,
                      isEdit: true,
                      vehicleId: item.id,
                    });
                  } catch (error) {
                    console.error('Navigation error:', error);
                    showMessageAlert('Error', 'Failed to open edit screen', 'danger');
                  }
                }}
              >
                <Ionicons name="pencil" size={18} color={Colors.PRIMARY} />
              </TouchableOpacity>
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
                    ],
                    { cancelable: true }
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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
          <Text style={styles.loadingText}>Loading {activeTab}...</Text>
        </View>
      ) : vehicles?.[activeTab]?.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No {activeTab} added yet</Text>
          <Text style={styles.emptySubText}>Add your first {activeTab === 'cars' ? 'car' : 'bus'} to start renting</Text>
        </View>
      ) : (
        <FlatList
          data={vehicles?.[activeTab]}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LINE_GRAY,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.BLACK,
  },
  addButton: {
    paddingHorizontal: 16,
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

export default MyCars;
