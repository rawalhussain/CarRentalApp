import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './styles';
import Loader from '../../Components/Loader';
import { showMessageAlert } from '../../Lib/utils/CommonHelper';
import useUserStore from '../../store/useUserStore';
import useAuthStore from '../../store/useAuthStore';
import { signOut, getAdminStats, getDatabaseRef } from '../../Config/firebase';

const AdminDashboard = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeVendors: 0,
    totalBookings: 0,
    revenue: 0,
  });
  const { userData, clearUserData } = useUserStore();
  const { clearAuth } = useAuthStore();
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    // Check if user is admin
    fetchStats();
    fetchRecentBookings();
  }, [userData]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const dashboardStats = await getAdminStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      showMessageAlert('Error', 'Failed to fetch dashboard stats', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentBookings = async () => {
    try {
      const ref = getDatabaseRef('bookings');
      // Order by createdAt descending, limit to 5
      const snapshot = await ref.orderByChild('createdAt').limitToLast(5).once('value');
      const data = snapshot.val() || {};
      // Convert to array and sort descending
      const arr = Object.entries(data)
        .map(([id, booking]) => ({ id, ...booking }))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setRecentBookings(arr);
    } catch (e) {
      setRecentBookings([]);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      clearUserData();
      clearAuth();
      await signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error during logout:', error);
      showMessageAlert('Error', 'Failed to logout. Please try again.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    { title: 'Total Users', value: stats.totalUsers.toString(), icon: 'people-outline' },
    { title: 'Active Vendors', value: stats.activeVendors.toString(), icon: 'business-outline' },
    { title: 'Total Bookings', value: stats.totalBookings, icon: 'calendar-outline' },
    { title: 'Revenue', value: '$0', icon: 'cash-outline' },
  ];

  const recentActivities = recentBookings.map((booking) => {
    const vehicle = booking.vehicle || {};
    const contact = booking.contactDetails || {};
    return {
      id: booking.id,
      type: 'New Booking',
      description: `${contact.firstName || ''} ${contact.lastName || ''} booked ${vehicle.make || 'Vehicle'} ${vehicle.model || ''}`,
      time: new Date(booking.createdAt).toLocaleDateString(),
    };
  });

  return (
    <View style={styles.container}>
      {loading && <Loader />}
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={32} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {statsData.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Ionicons name={stat.icon} size={24} color="#E53935" />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </View>
          ))}
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {recentActivities.length === 0 ? (
            <Text style={styles.text}>No recent activities.</Text>
          ) : (
            recentActivities.map((activity) => (
              <TouchableOpacity
                key={activity.id}
                style={styles.activityCard}
                onPress={() => navigation.navigate('BookingSummary', { ...recentBookings.find(b => b.id === activity.id), bookingId: activity.id })}
              >
                <View style={styles.activityHeader}>
                  <View style={styles.activityType}>
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#E53935"
                    />
                    <Text style={styles.activityTypeText}>{activity.type}</Text>
                  </View>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
                <Text style={styles.activityDescription}>{activity.description}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default AdminDashboard;
