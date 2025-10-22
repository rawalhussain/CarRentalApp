import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './styles';
import Loader from '../../Components/Loader';
import { showMessageAlert } from '../../Lib/utils/CommonHelper';
import useUserStore from '../../store/useUserStore';
import useAuthStore from '../../store/useAuthStore';
import { signOut, getAdminStats, getDatabaseRef } from '../../Config/firebase';
import { SafeAreaView } from 'react-native-safe-area-context';

const AdminDashboard = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
    loadDashboardData();
  }, [userData]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchStats(), fetchRecentBookings()]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const fetchStats = async () => {
    try {
      const dashboardStats = await getAdminStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      showMessageAlert('Error', 'Failed to fetch dashboard stats', 'danger');
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
    } catch (error) {
      console.error('Error fetching recent bookings:', error);
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
    { title: 'Total Bookings', value: stats.totalBookings.toString(), icon: 'calendar-outline' },
    { title: 'Revenue', value: `$${stats.revenue.toFixed(2)}`, icon: 'cash-outline' },
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
    <SafeAreaView style={styles.container}>
     
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={25} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Booking')}
            >
              <Ionicons name="calendar-outline" size={24} color="#E53935" />
              <Text style={styles.quickActionText}>Bookings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('MyCars')}
            >
              <Ionicons name="car-outline" size={24} color="#E53935" />
              <Text style={styles.quickActionText}>Vehicles</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Packages')}
            >
              <Ionicons name="package-outline" size={24} color="#E53935" />
              <Text style={styles.quickActionText}>Packages</Text>
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
          {recentActivities.length === 0 ? (
            <Text style={styles.emptyText}>No recent activities.</Text>
          ) : (
            recentActivities.map((activity) => (
              <TouchableOpacity
                key={activity.id}
                style={styles.activityCard}
                onPress={() => navigation.navigate('BookingDetails', { ...recentBookings.find(b => b.id === activity.id), bookingId: activity.id })}
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
       {loading && <Loader />}
    </SafeAreaView>
  );
};

export default AdminDashboard;
