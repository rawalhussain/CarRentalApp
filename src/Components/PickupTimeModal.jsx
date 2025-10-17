import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../Themes/MyColors';
import ModalHeader from './ModalHeader';

const { height: screenHeight } = Dimensions.get('window');

const PickupTimeBottomSheet = ({
  bottomSheetRef,
  onSelectTime,
  selectedOption = 'later', // Default to 'later' as shown in the image
}) => {
  const [selected, setSelected] = useState(selectedOption);

  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => ['40%'], []);

  // Handle sheet changes
  const handleSheetChanges = useCallback((index) => {
    if (index === -1) {
      // Sheet is closed, do nothing as parent handles it
    }
  }, []);

  // Backdrop component
  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.3}
      />
    ),
    []
  );

  const handleOptionSelect = (option) => {
    setSelected(option);
  };

  const handleDone = () => {
    onSelectTime(selected);
    bottomSheetRef.current?.close();
  };

  const handleBack = () => {
    bottomSheetRef.current?.close();
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={true}
      handleIndicatorStyle={styles.dragHandle}
      backgroundStyle={styles.bottomSheetBackground}
    >
      <BottomSheetView style={styles.bottomSheetContent}>
        <ModalHeader
          title="When do you need a ride?"
          onBack={handleBack}
          showBackButton={true}
        />

        <View style={styles.optionsContainer}>
          {/* Now Option */}
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => handleOptionSelect('now')}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Now</Text>
              <Text style={styles.optionSubtitle}>Request a ride, hop-in, and go</Text>
            </View>
            <View style={styles.radioButtonContainer}>
              <View style={[
                styles.radioButton,
                selected === 'now' && styles.radioButtonSelected,
              ]}>
                {selected === 'now' && <View style={styles.radioButtonInner} />}
              </View>
            </View>
          </TouchableOpacity>

          {/* Later Option */}
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => handleOptionSelect('later')}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Later</Text>
              <Text style={styles.optionSubtitle}>Reserve for extra peace of mind</Text>
            </View>
            <View style={styles.radioButtonContainer}>
              <View style={[
                styles.radioButton,
                selected === 'later' && styles.radioButtonSelected,
              ]}>
                {selected === 'later' && <View style={styles.radioButtonInner} />}
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Done Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: Colors.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomSheetContent: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_GREY,
    paddingBottom: 20,
  },
  dragHandle: {
    width: 100,
    height: 4,
    backgroundColor: Colors.SLIDER_GRAY,
    borderRadius: 2,
  },
  optionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // paddingVertical: 16,
    marginVertical: 5,
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 7,
    backgroundColor: '#EEEEEE',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.BLACK,
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: Colors.PRIMARY_GREY,
    lineHeight: 20,
  },
  radioButtonContainer: {
    marginLeft: 16,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.BLACK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: Colors.BLACK,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.BLACK,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  doneButton: {
    backgroundColor: Colors.PRIMARY,
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.WHITE,
  },
});

export default PickupTimeBottomSheet;
