import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');
// Guideline sizes are based on standard ~5" screen mobile device
const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;
const heightCustom = height;
// heightCustom = (680 * 375) / 350
// // DeviceInfo.getModel() === 'iPhone X'
// if (height === 812) {
//   // iphone X,11 Pro,Xs,
//   heightCustom = 680
// } else if (height === 896) {
//   // 11 pro max, XS max,11,xr
//   heightCustom = 740
// } else {
//   heightCustom = height
// }
const scale = (size: number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number) => (heightCustom / guidelineBaseHeight) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

function fs(size: number) {
  const newSize = size;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
}
export { moderateScale, scale, verticalScale, fs };
