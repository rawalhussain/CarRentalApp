import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../Config/AuthContext';
import { storage } from '../../App';
// Auth Screens
import Welcome from '../Screens/Welcome';
import Login from '../Screens/Auth/Login';
import SignUp from '../Screens/Auth/SignUp';
import OtpVerification from '../Screens/Auth/OtpVerification';
// Customer Screens
import Services from '../Screens/Services';
import CarList from '../Screens/CarList';
import CarDetails from '../Screens/CarDetails';
// import BookingScreen from '../Screens/Booking';
// Driver Screens
import VendorDashboard from '../Screens/VendorDashboard';
// Admin Screens
import AdminDashboard from '../Screens/AdminDashboard';
import BootSplash from 'react-native-bootsplash';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Customer Tab Navigator
const CustomerTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Services') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Bookings') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#E53935',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Services" component={Services} />
      {/*<Tab.Screen name="Bookings" component={BookingScreen} />*/}
      <Tab.Screen name="Profile" component={Services} />
    </Tab.Navigator>
  );
};

const AppNavigation = () => {
  const { user, userType, loading } = useAuth();
  const hasCompletedOnboarding = storage.getBoolean('hasCompletedOnboarding');

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer
        onReady={async () => {
            await BootSplash.hide({ fade: true });
        }}>
      <Stack.Navigator>
        {!user ? (
          // Auth Stack
          <>
            {!hasCompletedOnboarding && (
              <Stack.Screen name="Welcome" component={Welcome} options={{headerShown: false}} />
            )}
            <Stack.Screen name="Login" component={Login} options={{headerShown: false}} />
            <Stack.Screen name="SignUp" component={SignUp} />
            <Stack.Screen name="OtpVerification" component={OtpVerification} />
          </>
        ) : (
          // App Stack based on user type
          <>
            {userType === 'customer' && (
              <>
                <Stack.Screen name="MainTabs" component={CustomerTabs} />
                <Stack.Screen name="CarList" component={CarList} />
                <Stack.Screen name="CarDetails" component={CarDetails} />
                {/*<Stack.Screen name="Booking" component={BookingScreen} />*/}
              </>
            )}
            {userType === 'vendor' && (
              <Stack.Screen name="VendorDashboard" component={VendorDashboard} />
            )}
            {userType === 'admin' && (
              <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;
