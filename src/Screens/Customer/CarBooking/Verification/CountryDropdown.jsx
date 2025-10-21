import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
} from 'react-native';
import styles from './styles';
import MainHeader from '../../../../Components/MainHeader';
import { Colors } from '../../../../Themes/MyColors';
const COUNTRIES = [
  { 
    name: 'United States', 
    code: '+1', 
    pattern: /^[2-9]\d{2}[2-9]\d{2}\d{4}$/,
    placeholder: '1234567890',
    minLength: 10,
    maxLength: 10
  },
  { 
    name: 'United Kingdom', 
    code: '+44', 
    pattern: /^[1-9]\d{8,9}$/,
    placeholder: '1234567890',
    minLength: 9,
    maxLength: 10
  },
  { 
    name: 'India', 
    code: '+91', 
    pattern: /^[6-9]\d{9}$/,
    placeholder: '9876543210',
    minLength: 10,
    maxLength: 10
  },
  { 
    name: 'Canada', 
    code: '+1', 
    pattern: /^[2-9]\d{2}[2-9]\d{2}\d{4}$/,
    placeholder: '1234567890',
    minLength: 10,
    maxLength: 10
  },
  { 
    name: 'Australia', 
    code: '+61', 
    pattern: /^[2-9]\d{8}$/,
    placeholder: '123456789',
    minLength: 9,
    maxLength: 9
  },
  { 
    name: 'Germany', 
    code: '+49', 
    pattern: /^[1-9]\d{7,10}$/,
    placeholder: '1234567890',
    minLength: 8,
    maxLength: 11
  },
  { 
    name: 'France', 
    code: '+33', 
    pattern: /^[1-9]\d{8}$/,
    placeholder: '123456789',
    minLength: 9,
    maxLength: 9
  },
  { 
    name: 'Japan', 
    code: '+81', 
    pattern: /^[1-9]\d{9,10}$/,
    placeholder: '1234567890',
    minLength: 10,
    maxLength: 11
  },
  // Add more as needed
];

const CountryDropdown = ({ selected, onSelect }) => {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.dropdownText}>
          {selected ? `${selected.name} (${selected.code})` : 'Select Country'}
        </Text>
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <MainHeader 
              title="Select Country"
              showBackButton={true}
              showOptionsButton={false}
              onBackPress={() => setVisible(false)}
            />
            
            <View style={styles.modalContent}>
              <TextInput
                placeholder="Search country..."
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
                placeholderTextColor={Colors.PRIMARY_GREY}
                color={Colors.BLACK}  
              />
              <FlatList
                data={filtered}
                keyExtractor={(item) => item.name}
                style={styles.countryList}
                showsVerticalScrollIndicator={true}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.countryItem}
                    onPress={() => {
                      onSelect(item);
                      setVisible(false);
                    }}
                  >
                    <Text style={styles.countryText}>{item.name} ({item.code})</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CountryDropdown;
