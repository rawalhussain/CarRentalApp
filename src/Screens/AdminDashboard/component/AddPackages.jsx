import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  TextInput,
  ScrollView,
  Image,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../../Themes/MyColors';
import { addRidePackage, addPackageCar, addPackagePricing, uploadFile } from '../../../Config/firebase';
import { showMessageAlert } from '../../../Lib/utils/CommonHelper';
import MainHeader from '../../../Components/MainHeader';
import AppImagePicker from '../../../Components/AppImagePicker';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

const AddPackages = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const imagePickerRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ratePerMile: '',
    baseFare: '',
    packageImage: null,
    carDetails: {
      make: '',
      model: '',
      year: '',
      color: '',
      seats: '',
      price: '',
    },
  });

  useEffect(() => {
    // No need to fetch existing cars - we'll only add new ones manually
  }, []);

  const handleAddPackage = async () => {
    if (!formData.name.trim() || !formData.ratePerMile || !formData.carDetails.make || !formData.carDetails.model) {
      showMessageAlert('Error', 'Please fill all required fields including car details', 'danger');
      return;
    }

    try {
      setLoading(true);

      // 1. Create the main package
      const packageData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: formData.packageImage || null,
        isActive: true,
      };
      const packageId = await addRidePackage(packageData);
      // 2. Add pricing rules
      const pricingData = {
        ratePerMile: parseFloat(formData.ratePerMile),
        baseFare: parseFloat(formData.baseFare) || 0,
        currency: 'USD',
      };
      await addPackagePricing(packageId, pricingData);
      // 3. Add the car to package
      const carData = {
        carId: `car_${Date.now()}`,
        make: formData.carDetails.make,
        model: formData.carDetails.model,
        year: formData.carDetails.year,
        color: formData.carDetails.color,
        seats: formData.carDetails.seats,
        price: formData.carDetails.price,
        isAvailable: true,
      };
      await addPackageCar(packageId, carData);
      showMessageAlert('Success', 'Ride package added successfully', 'success');
      navigation.goBack();
    } catch (error) {
      showMessageAlert('Error', `Failed to add ride package: ${error.message}`, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleImagePicker = () => {
    imagePickerRef.current?.present();
  };

  const handleImageSelected = async (file) => {
    try {
      const fileName = `package_${Date.now()}.jpg`;
      const uploadPath = `packages/${fileName}`;
      const imageUrl = await uploadFile(file.uri, uploadPath);
      setFormData(prev => ({
        ...prev,
        packageImage: imageUrl,
      }));
      showMessageAlert('Success', 'Image uploaded successfully', 'success');
    } catch (error) {
      console.error('Error uploading image:', error);
      console.error('Image upload error details:', error.message);
      showMessageAlert('Error', `Failed to upload image: ${error.message}`, 'danger');
    }
  };



  return (
    <SafeAreaView style={styles.container}>
      <MainHeader
        title="Add Package"
        showOptionsButton={false}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      <StatusBar barStyle="dark-content" backgroundColor={Colors.WHITE} />
      <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        bounces={true}
      >
        {/* Package Details Section */}
        <View style={styles.packageDetailsSection}>
          <Text style={styles.sectionTitle}>Package Details</Text>

          {/* Package Image */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Package Image</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={handleImagePicker}>
              {formData.packageImage ? (
                <Image source={{ uri: formData.packageImage }} style={styles.packageImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera" size={40} color={Colors.GRAY} />
                  <Text style={styles.imagePlaceholderText}>Tap to add image</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

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

          </View>
        </View>

      </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleAddPackage}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={Colors.WHITE} />
          ) : (
            <Text style={styles.saveButtonText}>Add Package</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Image Picker */}
      <AppImagePicker
        bottomSheetModalRef={imagePickerRef}
        onImageSelected={handleImageSelected}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_GREY,
  },
  scrollContainer: {
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
  // Package details section
  packageDetailsSection: {
    backgroundColor: Colors.WHITE,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
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
  footer: {
    padding: 16,
    backgroundColor: Colors.WHITE,
    borderTopWidth: 1,
    borderTopColor: Colors.LINE_GRAY,
  },
  saveButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 16,
    borderRadius: 8,
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
});

export default AddPackages;
