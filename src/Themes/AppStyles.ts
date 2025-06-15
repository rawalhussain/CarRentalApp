import { Dimensions, Platform, StyleSheet } from 'react-native';

import Colors from './MyColors';
import Fonts from './Fonts';
import Metrics from './Metrics';

// This file is for a reusable grouping of Theme items.
const AppStyles = StyleSheet.create({
  bottomSheetHeader: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    ...Platform.select({
      ios: {
        shadowRadius: 2,
        shadowOpacity: 0.1,
        shadowOffset: {
          width: 0,
          height: -3,
        },
        shadowColor: Colors.black,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  pageSheet: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    backgroundColor: Colors.white,
    ...Platform.select({
      ios: {
        shadowRadius: 3.84,
        shadowOpacity: 0.25,
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowColor: Colors.black,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  errorIcon: {
    color: Colors.error,
    fontSize: Metrics.icons.medium,
  },
  errorText: {
    ...Fonts.style.regular,
    textAlign: 'center',
    color: Colors.gray,
  },
  infoIcon: {
    color: Colors.info,
    textAlign: 'center',
    fontSize: Metrics.icons.medium,
  },
  infoText: {
    ...Fonts.style.regular,
    color: Colors.gray,
  },
  borderBottom: {
    borderBottomColor: Colors.gray5,
    borderBottomWidth: 0.5,
  },
  container: {
    alignItems: 'center',
    flex: 1,
  },
  flex_1: { flex: 1 },
  font_bold: { fontWeight: 'bold' },
  heading: {
    ...Fonts.style.semiBold,
    fontSize: Fonts.size.medium,
    textAlign: 'center',
  },
  imgIconMenu: {
    height: 20,
    marginHorizontal: 20,
    resizeMode: 'contain',
    tintColor: 'black',
    width: 20,
  },
  shadow: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  shadow2: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  subHeading: {
    ...Fonts.style.regular,
    fontSize: Fonts.size.small,
    textAlign: 'center',
  },
  textContent: {},
  textDate: {
    color: Colors.dark1,
  },
  vRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  greyText: {
    color: Colors.dark3,
  },
  textBold: {
    fontWeight: 'bold',
  },
  flexGrow: {
    flex: 1,
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  alignSelfStretch: {
    alignSelf: 'stretch',
  },
  padding10: {
    padding: 10,
  },
});

export default AppStyles;
