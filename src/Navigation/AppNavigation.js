import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Colors} from '../Themes/MyColors';
import useAuthStore from '../store/useAuthStore';
import useUserStore from '../store/useUserStore';
import {getUserData} from '../Config/firebase';
import Loader from '../Components/Loader';

// Auth Screens
import Login from '../Screens/Auth/Login';
import SignUp from '../Screens/Auth/SignUp';
import ForgotPassword from '../Screens/Auth/ForgotPassword';

// Customer Screens
import CustomerHome from '../Screens/Customer/Services';
import CustomerBookings from '../Screens/Customer/Booking';
import CustomerCarList from '../Screens/Customer/CarList';
import CustomerCarDetails from '../Screens/Customer/CarDetails';

// Provider Screens
import ProviderHome from '../Screens/Provider/Home';
import ProviderBookings from '../Screens/Provider/Bookings';
import ProviderCars from '../Screens/Provider/Cars';
import ProviderAddCar from '../Screens/Provider/AddCar';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Customer Tab Navigator
const CustomerTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Cars') {
            iconName = focused ? 'car' : 'car-outline';
          } else if (route.name === 'Bookings') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.PRIMARY,
        tabBarInactiveTintColor: Colors.PRIMARY_GREY,
        headerShown: false,
      })}>
      <Tab.Screen name="Home" component={CustomerHome} />
      <Tab.Screen name="Cars" component={CustomerCarList} />
      <Tab.Screen name="Bookings" component={CustomerBookings} />
    </Tab.Navigator>
  );
};

// Provider Tab Navigator
const ProviderTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'MyCars') {
            iconName = focused ? 'car' : 'car-outline';
          } else if (route.name === 'Bookings') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.PRIMARY,
        tabBarInactiveTintColor: Colors.PRIMARY_GREY,
        headerShown: false,
      })}>
      <Tab.Screen name="Home" component={ProviderHome} />
      <Tab.Screen name="MyCars" component={ProviderCars} />
      <Tab.Screen name="Bookings" component={ProviderBookings} />
    </Tab.Navigator>
  );
};

const Navigation = () => {
  const {user, setUser} = useAuthStore();
  const {userData, setUserData} = useUserStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        if (user) {
          // Fetch user data if we have a user but no userData
          if (!userData) {
            const data = await getUserData(user.uid);
            setUserData(data);
          }
        }
      } catch (error) {
        console.error('Error initializing user:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, [user]);

  if (loading) {
    return <Loader />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {!user ? (
          // Auth Stack
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="SignUp" component={SignUp} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          </>
        ) : userData?.userType === 'customer' ? (
          // Customer Stack
          <>
            <Stack.Screen name="CustomerTabs" component={CustomerTabs} />
            <Stack.Screen
              name="CarDetails"
              component={CustomerCarDetails}
              options={{
                headerShown: true,
                title: 'Car Details',
                headerStyle: {
                  backgroundColor: Colors.PRIMARY,
                },
                headerTintColor: Colors.WHITE,
              }}
            />
          </>
        ) : (
          // Provider Stack
          <>
            <Stack.Screen name="ProviderTabs" component={ProviderTabs} />
            <Stack.Screen
              name="AddCar"
              component={ProviderAddCar}
              options={{
                headerShown: true,
                title: 'Add New Car',
                headerStyle: {
                  backgroundColor: Colors.PRIMARY,
                },
                headerTintColor: Colors.WHITE,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
