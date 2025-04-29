import { AddressTypeType } from '@models'
import { ProductDetails } from '@containers/OfferDetailsContainer'
import {
  CompositeNavigationProp,
  CompositeScreenProps,
  createNavigationContainerRef,
  NavigatorScreenParams,
} from '@react-navigation/native'
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack'
import { BottomTabNavigationProp, BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import React, { Dispatch, SetStateAction } from 'react'
import { MiniVendorsDto } from '@services/Api'
import RatingReviews from '@containers/TabContainers/ShopContainer/RatingReviews'

export const navigationRef = createNavigationContainerRef<PrimaryStackProps>()

export enum Routes {
  SplashScreen = 'SplashScreen',
  Welcome = 'Welcome',
  Login = 'Login',
  Forgot = 'Forgot',
  Signup = 'Signup',
  Home = 'Home',
  YourOffers = 'YourOffers',
  Messages = 'Messages',
  Favorites = 'Favorites',
  Account = 'Account',
  ConfirmOtpContainer = 'ConfirmOtpContainer',
  Details = 'Details',
  // To do remove unused routes
  PrimaryNavigation = 'PrimaryNavigation',
  Main = 'Main',
  MainNavigation = 'MainNavigation',
  NotificationContainer = 'NotificationContainer',
  ShoppingCart = 'ShoppingCart',
  WriteReview = 'WriteReview',
  SubmitReview = 'SubmitReview',
  PlaceOrder = 'PlaceOrder',
  EditAddress = 'EditAddress',
  WelcomeNavigation = 'WelcomeNavigation',
  HomeNavigation = 'HomeNavigation',
  AccountNavigation = 'AccountNavigation',
  Storybook = 'Storybook',
  Chat = 'Chat',
  Search = 'Search',
  SetPasswordContainer = 'SetPasswordContainer',
  StoreContainer = 'StoreContainer',
  RedirectToStoreContainer = 'RedirectToStoreContainer',
  ProductCatagoryContainer = 'ProductCatagoryContainer',
  PickUpDeliveryAddress = 'PickUpDeliveryAddress',
  ProductSubCatagoryContainer = 'ProductSubCatagoryContainer',
  ProductDetailContainer = 'ProductDetailContainer',
  SetUpAccountContainer = 'SetUpAccountContainer',
  StoreDescription = 'StoreDescription',
  AccountContainer = 'AccountContainer',
  AccountInfo = 'AccountInfo',
  OrderConfirmationContainer = 'OrderConfirmationContainer',
  WebViewContainer = 'WebViewContainer',
  MyReviewsContiner = 'MyReviewsContiner',
  HomeStack = 'HomeStack',
  ShopStack = 'ShopStack',
  AccountStack = 'AccountStack',
  ReelsStack = 'ReelsStack',
  CancelOrderContainer = 'CancelOrderContainer',
  ForgotPassword = 'ForgotPassword',
  SuccessPasswordUpdateContainer = 'SuccessPasswordUpdateContainer',
  RatingReviews = 'RatingReviews',
  AddressListContainer = 'AddressListContainer',
  OrdersDetailContainer = 'OrdersDetailContainer',
  OrderSummaryContainer = 'OrderSummaryContainer',
  CrashScreenContainer = 'CrashScreenContainer',
  SearchContainer = 'SearchContainer',
  ForceUpdateContainer = 'ForceUpdateContainer',
  OrderTrackingContainer = 'OrderTrackingContainer',
  LiveCahtWebViewContainer = 'LiveCahtWebViewContainer',
  BookMe = 'BookMe',
  ThemeContainer = 'ThemeContainer',
  LanguageContainer = 'LanguageContainer',
  ServicePlaceOrder = 'ServicePlaceOrder',
  ServicesListView = 'ServicesListView',
  TimeSlots = 'TimeSlots',
  Reels = 'Reels',
  LiveStore = 'LiveStore',
  LiveReelsContainer = 'LiveReelsContainer',
  ReelsContainer = 'ReelsContainer',
  DisputeOrderContainer = 'DisputeOrderContainer',
  DisputeOrderStatusContainer = 'DisputeOrderStatusContainer',
  RefundOrderStatusContainer = 'RefundOrderStatusContainer',
  MyWalletContiner = 'MyWalletContiner',
  DepositContiner = 'DepositContiner',
  TransactionsHistory = 'TransactionsHistory',
  EWallet = 'EWallet',
  TPinContainer = 'TPinContainer',
  ManualEntry = 'ManualEntry',
  QrCodeStack = 'QrCodeStack',
  QrCodeContainer = 'QrCodeContainer',
  RedirectToStorePaymentContainer = 'RedirectToStorePaymentContainer',
  ConfirmOrderCancel = 'ConfirmOrderCancel',
  EcommrenceContainer = 'EcommrenceContainer',
  ReturnOrderReason = 'ReturnOrderReason',
  ReturnOrderMethod = 'ReturnOrderMethod',
  ReturnOrderPayment = 'ReturnOrderPayment',
  ReturnConfirmation = 'ReturnConfirmation',
  ReturnOrderSubmit = 'ReturnOrderSubmit',
  TransactionContainer = 'TransactionContainer',
  MyQrContainer = 'MyQrContainer',
  StoreList = 'StoreList',
  CateringContainer = 'CateringContainer',
  OnDemandContainer = 'OnDemandContainer',
}

export type WelcomeNavigatorProps = {
  [Routes.CrashScreenContainer]: undefined
  [Routes.ForceUpdateContainer]: undefined
  [Routes.SplashScreen]: undefined
  [Routes.Welcome]: undefined
  [Routes.Login]: undefined
  [Routes.Signup]: undefined
  [Routes.Forgot]: undefined
  [Routes.ConfirmOtpContainer]: undefined
  [Routes.ConfirmOtpContainer]: undefined
  [Routes.SetPasswordContainer]: undefined
  [Routes.SetUpAccountContainer]: { screenType?: 'resetPassword' }
  [Routes.ForgotPassword]: undefined
  [Routes.SuccessPasswordUpdateContainer]: undefined
  [Routes.NotificationContainer]: undefined
}

export type HomeNavigatorProps = {
  [Routes.Home]: undefined
  [Routes.ShoppingCart]: undefined
  [Routes.Search]: undefined
  [Routes.PlaceOrder]: undefined
  [Routes.RedirectToStorePaymentContainer]: undefined
  [Routes.StoreContainer]: { obj: MiniVendorsDto }
  [Routes.RedirectToStoreContainer]: { id: string }
  [Routes.PickUpDeliveryAddress]: undefined
  [Routes.ProductDetailContainer]: undefined
  [Routes.WriteReview]: undefined
  [Routes.SubmitReview]: undefined
  [Routes.ProductCatagoryContainer]: undefined
  [Routes.ProductSubCatagoryContainer]: undefined
  [Routes.StoreDescription]: undefined
  [Routes.RatingReviews]: undefined
  [Routes.OrderConfirmationContainer]: undefined
  [Routes.WebViewContainer]: { url: string; isBookMeScreen?: boolean; isEWallet?: boolean }
  [Routes.AddressListContainer]: undefined
  [Routes.SearchContainer]: undefined
  [Routes.BookMe]: undefined
  [Routes.ServicePlaceOrder]: undefined
  [Routes.ServicesListView]: undefined
  [Routes.TimeSlots]: { vendorId: number; productId: number; orderConfirmScreen?: boolean }
  [Routes.ReelsContainer]: undefined
  [Routes.EWallet]: undefined
  [Routes.TPinContainer]: undefined
  [Routes.ManualEntry]: undefined
  [Routes.EcommrenceContainer]: undefined
  [Routes.StoreList]: undefined
  [Routes.CateringContainer]: undefined
  [Routes.OnDemandContainer]: undefined
}
export type ShopNavigatorProps = {
  [Routes.OrdersDetailContainer]: { serviceTypeId?: number }
  [Routes.ShoppingCart]: undefined
  [Routes.PlaceOrder]: undefined
  [Routes.StoreContainer]: { obj: MiniVendorsDto }
  [Routes.PickUpDeliveryAddress]: undefined
  [Routes.ProductDetailContainer]: undefined
  [Routes.WriteReview]: undefined
  [Routes.SubmitReview]: undefined
  [Routes.ProductCatagoryContainer]: undefined
  [Routes.ProductSubCatagoryContainer]: undefined
  [Routes.StoreDescription]: undefined
  [Routes.OrderConfirmationContainer]: undefined
  [Routes.WebViewContainer]: { url: string; isBookMeScreen?: boolean; isEWallet?: boolean }
  [Routes.StoreDescription]: undefined
  [Routes.CancelOrderContainer]: undefined
  [Routes.DisputeOrderContainer]: undefined
  [Routes.DisputeOrderStatusContainer]: undefined
  [Routes.RefundOrderStatusContainer]: undefined
  [Routes.AddressListContainer]: { fromRoute?: string }
  [Routes.SearchContainer]: undefined
  [Routes.BookMe]: undefined
  [Routes.ServicesListView]: undefined
  [Routes.EWallet]: undefined
  [Routes.TPinContainer]: undefined
  [Routes.ManualEntry]: undefined
}
export type AccountNavigatorProps = {
  [Routes.AccountContainer]: undefined
  [Routes.AccountInfo]: undefined
  [Routes.SetUpAccountContainer]: { screenType?: 'resetPassword' }
  [Routes.NotificationContainer]: undefined

  [Routes.OrderSummaryContainer]: undefined
  [Routes.CancelOrderContainer]: undefined
  [Routes.DisputeOrderContainer]: undefined
  [Routes.DisputeOrderStatusContainer]: undefined
  [Routes.RefundOrderStatusContainer]: undefined
  [Routes.StoreDescription]: undefined
  [Routes.AddressListContainer]: { fromRoute?: string }
  [Routes.SearchContainer]: undefined
  [Routes.OrderTrackingContainer]: undefined
  [Routes.LiveCahtWebViewContainer]: undefined
  [Routes.BookMe]: undefined
  [Routes.ThemeContainer]: undefined
  [Routes.Chat]: undefined
  [Routes.EWallet]: undefined
  [Routes.TPinContainer]: undefined
  [Routes.ManualEntry]: undefined
  [Routes.WebViewContainer]: { url: string; isBookMeScreen?: boolean; isEWallet?: boolean }
  [Routes.ConfirmOrderCancel]: undefined
  [Routes.ReturnOrderReason]: undefined
  [Routes.ReturnOrderMethod]: undefined
  [Routes.ReturnOrderPayment]: undefined
  [Routes.ReturnConfirmation]: undefined
  [Routes.ReturnOrderSubmit]: undefined
  [Routes.TransactionContainer]: undefined
  [Routes.MyQrContainer]: undefined
}
export type ReelsNavigatorProps = {
  [Routes.ReelsContainer]: undefined
  [Routes.LiveStore]: undefined
  [Routes.LiveReelsContainer]: undefined
  [Routes.Reels]: undefined
  [Routes.RedirectToStoreContainer]: { id: string }
}
export type QrCodeNavigatorProps = {
  [Routes.QrCodeContainer]: undefined
  [Routes.EWallet]: undefined
  [Routes.TPinContainer]: undefined
  [Routes.ManualEntry]: undefined
  [Routes.WebViewContainer]: { url: string; isBookMeScreen?: boolean; isEWallet?: boolean }
  [Routes.RedirectToStoreContainer]: { id: string }
}

export type MainTabNavigatorProps = {
  [Routes.HomeStack]: NavigatorScreenParams<HomeNavigatorProps>
  [Routes.ShopStack]: NavigatorScreenParams<ShopNavigatorProps>
  [Routes.AccountStack]: NavigatorScreenParams<AccountNavigatorProps>
  [Routes.ReelsStack]: NavigatorScreenParams<ReelsNavigatorProps>
  [Routes.QrCodeStack]: NavigatorScreenParams<QrCodeNavigatorProps>
}

export type StorybookNavigatorProps = {
  [Routes.Storybook]: undefined
}

export type PrimaryStackProps = {
  [Routes.WelcomeNavigation]: undefined
  [Routes.CrashScreenContainer]: undefined
  [Routes.Main]: undefined
}
export type WelcomeNavigatorScreenProps<T extends keyof WelcomeNavigatorProps> = CompositeScreenProps<
  StackScreenProps<WelcomeNavigatorProps, T>,
  PrimaryStackNavigatorScreenProps<Routes.WelcomeNavigation>
>

export type PrimaryStackNavigatorScreenProps<T extends keyof PrimaryStackProps> = StackScreenProps<PrimaryStackProps, T>

export type PrimaryStackNavigatorNavigationProp<T extends keyof PrimaryStackProps> = StackNavigationProp<
  PrimaryStackProps,
  T
>

export type MainTabNavigatorScreenProps<T extends keyof MainTabNavigatorProps> = CompositeScreenProps<
  BottomTabScreenProps<MainTabNavigatorProps, T>,
  PrimaryStackNavigatorScreenProps<Routes.Main>
>

export type MainTabNavigatorNavigationProp<T extends keyof MainTabNavigatorProps> = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabNavigatorProps, T>,
  PrimaryStackNavigatorNavigationProp<Routes.Main>
>

export type HomeNavigatorScreenProps<T extends keyof HomeNavigatorProps> = StackScreenProps<HomeNavigatorProps, T>

export type ShopNavigatorScreenProps<T extends keyof ShopNavigatorProps> = StackScreenProps<ShopNavigatorProps, T>

export type AccountNavigatorScreenProps<T extends keyof AccountNavigatorProps> = StackScreenProps<
  AccountNavigatorProps,
  T
>

export const CAS_APP = 'CAS'

interface AppContextState {
  app: string
  setApp?: Dispatch<SetStateAction<string>>
}

export const AppContext = React.createContext<AppContextState>({ app: CAS_APP })
