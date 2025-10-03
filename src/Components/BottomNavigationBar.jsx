import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../Themes/MyColors';

const BottomNavigationBar = ({ 
  activeTab, 
  onTabPress, 
  tabs = [
    { id: 'Home', icon: 'home', label: 'Home' },
    { id: 'Services', icon: 'grid', label: 'Services' },
    { id: 'Activity', icon: 'document-text', label: 'Activity' },
    { id: 'Account', icon: 'person', label: 'Account' }
  ]
}) => {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={styles.tab}
          onPress={() => onTabPress(tab.id)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === tab.id ? tab.icon : `${tab.icon}-outline`}
            size={24}
            color={activeTab === tab.id ? Colors.PRIMARY : Colors.PRIMARY_GREY}
          />
          <Text
            style={[
              styles.tabLabel,
              {
                color: activeTab === tab.id ? Colors.PRIMARY : Colors.PRIMARY_GREY,
                fontWeight: activeTab === tab.id ? '600' : '400',
              },
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 12,
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default BottomNavigationBar;
