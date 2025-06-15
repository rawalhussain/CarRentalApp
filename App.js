/**
 *App Design & Develop By Rawal Hussain Khan
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect, useCallback, lazy, Suspense} from 'react';
import {LogBox, StatusBar, Text, TextInput} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Routes from './src/Navigation/AppNavigation';
import NetInfo from '@react-native-community/netinfo';
import {SelectProvider} from '@mobile-reality/react-native-select-pro';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {MMKV} from 'react-native-mmkv';
import {AppProvider} from './src/api/app';
import {PaperProvider} from 'react-native-paper';
import analytics from '@react-native-firebase/analytics';
import {Colors} from "react-native/Libraries/NewAppScreen";

LogBox.ignoreAllLogs();
LogBox.ignoreLogs([
    "[react-native-gesture-handler] Seems like you're using an old API with gesture AirSial, check out new Gestures system!",
    'Non-serializable values were found in the navigation state',
    'VirtualizedLists should never be nested',
    'Non-serializable values were found in the navigation state',
]);

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.maxFontSizeMultiplier = 1;
TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;
TextInput.defaultProps.maxFontSizeMultiplier = 1;

// Lazy load heavy components
const FlashMessage = lazy(() => import('react-native-flash-message'));

// Memoize configurations
const netInfoConfig = {
    reachabilityUrl: 'https://clients3.google.com/generate_204',
    reachabilityTest: async response => response.status === 204,
    reachabilityLongTimeout: 60 * 1000,
    reachabilityShortTimeout: 5 * 1000,
    reachabilityRequestTimeout: 15 * 1000,
    reachabilityShouldRun: () => true,
    shouldFetchWiFiSSID: true,
    useNativeReachability: false,
};

export const storage = new MMKV();

const App = React.memo(() => {
    const initializeApp = useCallback(async () => {
        try {
            NetInfo.configure(netInfoConfig);
        } catch (error) {
            console.error('Initialization error:', error);
        }
        await analytics().setConsent({
            analytics_storage: true,
            ad_storage: true,
            ad_user_data: true,
            ad_personalization: true,
        });
    }, []);

    useEffect(() => {
        initializeApp();
    }, [initializeApp]);

    return (
        <SafeAreaProvider>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
            <GestureHandlerRootView style={{flex: 1}}>
                <BottomSheetModalProvider>
                    <PaperProvider>
                        <AppProvider>
                            <Suspense>
                                <FlashMessage position="top" />
                            </Suspense>
                            <SelectProvider>
                                <Routes />
                            </SelectProvider>
                        </AppProvider>
                    </PaperProvider>
                </BottomSheetModalProvider>
            </GestureHandlerRootView>
        </SafeAreaProvider>
    );
});

export default App;
