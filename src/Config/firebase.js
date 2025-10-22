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
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    // Send email verification
    await userCredential.user.sendEmailVerification();

    const userProfile = {
      ...userData,
      email: email,
      userType: userData.userType,
      emailVerified: false,
      createdAt: database.ServerValue.TIMESTAMP,
      updatedAt: database.ServerValue.TIMESTAMP,
    };

    await database().ref(`users/${userCredential.user.uid}`).set(userProfile);

    return {
      user: userCredential.user,
      userData: userProfile,
    };
  } catch (error) {
    throw error;
  }
};

// Sign in
export const signIn = async (email, password) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);

    // Reload user to get latest emailVerified status
    await userCredential.user.reload();
    const isEmailVerified = auth().currentUser.emailVerified;
    // Check if email is verified
    if (!isEmailVerified) {
      // Sign out the user
      await auth().signOut();
      // Throw custom error
      const error = new Error('Please verify your email to continue. Check your inbox for the verification link.');
      error.code = 'auth/email-not-verified';
      throw error;
    }

    const snapshot = await database().ref(`users/${userCredential.user.uid}`).once('value');
    const userData = snapshot.val();
    // Update emailVerified status in database
    await database().ref(`users/${userCredential.user.uid}`).update({
      emailVerified: true,
      updatedAt: database.ServerValue.TIMESTAMP,
    });

    return {
      user: userCredential.user,
      userData: { ...userData, emailVerified: true },
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
    const snapshot = await database().ref(`users/${userId}`).once('value');
    const userData = snapshot.val();
    return userData;
  } catch (error) {
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
  try {
    // Validate required fields
    if (!bookingData.customerId) {
      throw new Error('Customer ID is required');
    }

    // Use a generic 'vehicle' field and always include customerId and vendorId
    const { vehicle, customerId, ...rest } = bookingData;
    const vendorId = vehicle?.vendorId || '';

    const bookingRef = database().ref('bookings').push();

    const bookingRecord = {
      ...rest,
      vehicle,
      customerId,
      vendorId,
      status: 'pending',
      createdAt: firebase.database.ServerValue.TIMESTAMP,
    };
    await bookingRef.set(bookingRecord);
    return bookingRef.key;
  } catch (error) {
    throw error;
  }
};

// Create package booking (separate from regular bookings)
export const createPackageBooking = async (bookingData) => {
  try {
    // Validate required fields
    if (!bookingData.customerId) {
      throw new Error('Customer ID is required');
    }

    if (!bookingData.packageId) {
      throw new Error('Package ID is required');
    }

    const { customerId, packageId, ...rest } = bookingData;
    const bookingRef = database().ref('package_bookings').push();
    const bookingRecord = {
      ...rest,
      customerId,
      packageId,
      vendorId: '', // Package bookings have no vendor
      status: 'pending',
      bookingType: 'ride_package',
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      updatedAt: firebase.database.ServerValue.TIMESTAMP,
    };
    await bookingRef.set(bookingRecord);
    return bookingRef.key;
  } catch (error) {
    throw error;
  }
};

// Get package bookings
export const getPackageBookings = async (userId, userType) => {
  try {
    let bookingsRef = database().ref('package_bookings');

    if (userType === 'customer') {
      bookingsRef = database().ref('package_bookings').orderByChild('customerId').equalTo(userId);
    } else if (userType === 'admin') {
      bookingsRef = database().ref('package_bookings');
    }

    const snapshot = await bookingsRef.once('value');
    const bookingsData = snapshot.val();

    if (!bookingsData) {
      return [];
    }

    // Convert object to array with booking IDs
    return Object.keys(bookingsData).map(key => ({
      id: key,
      ...bookingsData[key],
    }));
  } catch (error) {
    console.error('Error in getPackageBookings:', error);
    throw error;
  }
};

// Update package booking status
export const updatePackageBookingStatus = async (bookingId, status) => {
  try {
    if (!bookingId) {
      throw new Error('Booking ID is required');
    }

    const updates = {
      status: status,
      updatedAt: firebase.database.ServerValue.TIMESTAMP,
    };

    await database().ref(`package_bookings/${bookingId}`).update(updates);
  } catch (error) {
    console.error('Error updating package booking status:', error);
    throw error;
  }
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
  try {
    if (!bookingId) {
      throw new Error('Booking ID is required');
    }

    const updates = {
      status: status,
      updatedAt: firebase.database.ServerValue.TIMESTAMP,
    };

    await database().ref(`bookings/${bookingId}`).update(updates);
    return true;
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
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

// Ride Packages Management Functions (Separate System)
export const addRidePackage = async (packageData) => {
  try {
    const packageRef = database().ref('ride_packages').push();
    await packageRef.set({
      ...packageData,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      updatedAt: firebase.database.ServerValue.TIMESTAMP,
    });
    return packageRef.key;
  } catch (error) {
    console.error('Error adding ride package:', error);
    throw error;
  }
};

export const getRidePackages = async () => {
  try {
    const snapshot = await database().ref('ride_packages').once('value');
    const data = snapshot.val() || {};
    return Object.entries(data).map(([id, packageData]) => ({
      id,
      ...packageData,
    }));
  } catch (error) {
    console.error('Error fetching ride packages:', error);
    throw error;
  }
};

export const updateRidePackage = async (packageId, updates) => {
  try {
    const packageRef = database().ref(`ride_packages/${packageId}`);
    const updateData = {
      ...updates,
      updatedAt: firebase.database.ServerValue.TIMESTAMP,
    };
    await packageRef.update(updateData);
    return true;
  } catch (error) {
    console.error('Error updating ride package:', error);
    throw error;
  }
};

export const deleteRidePackage = async (packageId) => {
  try {
    await database().ref(`ride_packages/${packageId}`).remove();
    return true;
  } catch (error) {
    console.error('Error deleting ride package:', error);
    throw error;
  }
};

// Package Cars Management Functions
export const addPackageCar = async (packageId, carData) => {
  try {
    const carRef = database().ref(`package_cars/${packageId}`).push();
    await carRef.set({
      ...carData,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
    });
    return carRef.key;
  } catch (error) {
    console.error('Error adding package car:', error);
    throw error;
  }
};

export const getPackageCars = async (packageId) => {
  try {
    const snapshot = await database().ref(`package_cars/${packageId}`).once('value');
    const data = snapshot.val() || {};
    return Object.entries(data).map(([id, carData]) => ({
      id,
      ...carData,
    }));
  } catch (error) {
    console.error('Error fetching package cars:', error);
    throw error;
  }
};

// Package Pricing Rules Functions
export const addPackagePricing = async (packageId, pricingData) => {
  try {
    const pricingRef = database().ref(`package_pricing/${packageId}`);
    await pricingRef.set({
      ...pricingData,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      updatedAt: firebase.database.ServerValue.TIMESTAMP,
    });
    return true;
  } catch (error) {
    console.error('Error adding package pricing:', error);
    throw error;
  }
};

export const getPackagePricing = async (packageId) => {
  try {
    const snapshot = await database().ref(`package_pricing/${packageId}`).once('value');
    return snapshot.val();
  } catch (error) {
    console.error('Error fetching package pricing:', error);
    throw error;
  }
};

// Calculate fare based on distance and package rate
export const calculateFare = (distance, ratePerMile, baseFare = 0) => {
  const distanceInMiles = distance * 0.621371; // Convert km to miles
  const fare = baseFare + (distanceInMiles * ratePerMile);
  return Math.round(fare * 100) / 100; // Round to 2 decimal places
};
