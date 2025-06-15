// Libraries
import _ from 'lodash';
import {showMessage} from 'react-native-flash-message';
import moment from 'moment';
import {StatusBar, Dimensions, Platform, PixelRatio} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {SEMIBOLD} from '../../Themes/Fonts';
import {Colors} from '../../Themes/MyColors';

// Retrieve initial screen's width
let screenWidth = Dimensions.get('window').width;
// Retrieve initial screen's height
let screenHeight = Dimensions.get('window').height;

// Url Maker
export const urlMaker = (url, params) => {
  let counter = 1;
  const parameters = [];
  _.forIn(params, (val, key) => {
    parameters.push((counter === 1 ? '?' : '&') + key + '=' + val);
    counter++;
  });
  return url + parameters.join('');
};
export const showMessageAlert = (
  message,
  description,
  type = 'default',
  position = Platform.OS === 'ios' ? 'top' : {top: StatusBar.currentHeight, left: 0, right: 0},
  floating = Platform.OS !== 'ios',
  color,
  backgroundColor,
  duration = 3000
) => {
  showMessage({
    message,
    description,
    type,
    position,
    color,
    backgroundColor,
    floating,
    duration,
  });
};
export const convertToHeading = text => {
  let string = text.split('_');
  const str = [];
  _.map(string, single => {
    str.push(stringToCapitalize(single));
  });
  return str.join(' ');
};

export const convertToMachineName = text => {
  let string = text.split(' ');
  const str = [];
  _.map(string, single => {
    str.push(single.toLowerCase());
  });
  return str.join('_');
};

export function formatDecimal(num, decimalPlaces) {
  if (Number.isInteger(num)) {
    return num.toString();
  } else {
    return num.toFixed(decimalPlaces);
  }
}

export const stringToCapitalize = string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const convertDateToHumanReadable = date => {
  return moment(date).format('DD MMMM, YYYY');
};

export const showMessageToast = (
  message,
  description = 'No internet connection. Please check your network and try again',
  type = 'info',
) => {
  const color = '#FFF';
  let backgroundColor = Colors.SECONDARY;
  const position =
    Platform.OS === 'ios' ? 'top' : {top: StatusBar.currentHeight, left: 0, right: 0};
  const duration = 3500;
  const floating = Platform.OS !== 'ios';
  if (type === 'success') {
    backgroundColor = Colors.GREEN;
  } else if (type === 'danger') {
    backgroundColor = Colors.RED;
  } else if (type === 'warning') {
    backgroundColor = Colors.YELLOW;
  }
  //Log.log('--> toaster........', type, message, description);
  showMessage({
    message,
    description,
    type,
    icon: type,
    position,
    color,
    backgroundColor,
    duration,
    floating,
    style: {
      borderRadius: ScreenScale(6),
      padding: ScreenScale(16),
      elevation: ScreenScale(10),
      alignItems: 'center',
    },
    titleStyle: {
      fontFamily: SEMIBOLD,
      fontSize: FontScale(14),
    },
  });
};
export const getSeatNumbersFromData = data => {
  if (data) {
    const arr = [];

    _.map(data, (seat, index) => {
      arr.push(seat.seatNumber);
    });

    return arr.length > 1 ? arr.join(', ').trimEnd(', ') : arr.join('');
  }
  return null;
};
export const weekDatesForBusSelection = (days = 6, startingDate = new Date()) => {
  const daysToBeReturned = [];
  const today = moment(startingDate).format();
  if (days === 0) {
    const dated = moment(startingDate);
    return getFormattedDateInObject(dated);
  }
  for (let i = 0; i <= days; i++) {
    const dated = moment(today).add(i, 'd');
    daysToBeReturned.push(getFormattedDateInObject(dated));
  }

  return daysToBeReturned;
};

export const getFormattedDateInObject = (date, momentFormatted = true) => {
  let dated = null;
  if (!momentFormatted) {
    dated = moment(date);
  } else {
    dated = date;
  }
  return {
    year: dated.format('YYYY'),
    month: dated.format('MM'),
    monthInWords: dated.format('MMMM'),
    monthInWordsShort: dated.format('MMM'),
    date: dated.format('DD'),
    day: dated.format('dddd'),
    dayShort: dated.format('ddd'),
    dateFormatted: dated.format(),
  };
};

export const monthOfYearsSelection = (months = 6, startingDate = new Date()) => {
  const monthsToBeReturned = [];
  const today = moment(startingDate).format();
  if (months === 0) {
    const dated = moment(startingDate);
    return getFormattedDateInObject(dated);
  }
  for (let i = 0; i <= months; i++) {
    const dated = moment(today).add(i, 'M');
    monthsToBeReturned.push(getFormattedMonthInObject(dated));
  }

  return monthsToBeReturned;
};

export const getFormattedMonthInObject = (date, momentFormatted = true) => {
  let dated = null;
  if (!momentFormatted) {
    dated = moment(date);
  } else {
    dated = date;
  }
  return {
    year: dated.format('YYYY'),
    month: dated.format('MM'),
    monthInWords: dated.format('MMMM'),
    monthInWordsShort: dated.format('MMM'),
    dateFormatted: dated.format(),
  };
};

export const checkModuleStatus = (module, dataFromApi) => {
  const finder = findModuleFromData(module, dataFromApi);
  return !!(finder && finder.status);
};

export const findModuleFromData = (module, dataFromApi) => {
  return _.find(dataFromApi, p => p.id === module.id);
};

export const validateEmail = email => {
  const re =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};

export const validateMobileNumber = mobile => {
  const re = /^((\+92)|(0092))-{0,1}\d{3}-{0,1}\d{7}$|^\d{10}$|^\d{4}-\d{7}$/;
  return re.test(mobile);
};

export const validateCNIC = cnic => {
  const re = /^[0-9]{13}$/;
  return re.test(cnic);
};

export const validatePassport = passport => {
  passport = passport.trim();
  const regex = /^[A-Z0-9]{6,12}$/; // Adjusted length to cover more formats
  return regex.test(passport);
};

const {height, width} = Dimensions.get('window');

export const isIphoneX = () => {
  const dim = Dimensions.get('window');
  return (
    Platform.OS === 'ios' &&
    !Platform.isPad &&
    !Platform.isTVOS &&
    (dim.height === 780 ||
      dim.width === 780 ||
      dim.height === 812 ||
      dim.width === 812 ||
      dim.height === 844 ||
      dim.width === 844 ||
      dim.height === 896 ||
      dim.width === 896 ||
      dim.height === 926 ||
      dim.width === 926)
  );
};

function calculateRatio(num_1, num_2) {
  for (let num = num_2; num > 1; num--) {
    if (num_1 % num === 0 && num_2 % num === 0) {
      num_1 = num_1 / num;
      num_2 = num_2 / num;
    }
  }
  return num_2 / num_1;
}

export const FontScale = (fontSize = 0) => {
  return fontSize / 1.2;
};

export const ScreenScale = (size, standardScreenHeight = height) => {
  return size;
};

export const isIphone = () => {
  return Platform.OS === 'ios';
};

export const ScreenScaleWidth = size => {
  return widthPercentageToDP(size);
};

export const ScreenScaleHeight = size => {
  return heightPercentageToDP(size);
};

const widthPercentageToDP = widthPercent => {
  // Parse string percentage input and convert it to number.
  const elemWidth = typeof widthPercent === 'number' ? widthPercent : parseFloat(widthPercent);

  // Use PixelRatio.roundToNearestPixel method in order to round the layout
  // size (dp) to the nearest one that correspons to an integer number of pixels.
  return PixelRatio.roundToNearestPixel((screenWidth * elemWidth) / 100);
};

const heightPercentageToDP = heightPercent => {
  // Parse string percentage input and convert it to number.
  const elemHeight = typeof heightPercent === 'number' ? heightPercent : parseFloat(heightPercent);

  // Use PixelRatio.roundToNearestPixel method in order to round the layout
  // size (dp) to the nearest one that correspons to an integer number of pixels.
  return PixelRatio.roundToNearestPixel((screenHeight * elemHeight) / 100);
};

export const parseAmount = amount => {
  const addCommas = num => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const removeNonNumeric = num => num.toString().replace(/[^0-9]/g, '');
  let a = amount;
  a = a.toString().replace(/\,/g, ''); // 1125, but a string, so convert it to number
  a = parseInt(a, 10);
  let number = Math.abs(Math.trunc(a));
  return (
    'Rs. ' + (Math.sign(amount) === -1 ? '-' : '') + addCommas(removeNonNumeric(number)) + '/-'
  );
};

export const checkNetworkConnectivity = async () => {
  try {
    const netInfoState = await NetInfo.fetch();
    return netInfoState.isConnected;
  } catch (error) {
    console.error('Error checking network connectivity:', error);
    return false; // Return false if there's an error
  }
};
