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

const COUNTRIES = [
  { name: 'United States', code: '+1' },
  { name: 'United Kingdom', code: '+44' },
  { name: 'India', code: '+91' },
  { name: 'Canada', code: '+1' },
  { name: 'Australia', code: '+61' },
  { name: 'Germany', code: '+49' },
  { name: 'France', code: '+33' },
  { name: 'Japan', code: '+81' },
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

      <Modal visible={visible} animationType="slide">
        <View style={styles.modalContainer}>
          <TextInput
            placeholder="Search country..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.countryItem}
                onPress={() => {
                  onSelect(item);
                  setVisible(false);
                }}
              >
                <Text>{item.name} ({item.code})</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            onPress={() => setVisible(false)}
            style={styles.closeButton}
          >
            <Text style={{ color: '#d21f3c', fontWeight: 'bold' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default CountryDropdown;
