import React, {useLayoutEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, StatusBar, Modal, FlatList} from 'react-native';
import { Colors } from '../../../../Themes/MyColors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Button from '../../../../Components/Button';

const AddCar = ({navigation, route}) => {
    const { type } = route.params || {};
    const isBus = type === 'bus';
    const [selectedNumber, setSelectedNumber] = useState(null);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [canDeliver, setCanDeliver] = useState(false);

    const numberOptions = Array.from({length: 10}, (_, i) => i + 1);

    useLayoutEffect(() => {
        navigation.setOptions({
            header: () => (
                <View style={styles.headerContainer}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.headerBack}
                    >
                        <Ionicons name="chevron-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Details</Text>
                    <TouchableOpacity style={styles.headerRight} />
                </View>
            ),
        });
    }, [navigation]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.BACKGROUND_GREY} />
            <Text style={styles.question}>
                HOW MANY {isBus ? 'BUSES' : 'CARS'} YOU WANT TO RENT
            </Text>
            <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setDropdownVisible(true)}
            >
                <Text style={styles.dropdownText}>
                    {selectedNumber ? `${selectedNumber} ${isBus ? 'bus(es)' : 'car(s)'}` : `No of ${isBus ? 'buses' : 'cars'}`}
                </Text>
            </TouchableOpacity>
            <Modal visible={dropdownVisible} transparent animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} onPress={() => setDropdownVisible(false)}>
                    <View style={styles.dropdownModal}>
                        <FlatList
                            data={numberOptions}
                            keyExtractor={item => item.toString()}
                            renderItem={({item}) => (
                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    onPress={() => {
                                        setSelectedNumber(item);
                                        setDropdownVisible(false);
                                    }}
                                >
                                    <Text style={styles.dropdownText}>{item}</Text>
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
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.BACKGROUND_GREY,
        padding: 20,
        paddingTop: 40,
    },
    question: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.BLACK,
        textAlign: 'center',
        marginBottom: 30,
    },
    dropdownButton: {
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
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    dropdownModal: {
        backgroundColor: Colors.WHITE,
        borderRadius: 8,
        padding: 10,
        width: 250,
        maxHeight: 300,
    },
    dropdownItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.LINE_GRAY,
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
