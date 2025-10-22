import React, {useState} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../../Themes/MyColors';
import styles from './styles';
import useUserStore from '../../../store/useUserStore';
import Loader from '../../../Components/Loader';
import useAuthStore from '../../../store/useAuthStore';
import { signOut } from '../../../Config/firebase';
import { useNavigation } from '@react-navigation/native';


const ServiceScreen = () => {
    const navigation = useNavigation();
    const {userData, clearUserData} = useUserStore();
    const {clearAuth} = useAuthStore();
    const [loading, setLoading] = useState(false);

    return (
        <View style={styles.container}>
            {loading && <Loader />}
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.profileSection}>
                    <View>
                        <Text style={styles.welcomeText}>WELCOME</Text>
                        <Text style={styles.nameText}>{userData?.fullName}</Text>
                    </View>
                </View>

                <TouchableOpacity onPress={async () => {
                    try {
                        setLoading(true);
                        clearUserData();
                        clearAuth();
                        await signOut();
                        // Reset navigation stack and go directly to Login screen
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Login' }],
                        });
                    } catch (e) {
                        console.log(e);
                    } finally {
                        setLoading(false);
                    }
                }}>
                    <Ionicons name="log-out-outline" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            {/* Center-aligned heading and buttons */}
            <View style={styles.centeredSection}>
                <Text style={styles.title}>
                    WHAT SERVICE YOU ARE{'\n'}LOOKING FOR?
                </Text>

                <TouchableOpacity
                    style={styles.bookRideBtn}
                    onPress={() => navigation.navigate('Services')}
                >
                    <Ionicons name="car" size={24} color={Colors.WHITE} style={styles.buttonIcon} />
                    <Text style={styles.bookRideBtnText}>BOOK RIDE</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.rentalBtn}
                    onPress={() => navigation.navigate('CarSearch')}
                >
                    <Text style={styles.rentalBtnText}>RENTAL</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.busBtn}
                    onPress={() => navigation.navigate('BusSearch')}
                >
                    <Text style={styles.busBtnText}>HIRE A BUS</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ServiceScreen;
