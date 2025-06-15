import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

// Initialize Firebase services
export const initializeFirebase = () => {
  // Firebase is automatically initialized when the app starts
  // You can add any additional initialization logic here
};

// Phone Authentication methods
export const sendOTP = async (phoneNumber) => {
  try {
    const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
    return confirmation;
  } catch (error) {
    throw error;
  }
};

export const verifyOTP = async (confirmation, otp) => {
  try {
    const result = await confirmation.confirm(otp);
    return result.user;
  } catch (error) {
    throw error;
  }
};

// Authentication methods
export const signUp = (email, password, userData) => {
  return auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Send verification email
      userCredential.user.sendEmailVerification();
      
      // Create user data object
      const userProfile = {
        ...userData,
        emailVerified: false,
        createdAt: database.ServerValue.TIMESTAMP,
        updatedAt: database.ServerValue.TIMESTAMP
      };

      // Save user data to database
      return database()
        .ref(`users/${userCredential.user.uid}`)
        .set(userProfile)
        .then(() => {
          // Return the user credential for further use
          return {
            user: userCredential.user,
            profile: userProfile
          };
        });
    });
};

export const signIn = (email, password) => {
  return auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Get user profile data
      return database()
        .ref(`users/${userCredential.user.uid}`)
        .once('value')
        .then((snapshot) => {
          const userData = snapshot.val();
          return {
            user: userCredential.user,
            profile: userData
          };
        });
    });
};

export const sendPasswordResetEmail = (email) => {
  return auth().sendPasswordResetEmail(email);
};

export const signOut = async () => {
  try {
    await auth().signOut();
  } catch (error) {
    throw error;
  }
};

// Database methods
export const getUserData = async (userId) => {
  try {
    const snapshot = await database().ref(`users/${userId}`).once('value');
    return snapshot.val();
  } catch (error) {
    throw error;
  }
};

export const updateUserData = async (userId, data) => {
  try {
    await database().ref(`users/${userId}`).update(data);
  } catch (error) {
    throw error;
  }
};

// Car management methods
export const addCar = async (vendorId, carData) => {
  try {
    const carRef = database().ref('cars').push();
    await carRef.set({
      ...carData,
      vendorId,
      createdAt: database.ServerValue.TIMESTAMP,
    });
    return carRef.key;
  } catch (error) {
    throw error;
  }
};

export const getCars = async (filters = {}) => {
  try {
    let carsRef = database().ref('cars');

    // Apply filters if any
    if (filters.vendorId) {
      carsRef = carsRef.orderByChild('vendorId').equalTo(filters.vendorId);
    }

    const snapshot = await carsRef.once('value');
    return snapshot.val();
  } catch (error) {
    throw error;
  }
};

// Booking methods
export const createBooking = async (bookingData) => {
  try {
    const bookingRef = database().ref('bookings').push();
    await bookingRef.set({
      ...bookingData,
      status: 'pending',
      createdAt: database.ServerValue.TIMESTAMP,
    });
    return bookingRef.key;
  } catch (error) {
    throw error;
  }
};

export const getBookings = async (userId, userType) => {
  try {
    let bookingsRef = database().ref('bookings');

    // Filter bookings based on user type
    if (userType === 'customer') {
      bookingsRef = bookingsRef.orderByChild('customerId').equalTo(userId);
    } else if (userType === 'vendor') {
      bookingsRef = bookingsRef.orderByChild('vendorId').equalTo(userId);
    }

    const snapshot = await bookingsRef.once('value');
    return snapshot.val();
  } catch (error) {
    throw error;
  }
};

export const updateBookingStatus = async (bookingId, status) => {
  try {
    await database().ref(`bookings/${bookingId}`).update({
      status,
      updatedAt: database.ServerValue.TIMESTAMP,
    });
  } catch (error) {
    throw error;
  }
};
