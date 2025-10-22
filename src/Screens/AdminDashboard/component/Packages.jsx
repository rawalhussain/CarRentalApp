import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  TextInput,
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../../Themes/MyColors';
import { getRidePackages, updateRidePackage, deleteRidePackage, getPackageCars, getPackagePricing, addPackagePricing, getCars } from '../../../Config/firebase';
import { showMessageAlert } from '../../../Lib/utils/CommonHelper';
import MainHeader from '../../../Components/MainHeader';

const PackagesManagement = ({ navigation }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [availableCars, setAvailableCars] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ratePerMile: '',
    baseFare: '',
    selectedCars: [],
    packageImage: null,
    carDetails: {
      make: '',
      model: '',
      year: '',
      color: '',
      variant: '',
      seats: '',
      transmission: '',
      fuelType: '',
      price: '',
    },
  });

  useEffect(() => {
    fetchPackages();
    fetchAvailableCars();
  }, [fetchPackages, fetchAvailableCars]);

  const fetchPackages = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const packagesData = await getRidePackages();
      const packagesWithDetails = await Promise.all(
        packagesData.map(async (pkg) => {
          const [pricing, cars] = await Promise.all([
            getPackagePricing(pkg.id),
            getPackageCars(pkg.id),
          ]);
          return {
            ...pkg,
            pricing,
            cars,
            ratePerMile: pricing?.ratePerMile || 0,
            baseFare: pricing?.baseFare || 0,
          };
        })
      );
      setPackages(packagesWithDetails);
    } catch (error) {
      console.error('Error fetching ride packages:', error);
      showMessageAlert('Error', 'Failed to fetch ride packages', 'danger');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchAvailableCars = useCallback(async () => {
    try {
      const carsData = await getCars({ type: 'cars' });
      const carsArray = Object.entries(carsData || {}).map(([id, car]) => ({
        id,
        ...car,
      }));
      setAvailableCars(carsArray);
    } catch (error) {
      console.error('Error fetching cars:', error);
    }
  }, []);


  const handleEditPackage = async () => {
    if (!selectedPackage || !formData.name.trim() || !formData.ratePerMile || formData.selectedCars.length === 0) {
      showMessageAlert('Error', 'Please fill all required fields', 'danger');
      return;
    }

    try {
      setLoading(true);

      // Update main package
      const packageUpdateData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
      };
      await updateRidePackage(selectedPackage.id, packageUpdateData);

      // Update pricing
      const pricingData = {
        ratePerMile: parseFloat(formData.ratePerMile),
        baseFare: parseFloat(formData.baseFare) || 0,
        currency: 'USD',
      };
      await addPackagePricing(selectedPackage.id, pricingData);

      await fetchPackages();
      setShowEditModal(false);
      setSelectedPackage(null);
      resetForm();
      showMessageAlert('Success', 'Ride package updated successfully', 'success');
    } catch (error) {
      console.error('Error updating ride package:', error);
      showMessageAlert('Error', 'Failed to update ride package', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePackage = async (packageId) => {
    Alert.alert(
      'Delete Ride Package',
      'Are you sure you want to delete this ride package? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(prev => ({ ...prev, [packageId]: true }));
              await deleteRidePackage(packageId);
              await fetchPackages();
              showMessageAlert('Success', 'Ride package deleted successfully', 'success');
            } catch (error) {
              console.error('Error deleting ride package:', error);
              showMessageAlert('Error', 'Failed to delete ride package', 'danger');
            } finally {
              setActionLoading(prev => ({ ...prev, [packageId]: false }));
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      ratePerMile: '',
      baseFare: '',
      selectedCars: [],
      packageImage: null,
      carDetails: {
        make: '',
        model: '',
        year: '',
        color: '',
        variant: '',
        seats: '',
        transmission: '',
        fuelType: '',
        price: '',
      },
    });
  };

  const openEditModal = (packageItem) => {
    setSelectedPackage(packageItem);
    setFormData({
      name: packageItem.name,
      description: packageItem.description || '',
      ratePerMile: packageItem.ratePerMile?.toString() || '',
      baseFare: packageItem.baseFare?.toString() || '',
      selectedCars: packageItem.cars?.map(car => car.carId) || [],
      packageImage: packageItem.image || null,
    });
    setShowEditModal(true);
  };

  const toggleCarSelection = (carId) => {
    setFormData(prev => ({
      ...prev,
      selectedCars: prev.selectedCars.includes(carId)
        ? prev.selectedCars.filter(id => id !== carId)
        : [...prev.selectedCars, carId],
    }));
  };


  const handleAddNewCar = () => {
    if (!formData.carDetails.make || !formData.carDetails.model) {
      showMessageAlert('Error', 'Please fill car make and model', 'danger');
      return;
    }

    const newCar = {
      id: `temp_${Date.now()}`,
      make: formData.carDetails.make,
      model: formData.carDetails.model,
      year: formData.carDetails.year,
      color: formData.carDetails.color,
      variant: formData.carDetails.variant,
      seats: formData.carDetails.seats,
      transmission: formData.carDetails.transmission,
      fuelType: formData.carDetails.fuelType,
      price: formData.carDetails.price,
    };

    setFormData(prev => ({
      ...prev,
      selectedCars: [...prev.selectedCars, newCar.id],
      carDetails: {
        make: '',
        model: '',
        year: '',
        color: '',
        variant: '',
        seats: '',
        transmission: '',
        fuelType: '',
        price: '',
      },
    }));

    setAvailableCars(prev => [...prev, newCar]);
    showMessageAlert('Success', 'Car added to selection', 'success');
  };

  const renderPackageItem = ({ item }) => {
    const isActionLoading = actionLoading[item.id];
    const packageCars = item.cars || [];

    return (
      <View style={styles.packageCard}>
        <View style={styles.packageContent}>
          {/* Left Side - Package Details */}
          <View style={styles.packageDetails}>
            <View style={styles.packageHeader}>
              <View style={styles.packageInfo}>
                <Text style={styles.packageName}>{item.name}</Text>
                <Text style={styles.packageRate}>${item.ratePerMile}/mile</Text>
              </View>
              <View style={styles.packageActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => openEditModal(item)}
                  disabled={isActionLoading}
                >
                  <Ionicons name="pencil" size={16} color={Colors.PRIMARY} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeletePackage(item.id)}
                  disabled={isActionLoading}
                >
                  {isActionLoading ? (
                    <ActivityIndicator size="small" color={Colors.RED} />
                  ) : (
                    <Ionicons name="trash" size={16} color={Colors.RED} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {item.description && (
              <Text style={styles.packageDescription}>{item.description}</Text>
            )}

            <View style={styles.packageInfoRow}>
              <Text style={styles.detailLabel}>Base Fare: ${item.baseFare || 0}</Text>
              <Text style={styles.detailLabel}>
                Cars: {packageCars.length} available
              </Text>
            </View>

            {packageCars.length > 0 && (
              <View style={styles.carsList}>
                <Text style={styles.carsLabel}>Available Cars:</Text>
                {packageCars.slice(0, 2).map(car => (
                  <Text key={car.id} style={styles.carName}>
                    • {car.make} {car.model} ({car.year})
                  </Text>
                ))}
                {packageCars.length > 2 && (
                  <Text style={styles.moreCars}>+{packageCars.length - 2} more</Text>
                )}
              </View>
            )}
          </View>

          {/* Right Side - Package Image */}
          <View style={styles.packageImageContainer}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.packageCardImage} />
            ) : (
              <View style={styles.noImagePlaceholder}>
                <Ionicons name="image-outline" size={40} color={Colors.GRAY} />
                <Text style={styles.noImageText}>No Image</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderEditModal = () => {
    const modalTitle = 'Edit Package';

    return (
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        style={styles.modal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setShowEditModal(false);
                setSelectedPackage(null);
                resetForm();
              }}
            >
              <Ionicons name="close" size={24} color={Colors.BLACK} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.scrollContainer}>
            <ScrollView
              style={styles.modalContent}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
              bounces={true}
              nestedScrollEnabled={true}
            >
              {/* Package Image - Read Only in Edit Mode */}
              {formData.packageImage && (
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Package Image</Text>
                  <Image source={{ uri: formData.packageImage }} style={styles.packageImage} />
                  <Text style={styles.imageNote}>Image cannot be changed in edit mode</Text>
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.label}>Package Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  placeholder="e.g., Economy, Premium"
                  placeholderTextColor={Colors.GRAY}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                  placeholder="Package description (optional)"
                  placeholderTextColor={Colors.GRAY}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Rate per Mile ($) *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.ratePerMile}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, ratePerMile: text }))}
                    placeholder="2.50"
                    placeholderTextColor={Colors.GRAY}
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.formGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Base Fare ($)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.baseFare}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, baseFare: text }))}
                    placeholder="5.00"
                    placeholderTextColor={Colors.GRAY}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Add New Car Section */}
              <View style={styles.formGroup}>
                <Text style={styles.sectionTitle}>Add New Car</Text>
                <View style={styles.carDetailsForm}>
                  <View style={styles.formRow}>
                    <View style={[styles.formGroup, styles.halfWidth]}>
                      <Text style={styles.label}>Make *</Text>
                      <TextInput
                        style={styles.input}
                        value={formData.carDetails.make}
                        onChangeText={(text) => setFormData(prev => ({
                          ...prev,
                          carDetails: { ...prev.carDetails, make: text },
                        }))}
                        placeholder="e.g., Toyota"
                        placeholderTextColor={Colors.GRAY}
                      />
                    </View>
                    <View style={[styles.formGroup, styles.halfWidth]}>
                      <Text style={styles.label}>Model *</Text>
                      <TextInput
                        style={styles.input}
                        value={formData.carDetails.model}
                        onChangeText={(text) => setFormData(prev => ({
                          ...prev,
                          carDetails: { ...prev.carDetails, model: text },
                        }))}
                        placeholder="e.g., Camry"
                        placeholderTextColor={Colors.GRAY}
                      />
                    </View>
                  </View>

                  <View style={styles.formRow}>
                    <View style={[styles.formGroup, styles.halfWidth]}>
                      <Text style={styles.label}>Year</Text>
                      <TextInput
                        style={styles.input}
                        value={formData.carDetails.year}
                        onChangeText={(text) => setFormData(prev => ({
                          ...prev,
                          carDetails: { ...prev.carDetails, year: text },
                        }))}
                        placeholder="2023"
                        placeholderTextColor={Colors.GRAY}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={[styles.formGroup, styles.halfWidth]}>
                      <Text style={styles.label}>Color</Text>
                      <TextInput
                        style={styles.input}
                        value={formData.carDetails.color}
                        onChangeText={(text) => setFormData(prev => ({
                          ...prev,
                          carDetails: { ...prev.carDetails, color: text },
                        }))}
                        placeholder="e.g., White"
                        placeholderTextColor={Colors.GRAY}
                      />
                    </View>
                  </View>

                  <View style={styles.formRow}>
                    <View style={[styles.formGroup, styles.halfWidth]}>
                      <Text style={styles.label}>Seats</Text>
                      <TextInput
                        style={styles.input}
                        value={formData.carDetails.seats}
                        onChangeText={(text) => setFormData(prev => ({
                          ...prev,
                          carDetails: { ...prev.carDetails, seats: text },
                        }))}
                        placeholder="4"
                        placeholderTextColor={Colors.GRAY}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={[styles.formGroup, styles.halfWidth]}>
                      <Text style={styles.label}>Price/Day</Text>
                      <TextInput
                        style={styles.input}
                        value={formData.carDetails.price}
                        onChangeText={(text) => setFormData(prev => ({
                          ...prev,
                          carDetails: { ...prev.carDetails, price: text },
                        }))}
                        placeholder="50"
                        placeholderTextColor={Colors.GRAY}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <TouchableOpacity style={styles.addCarButton} onPress={handleAddNewCar}>
                    <Ionicons name="add" size={20} color={Colors.WHITE} />
                    <Text style={styles.addCarButtonText}>Add Car to Package</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Select Cars *</Text>
                <ScrollView
                  style={styles.carsSelection}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                >
                  {availableCars.map(car => (
                    <TouchableOpacity
                      key={car.id}
                      style={[
                        styles.carOption,
                        formData.selectedCars.includes(car.id) && styles.selectedCarOption,
                      ]}
                      onPress={() => toggleCarSelection(car.id)}
                    >
                      <View style={styles.carOptionContent}>
                        <Text style={[
                          styles.carOptionText,
                          formData.selectedCars.includes(car.id) && styles.selectedCarOptionText,
                        ]}>
                          {car.make} {car.model}
                        </Text>
                        {car.year && (
                          <Text style={styles.carOptionSubText}>{car.year} • {car.color}</Text>
                        )}
                      </View>
                      {formData.selectedCars.includes(car.id) && (
                        <Ionicons name="checkmark" size={16} color={Colors.PRIMARY} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </ScrollView>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowEditModal(false);
                setSelectedPackage(null);
                resetForm();
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.disabledButton]}
              onPress={handleEditPackage}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={Colors.WHITE} />
              ) : (
                <Text style={styles.saveButtonText}>Update Package</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <MainHeader
        title="Ride Packages"
        showOptionsButton={false}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      <StatusBar barStyle="dark-content" backgroundColor={Colors.WHITE} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddPackages')}
        >
          <Ionicons name="add" size={20} color={Colors.WHITE} />
          <Text style={styles.addButtonText}>Add Package</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
          <Text style={styles.loadingText}>Loading packages...</Text>
        </View>
      ) : packages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="package-outline" size={64} color={Colors.GRAY} />
          <Text style={styles.emptyText}>No packages found</Text>
          <Text style={styles.emptySubText}>
            Add your first ride package to get started
          </Text>
        </View>
      ) : (
        <FlatList
          data={packages}
          renderItem={renderPackageItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchPackages(true)}
              colors={[Colors.PRIMARY]}
              tintColor={Colors.PRIMARY}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {renderEditModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_GREY,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LINE_GRAY,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  listContainer: {
    padding: 16,
  },
  packageCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    overflow: 'hidden',
  },
  packageContent: {
    flexDirection: 'row',
    padding: 16,
  },
  packageDetails: {
    flex: 1,
    paddingRight: 12,
  },
  packageImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
  },
  packageCardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  noImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.BACKGROUND_GREY,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  noImageText: {
    fontSize: 12,
    color: Colors.GRAY,
    marginTop: 4,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  packageInfo: {
    flex: 1,
  },
  packageName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.BLACK,
    marginBottom: 4,
  },
  packageRate: {
    fontSize: 16,
    color: Colors.PRIMARY,
    fontWeight: '600',
  },
  packageActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: Colors.BACKGROUND_GREY,
  },
  editButton: {
    backgroundColor: Colors.lightGray,
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  packageDescription: {
    fontSize: 14,
    color: Colors.GRAY,
    marginBottom: 12,
    lineHeight: 20,
  },
  packageInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.GRAY,
    fontWeight: '500',
  },
  carsList: {
    borderTopWidth: 1,
    borderTopColor: Colors.LINE_GRAY,
    paddingTop: 12,
  },
  carsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.BLACK,
    marginBottom: 8,
  },
  carName: {
    fontSize: 13,
    color: Colors.GRAY,
    marginBottom: 2,
  },
  moreCars: {
    fontSize: 13,
    color: Colors.PRIMARY,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.GRAY,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.BLACK,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    color: Colors.GRAY,
    textAlign: 'center',
  },
  // Modal styles
  modal: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LINE_GRAY,
    backgroundColor: Colors.WHITE,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.BLACK,
  },
  placeholder: {
    width: 24,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.BLACK,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.LINE_GRAY,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.BLACK,
    backgroundColor: Colors.WHITE,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  carsSelection: {
    maxHeight: 250,
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  carOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.LINE_GRAY,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: Colors.WHITE,
  },
  selectedCarOption: {
    borderColor: Colors.PRIMARY,
    backgroundColor: '#F0F8FF',
  },
  carOptionText: {
    fontSize: 14,
    color: Colors.BLACK,
    flex: 1,
  },
  selectedCarOptionText: {
    color: Colors.PRIMARY,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.LINE_GRAY,
    gap: 12,
    backgroundColor: Colors.WHITE,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.LINE_GRAY,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: Colors.GRAY,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.PRIMARY,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    color: Colors.WHITE,
    fontWeight: '600',
  },
  // Image picker styles
  imagePicker: {
    borderWidth: 2,
    borderColor: Colors.LINE_GRAY,
    borderStyle: 'dashed',
    borderRadius: 8,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.BACKGROUND_GREY,
  },
  packageImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.GRAY,
  },
  // Car details form styles
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.BLACK,
    marginBottom: 16,
  },
  carDetailsForm: {
    backgroundColor: Colors.BACKGROUND_GREY,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  addCarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  addCarButtonText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  carOptionContent: {
    flex: 1,
  },
  carOptionSubText: {
    fontSize: 12,
    color: Colors.GRAY,
    marginTop: 2,
  },
  imageNote: {
    fontSize: 12,
    color: Colors.GRAY,
    fontStyle: 'italic',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default PackagesManagement;
