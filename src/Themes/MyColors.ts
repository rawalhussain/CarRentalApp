/**
 * Check material design docs for reference in color naming. https://m3.material.io/styles/color/overview
 */

export interface ThemeColors {
  indigo: string
  black: string
  white: string
  background: string
  text: string
  gray: string
  yellow: string
  lightGray: string
  skeletonGray: string
  error: string
  info: string
  warning: string
  blue: string
  lightGray2: string
  lightGray3: string
  lightGray4: string
  darkGray: string
  darkGray3: string
  white7: string
  white8: string
  // Stars
  activeStar: string
  inactiveStar: string
  activeStarBorder: string
  inactiveStarBorder: string
  reviewCount: string
  inactivereviewBarColor: string
  reviewBarColor: string
  dateColor: string
  borderColor: string
  errorBorderColor: string
  // Specific
  pink: string
  dark1: string
  dark2: string
  dark3: string
  green: string
  white2: string
  red: string
  gray1: string
  gray2: string
  gray3: string
  gray4: string
  gray5: string
  gray8: string
  darkBlue: string
  lightBlue: string
  text_lighter: string
  text1: string
  text2: string
  text3: string
  border: string
  outline: string
  iconBackground: string
  subTitle: string
  // Mostly used
  themeGreen: string
  textBlue: string
  lightText: string
  disabledText: string
  loaderBackgroung: string
  loaderForeground: string
  catText: string
  discountText: string
  ligthDarkText: string
  searchBarBackground: string
  iconColor: string
  solidWhite: string
  darkBorder: string
  statusBarColor: string
  haydiiContent500: string
  solidBlack: string
  // SubHeading: string
  lightOrange: string
  orange: string
  earthyBrown: string
  //SubHeading: string
}
const lightTheme = {
  indigo: '#0C4160',
  black: '#000000',
  white: '#ffffff',
  white8: '#ffffff',
  gray: '#808080',
  yellow: '#EDD81A',
  lightGray: '#EDF2F1',
  skeletonGray: '#eeeeee',
  error: '#E63535',
  info: '#3A84FD',
  warning: '#FFB100',
  blue: '#1979DA',
  lightGray2: '#EDEEEF',
  lightGray3: '#D9D9D9',
  lightGray4: '#F5FAF9',
  darkGray: '#6D7278',
  darkGray3: '#8C8C8C',
  white7: '#E3E4E5',
  // stars
  activeStar: '#FFD700',
  inactiveStar: '#D9D9D9',
  activeStarBorder: '#EB8D00',
  inactiveStarBorder: '#E0E0E0',
  reviewCount: '#697079',
  inactivereviewBarColor: '#E9EAEB',
  reviewBarColor: '#FF6347',
  dateColor: '#4C555F',
  borderColor: '#FDE6F3',
  errorBorderColor: '#FFEFED',
  // specific
  pink: '#ED1E79',
  dark1: '#171717',
  dark2: '#404040',
  dark3: '#737373',
  green: '#7CDA24',
  white2: '#FAFAFA',
  red: '#CD1010',
  gray1: '#F7F7F7',
  gray2: '#C4C4C4',
  gray3: '#A6A6A6',
  gray4: '#CBCBCB',
  gray5: '#E6E6E6',
  gray8: '#72767E',
  darkBlue: '#1B3E5E',
  lightBlue: '#E6EEF6',
  text_lighter: '#898C85',
  text: '#3B4036',
  text1: '#697B8C',
  text2: '#4C4C4C',
  text3: '#323660',
  border: '#B6BABF',
  outline: '#E0E5DC',
  iconBackground: '#13C296',
  subTitle: '#0D1217',
  // mostly used
  themeGreen: '#E32279',
  background: 'rgb(248, 247, 249)',
  textBlue: '#000DFF',
  lightText: '#797C87',
  disabledText: '#979C9E',
  loaderBackgroung: '#ddd',
  loaderForeground: '#ccc',
  ligthDarkText: '#6E7990',
  catText: '#000000',
  discountText: '#FE0202',
  iconColor: '#8E96A4',
  searchBarBackground: '#F8F6F8',
  solidWhite: '#ffffff',
  darkBorder: '#F7F7F7',
  subHeading: '#000000',
  statusBarColor: '#E32279',
  haydiiContent500: '#737584',
  solidBlack: '#000000',
  lightOrange: '#FEFBE6',
  orange: '#FF9500',
  earthyBrown: '#7E4418',
  // add other light mode colors
}
const darkTheme = {
  indigo: '#0C4160',
  black: '#ffffff',
  white: '#292F3D',
  white8: '#000000',
  background: '#1F232E',
  text: '#E5E5E5',
  gray: '#d1cfcf',
  yellow: '#EDD81A',
  lightGray: '#EDF2F1',
  skeletonGray: '#eeeeee',
  error: '#E63535',
  info: '#3A84FD',
  warning: '#FFB100',
  blue: '#1979DA',
  lightGray2: '#5a5b5e',
  lightGray3: '#1F232E',
  lightGray4: '#F5FAF9',
  darkGray: '#6D7278',
  darkGray3: '#8C8C8C',
  white7: '#E3E4E5',
  // stars
  activeStar: '#FFD700',
  inactiveStar: '#D9D9D9',
  activeStarBorder: '#EB8D00',
  inactiveStarBorder: '#E0E0E0',
  reviewCount: '#697079',
  inactivereviewBarColor: '#E9EAEB',
  reviewBarColor: '#FF6347',
  dateColor: '#4C555F',
  borderColor: '#FDE6F3',
  errorBorderColor: '#FFEFED',
  // specific
  pink: '#ED1E79',
  dark1: '#171717',
  dark2: '#404040',
  dark3: '#737373',
  green: '#7CDA24',
  white2: '#FAFAFA',
  red: '#CD1010',
  gray1: '#F7F7F7',
  gray2: '#C4C4C4',
  gray3: '#A6A6A6',
  gray4: '#CBCBCB',
  gray5: '#E6E6E6',
  gray8: '#72767E',
  darkBlue: '#1B3E5E',
  lightBlue: '#E6EEF6',
  text_lighter: '#898C85',
  text1: '#697B8C',
  text2: '#F7F7F7',
  text3: '#8488b5',
  border: '#B6BABF',
  outline: '#E0E5DC',
  iconBackground: '#13C296',
  subTitle: '#0D1217',
  // mostly used
  themeGreen: '#E32279',
  textBlue: '#ffffff',
  lightText: '#D9D9D9',
  disabledText: '#979C9E',
  loaderBackgroung: '#ddd',
  loaderForeground: '#111',
  catText: '#ffffff',
  ligthDarkText: '#BCC3D0',
  discountText: '#A3A3A3',
  searchBarBackground: '#1F232E',
  iconColor: '#8E96A4',
  solidWhite: '#ffffff',
  darkBorder: '#505868',
  subHeading: '#E9EBEC',
  statusBarColor: '#292F3D',
  // hayddiii Color
  haydiiContent500: '#ffffff',
  solidBlack: '#000000',
  lightOrange: '#FEFBE6',
  orange: '#FF9500',
  earthyBrown: '#7E4418',
}
const colors = (isDarkMode: boolean): ThemeColors => (isDarkMode ? darkTheme : lightTheme)

export default colors
