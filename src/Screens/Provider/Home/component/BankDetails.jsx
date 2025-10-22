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
import useAuthStore from '../../../../store/useAuthStore';
import useUserStore from '../../../../store/useUserStore';
import {showMessageAlert} from '../../../../Lib/utils/CommonHelper';
import Loader from '../../../../Components/Loader';
import {
  saveBankDetailsAndPreferences,
  saveCarsWithImages,
  uploadFile,
} from '../../../../Config/firebase';

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

  const uploadCarImages = async (car, userId) => {
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

      const filename = `${Date.now()}_${car.make}_${car.model}.jpg`;
      const path = `cars/${userId}/${filename}`;

      // Use the uploadFile function from firebase config
      return await uploadFile(fileUri, path);
    } catch (error) {
      console.error('Error uploading image:', error);
      // Don't throw error, just return null to continue without image
      return null;
    }
  };

  const saveDataToFirebase = async () => {
    try {
      setLoading(true);
      // Check if user is authenticated - handle different user object structures
      let userId = null;
      if (user?.uid) {
        userId = user.uid;
      } else if (user?.user?.uid) {
        userId = user.user.uid;
      } else if (typeof user === 'string') {
        userId = user;
      }

      if (!userId) {
        console.error('User not authenticated - user object:', user);
        throw new Error('User not authenticated. Please login again.');
      }
      // Process cars and upload images
      const processedCars = await Promise.all(
        cars.map(async car => {
          // If there's no photo, just return the car data without uploading
          if (!car.photo) {
            return {
              make: car.make,
              model: car.model,
              variant: car.variant,
              rent: car.rent,
              vendorId: userId,
              createdAt: new Date().toISOString(),
              verified: false,
              photo: null,
            };
          }

          // Upload image if photo exists
          const imageUrl = await uploadCarImages(car, userId);
          return {
            make: car.make,
            model: car.model,
            variant: car.variant,
            rent: car.rent,
            vendorId: user.uid,
            createdAt: new Date().toISOString(),
            verified: false,
            photo: imageUrl || null,
          };
        }),
      );
      // Save cars to Firebase (without images for now)
      await saveCarsWithImages(userId, processedCars, type);

      // Update user profile with bank details and preferences
      const userUpdate = await saveBankDetailsAndPreferences(userId, {
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
      console.error('Error saving data:', error);
      showMessageAlert(
        'Error',
        `Failed to save data: ${error.message || 'Unknown error'}`,
        'danger',
      );
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
