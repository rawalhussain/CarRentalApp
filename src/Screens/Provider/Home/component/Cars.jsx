import React, {useLayoutEffect, useState, useRef} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, StatusBar} from 'react-native';
import { Colors } from '../../../../Themes/MyColors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Button from '../../../../Components/Button';
import InputField from '../../../../Components/InputField';
import AppImagePicker from '../../../../Components/AppImagePicker';
import Loader from '../../../../Components/Loader';
import { updateVehicle } from '../../../../Config/firebase';
import { showMessageAlert } from '../../../../Lib/utils/CommonHelper';

const ProviderCars = ({navigation, route}) => {
  const { type, canDeliver, selectedNumber, car, isEdit, vehicleId } = route.params || {};
  const isEditMode = isEdit || !!car;

  const [cars, setCars] = useState(
    isEditMode
      ? [{
          make: car.make || '',
          model: car.model || '',
          variant: car.variant || '',
          rent: car.rent || '',
          photo: car.photo || null,
          previousPhotoUrl: car.photo || null,
        }]
      : Array.from({ length: selectedNumber || 1 }, () => ({
          make: '',
          model: '',
          variant: '',
          rent: '',
          photo: null,
          previousPhotoUrl: null,
        }))
  );
  const [activeCarIndex, setActiveCarIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const bottomSheetModalRef = useRef(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
          <View style={styles.headerContainer}>
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.headerBack}
            >
              <Ionicons name="chevron-back" size={24} color={Colors.WHITE} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{isEditMode ? 'Edit Car' : 'Adddd Car'}</Text>
            <TouchableOpacity style={styles.headerRight} />
          </View>
      ),
    });
  }, [navigation, isEditMode]);

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

  const handleInputChange = (index, field, value) => {
    try {
      const updatedCars = [...cars];
      updatedCars[index] = {
        ...updatedCars[index],
        [field]: value,
      };
      setCars(updatedCars);
    } catch (error) {
      console.error('Error updating input:', error);
    }
  };

  const handleUploadPhoto = (index) => {
    try {
      setActiveCarIndex(index);
      bottomSheetModalRef.current?.present();
    } catch (error) {
      console.error('Error opening image picker:', error);
      Alert.alert('Error', 'Failed to open image picker. Please try again.');
    }
  };

  const handleImageSelected = async (file) => {
    if (activeCarIndex === null) {return;}

    try {
      // Validate file
      if (!file || !file.uri) {
        console.error('Invalid file selected');
        return;
      }

      // Store the entire file object
      const newCars = [...cars];
      newCars[activeCarIndex] = {
        ...newCars[activeCarIndex],
        photo: file, // Store the entire file object
        previousPhotoUrl: newCars[activeCarIndex].photo?.uri || newCars[activeCarIndex].photoUrl,
      };
      setCars(newCars);
    } catch (error) {
      console.error('Error handling image selection:', error);
      Alert.alert('Error', 'Failed to process image. Please try again.');
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const carData = cars[0];

      // Validate required fields
      if (!carData.make || !carData.model || !carData.variant || !carData.rent) {
        showMessageAlert('Error', 'Please fill in all required fields', 'danger');
        return;
      }

      // Format the data
      const updatedCar = {
        make: carData.make.trim(),
        model: carData.model.trim(),
        variant: carData.variant.trim(),
        rent: carData.rent.trim(),
        photo: carData.photo,
        verified: false,
        vendorId: carData.vendorId || route.params?.car?.vendorId,
        updatedAt: new Date().toISOString(),
      };

      if (isEditMode && vehicleId) {
        const result = await updateVehicle(vehicleId, updatedCar, type);

        if (result) {
          showMessageAlert('Success', 'Vehicle updated successfully', 'success');
          // Navigate back to the tab navigator
          navigation.navigate('ProviderTabs', {
            screen: 'MyCars',
            params: { refresh: true },
          });
        } else {
          throw new Error('Update failed');
        }
      } else {
        navigation.navigate('BankDetails', { cars, type, canDeliver });
      }
    } catch (error) {
      console.error('Error updating car:', error);
      showMessageAlert('Error', 'Failed to update car: ' + error.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const renderCarForm = (car, idx) => (
    <View key={idx} style={styles.card}>
      <View style={styles.row}>
        <InputField
          placeholder="Make"
          value={car.make}
          onChangeText={text => handleInputChange(idx, 'make', text)}
        />
        <InputField
          placeholder="Model"
          value={car.model}
          onChangeText={text => handleInputChange(idx, 'model', text)}
        />
      </View>
      <View style={styles.row}>
        <InputField
          placeholder="Variant"
          value={car.variant}
          onChangeText={text => handleInputChange(idx, 'variant', text)}
        />
        <InputField
          placeholder="Rent"
          value={car.rent}
          keyboardType="numeric"
          onChangeText={text => handleInputChange(idx, 'rent', text)}
        />
      </View>
      <View style={styles.photoRow}>
        <Button
          title={car.photo ? 'Change Photo' : 'Upload Photo'}
          onPress={() => handleUploadPhoto(idx)}
          buttonStyle={{paddingHorizontal: 10}}
          type="primary"
        />
        {car.photo && (
          <Image
            source={getImageSource(car.photo)}
            style={styles.thumbnail}
            onError={(e) => {
              console.error('Image loading error:', e.nativeEvent.error);
              Alert.alert('Error', 'Failed to load image. Please try uploading again.');
            }}
          />
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.BACKGROUND_GREY} />
      <ScrollView contentContainerStyle={{paddingBottom: 100}}>
        {cars.map((car, idx) => renderCarForm(car, idx))}
      </ScrollView>
      <View style={styles.buttonWrapper}>
        <Button
          title={isEditMode ? 'Update Car' : 'Continue'}
          onPress={handleUpdate}
          type="primary"
          loading={loading}
        />
      </View>
      <AppImagePicker
        bottomSheetModalRef={bottomSheetModalRef}
        onImageSelected={handleImageSelected}
      />
      {loading && (
        <View style={styles.loaderOverlay}>
          <Loader />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_GREY,
  },
  card: {
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
    margin: 16,
    padding: 16,
    elevation: 2,
    shadowColor: Colors.BLACK,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  row: {
    marginBottom: 10,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginLeft: 12,
    borderWidth: 1,
    borderColor: Colors.LINE_GRAY,
  },
  buttonWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: 'transparent',
  },
  headerContainer: {
    backgroundColor: Colors.BACKGROUND_GREY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LINE_GRAY,
  },
  headerBack: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 3,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.BLACK,
    textAlign: 'center',
    flex: 1,
  },
  headerRight: {
    width: 40,
    height: 40,
  },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});

export default ProviderCars;
