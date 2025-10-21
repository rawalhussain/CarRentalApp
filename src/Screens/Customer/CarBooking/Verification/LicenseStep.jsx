import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  Image,
} from 'react-native';
import { Icons } from '../../../../Themes/icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import styles from './styles';
import Steps from './Steps';
import { SafeAreaView } from 'react-native-safe-area-context';
import MainHeader from '../../../../Components/MainHeader';
import { useNavigation } from '@react-navigation/native';
import AppImagePicker from '../../../../Components/AppImagePicker'; 
import { Colors } from '../../../../Themes/MyColors';
import Button from '../../../../Components/Button';
const LicenseStep = ({ onNext }) => {
  const navigation = useNavigation();
  const bottomSheetModalRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    country: '',
    state: '',
    firstName: '',
    middleName: '',
    lastName: '',
    licenseNumber: '',
  });
  
  const [dob, setDob] = useState(null);
  const [expiry, setExpiry] = useState(null);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [scannedImage, setScannedImage] = useState(null);

  const formatDate = (date) =>
    date ? date.toLocaleDateString('en-US') : '';

  // Form validation schema
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
    if (!dob) newErrors.dob = 'Date of birth is required';
    if (!expiry) newErrors.expiry = 'Expiration date is required';
    
    // Check if expiry date is in the future
    if (expiry && expiry <= new Date()) {
      newErrors.expiry = 'License must not be expired';
    }
    
    // Check if DOB is reasonable (not in future, not too old)
    if (dob && dob > new Date()) {
      newErrors.dob = 'Date of birth cannot be in the future';
    }
    
    if (dob && new Date().getFullYear() - dob.getFullYear() > 120) {
      newErrors.dob = 'Please enter a valid date of birth';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle image selection from camera/gallery
  const handleImageSelected = (image) => {
    setScannedImage(image);
    // Image is stored for verification purposes only
    // User must fill all fields manually
  };

  // Handle scan box press
  const handleScanPress = () => {
    if (scannedImage) {
      // If image is already selected, show options to rescan or remove
      Alert.alert(
        'Rescan License',
        'Do you want to scan a new image or remove the current one?',
        [
          { text: 'Remove', onPress: () => setScannedImage(null) },
          { text: 'Rescan', onPress: () => bottomSheetModalRef.current?.present() },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } else {
      bottomSheetModalRef.current?.present();
    }
  };

  // Handle continue button
  const handleContinue = () => {
    if (validateForm()) {
      onNext();
    } else {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
    <MainHeader 
        title="License Verification"
        showBackButton={true}
        showOptionsButton={false}
        onBackPress={() => navigation.goBack()}
      />
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
    <Steps currentStep={1} verifiedStep={true} />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* <Text style={styles.subtitle}>
          Scan your driver’s license or enter your information exactly as it appears on your license.
        </Text> */}

        {/* Scan Box */}
        <Pressable style={styles.scanBox} onPress={handleScanPress}>
          {scannedImage ? (
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: scannedImage.uri }} 
                style={styles.selectedImage}
                resizeMode="cover"
              />
              <View style={styles.imageOverlay}>
                <View style={styles.editIconContainer}>
                  <Image source={Icons.edit} style={styles.editIcon} />
                  <Text style={styles.editText}>Edit Image</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <Image source={Icons.license} style={styles.placeholderIcon} />
              <Text style={styles.scanBoxText}>Select License Image</Text>
              <Text style={styles.scanBoxSubtext}>Tap to choose from camera or gallery</Text>
            </View>
          )}
        </Pressable>

        {/* Form Inputs */}
        <View>
          <TextInput 
            placeholder="Country" 
            style={[styles.phoneInput, errors.country && styles.phoneInputError]} 
            placeholderTextColor={Colors.PRIMARY_GREY}
            color={Colors.BLACK}  
            value={formData.country}
            onChangeText={(value) => handleInputChange('country', value)}
          />
          {errors.country && <Text style={styles.errorText}>{errors.country}</Text>}
        </View>

        <View>
          <TextInput 
            placeholder="State" 
            style={[styles.phoneInput, errors.state && styles.phoneInputError]} 
            placeholderTextColor={Colors.PRIMARY_GREY}
            color={Colors.BLACK}  
            value={formData.state}
            onChangeText={(value) => handleInputChange('state', value)}
          />
          {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
        </View>

        <View>
          <TextInput 
            placeholder="First Name" 
            style={[styles.phoneInput, errors.firstName && styles.phoneInputError]} 
            placeholderTextColor={Colors.PRIMARY_GREY}
            color={Colors.BLACK}  
            value={formData.firstName}
            onChangeText={(value) => handleInputChange('firstName', value)}
          />
          {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
        </View>

        <View>
          <TextInput 
            placeholder="Middle Name" 
            style={styles.phoneInput} 
            placeholderTextColor={Colors.PRIMARY_GREY}
            color={Colors.BLACK}  
            value={formData.middleName}
            onChangeText={(value) => handleInputChange('middleName', value)}
          />
        </View>

        <View>
          <TextInput 
            placeholder="Last Name" 
            style={[styles.phoneInput, errors.lastName && styles.phoneInputError]} 
              placeholderTextColor={Colors.PRIMARY_GREY}
              color={Colors.BLACK}  
            value={formData.lastName}
            onChangeText={(value) => handleInputChange('lastName', value)}
          />
          {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
        </View>

        <View>
          <TextInput 
            placeholder="License Number" 
            style={[styles.phoneInput, errors.licenseNumber && styles.phoneInputError]} 
            placeholderTextColor={Colors.PRIMARY_GREY}
            color={Colors.BLACK}  
            value={formData.licenseNumber}
            onChangeText={(value) => handleInputChange('licenseNumber', value)}
          />
          {errors.licenseNumber && <Text style={styles.errorText}>{errors.licenseNumber}</Text>}
        </View>

        {/* DOB */}
        <View>
          <Pressable 
            onPress={() => setShowDobPicker(true)} 
            style={[styles.phoneInput, errors.dob && styles.phoneInputError]}
          >
            <Text style={dob ? styles.dateText : styles.placeholderText}>
              {dob ? formatDate(dob) : 'Date of birth'}
            </Text>
          </Pressable>
          {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}
        </View>

        {/* Expiration */}
        <View>
          <Pressable 
            onPress={() => setShowExpiryPicker(true)} 
            style={[styles.phoneInput, errors.expiry && styles.phoneInputError]}
          >
            <Text style={expiry ? styles.dateText : styles.placeholderText}>
              {expiry ? formatDate(expiry) : 'Expiration Date'}
            </Text>
          </Pressable>
          {errors.expiry && <Text style={styles.errorText}>{errors.expiry}</Text>}
        </View>

        {/* Date Pickers */}
        {showDobPicker && (
          <DateTimePicker
            value={dob || new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDobPicker(false);
              if (selectedDate) {setDob(selectedDate);}
            }}
          />
        )}

        {showExpiryPicker && (
          <DateTimePicker
            value={expiry || new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowExpiryPicker(false);
              if (selectedDate) {setExpiry(selectedDate);}
            }}
          />
        )}
      
      </ScrollView>
    </KeyboardAvoidingView>
    <View style={styles.bottomButtonContainerLicense}>
        <Button title="Continue" onPress={handleContinue} buttonStyle={styles.continueButtonLicense} />
        </View>
    <AppImagePicker 
      bottomSheetModalRef={bottomSheetModalRef}
      onImageSelected={handleImageSelected}
    />
    </SafeAreaView>
  );
};

export default LicenseStep;
