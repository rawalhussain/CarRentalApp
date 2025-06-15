import { StyleSheet, Dimensions } from 'react-native';
import {Colors} from "../../Themes/MyColors";

const { width, height } = Dimensions.get('screen');

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleWrapper: {
    alignItems: 'center',
  },
  title: {
    color: Colors.WHITE,
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  overlayContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconWrapper: {
    marginTop: 90,
    width: '100%',
    alignItems: 'center',
  },
  carIcon: {
    width: 151,
    height: 151,
  },
  getStartedButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 15,
    paddingHorizontal: 130,
    borderRadius: 30,
    marginBottom: 50,
  },
  getStartedText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
