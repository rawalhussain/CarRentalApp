import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 16,
  },

  // Top Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    elevation: 2,
  },
  backIcon: {
    marginRight: 10,
  },
  searchTextContainer: {
    flex: 1,
  },
  searchLocation: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  searchDates: {
    fontSize: 12,
    color: '#777',
  },

  // Filters
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  filterButton: {
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderColor: '#ccc',
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 10,
  },

  // Car Card
  carList: {
    paddingBottom: 20,
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
    backgroundColor: '#fff',
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
    fontWeight: 'bold',
    fontSize: 14,
  },
  carModel: {
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
});
