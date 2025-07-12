import { StyleSheet } from 'react-native';
import {Colors} from '../../../Themes/MyColors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 60,
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
  rentalBtn: {
    backgroundColor: Colors.PRIMARY, // blue
    paddingVertical: 20,
    paddingHorizontal: 60,
    borderRadius: 25,
    marginBottom: 25,
    width: 260,
    alignItems: 'center',
  },
  rentalBtnText: {
    color: Colors.WHITE,
    fontSize: 24,
    fontWeight: 'bold',
  },
  busBtn: {
    backgroundColor: Colors.SECONDARY,
    paddingVertical: 20,
    paddingHorizontal: 60,
    borderRadius: 25,
    width: 260,
    alignItems: 'center',
  },
  busBtnText: {
    color: Colors.WHITE,
    fontSize: 24,
    fontWeight: 'bold',
  },
});
