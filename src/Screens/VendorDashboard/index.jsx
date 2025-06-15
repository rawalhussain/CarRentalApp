import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './styles';

const VendorDashboard = ({ navigation }) => {
  const stats = [
    { title: 'Total Cars', value: '12', icon: 'car-outline' },
    { title: 'Active Bookings', value: '5', icon: 'calendar-outline' },
    { title: 'Total Revenue', value: '$2,450', icon: 'cash-outline' },
    { title: 'Rating', value: '4.8', icon: 'star-outline' },
  ];

  const recentBookings = [
    {
      id: 1,
      carName: 'Toyota Camry 2023',
      customer: 'John Doe',
      date: '2024-03-20',
      status: 'Active',
    },
    {
      id: 2,
      carName: 'Honda Civic 2024',
      customer: 'Jane Smith',
      date: '2024-03-19',
      status: 'Completed',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Vendor Dashboard</Text>
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
              <Ionicons name="add-circle-outline" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Add New Car</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="calendar-outline" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>View Schedule</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Bookings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Bookings</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {recentBookings.map((booking) => (
            <View key={booking.id} style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <Text style={styles.carName}>{booking.carName}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: booking.status === 'Active' ? '#E3F2FD' : '#E8F5E9' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: booking.status === 'Active' ? '#1976D2' : '#2E7D32' }
                  ]}>{booking.status}</Text>
                </View>
              </View>
              <View style={styles.bookingDetails}>
                <Text style={styles.bookingText}>Customer: {booking.customer}</Text>
                <Text style={styles.bookingText}>Date: {booking.date}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default VendorDashboard;
