import { StyleSheet } from 'react-native';
import { Colors } from '../../../../Themes/MyColors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_GREY,
    // padding: 16,
    // paddingHorizontal:16
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth:1,
    borderColor:Colors.LINE_GRAY,
    paddingBottom:8,
    paddingHorizontal:16
    
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e53935',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  searchPill: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  searchLocation: {
    color: Colors.BLACK,
    fontSize: 14,
    fontWeight: 'bold',
  },
  searchDates: {
    fontSize: 12,
    color: '#777',
  },

  // Filters
  filters: {
    marginBottom: 12,
    paddingHorizontal:16
  },
  filtersContent: {
    paddingRight: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderColor: Colors.LINE_GRAY,
    borderWidth: 1,
    marginRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  filterIcon: {
    marginRight: 6,
  },
  filterText: {
    fontSize: 13,
    color: '#111',
    fontWeight: '600',
  },

  // Car Card
  carList: {
    paddingBottom: 20,
    paddingHorizontal:16
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 2,
  },
  carImage: {
    width: '100%',
    height: 180,
  },
  heartIcon: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 20,
    padding: 5,
    elevation: 3,
  },

  cardBottom: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  carName: {
    color: Colors.BLACK,
    fontWeight: 'bold',
    fontSize: 14,
  },
  carModel: {
    color: Colors.BLACK,
    fontSize: 14,
    fontWeight: 'bold',
  },

  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  metaDetails: {
    flex: 1,
  },
  metaText: {
    fontSize: 12,
    color: '#555',
    marginBottom: 3,
  },

  priceBox: {
    backgroundColor: '#0abde3',
    borderRadius: 6,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  priceLabel: {
    fontSize: 12,
    color: '#fff',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.BLACK,
    fontWeight: '500',
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.RED,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.BLACK,
    textAlign: 'center',
    fontWeight: '500',
  },
});
