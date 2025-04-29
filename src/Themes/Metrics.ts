import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const metrics = {
  tinyMargin: 2,
  smallMargin: 5,
  baseMargin: 10,
  doubleBaseMargin: 20,
  smallPadding: 5,
  basePadding: 10,
  doubleBasePadding: 20,
  screenWidth: width < height ? width : height,
  screenHeight: width < height ? height : width,
  icons: {
    tiny: 15,
    small: 20,
    regular: 25,
    medium: 30,
    large: 45,
    xl: 50,
  },
  images: {
    small: 20,
    medium: 40,
    large: 60,
    thumbnail: 80,
    logo: 200,
  },
  hitSlop: {
    left: 10,
    right: 10,
    top: 10,
    bottom: 10,
  },
};

export default metrics;
