import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Colors} from '../Themes/MyColors';
import useAuthStore from '../store/useAuthStore';
import useUserStore from '../store/useUserStore';
import {useMMKVBoolean} from 'react-native-mmkv';
import {logEvent} from '../Config/firebase';

// Auth Screens
import Login from '../Screens/Auth/Login';
import SignUp from '../Screens/Auth/SignUp';
import ForgotPassword from '../Screens/Auth/ForgotPassword';

// Customer Screens
import CustomerHome from '../Screens/Customer/BusBooking';
import BusSearch from '../Screens/Customer/BusBooking/component/BusBookingDetails';
import BusSearchResults from '../Screens/Customer/BusBooking/component/BusSearchResults';
import CarSearch from '../Screens/Customer/CarBooking/CarBookingDetails';
import CustomerCarDetails from '../Screens/Customer/CarBooking/CarDetails';
import CustomerBookings from '../Screens/Customer/Booking';
import ContactDetails from '../Screens/Customer/BusBooking/component/ContactDetails';
import BookingSummary from '../Screens/Customer/BusBooking/component/BookingSummary';

// Provider Screens
import ProviderHome from '../Screens/Provider/Home/Home';
import ProviderAddCar from '../Screens/Provider/Home/component/AddCar';
import BootSplash from 'react-native-bootsplash';
import ProviderBookings from '../Screens/Provider/Booking';
import Cars from '../Screens/Provider/Home/component/Cars';
import BankDetails from '../Screens/Provider/Home/component/BankDetails';
import SubmissionSuccess from '../Screens/Provider/Home/component/SubmissionSuccess';
import MyCars from '../Screens/Provider/MyCars';
import VehicleManagement from '../Screens/AdminDashboard/component/MyCars';

// Admin Screens
import AdminDashboard from '../Screens/AdminDashboard';
import AdminBookings from '../Screens/AdminDashboard/component/Booking';
import Welcome from '../Screens/Welcome';
import {SafeAreaView} from "react-native";

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
            <Tab.Screen name="MyCars" component={MyCars} />
            <Tab.Screen name="Bookings" component={ProviderBookings} />
        </Tab.Navigator>
    );
};


// Admin  Tab Navigator
const AdminTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({route}) => ({
                tabBarIcon: ({focused, color, size}) => {
                    let iconName;
                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Vehicle Management') {
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
            <Tab.Screen name="Home" component={AdminDashboard} />
            <Tab.Screen name="Vehicle Management" component={VehicleManagement} />
            <Tab.Screen name="Bookings" component={AdminBookings} />
        </Tab.Navigator>
    );
};

const Navigation = () => {
    const {user} = useAuthStore();
    const {userData} = useUserStore();
    const [hasCompletedOnboarding] = useMMKVBoolean('hasCompletedOnboarding');

    const handleNavigationStateChange = async (state) => {
        try {
            const currentRoute = state.routes[state.index];
            await logEvent('screen_view', {
                screen_name: currentRoute.name,
                screen_class: currentRoute.name,
            });
        } catch (error) {
            console.warn('Analytics error:', error);
            // Continue with navigation even if analytics fails
        }
    };

    // Determine which stack to show
    const getInitialRoute = () => {
        if (!user) {
            return 'Login';
        }

        if (!userData) {
            return 'Login';
        }

        switch (userData.userType) {
            case 'customer':
                return 'CustomerTabs';
            case 'provider':
                return 'ProviderTabs';
            case 'admin':
                return 'AdminTabs';
            default:
                return 'Login';
        }
    };

    return (
        <SafeAreaView style={{flex: 1}}>
            <NavigationContainer
                onStateChange={handleNavigationStateChange}
                onReady={async () => {
                    await BootSplash.hide({ fade: true });
                }}>
                <Stack.Navigator
                    screenOptions={{headerShown: false}}
                    initialRouteName={getInitialRoute()}>
                    {!hasCompletedOnboarding && (
                        <Stack.Screen name="WelcomeScreen" component={Welcome} />
                    )}
                    {!user || !userData ? (
                        // Auth Stack
                        <>
                            <Stack.Screen name="Login" component={Login} />
                            <Stack.Screen name="SignUp" component={SignUp}  options={{
                                headerShown: true,
                            }} />
                            <Stack.Screen name="ForgotPassword" component={ForgotPassword}  options={{
                                headerShown: true,
                            }} />
                        </>
                    ) : (
                        // User type specific stacks
                        <>
                            {userData.userType === 'customer' && (
                                <>
                                    <Stack.Screen name="CustomerTabs" component={CustomerTabs} />
                                    <Stack.Screen
                                        name="BusSearch"
                                        component={BusSearch}
                                        options={{
                                            headerShown: true,
                                        }}
                                    />
                                    <Stack.Screen
                                        name="BusSearchResults"
                                        component={BusSearchResults}
                                        options={{
                                            headerShown: true,
                                        }}
                                    />
                                    <Stack.Screen
                                        name="ContactDetails"
                                        component={ContactDetails}
                                        options={{
                                            headerShown: true,
                                        }}
                                    />
                                    <Stack.Screen
                                        name="BookingSummary"
                                        component={BookingSummary}
                                        options={{
                                            headerShown: true,
                                        }}
                                    />
                                    <Stack.Screen
                                        name="CarSearch"
                                        component={CarSearch}
                                        options={{
                                            headerShown: true,
                                        }}
                                    />
                                    <Stack.Screen
                                        name="CarDetails"
                                        component={CustomerCarDetails}
                                        options={{
                                            headerShown: true,
                                        }}
                                    />
                                </>
                            )}
                            {userData.userType === 'provider' && (
                                <>
                                    <Stack.Screen name="ProviderTabs" component={ProviderTabs} />
                                    <Stack.Screen
                                        name="AddCar"
                                        component={ProviderAddCar}
                                        options={{
                                            headerShown: true,
                                        }}
                                    />
                                    <Stack.Screen
                                        name="CarDetails"
                                        component={Cars}
                                        options={{
                                            headerShown: true,
                                        }}
                                    />
                                    <Stack.Screen
                                        name="BankDetails"
                                        component={BankDetails}
                                        options={{
                                            headerShown: true,
                                        }}
                                    />
                                    <Stack.Screen
                                        name="SubmissionSuccess"
                                        component={SubmissionSuccess}
                                    />
                                </>
                            )}
                            {userData.userType === 'admin' && (
                                <Stack.Screen name="AdminTabs" component={AdminTabs} />
                            )}
                        </>
                    )}
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaView>
    );
};

export default Navigation;
