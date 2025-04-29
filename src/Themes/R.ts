import { Dimensions } from 'react-native';

import appStyles from './AppStyles';
import colors from './Colors';

const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;
const R = {
  colors,
  appStyles,
  sizes: {
    DEVICE_HEIGHT,
    DEVICE_WIDTH,
  },
  // i18n
  // fonts,
};
export default R;
