import React, { useCallback, useMemo } from 'react';
import {
  Alert,
  View,
  Text,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../Themes/MyColors';
import ModalHeader from './ModalHeader';

export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
export const MAX_VIDEO_SIZE_MB = 100;
export const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

const AppImagePicker = ({ bottomSheetModalRef, onImageSelected }) => {
  const snapPoints = useMemo(() => ['30%', '35%'], []);
  const handleSheetChanges = useCallback(() => {}, []);

  const OptionItem = ({ iconName, label, onPress }) => (
    <TouchableOpacity style={styles.optionItem} onPress={onPress}>
      <Icon name={iconName} size={36} color={Colors.PRIMARY} />
      <Text style={{ color: Colors.BLACK }}>{label}</Text>
    </TouchableOpacity>
  );

  // ✅ CAMERA PERMISSION
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to your camera to take photos.',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Camera permission error:', err);
        return false;
      }
    }
    return true;
  };

  // ✅ GALLERY/STORAGE PERMISSION
  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      const version = parseInt(Platform.Version, 10);

      try {
        if (version >= 33) {
          // Android 13+ - Use new media permissions
          const grantedImages = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            {
              title: 'Gallery Permission',
              message: 'This app needs access to your photos to select images.',
              buttonPositive: 'OK',
              buttonNegative: 'Cancel',
            }
          );
          
          // For video support, also request video permission
          const grantedVideo = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
            {
              title: 'Video Permission',
              message: 'This app needs access to your videos to select media.',
              buttonPositive: 'OK',
              buttonNegative: 'Cancel',
            }
          );
          
          return (
            grantedImages === PermissionsAndroid.RESULTS.GRANTED ||
            grantedVideo === PermissionsAndroid.RESULTS.GRANTED
          );
        } else {
          // Android 12 and below - Use legacy storage permissions
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission',
              message: 'This app needs access to your gallery to select images.',
              buttonPositive: 'OK',
              buttonNegative: 'Cancel',
            }
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch (err) {
        console.warn('Storage permission error:', err);
        return false;
      }
    }
    return true;
  };

  // ✅ CAMERA HANDLER
  const handleLaunchCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera access is required to take photos.');
      return;
    }

    await launchCamera(
      {
        mediaType: 'photo',
        includeBase64: false,
      },
      handleImageResponse
    );
  };

  // ✅ GALLERY HANDLER
  const handleLaunchImageLibrary = async () => {
    console.log('handleLaunchImageLibrary called');
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Gallery access is required to select photos or videos.'
      );
      return;
    }

    await launchImageLibrary(
      {
        mediaType: 'mixed',
        includeBase64: false,
      },
      handleImageResponse
    );
  };

  // ✅ RESPONSE HANDLER
  const handleImageResponse = (response) => {
    if (response.didCancel) return;
    if (response.errorMessage) {
      Alert.alert('Error', 'An error occurred while selecting a file.');
      return;
    }

    const file = response?.assets?.[0];
    if (!file) return;

    if (file.type?.includes('image') && file.fileSize > MAX_IMAGE_SIZE_BYTES) {
      Alert.alert('Error', 'Image size exceeds 5MB limit.');
      return;
    }
    if (file.type?.includes('video') && file.fileSize > MAX_VIDEO_SIZE_BYTES) {
      Alert.alert('Error', 'Video size exceeds 100MB limit.');
      return;
    }

    bottomSheetModalRef.current?.dismiss();
    onImageSelected(file);
  };

  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
      >
        <BottomSheetView style={styles.container}>
        <ModalHeader title="Choose your option"  onBack={() => bottomSheetModalRef.current?.dismiss()}  showBackButton={true} />

          <View style={styles.optionsContainer}>
            <OptionItem
              iconName="add-photo-alternate"
              label="Gallery"
              onPress={handleLaunchImageLibrary}
            />
            <OptionItem
              iconName="add-a-photo"
              label="Take Photo"
              onPress={handleLaunchCamera}
            />
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_GREY,
    // marginBottom: 20,
  },
  sheetTitle: {
    textAlign: 'center',
    fontSize: 20,
    marginTop: 10,
  },
  optionsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 50,
    paddingBottom: 50,
    paddingTop: 20,
    backgroundColor: Colors.BACKGROUND_GREY,
  },
  optionItem: {
    height: 100,
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: 'red',
  },
});

export default AppImagePicker;
