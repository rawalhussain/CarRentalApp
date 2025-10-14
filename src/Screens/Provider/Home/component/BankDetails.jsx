import React, {useLayoutEffect, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Colors} from '../../../../Themes/MyColors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Button from '../../../../Components/Button';
import InputField from '../../../../Components/InputField';
import storage from '@react-native-firebase/storage';
import database from '@react-native-firebase/database';
import useAuthStore from '../../../../store/useAuthStore';
import useUserStore from '../../../../store/useUserStore';
import {showMessageAlert} from '../../../../Lib/utils/CommonHelper';
import Loader from '../../../../Components/Loader';
import { saveBankDetailsAndPreferences, saveCarsWithImages, uploadFile } from '../../../../Config/firebase';

const BankDetails = ({navigation, route}) => {
  const {cars, type, canDeliver} = route.params || {};
  const [loading, setLoading] = useState(false);
  const {user} = useAuthStore();
  const {userData, setUserData} = useUserStore();

  const [bankDetails, setBankDetails] = useState({
    accountHolderName: '',
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    branchName: '',
  });

  const [errors, setErrors] = useState({});

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerBack}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bank Details</Text>
          <TouchableOpacity style={styles.headerRight} />
        </View>
      ),
    });
  }, [navigation]);

  const validateAccountHolderName = name => {
    if (!name.trim()) {
      return 'Account holder name is required';
    }
    if (name.length < 3) {
      return 'Name must be at least 3 characters long';
    }
    if (!/^[a-zA-Z\s]*$/.test(name)) {
      return 'Name should only contain letters and spaces';
    }
    return '';
  };

  const validateAccountNumber = number => {
    if (!number) {
      return 'Account number is required';
    }
    if (!/^\d+$/.test(number)) {
      return 'Account number should only contain digits';
    }
    if (number.length < 9 || number.length > 18) {
      return 'Account number should be between 9 and 18 digits';
    }
    return '';
  };

  const validateBankName = name => {
    if (!name.trim()) {
      return 'Bank name is required';
    }
    if (name.length < 3) {
      return 'Bank name must be at least 3 characters long';
    }
    return '';
  };

  const validateIFSCCode = code => {
    if (!code) {
      return 'IFSC code is required';
    }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(code)) {
      return 'Invalid IFSC code format (e.g., SBIN0001234)';
    }
    return '';
  };

  const validateBranchName = name => {
    if (!name.trim()) {
      return 'Branch name is required';
    }
    if (name.length < 3) {
      return 'Branch name must be at least 3 characters long';
    }
    return '';
  };

  const handleInputChange = (field, value) => {
    setBankDetails(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    setErrors(prev => ({
      ...prev,
      [field]: '',
    }));
  };

  const validateForm = () => {
    const newErrors = {
      accountHolderName: validateAccountHolderName(
        bankDetails.accountHolderName,
      ),
      accountNumber: validateAccountNumber(bankDetails.accountNumber),
      bankName: validateBankName(bankDetails.bankName),
      ifscCode: validateIFSCCode(bankDetails.ifscCode),
      branchName: validateBranchName(bankDetails.branchName),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const uploadCarImages = async (car) => {
    try {
      if (!car.photo) {
        console.warn('No photo to upload for car');
        return null;
      }

      // Handle different photo formats
      let fileUri;
      if (typeof car.photo === 'string') {
        fileUri = car.photo;
      } else if (car.photo.uri) {
        fileUri = car.photo.uri;
      } else {
        console.warn('Invalid photo format:', car.photo);
        return null;
      }

      // Ensure fileUri is a valid string path
      if (!fileUri || typeof fileUri !== 'string') {
        console.warn('Invalid file URI:', fileUri);
        return null;
      }

      const filename = `${Date.now()}.jpg`;
      const path = `cars/${user?.user?.uid}/${filename}`;

      // Use the storage reference directly
      const reference = storage().ref(path);
      await reference.putFile(fileUri);
      return await reference.getDownloadURL();
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const saveDataToFirebase = async () => {
    try {
      setLoading(true);

      // Check if user is authenticated
      if (!user?.user?.uid) {
        throw new Error('User not authenticated');
      }

      // Process cars and upload images only if they have photos
      const processedCars = await Promise.all(
        cars.map(async (car) => {
          // If there's no photo, just return the car data without uploading
          if (!car.photo) {
            return {
              ...car,
              vendorId: user.user.uid,
              createdAt: new Date().toISOString(),
              verified: false,
            };
          }

          // Only attempt to upload if there's a photo
          const imageUrl = await uploadCarImages(car);
          return {
            ...car,
            photo: imageUrl || car.photo, // Keep existing photo if upload fails
            vendorId: user.user.uid,
            createdAt: new Date().toISOString(),
            verified: false,
          };
        })
      );

      // Save cars with images
      await saveCarsWithImages(user.user.uid, processedCars, type);

      // Update user profile with bank details and preferences
      const userUpdate = await saveBankDetailsAndPreferences(user.user.uid, {
        bankDetails,
        canDeliver,
      });

      // Update local user data
      setUserData({
        ...userData,
        ...userUpdate,
      });

      setLoading(false);
      navigation.reset({
        index: 0,
        routes: [{name: 'SubmissionSuccess'}],
      });
    } catch (error) {
      setLoading(false);
      showMessageAlert(
        'Error',
        error.message || 'Failed to save data. Please try again.',
        'danger',
      );
      console.error('Error saving data:', error);
    }
  };

  const handleContinue = async () => {
    if (!validateForm()) {
      // Find the first error message
      const firstError = Object.values(errors).find(e => e);
      showMessageAlert(
        'Validation Error',
        firstError ||
          'Please correct the errors in the form before continuing.',
        'danger',
      );
      return;
    }

    try {
      await saveDataToFirebase();
    } catch (error) {
      showMessageAlert(
        'Error',
        'Failed to save data. Please try again.',
        'danger',
      );
    }
  };

  return (
    <View style={styles.container}>
      {loading && <Loader />}
      <ScrollView contentContainerStyle={{paddingBottom: 100}}>
        <View style={styles.card}>
          <InputField
            placeholder="Account Holder Name"
            value={bankDetails.accountHolderName}
            onChangeText={text => handleInputChange('accountHolderName', text)}
            error={errors.accountHolderName}
          />
          <InputField
            placeholder="Account Number"
            value={bankDetails.accountNumber}
            onChangeText={text => handleInputChange('accountNumber', text)}
            keyboardType="numeric"
            error={errors.accountNumber}
            maxLength={18}
          />
          <InputField
            placeholder="Bank Name"
            value={bankDetails.bankName}
            onChangeText={text => handleInputChange('bankName', text)}
            error={errors.bankName}
          />
          <InputField
            placeholder="IFSC Code"
            value={bankDetails.ifscCode}
            onChangeText={text =>
              handleInputChange('ifscCode', text.toUpperCase())
            }
            autoCapitalize="characters"
            error={errors.ifscCode}
            maxLength={11}
          />
          <InputField
            placeholder="Branch Name"
            value={bankDetails.branchName}
            onChangeText={text => handleInputChange('branchName', text)}
            error={errors.branchName}
          />
        </View>
      </ScrollView>
      <View style={styles.continueBtnWrapper}>
        <Button title="Continue" onPress={handleContinue} type="primary" />
      </View>
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
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  continueBtnWrapper: {
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
});

export default BankDetails;
