import { Platform } from 'react-native';

// https://fonts.google.com/specimen/Poppins
const type = {
  default: Platform.OS == 'android' ? 'SF Pro Text' : undefined,
  thin: 'Poppins-Thin',
  extraLight: 'Poppins-ExtraLight',
  light: 'Poppins-Light',
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  semiBold: 'Poppins-SemiBold',
  extraBold: 'Poppins-ExtraBold',
  black: 'Poppins-Black',
  ralewayThin: 'Raleway-Thin',
  ralewayExtraLight: 'Raleway-ExtraLight',
  ralewayLight: 'Raleway-Light',
  ralewayRegular: 'Raleway-Regular',
  ralewayMedium: 'Raleway-Medium',
  ralewaySemiBold: 'Raleway-SemiBold',
  ralewayExtraBold: 'Raleway-ExtraBold',
  ralewayBlack: 'Raleway-Black',
  // TODO: Add GT-Walsheims fonts here
};

const size = {
  h1: 24,
  h2: 20,
  h3: 18,
  h4: 16,
  h5: 14,
  h6: 12,
  tiny: 10,
  small: 12,
  regular: 14,
  normal: 15,
  medium: 16,
  large: 18,
  xl: 20,
};

const style = {
  default: {
    fontFamily: type.default,
    fontSize: size.normal,
  },
  h1: {
    fontFamily: type.default,
    fontSize: size.h1,
  },
  h2: {
    fontFamily: type.default,
    fontSize: size.h2,
  },
  h3: {
    fontFamily: type.default,
    fontSize: size.h3,
  },
  h4: {
    fontFamily: type.default,
    fontSize: size.h4,
  },
  h5: {
    fontFamily: type.default,
    fontSize: size.h5,
  },
  h6: {
    fontFamily: type.default,
    fontSize: size.h6,
  },
  thin: {
    fontFamily: type.default,
    fontSize: size.regular,
  },
  extraLight: {
    fontFamily: type.default,
    fontSize: size.regular,
  },
  light: {
    fontFamily: type.default,
    fontSize: size.regular,
  },
  normal: {
    fontFamily: type.default,
    fontSize: size.normal,
  },
  regular: {
    fontFamily: type.default,
    fontSize: size.regular,
  },
  medium: {
    fontFamily: type.medium,
    fontSize: size.regular,
  },
  semiBold: {
    fontFamily: type.semiBold,
    fontSize: size.regular,
  },
  extraBold: {
    fontFamily: type.extraBold,
    fontSize: size.regular,
  },
  black: {
    fontFamily: type.black,
    fontSize: size.regular,
  },
};

export default {
  type,
  size,
  style,
};
