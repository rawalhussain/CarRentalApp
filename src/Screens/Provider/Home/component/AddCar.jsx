import React, {useLayoutEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, StatusBar, Modal, FlatList} from 'react-native';
import { Colors } from '../../../../Themes/MyColors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Button from '../../../../Components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';
import MainHeader from '../../../../Components/MainHeader';

const AddCar = ({navigation, route}) => {
    const { type } = route.params || {};
    const isBus = type === 'bus';
    const [selectedNumber, setSelectedNumber] = useState(null);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [canDeliver, setCanDeliver] = useState(false);

    const numberOptions = Array.from({length: 10}, (_, i) => i + 1);


    return (
        <SafeAreaView style={styles.container}>
            <MainHeader title="Details" onBackPress={() => navigation.goBack()} showOptionsButton={false}/>
                <View style={{padding: 20}}>
            <Text style={styles.question}>
                HOW MANY {isBus ? 'BUSES' : 'CARS'} YOU WANT TO RENT
            </Text>
            <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setDropdownVisible(true)}
                activeOpacity={0.7}
            >
                <Text style={styles.dropdownText}>
                    {selectedNumber ? `${selectedNumber} ${isBus ? (selectedNumber === 1 ? 'bus' : 'buses') : (selectedNumber === 1 ? 'car' : 'cars')}` : `No of ${isBus ? 'buses' : 'cars'}`}
                </Text>
                <Ionicons 
                    name={dropdownVisible ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={Colors.BLACK} 
                />
            </TouchableOpacity>
            <Modal 
                visible={dropdownVisible} 
                transparent 
                animationType="fade"
                onRequestClose={() => setDropdownVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay} 
                    activeOpacity={1}
                    onPress={() => setDropdownVisible(false)}
                >
                    <View style={styles.dropdownModal}>
                        <View style={styles.dropdownHeader}>
                            <Text style={styles.dropdownTitle}>Select Number</Text>
                            <TouchableOpacity 
                                style={styles.closeButton}
                                onPress={() => setDropdownVisible(false)}
                            >
                                <Ionicons name="close" size={20} color={Colors.BLACK} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={numberOptions}
                            keyExtractor={item => item.toString()}
                            showsVerticalScrollIndicator={false}
                            renderItem={({item, index}) => (
                                <TouchableOpacity
                                    style={[
                                        styles.dropdownItem,
                                        selectedNumber === item && styles.selectedDropdownItem,
                                        index === numberOptions.length - 1 && styles.lastDropdownItem
                                    ]}
                                    onPress={() => {
                                        setSelectedNumber(item);
                                        setDropdownVisible(false);
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.dropdownItemText,
                                        selectedNumber === item && styles.selectedDropdownItemText
                                    ]}>
                                        {item} {isBus ? (item === 1 ? 'bus' : 'buses') : (item === 1 ? 'car' : 'cars')}
                                    </Text>
                                    {selectedNumber === item && (
                                        <Ionicons name="checkmark" size={20} color={Colors.PRIMARY} />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
            <Text style={styles.deliveryQuestion}>
                WOULD YOU BE ABLE TO DELIVER {'\n'}THE {isBus ? 'BUS' : 'CAR'} TO DOOR?
            </Text>
            <View style={styles.deliveryButtons}>
                <TouchableOpacity
                    style={[styles.yesNoButton, canDeliver === true && styles.selectedYes]}
                    onPress={() => setCanDeliver(true)}
                >
                    <Text style={[styles.yesNoText, canDeliver === true && styles.selectedYesText]}>YES</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.yesNoButton, canDeliver === false && styles.selectedNo]}
                    onPress={() => setCanDeliver(false)}
                >
                    <Text style={[styles.yesNoText, canDeliver === false && styles.selectedNoText]}>NO</Text>
                </TouchableOpacity>
            </View>
            <View style={{flex: 1}} />
            <Button
                title="Continue"
                onPress={() => navigation.navigate('CarDetails', { canDeliver, selectedNumber, type })}
                type="primary"
            />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.BACKGROUND_GREY,
        // padding: 20,
        // paddingTop: 40,
    },
    question: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.BLACK,
        textAlign: 'center',
        marginBottom: 30,
    },
    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.LINE_GRAY,
        borderRadius: 8,
        padding: 16,
        backgroundColor: Colors.WHITE,
        marginBottom: 30,
    },
    dropdownText: {
        fontSize: 16,
        color: Colors.BLACK,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    dropdownModal: {
        backgroundColor: Colors.WHITE,
        borderRadius: 12,
        width: 280,
        maxHeight: 350,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    dropdownHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.LINE_GRAY,
    },
    dropdownTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.BLACK,
    },
    closeButton: {
        padding: 4,
        borderRadius: 15,
        backgroundColor: Colors.BACKGROUND_GREY,
    },
    dropdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.LINE_GRAY,
    },
    lastDropdownItem: {
        borderBottomWidth: 0,
    },
    selectedDropdownItem: {
        backgroundColor: Colors.BACKGROUND_GREY,
    },
    dropdownItemText: {
        fontSize: 16,
        color: Colors.BLACK,
    },
    selectedDropdownItemText: {
        color: Colors.PRIMARY,
        fontWeight: '600',
    },
    deliveryQuestion: {
        fontSize: 16,
        color: Colors.BLACK,
        textAlign: 'center',
        marginBottom: 20,
    },
    deliveryButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 40,
    },
    yesNoButton: {
        flex: 1,
        marginHorizontal: 10,
        paddingVertical: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.LINE_GRAY,
        alignItems: 'center',
        backgroundColor: Colors.WHITE,
    },
    selectedYes: {
        backgroundColor: Colors.PRIMARY,
        borderColor: Colors.PRIMARY,
    },
    selectedNo: {
        backgroundColor: Colors.WHITE,
        borderColor: Colors.PRIMARY,
    },
    yesNoText: {
        fontSize: 16,
        color: Colors.BLACK,
        fontWeight: 'bold',
    },
    selectedYesText: {
        color: Colors.WHITE,
    },
    selectedNoText: {
        color: Colors.PRIMARY,
    },
    headerContainer: {
        backgroundColor: Colors.BACKGROUND_GREY,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        paddingTop: 50,
        borderBottomWidth: 1,
        borderBottomColor: Colors.LINE_GRAY,
    },
    headerBack: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.PRIMARY,
        alignItems: 'center',
        justifyContent: 'center',
        paddingRight: 3,
        marginRight: 8,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.BLACK,
        textAlign: 'center',
        flex: 1,
    },
    headerRight: {
        width: 40,
        height: 40,
    },
});

export default AddCar;
