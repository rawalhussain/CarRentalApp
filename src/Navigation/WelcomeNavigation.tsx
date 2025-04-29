import ConfirmOtpContainer from '@containers/WelcomeContainers/ConfirmOtpContainer'
import ForgotContainer from '@containers/WelcomeContainers/ForgotContainer'
import LoginContainer from '@containers/WelcomeContainers/LoginContainer'
import SignupContainer from '@containers/WelcomeContainers/SignupContainer'
import WelcomeContainer from '@containers/WelcomeContainers/WelcomeContainer'
import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { Routes, WelcomeNavigatorProps } from './RootNavigation'
import { HiddenHeaderOptions } from './defaultOptions'
import SetPasswordContainer from '@containers/WelcomeContainers/SetPasswordContainer'
import SplashScreen from '@containers/WelcomeContainers/SplashScreen'
import SetUpAccountContainer from '@containers/WelcomeContainers/SignupContainer/SetUpAccountContainer'
import ForgotPassword from '@containers/WelcomeContainers/ForgotPassword'
import SuccessPasswordUpdateContainer from '@containers/WelcomeContainers/SuccessPasswordUpdateContainer'
import LanguageContainer from '@containers/TabContainers/AccountContainer/LanguageContainer'
const Stack = createStackNavigator<WelcomeNavigatorProps>()

function WelcomeNavigation() {
  return (
    <Stack.Navigator
      id={Routes.WelcomeNavigation}
      initialRouteName={Routes.SplashScreen}
      screenOptions={HiddenHeaderOptions}
    >
      <Stack.Screen name={Routes.SplashScreen} component={SplashScreen} />
      <Stack.Screen name={Routes.Welcome} component={WelcomeContainer} />
      <Stack.Screen name={Routes.Login} component={LoginContainer} />
      <Stack.Screen name={Routes.Forgot} component={ForgotContainer} />
      <Stack.Screen name={Routes.ConfirmOtpContainer} component={ConfirmOtpContainer} />
      <Stack.Screen name={Routes.Signup} component={SignupContainer} />
      <Stack.Screen name={Routes.SetPasswordContainer} component={SetPasswordContainer} />
      <Stack.Screen name={Routes.SetUpAccountContainer} component={SetUpAccountContainer} />
      <Stack.Screen name={Routes.ForgotPassword} component={ForgotPassword} />
      <Stack.Screen name={Routes.SuccessPasswordUpdateContainer} component={SuccessPasswordUpdateContainer} />
      <Stack.Screen name={Routes.LanguageContainer} component={LanguageContainer} />
    </Stack.Navigator>
  )
}

export default WelcomeNavigation
