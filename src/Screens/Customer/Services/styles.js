import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
    color: '#999',
  },

  nameText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },

  centeredSection: {
    alignItems: 'center',
    marginTop: 40,
  },

  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
    marginBottom: 40,
  },

  rentalButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    paddingHorizontal: 70,
    borderRadius: 10,
    marginBottom: 20,
  },

  rentalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  busButton: {
    backgroundColor: '#E53935',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 10,
  },

  busButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
