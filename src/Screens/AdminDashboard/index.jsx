import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './styles';

const AdminDashboard = ({ navigation }) => {
  const stats = [
    { title: 'Total Users', value: '1,234', icon: 'people-outline' },
    { title: 'Active Vendors', value: '89', icon: 'business-outline' },
    { title: 'Total Bookings', value: '456', icon: 'calendar-outline' },
    { title: 'Revenue', value: '$45,678', icon: 'cash-outline' },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'New Vendor',
      description: 'John\'s Auto Rental joined the platform',
      time: '2 hours ago',
    },
    {
      id: 2,
      type: 'New Booking',
      description: 'Booking #1234 created for Toyota Camry',
      time: '3 hours ago',
    },
    {
      id: 3,
      type: 'Payment',
      description: 'Payment received for Booking #1233',
      time: '5 hours ago',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle-outline" size={32} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Ionicons name={stat.icon} size={24} color="#E53935" />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="person-add-outline" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Add Vendor</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="settings-outline" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {recentActivities.map((activity) => (
            <View key={activity.id} style={styles.activityCard}>
              <View style={styles.activityHeader}>
                <View style={styles.activityType}>
                  <Ionicons 
                    name={
                      activity.type === 'New Vendor' ? 'business-outline' :
                      activity.type === 'New Booking' ? 'calendar-outline' :
                      'cash-outline'
                    } 
                    size={20} 
                    color="#E53935" 
                  />
                  <Text style={styles.activityTypeText}>{activity.type}</Text>
                </View>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
              <Text style={styles.activityDescription}>{activity.description}</Text>
            </View>
          ))}
        </View>

        {/* System Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Status</Text>
          <View style={styles.systemStatusCard}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Server Status</Text>
              <View style={styles.statusIndicator}>
                <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.statusText}>Online</Text>
              </View>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Database</Text>
              <View style={styles.statusIndicator}>
                <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.statusText}>Connected</Text>
              </View>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>API Services</Text>
              <View style={styles.statusIndicator}>
                <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.statusText}>Running</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AdminDashboard; 