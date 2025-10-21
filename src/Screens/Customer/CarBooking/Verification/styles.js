import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../../../Themes/MyColors';
import { Fonts } from '../../../../Themes';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  // ===== Common Layout =====
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backIcon: {
    fontSize: 24,
    color: '#d21f3c',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerDots: {
    fontSize: 18,
    color: '#999',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  body: {
    marginTop: 20,
    paddingHorizontal: 20,
    // marginBottom: 20,
  },

  // ===== Text Headers =====
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: Colors.black,
  },
  subtitle: {
    fontSize: 14,
    color: "#0F0F0FB5",
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },

  // ===== Inputs =====
  phoneInput: {
    borderWidth: 1,
    borderColor: '#E8ECF4',
    padding: 14,
    borderRadius: 10,
    fontSize: 15,
    marginBottom: 20,
    backgroundColor: '#F7F8F9',
  },
  phoneInputError: {
    borderColor: '#d21f3c',
    borderWidth: 2,
  },
  phoneInputValid: {
    borderColor: '#28a745',
    borderWidth: 2,
  },
  errorText: {
    color: '#d21f3c',
    fontSize: 12,
    marginTop: -15,
    marginBottom: 10,
  },
  successText: {
    color: '#28a745',
    fontSize: 12,
    marginTop: -15,
    marginBottom: 10,
  },

  // ===== OTP Input Step =====
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 30,
    marginHorizontal: 20,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: 50,
    height: 50,
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 20,
  },
  resendText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  resendLink: {
    color: '#d21f3c',
    fontWeight: 'bold',
  },
  resendDisabled: {
    color: '#999',
    fontWeight: 'normal',
  },

  // ===== Stepper =====
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  stepCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepActive: {
    borderColor: '#d21f3c',
  },
  stepCompleted: {
    backgroundColor: '#d21f3c',
    borderColor: '#d21f3c',
  },
  stepTick: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 6,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: '#d21f3c',
    fontWeight: '600',
  },
  stepLine: {
    position: 'absolute',
    top: 9,
    right: -((width / 3 - 36) / 2),
    height: 2,
    width: (width / 3) - 40,
    backgroundColor: '#ccc',
  },

  // ===== From index.jsx (icon steps intro) =====
  stepsWrapper: {
    marginBottom: 16,
    alignItems: 'flex-start',
    // paddingLeft: 20,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  iconColumn: {
    width: 60,
    alignItems: 'center',
    position: 'relative',
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#FF0D11F0",
    // backgroundColor: "#FF0D11F0",
    // backgroundColor: Colors.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIcon: {
    width: 34,
    height: 34,
    // tintColor: '#fff',
  },
  phoneStep:{
    width: 34,
    height: 34,
  },
  otpStep:{
    width: 34,
    height: 34,
  },
  licenseStep:{
    width: 33,
    height: 25,
  },
  paymentStep:{
    width: 41,
    height: 41,
  },
  verticalLine: {
    position: 'absolute',
    top: 62,  
    height: 37,
    width: 2,
    borderLeftWidth: 3,
   
    borderColor: '#d21f3c',
    borderStyle: 'dotted',
    left: 29,
  },
  textColumn: {
    justifyContent: 'center',
    paddingLeft: 20,
    flex: 1,
  },
  stepLabelText: {
    fontSize: 18,
    color: "#000000",
    fontWeight: '500',
  },

  // ===== Button =====
  bottomButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    paddingTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',

  },
  continueButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
    // marginHorizontal: 20,
  },
  continueButtonLicense: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
  },
  bottomButtonContainerLicense:{
    // paddingHorizontal: 20,
    // paddingBottom: 15,
    // paddingTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    // width: '100%',
    // backgroundColor: 'red',
    marginHorizontal: 20,
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  continueTextDisabled: {
    color: '#999',
  },

  // ===== Country Dropdown (Manual) =====
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  dropdownText: {
    fontSize: 16,
    color: Colors.PRIMARY_GREY,
    fontWeight: '400',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '70%',
    backgroundColor: Colors.BACKGROUND_GREY,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    justifyContent: 'flex-start',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 0,
  },
  countryList: {
    flex: 1,
    marginBottom: 0,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    // color: '#000',
    // color: Colors.BLACK,
  },
  countryItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 0,
  },
  countryText: {
    fontSize: 16,
    color: Colors.BLACK,
  },
  scrollContainer:{
// paddingBottom: 20,
padHorizontal: 20,
marginHorizontal:20
  },

  scanBox: {
    height: 150,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  scanBoxText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  editIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editIcon: {
    width: 16,
    height: 16,
    tintColor: '#fff',
    marginRight: 6,
  },
  editText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    width: 32,
    height: 32,
    tintColor: '#999',
    marginBottom: 8,
  },
  scanBoxSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  dateText: {
    fontSize: 16,
    color: '#000',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },

  // ===== Payment Step Styles =====
  cardPreview: {
    backgroundColor: '#2C3544',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    height: 200,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardLogos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardLogoImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  cardChip: {
    width: 40,
    height: 30,
    backgroundColor: '#FFD700',
    borderRadius: 4,
    marginTop: 10,
  },
  cardName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardExpire: {
    color: '#B8BCC8',
    fontSize: 12,
    marginBottom: 10,
  },
  cardNumber: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 3,
    marginTop: 10,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
    textTransform: 'lowercase',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#E8ECF4',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F7F8F9',
  },
  dropdownLabel: {
    fontSize: 15,
    color: '#000',
  },
  defaultBadge: {
    backgroundColor: '#E8ECF4',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: 11,
    color: '#8391A1',
    fontWeight: '500',
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    tintColor: '#666',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardIconsRow: {
    position: 'absolute',
    right: 12,
    top: 12,
    flexDirection: 'row',
    gap: 4,
  },
  cardTypeIcon: {
    width: 32,
    height: 20,
    resizeMode: 'contain',
  },
  inputWithIcons: {
    position: 'relative',
  },
  cardNumberInput: {
    borderWidth: 1,
    borderColor: '#E8ECF4',
    padding: 14,
    paddingRight: 150,
    borderRadius: 10,
    fontSize: 15,
    marginBottom: 20,
    backgroundColor: '#F7F8F9',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
    marginLeft: -8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: '#000',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxInner: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 13,
    color: '#000',
    flex: 1,
    marginLeft: -4,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8ECF4',
  },
  separatorText: {
    marginHorizontal: 10,
    fontSize: 13,
    color: '#8391A1',
  },
  payButton: {
    borderWidth: 1,
    borderColor: '#E8ECF4',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    alignItems: 'center',
    backgroundColor: '#F7F8F9',
  },
  payText: {
    fontSize: 15,
    color: '#000',
    fontWeight: '500',
  },
  cvcIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  halfInputWithIcon: {
    position: 'relative',
    flex: 1,
  },
});

export default styles;
