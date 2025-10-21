import auth from '@react-native-firebase/auth';
import database, { firebase } from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import analytics from '@react-native-firebase/analytics';

// Configure database to use emulator in development
// if (__DEV__) {
//   database().useEmulator('localhost', 9000);
// }

// Sign up
export const signUp = async (email, password, userData) => {
  try {
    console.log('Creating user with email:', email);
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    console.log('User created with UID:', userCredential.user.uid);
    
    const userProfile = {
      ...userData,
      userType: userData.userType,
      emailVerified: false,
      createdAt: database.ServerValue.TIMESTAMP,
      updatedAt: database.ServerValue.TIMESTAMP,
    };

    console.log('Storing user profile:', userProfile);
    await database().ref(`users/${userCredential.user.uid}`).set(userProfile);
    console.log('User profile stored successfully');

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
    console.log('Signing in with email:', email);
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    console.log('Auth successful, user UID:', userCredential.user.uid);
    
    const snapshot = await database().ref(`users/${userCredential.user.uid}`).once('value');
    const userData = snapshot.val();
    console.log('User data from database:', userData);
    
    return {
      user: userCredential.user,
      userData: userData,
    };
  } catch (error) {
    console.error('Error in signIn:', error);
    throw error;
  }
};

// Reset password
export const sendPasswordResetEmail = (email) => {
  return auth().sendPasswordResetEmail(email);
};

// Sign out
export const signOut = async () => {
  try {
    await auth().signOut();
  } catch (error) {
    console.error('Error in signOut:', error);
    throw error;
  }
};

// Get user data
export const getUserData = async (userId) => {
  try {
    console.log('Getting user data for userId:', userId);
    const snapshot = await database().ref(`users/${userId}`).once('value');
    const userData = snapshot.val();
    console.log('Retrieved userData from database:', userData);
    return userData;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Update user data
export const updateUserData = async (userId, data) => {
  await database().ref(`users/${userId}`).update(data);
};

// Add car
export const addCar = async (vendorId, carData) => {
  const carRef = database().ref('cars').push();
  await carRef.set({
    ...carData,
    vendorId,
    createdAt: firebase.database.ServerValue.TIMESTAMP,
  });
  return carRef.key;
};

// Get cars
export const getCars = async (filters = {}) => {
  try {
    const type = filters.type?.toLowerCase() || 'cars';
    const tableName = type.endsWith('s') ? type : `${type}s`;
    let query = database().ref(tableName);

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
  const vehicleSnap = await database().ref(tableName).child(vehicleId).once('value');
  const vehicleData = vehicleSnap.val();

  if (vehicleData?.photo) {
    try {
      const imageRef = storage().ref(vehicleData.photo);
      await storage().ref(imageRef).delete();
    } catch (error) {
      console.warn('Image delete failed:', error);
    }
  }

  await database().ref(tableName).child(vehicleId).remove();
};

// Create booking
export const createBooking = async (bookingData) => {
  // Use a generic 'vehicle' field and always include customerId and vendorId
  const { vehicle, customerId, ...rest } = bookingData;
  const vendorId = vehicle?.vendorId || '';
  const bookingRef = database().ref('bookings').push();
  await bookingRef.set({
    ...rest,
    vehicle,
    customerId,
    vendorId,
    status: 'pending',
    createdAt: firebase.database.ServerValue.TIMESTAMP,
  });
  return bookingRef.key;
};

// Get bookings
export const getBookings = async (userId, userType) => {
  let bookingsRef = database().ref('bookings');

  if (userType === 'customer') {
    bookingsRef = database().ref('bookings').orderByChild('customerId').equalTo(userId);
  } else if (userType === 'vendor') {
    bookingsRef = database().ref('bookings').orderByChild('vendorId').equalTo(userId);
  }

  const snapshot = await bookingsRef.once('value');
  return snapshot.val();
};

// Update booking status
export const updateBookingStatus = async (bookingId, status) => {
  await database().ref(`bookings/${bookingId}/status`).set(status);
  await database().ref(`bookings/${bookingId}/updatedAt`).set(firebase.database.ServerValue.TIMESTAMP);
};

// Get admin dashboard stats
export const getAdminStats = async () => {
  try {
    const [usersSnapshot, bookingsSnapshot] = await Promise.all([
      database().ref('users').once('value'),
      database().ref('bookings').once('value'),
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
  await database().ref(`${table}/${carId}/verified`).set(true);
  await database().ref(`${table}/${carId}/updatedAt`).set(firebase.database.ServerValue.TIMESTAMP);
};

// Get current user
export const getCurrentUser = () => {
  return auth().currentUser;
};

// On auth state changed
export const onAuthStateChanged = (callback) => {
  return auth().onAuthStateChanged(callback);
};

// Analytics
export const logEvent = async (eventName, params = {}) => {
  try {
    await analytics().logEvent(eventName, params);
  } catch (error) {
    console.error('Error logging analytics event:', error);
  }
};

// Get image reference from URL
export const getImageRefFromURL = (imageUrl) => {
  return storage().ref(imageUrl);
};

// Get image reference
export const getImageRef = (path) => {
  return storage().ref(path);
};

// Upload file to storage
export const uploadFile = async (fileUri, path) => {
  try {
    const reference = storage().ref(path);
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
    const reference = storage().ref(path);
    await reference.delete();
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Get database reference
export const getDatabaseRef = (path) => {
  return database().ref(path);
};

// Get database value
export const getDatabaseValue = async (path) => {
  const snapshot = await database().ref(path).once('value');
  return snapshot.val();
};

// Set database value
export const setDatabaseValue = async (path, value) => {
  await database().ref(path).set(value);
};

// Update database value
export const updateDatabaseValue = async (path, value) => {
  await database().ref(path).update(value);
};

// Remove database value
export const removeDatabaseValue = async (path) => {
  await database().ref(path).remove();
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
      updatedAt: firebase.database.ServerValue.TIMESTAMP,
    };

    const userRef = database().ref(`users/${userId}`);
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

    console.log('Saving cars with images:', cars);

    // Prepare car data (images already uploaded in BankDetails component)
    const carsData = cars.map(car => ({
      ...car,
      vendorId,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      verified: false,
    }));

    // Save cars to appropriate table
    const carTable = type === 'car' ? 'cars' : 'buses';
    const carPromises = carsData.map(car =>
      database().ref(carTable).push().set(car)
    );
    await Promise.all(carPromises);

    console.log('Cars saved successfully to', carTable);
    return carsData;
  } catch (error) {
    console.error('Error saving cars:', error);
    throw error;
  }
};

// Get server timestamp
export const getServerTimestamp = () => {
  return firebase.database.ServerValue.TIMESTAMP;
};

// Update vehicle
export const updateVehicle = async (vehicleId, updates, type = 'cars') => {
  try {
    if (!vehicleId) {
      throw new Error('Vehicle ID is required');
    }

    const vehicleRef = database().ref(`${type}/${vehicleId}`);
    const updateData = {
      ...updates,
      updatedAt: firebase.database.ServerValue.TIMESTAMP,
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

    const vendorRef = database().ref(`users/${vendorId}`);
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
