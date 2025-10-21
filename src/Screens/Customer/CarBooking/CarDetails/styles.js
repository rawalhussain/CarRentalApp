import { StyleSheet } from 'react-native';
import { Colors } from '../../../../Themes/MyColors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
  },
  backButton: {
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerLocation: {
    color: Colors.WHITE,
    fontSize: 12,
    opacity: 0.8,
  },
  headerDates: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  carImage: {
    width: '100%',
    height: 250,
    borderRadius: 0,
    marginBottom: 16,
  },
  carInfoSection: {
    marginBottom: 20,
  },
  carName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.BLACK,
    marginBottom: 4,
  },
  carModel: {
    fontSize: 18,
    color: Colors.BLACK,
    marginBottom: 8,
  },
  rating: {
    fontSize: 16,
    color: Colors.BLACK,
  },
  tripDetailsSection: {
    // marginBottom: 20,
  },
  tripItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    // backgroundColor: 'blue',
  },
  tripTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  tripLabel: {
    fontSize: 16,
    color: Colors.BLACK,
    marginBottom: 2,
  },
  tripSubLabel: {
    fontSize: 14,
    color: Colors.gray3,
  },

  changeText: {
    color: Colors.PRIMARY,
    fontSize: 14,
    fontWeight: '600',
  },
  priceSection: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  priceContainer: {
    // marginBottom: 16,
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: '500',
    color: Colors.BLACK,
  },
  priceSubtext: {
    fontSize: 12,
    color: Colors.BLACK,
    // marginTop: 4,
    paddingVertical: 4,
  },
  continueButton: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    minHeight: 50,
    maxHeight: 50,
    justifyContent: 'center',
    paddingHorizontal: 20,

    // flex: 1,
  },
  continueButtonText: {
    color: Colors.WHITE,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  mileageText: {
    fontSize: 12,
    color: Colors.gray3,
    textAlign: 'left',
  },
  insuranceSection: {
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
    // paddingVertical: 12,
  
  },
  sectionInsurance:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // backgroundColor: 'red',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 12,
    // paddingBottom: 12,
    paddingVertical: 12,

  },
  insuranceText: {
    fontSize: 16,
    color: Colors.BLACK,
  },
  readMoreButton:{
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  readMoreText: {
    color: Colors.black,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.BLACK,
    marginBottom: 12,
  },
  sectionTitleInsurance: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.BLACK,
    // marginBottom: 12,
  },
  basicsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  basicItem: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  basicText: {
    marginTop: 4,
    fontSize: 14,
    color: Colors.BLACK,
    textAlign: 'center',
    fontWeight: '400',
  },
  basicIcon: {
    width: 24,
    height: 24,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureItem: {
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  featureText: {
    fontSize: 14,
    color: Colors.BLACK,
  },
  viewAllButton: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewAllText: {
    color: Colors.WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
  includedText: {
    fontSize: 12,
    color: Colors.gray3,
  },
  convenienceList: {
    gap: 12,
  },
  convenienceItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  convenienceText: {
    marginLeft: 12,
    fontSize: 14,
    color: Colors.BLACK,
  },
  peaceList: {
    gap: 12,
  },
  peaceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  peaceText: {
    marginLeft: 12,
    fontSize: 14,
    color: Colors.BLACK,
    flex: 1,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.BLACK,
    lineHeight: 20,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: 8,
  },
  seeAllText: {
    color: Colors.PRIMARY,
    fontSize: 14,
    fontWeight: '600',
  },
  basedOnText: {
    fontSize: 12,
    color: Colors.gray3,
  },
  hostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  hostAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  hostAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.GRAY,
    borderWidth: 2,
    borderColor: Colors.BLACK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: -12,
    left: '50%',
    transform: [{ translateX: -25 }],
    backgroundColor: Colors.PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.WHITE,
  },
  ratingText: {
    color: Colors.WHITE,
    fontSize: 12,
    fontWeight: '600',
    marginRight: 2,
  },
  hostInfo: {
    flex: 1,
  },
  hostName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.BLACK,
    marginBottom: 2,
  },
  hostStatus: {
    fontSize: 14,
    color: Colors.PRIMARY,
    marginBottom: 2,
  },
  hostDetails: {
    fontSize: 12,
    color: Colors.gray3,
    marginBottom: 2,
  },
  hostBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  badgeText: {
    marginLeft: 8,
    fontSize: 12,
    color: Colors.BLACK,
    flex: 1,
  },
  extrasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  extrasDescription: {
    fontSize: 14,
    color: Colors.BLACK,
    marginBottom: 16,
  },
  moreInfoText: {
    color: Colors.PRIMARY,
    fontSize: 14,
    fontWeight: '600',
  },
  extrasList: {
    gap: 16,
  },
  extraItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  extraContent: {
    flex: 1,
    marginRight: 12,
  },
  extraTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.BLACK,
    marginBottom: 4,
  },
  extraPrice: {
    fontSize: 14,
    color: Colors.BLACK,
    marginTop: 4,
  },
  extraAvailability: {
    fontSize: 14,
    color: Colors.BLACK,
    fontWeight: '500',
  },
  extraDescription: {
    fontSize: 14,
    color: Colors.BLACK,
    lineHeight: 20,
    marginBottom: 8,
  },
  rulesList: {
    gap: 12,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ruleText: {
    marginLeft: 12,
    fontSize: 14,
    color: Colors.BLACK,
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    // marginTop: 20,
    marginBottom: 30,
    borderTopWidth: 1,
    borderTopColor:"#f0f0f0",
    paddingTop: 10,
  },
  bottomButton: {
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  bottomButtonText: {
    color: Colors.PRIMARY,
    fontSize: 14,
    fontWeight: '600',
  },
  fixedPriceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'space-between',
    backgroundColor: Colors.BACKGROUND_GREY,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  priceButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent:'flex-end',
    width:'60%',
    paddingTop: 10,
    // backgroundColor:'red',

    // marginBottom: 8,
  },
  dueNowButton: {
    backgroundColor: Colors.PRIMARY,
    // paddingHorizontal: 12,
    // paddingVertical: 8,
    borderRadius: 6,
    // marginRight: 12,
    justifyContent:'center',
    alignItems:'center',
    minHeight: 25,
    maxHeight: 25,
    maxHeight: 30,
    width: 92
  },
  dueNowText: {
    color: Colors.WHITE,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default styles;
