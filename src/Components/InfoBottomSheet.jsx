import React, { useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../Themes/MyColors';
import MainHeader from './MainHeader';

const InfoBottomSheet = ({
  bottomSheetRef,
  type = 'report', // 'report' or 'cancellation'
  onClose,
}) => {
  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => ['60%'], []);

  // Handle sheet changes
  const handleSheetChanges = useCallback((index) => {
    if (index === -1) {
      onClose && onClose();
    }
  }, [onClose]);

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

  const handleBack = () => {
    bottomSheetRef.current?.close();
  };

  const renderReportContent = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Report This Listing</Text>
      <Text style={styles.subtitle}>
        Help us keep our community safe by reporting any issues with this listing.
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why are you reporting this listing?</Text>
        
        <TouchableOpacity style={styles.optionItem}>
          <View style={styles.optionContent}>
            <Ionicons name="warning-outline" size={20} color={Colors.PRIMARY} />
            <Text style={styles.optionText}>Inaccurate information</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.gray5} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionItem}>
          <View style={styles.optionContent}>
            <Ionicons name="car-outline" size={20} color={Colors.PRIMARY} />
            <Text style={styles.optionText}>Vehicle condition issues</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.gray5} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionItem}>
          <View style={styles.optionContent}>
            <Ionicons name="person-outline" size={20} color={Colors.PRIMARY} />
            <Text style={styles.optionText}>Host behavior concerns</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.gray5} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionItem}>
          <View style={styles.optionContent}>
            <Ionicons name="location-outline" size={20} color={Colors.PRIMARY} />
            <Text style={styles.optionText}>Location problems</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.gray5} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionItem}>
          <View style={styles.optionContent}>
            <Ionicons name="shield-outline" size={20} color={Colors.PRIMARY} />
            <Text style={styles.optionText}>Safety concerns</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.gray5} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionItem}>
          <View style={styles.optionContent}>
            <Ionicons name="ellipsis-horizontal-outline" size={20} color={Colors.PRIMARY} />
            <Text style={styles.optionText}>Other</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.gray5} />
        </TouchableOpacity>
      </View>

      <View style={styles.noteSection}>
        <Ionicons name="information-circle-outline" size={20} color={Colors.PRIMARY} />
        <Text style={styles.noteText}>
          Your report will be reviewed by our team. We take all reports seriously and will investigate accordingly.
        </Text>
      </View>
    </ScrollView>
  );

  const renderCancellationContent = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Cancellation Policy</Text>
      <Text style={styles.subtitle}>
        Understanding our cancellation policy helps you make informed decisions.
      </Text>

      <View style={styles.section}>
        <View style={styles.policyCard}>
          <View style={styles.policyHeader}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.green} />
            <Text style={styles.policyTitle}>Free Cancellation</Text>
          </View>
          <Text style={styles.policyDescription}>
            Cancel before pickup time for a full refund. No questions asked.
          </Text>
          <Text style={styles.policyTime}>
            Available until: Mar 13, 2:00 PM
          </Text>
        </View>

        <View style={styles.policyCard}>
          <View style={styles.policyHeader}>
            <Ionicons name="time-outline" size={24} color={Colors.orange} />
            <Text style={styles.policyTitle}>Partial Refund</Text>
          </View>
          <Text style={styles.policyDescription}>
            Cancel after pickup time but before trip starts for 50% refund.
          </Text>
          <Text style={styles.policyTime}>
            Available: Mar 13, 2:00 PM - Mar 14, 2:00 PM
          </Text>
        </View>

        <View style={styles.policyCard}>
          <View style={styles.policyHeader}>
            <Ionicons name="close-circle" size={24} color={Colors.red} />
            <Text style={styles.policyTitle}>No Refund</Text>
          </View>
          <Text style={styles.policyDescription}>
            No refund available after trip has started.
          </Text>
          <Text style={styles.policyTime}>
            After: Mar 14, 2:00 PM
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Important Notes</Text>
        
        <View style={styles.noteItem}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.PRIMARY} />
          <Text style={styles.noteText}>
            All times are based on the local timezone of the pickup location.
          </Text>
        </View>

        <View style={styles.noteItem}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.PRIMARY} />
          <Text style={styles.noteText}>
            Refunds are processed within 5-7 business days to your original payment method.
          </Text>
        </View>

        <View style={styles.noteItem}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.PRIMARY} />
          <Text style={styles.noteText}>
            Contact our support team if you have any questions about your cancellation.
          </Text>
        </View>
      </View>

      {/* <View style={styles.contactSection}>
        <TouchableOpacity style={styles.contactButton}>
          <Ionicons name="headset-outline" size={20} color={Colors.white} />
          <Text style={styles.contactButtonText}>Contact Support</Text>
        </TouchableOpacity>
      </View> */}
    </ScrollView>
  );

  const getHeaderTitle = () => {
    return type === 'report' ? 'Report Listing' : 'Cancellation Policy';
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
        <MainHeader
          title={getHeaderTitle()}
          onBackPress={handleBack}
          showOptionsButton={false}
          backgroundColor={Colors.white}
          showBorder={true}
        />
        {type === 'report' ? renderReportContent() : renderCancellationContent()}
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: Colors.white,
  },
  bottomSheetContent: {
    flex: 1,
  },
  dragHandle: {
    backgroundColor: Colors.gray5,
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray3,
    marginBottom: 24,
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.gray6,
    borderRadius: 12,
    marginBottom: 8,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    color: Colors.black,
    marginLeft: 12,
    fontWeight: '500',
  },
  policyCard: {
    backgroundColor: Colors.gray6,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  policyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
    marginLeft: 8,
  },
  policyDescription: {
    fontSize: 14,
    color: Colors.gray2,
    lineHeight: 20,
    marginBottom: 8,
  },
  policyTime: {
    fontSize: 12,
    color: Colors.PRIMARY,
    fontWeight: '500',
  },
  noteSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.blue1,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  noteText: {
    fontSize: 14,
    color: Colors.gray2,
    lineHeight: 20,
    marginLeft: 8,
    flex: 1,
  },
  contactSection: {
    marginTop: 16,
    marginBottom: 24,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginLeft: 8,
  },
});

export default InfoBottomSheet;
