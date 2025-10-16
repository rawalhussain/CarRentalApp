import { StyleSheet } from 'react-native';
import {Colors} from '../../../../Themes/MyColors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
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
  header: {
    padding: 20,
    paddingTop: 40,
  },
  // Top Bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  welcomeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  nameText: {
    fontSize: 12,
  },

  // Title Bar
  titleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Inputs
  inputContainer: {
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 10,
    position: 'relative',
  },
  label: {
    position: 'absolute',
    top: -10,
    left: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 4,
    fontSize: 12,
    color: '#999',
  },
  input: {
    fontSize: 16,
    color: '#000',
  },
  inputText: {
    fontSize: 16,
    color: '#000',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  halfInputContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 10,
    position: 'relative',
    marginHorizontal: 5,
  },

  // Delivery Options
  deliveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  deliveryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'red',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  deliveryButtonSelected: {
    backgroundColor: 'red',
  },
  deliveryText: {
    color: 'red',
    fontWeight: 'bold',
  },
  deliveryTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // Search Button
  searchButton: {
    backgroundColor: 'red',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 30,
  },
  searchText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Modal Common
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },

  // Month Navigation
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 5,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 12,
    color: '#777',
  },

  // Calendar Grid
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  dayBoxSelected: {
    backgroundColor: 'red',
    borderColor: 'red',
  },
  dayText: {
    color: '#000',
  },
  dayTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // Time Picker
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  timeBox: {
    width: 80,
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  timeBoxSelected: {
    backgroundColor: 'red',
    borderColor: 'red',
  },
  timeText: {
    color: '#000',
  },
  timeTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // Bottom Display + Next
  selectedDateText: {
    textAlign: 'center',
    color: 'red',
    fontWeight: 'bold',
    fontSize: 14,
    marginVertical: 10,
  },
  nextButton: {
    backgroundColor: 'red',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  calendar: {
    width: '100%',
    height: 400,
  },
  calendarText: {
    color: '#000',
    fontSize: 16,
  },
  calendarHeaderText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  calendarWeekDaysText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  calendarSelectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // Bus Card Styles
  busCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginVertical: 16,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  heartIconContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 2,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    elevation: 2,
  },
  busImage: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  busDetails: {
    padding: 16,
  },
  busName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#222',
    textAlign: 'left',
  },
  busInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  busInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  busInfoText: {
    fontSize: 18,
    color: '#d32f2f',
    marginLeft: 4,
    fontWeight: '500',
  },
  busPriceBox: {
    backgroundColor: '#00b4f6',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
  },
  busPriceLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  busPriceValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 2,
  },
});
