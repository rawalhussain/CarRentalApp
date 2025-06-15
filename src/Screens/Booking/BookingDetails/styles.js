import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
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
});
