import { initializeApp, getApp, getApps } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import { getDatabase, serverTimestamp } from '@react-native-firebase/database';
import { getStorage } from '@react-native-firebase/storage';
import { getAnalytics } from '@react-native-firebase/analytics';

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp() : getApp();
const authRef = getAuth(app);
const databaseRef = getDatabase(app);
const storageRef = getStorage(app);
const analyticsRef = getAnalytics(app);

// Sign up
export const signUp = async (email, password, userData) => {
  try {
    const userCredential = await authRef.createUserWithEmailAndPassword(email, password);
    const userProfile = {
      ...userData,
      userType: userData.userType,
      emailVerified: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await databaseRef.ref(`users/${userCredential.user.uid}`).set(userProfile);

    return {
      user: userCredential.user,
      userData: userProfile,
    };
  } catch (error) {
    console.error('Error in signUp:', error);
    throw error;
  }
};

// Sign in
export const signIn = async (email, password) => {
  try {
    const userCredential = await authRef.signInWithEmailAndPassword(email, password);
    const snapshot = await databaseRef.ref(`users/${userCredential.user.uid}`).once('value');
    return {
      user: userCredential.user,
      userData: snapshot.val(),
    };
  } catch (error) {
    console.error('Error in signIn:', error);
    throw error;
  }
};

// Reset password
export const sendPasswordResetEmail = (email) => {
  return authRef.sendPasswordResetEmail(email);
};

// Sign out
export const signOut = async () => {
  try {
    await authRef.signOut();
  } catch (error) {
    console.error('Error in signOut:', error);
    throw error;
  }
};

// Get user data
export const getUserData = async (userId) => {
  const snapshot = await databaseRef.ref(`users/${userId}`).once('value');
  return snapshot.val();
};

// Update user data
export const updateUserData = async (userId, data) => {
  await databaseRef.ref(`users/${userId}`).update(data);
};

// Add car
export const addCar = async (vendorId, carData) => {
  const carRef = databaseRef.ref('cars').push();
  await carRef.set({
    ...carData,
    vendorId,
    createdAt: serverTimestamp(),
  });
  return carRef.key;
};

// Get cars
export const getCars = async (filters = {}) => {
  try {
    const type = filters.type?.toLowerCase() || 'cars';
    const tableName = type.endsWith('s') ? type : `${type}s`;
    let query = databaseRef.ref(tableName);

    // Only filter by vendorId if it's explicitly provided
    if (filters.vendorId) {
      query = query.orderByChild('vendorId').equalTo(filters.vendorId);
    }

    const snapshot = await query.once('value');
    return snapshot.val() || {};
  } catch (error) {
    console.error('Error fetching cars:', error);
    throw error;
  }
};

// Delete vehicle (car or bus)
export const deleteVehicle = async (vehicleId, type = 'cars') => {
  const tableName = type.endsWith('s') ? type : `${type}s`;
  const vehicleSnap = await databaseRef.ref(tableName).child(vehicleId).once('value');
  const vehicleData = vehicleSnap.val();

  if (vehicleData?.photo) {
    try {
      const imageRef = storageRef.ref(vehicleData.photo);
      await storageRef.ref(imageRef).delete();
    } catch (error) {
      console.warn('Image delete failed:', error);
    }
  }

  await databaseRef.ref(tableName).child(vehicleId).remove();
};

// Create booking
export const createBooking = async (bookingData) => {
  // Use a generic 'vehicle' field and always include customerId and vendorId
  const { vehicle, customerId, ...rest } = bookingData;
  const vendorId = vehicle?.vendorId || '';
  const bookingRef = databaseRef.ref('bookings').push();
  await bookingRef.set({
    ...rest,
    vehicle,
    customerId,
    vendorId,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
  return bookingRef.key;
};

// Get bookings
export const getBookings = async (userId, userType) => {
  let bookingsRef = databaseRef.ref('bookings');

  if (userType === 'customer') {
    bookingsRef = databaseRef.ref('bookings').orderByChild('customerId').equalTo(userId);
  } else if (userType === 'vendor') {
    bookingsRef = databaseRef.ref('bookings').orderByChild('vendorId').equalTo(userId);
  }

  const snapshot = await bookingsRef.once('value');
  return snapshot.val();
};

// Update booking status
export const updateBookingStatus = async (bookingId, status) => {
  await databaseRef.ref(`bookings/${bookingId}/status`).set(status);
  await databaseRef.ref(`bookings/${bookingId}/updatedAt`).set(serverTimestamp());
};

// Get admin dashboard stats
export const getAdminStats = async () => {
  try {
    const [usersSnapshot, bookingsSnapshot] = await Promise.all([
      databaseRef.ref('users').once('value'),
      databaseRef.ref('bookings').once('value'),
    ]);

    const users = usersSnapshot.val() || {};
    const bookings = bookingsSnapshot.val() || {};

    const stats = {
      totalUsers: Object.keys(users).length,
      activeVendors: Object.values(users).filter(user => user.userType === 'provider').length,
      totalBookings: Object.keys(bookings).length,
      revenue: Object.values(bookings).reduce((sum, booking) => sum + (booking.amount || 0), 0),
    };

    return stats;
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
};

// Verify car
export const verifyCar = async (carId, type = 'car') => {
  const table = type === 'car' ? 'cars' : 'buses';
  await databaseRef.ref(`${table}/${carId}/verified`).set(true);
  await databaseRef.ref(`${table}/${carId}/updatedAt`).set(serverTimestamp());
};

// Get current user
export const getCurrentUser = () => {
  return authRef.currentUser;
};

// On auth state changed
export const onAuthStateChanged = (callback) => {
  return authRef.onAuthStateChanged(callback);
};

// Analytics
export const logEvent = async (eventName, params = {}) => {
  try {
    await analyticsRef.logEvent(eventName, params);
  } catch (error) {
    console.error('Error logging analytics event:', error);
  }
};

// Get image reference from URL
export const getImageRefFromURL = (imageUrl) => {
  return storageRef.ref(imageUrl);
};

// Get image reference
export const getImageRef = (path) => {
  return storageRef.ref(path);
};

// Upload file to storage
export const uploadFile = async (fileUri, path) => {
  try {
    const reference = storageRef.ref(path);
    await reference.putFile(fileUri);
    return await reference.getDownloadURL();
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Delete file from storage
export const deleteFile = async (path) => {
  try {
    const reference = storageRef.ref(path);
    await reference.delete();
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Get database reference
export const getDatabaseRef = (path) => {
  return databaseRef.ref(path);
};

// Get database value
export const getDatabaseValue = async (path) => {
  const snapshot = await databaseRef.ref(path).once('value');
  return snapshot.val();
};

// Set database value
export const setDatabaseValue = async (path, value) => {
  await databaseRef.ref(path).set(value);
};

// Update database value
export const updateDatabaseValue = async (path, value) => {
  await databaseRef.ref(path).update(value);
};

// Remove database value
export const removeDatabaseValue = async (path) => {
  await databaseRef.ref(path).remove();
};

// Save bank details and car preferences
export const saveBankDetailsAndPreferences = async (userId, data) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const update = {
      bankDetails: data.bankDetails,
      carDeliveryPreference: data.canDeliver,
      updatedAt: serverTimestamp(),
    };

    const userRef = databaseRef.ref(`users/${userId}`);
    await userRef.update(update);
    return update;
  } catch (error) {
    console.error('Error saving bank details:', error);
    throw error;
  }
};

// Save cars with images
export const saveCarsWithImages = async (vendorId, cars, type) => {
  try {
    if (!vendorId) {
      throw new Error('Vendor ID is required');
    }

    // 1. Upload car images and prepare car data
    const carsWithImages = await Promise.all(
      cars.map(async car => {
        // If there's no photo, just return the car data without uploading
        if (!car.photo) {
          return {
            ...car,
            vendorId,
            createdAt: serverTimestamp(),
            verified: false,
          };
        }

        // Only attempt to upload if there's a photo
        const imageUrl = await uploadFile(car.photo, `cars/${vendorId}/${Date.now()}`);
        return {
          ...car,
          photo: imageUrl,
          vendorId,
          createdAt: serverTimestamp(),
          verified: false,
        };
      }),
    );

    // 2. Save cars to appropriate table
    const carTable = type === 'car' ? 'cars' : 'buses';
    const carPromises = carsWithImages.map(car =>
      databaseRef.ref(carTable).push().set(car)
    );
    await Promise.all(carPromises);

    return carsWithImages;
  } catch (error) {
    console.error('Error saving cars:', error);
    throw error;
  }
};

// Get server timestamp
export const getServerTimestamp = () => {
  return serverTimestamp();
};

// Update vehicle
export const updateVehicle = async (vehicleId, updates, type = 'cars') => {
  try {
    if (!vehicleId) {
      throw new Error('Vehicle ID is required');
    }

    const vehicleRef = databaseRef.ref(`${type}/${vehicleId}`);
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    await vehicleRef.update(updateData);
    return true;
  } catch (error) {
    console.error('Error updating vehicle:', error);
    throw error;
  }
};

// Get vendor details
export const getVendorDetails = async (vendorId) => {
  try {
    if (!vendorId) {
      throw new Error('Vendor ID is required');
    }

    const vendorRef = databaseRef.ref(`users/${vendorId}`);
    const snapshot = await vendorRef.once('value');
    const vendorData = snapshot.val();

    if (!vendorData) {
      throw new Error('Vendor not found');
    }

    return vendorData;
  } catch (error) {
    console.error('Error fetching vendor details:', error);
    throw error;
  }
};

// Get vehicles with vendor details
export const getVehiclesWithVendorDetails = async ({ type = 'cars' }) => {
  try {
    const data = await getCars({ type });

    if (!data) {
      return [];
    }

    const vehiclesWithVendor = await Promise.all(
      Object.entries(data).map(async ([id, vehicle]) => {
        try {
          // Skip vendor details fetch if vendorId is missing
          if (!vehicle.vendorId) {
            return {
              id,
              ...vehicle,
              vendorName: 'Unknown Vendor',
            };
          }

          const vendorData = await getVendorDetails(vehicle.vendorId);
          return {
            id,
            ...vehicle,
            vendorName: vendorData?.fullName || 'Unknown Vendor',
          };
        } catch (error) {
          console.error('Error fetching vendor details:', error);
          return {
            id,
            ...vehicle,
            vendorName: 'Unknown Vendor',
          };
        }
      })
    );

    return vehiclesWithVendor;
  } catch (error) {
    console.error('Error fetching vehicles with vendor details:', error);
    throw error;
  }
};
