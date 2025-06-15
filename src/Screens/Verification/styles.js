import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  // ===== Common Layout =====
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 24,
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
  },

  // ===== Text Headers =====
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },

  // ===== Inputs =====
  phoneInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 20,
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

  // ===== Stepper =====
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
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
    right: -((width / 3 - 20) / 2),
    height: 2,
    width: (width / 3) - 40,
    backgroundColor: '#ccc',
  },

  // ===== From index.jsx (emoji steps intro) =====
  stepsWrapper: {
    marginBottom: 60,
    alignItems: 'center',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 30,
  },
  iconColumn: {
    width: 50,
    alignItems: 'center',
    position: 'relative',
  },
  emojiWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: '#d21f3c',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 20,
  },
  verticalLine: {
    position: 'absolute',
    top: 44,
    height: 30,
    borderLeftWidth: 1,
    borderColor: '#d21f3c',
    borderStyle: 'dotted',
  },
  textColumn: {
    justifyContent: 'center',
    paddingLeft: 10,
    flex: 1,
  },
  stepLabelText: {
    fontSize: 15,
    color: '#000',
  },

  // ===== Button =====
  continueButton: {
    backgroundColor: '#d21f3c',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    width: width * 0.9,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  countryItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    marginTop: 20,
    alignItems: 'center',
  },

  // ===== Scan box for license step =====
  scanBox: {
    height: 90,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  scanBoxText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
});

export default styles;
