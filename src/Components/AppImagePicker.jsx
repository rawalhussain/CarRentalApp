import React, {useCallback, useMemo} from 'react';
import {
    Alert,
    View,
    Text,
    PermissionsAndroid,
    Platform,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {BottomSheetModal, BottomSheetModalProvider, BottomSheetView} from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Colors} from '../Themes/MyColors';

export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
export const MAX_VIDEO_SIZE_MB = 100; // Maximum file size in MB
export const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

const AppImagePicker = ({bottomSheetModalRef, onImageSelected}) => {
    const snapPoints = useMemo(() => ['30%', '35%'], []);
    const handleSheetChanges = useCallback((index) => {}, []);

    const OptionItem = ({iconName, label, onPress}) => (
        <TouchableOpacity style={styles.optionItem} onPress={onPress}>
            <Icon name={iconName} size={36} color={Colors.PRIMARY} />
            <Text style={{color: Colors.BLACK}}>{label}</Text>
        </TouchableOpacity>
    );

    const requestCameraPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
                    title: 'Camera Permission',
                    message: 'Afrocart needs access to your camera',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                });
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true;
    };

    const requestStoragePermission = async () => {
        if (Platform.OS === 'android') {
            const version = parseInt(Platform.Version, 10);

            if (version >= 34) {
                try {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                        {
                            title: 'Storage Permission',
                            message: 'Afrocart needs access to your gallery',
                            buttonNeutral: 'Ask Me Later',
                            buttonNegative: 'Cancel',
                            buttonPositive: 'OK',
                        },
                    );
                    return granted === PermissionsAndroid.RESULTS.GRANTED;
                } catch (err) {
                    console.warn('Permission request failed', err);
                    return false;
                }
            } else {
                try {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                        {
                            title: 'Storage Permission',
                            message: 'Afrocart needs access to your gallery',
                            buttonNeutral: 'Ask Me Later',
                            buttonNegative: 'Cancel',
                            buttonPositive: 'OK',
                        },
                    );

                    return granted === PermissionsAndroid.RESULTS.GRANTED;
                } catch (err) {
                    console.warn('Permission request failed', err);
                    return false;
                }
            }
        }
        return true;
    };

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
            response => {
                handleImageResponse(response);
            },
        );
    };

    const handleLaunchImageLibrary = async () => {
        const hasPermission = await requestStoragePermission();
        if (!hasPermission) {
            Alert.alert('Permission Denied', 'Storage access is required to select images or videos.');
            return;
        }

        await launchImageLibrary(
            {
                mediaType: 'mixed',
                includeBase64: false,
            },
            response => {
                handleImageResponse(response);
            },
        );
    };

    const handleImageResponse = (response) => {
        if (response.didCancel) {
        } else if (response.errorMessage) {
            Alert.alert('Error', 'An error occurred while selecting a file.');
        } else if (response.assets && response.assets.length > 0) {
            const file = response.assets[0];
            if (file.type?.includes('image') && (file?.fileSize || 0) > MAX_IMAGE_SIZE_BYTES) {
                Alert.alert('Error', 'Image size exceeds the maximum allowed size of 5MB');
            } else if (file.type?.includes('video') && (file?.fileSize || 0) > MAX_VIDEO_SIZE_BYTES) {
                Alert.alert('Error', 'Video size exceeds the maximum allowed size of 100MB');
            } else {
                bottomSheetModalRef.current?.dismiss();
                onImageSelected(file);
            }
        }
    };

    return (
        <BottomSheetModalProvider>
            <BottomSheetModal
                ref={bottomSheetModalRef}
                index={1}
                snapPoints={snapPoints}
                onChange={handleSheetChanges}>
                <BottomSheetView style={styles.container}>
                    <Text style={[styles.sheetTitle, {color: Colors.BLACK}]}>Choose your option</Text>
                    <View style={styles.optionsContainer}>
                        <OptionItem
                            iconName="add-photo-alternate"
                            label="Gallery"
                            onPress={handleLaunchImageLibrary}
                        />
                        <OptionItem iconName="add-a-photo" label="Take Photo" onPress={handleLaunchCamera} />
                    </View>
                </BottomSheetView>
            </BottomSheetModal>
        </BottomSheetModalProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.WHITE,
        marginBottom: 20,
    },
    sheetTitle: {
        textAlign: 'center',
        fontSize: 20,
    },
    optionsContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 50,
        paddingBottom: 30,
    },
    optionItem: {
        height: 100,
        width: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default AppImagePicker;
