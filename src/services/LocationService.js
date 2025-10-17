import { PermissionsAndroid, Platform, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import Geocoder from 'react-native-geocoding';
import { GOOGLE_MAPS_API_KEY } from '../Config/constants';

// Initialize Geocoder with Google Maps API key
Geocoder.init(GOOGLE_MAPS_API_KEY, { language: 'en' });

class LocationService {
  static async requestLocationPermission() {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to show your current location.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Location permission error:', err);
        return false;
      }
    }
    return true; // iOS permissions are handled in Info.plist
  }

  static async getCurrentLocation() {
    const hasPermission = await this.requestLocationPermission();

    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Location permission is required to show your current location.',
        [{ text: 'OK' }]
      );
      return null;
    }

    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          resolve({
            latitude,
            longitude,
            accuracy,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        },
        (error) => {
          console.warn('Location error:', error);
          // Return null if location fails so component can handle it
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 5000,
          distanceFilter: 10, // Update when user moves 10 meters
        }
      );
    });
  }

  static async getCurrentLocationAddress() {
    const location = await this.getCurrentLocation();
    if (!location) {
      console.log('No location available');
      return 'Current Location';
    }

    console.log('Getting address for location:', location);
    try {
      // Use react-native-geocoding for reverse geocoding
      const address = await this.reverseGeocode(location.latitude, location.longitude);
      console.log('Resolved address:', address);
      return address;
    } catch (error) {
      console.warn('Address lookup error:', error);
      return 'Current Location';
    }
  }

  // Method to get address for any coordinates
  static async getAddressFromCoordinates(latitude, longitude) {
    try {
      return await this.reverseGeocode(latitude, longitude);
    } catch (error) {
      console.warn('Address lookup error:', error);
      return `Location at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  }

  // Method to perform reverse geocoding using react-native-geocoding
  static async reverseGeocode(latitude, longitude) {
    try {
      console.log('Reverse geocoding coordinates:', latitude, longitude);
      
      // Use Geocoder.from() to get address from coordinates
      const json = await Geocoder.from(latitude, longitude);
      
      console.log('Geocoder response:', json);
      
      if (json.results && json.results.length > 0) {
        const result = json.results[0];
        const addressComponents = result.address_components;
        
        // Extract address components for a clean format
        let neighborhood = '';
        let sublocality = '';
        let city = '';
        let state = '';
        let country = '';
        
        for (let component of addressComponents) {
          const types = component.types;
          
          if (types.includes('neighborhood') || types.includes('sublocality_level_1')) {
            neighborhood = component.long_name;
          } else if (types.includes('sublocality') || types.includes('sublocality_level_2')) {
            sublocality = component.long_name;
          } else if (types.includes('locality') || types.includes('administrative_area_level_2')) {
            city = component.long_name;
          } else if (types.includes('administrative_area_level_1')) {
            state = component.long_name;
          } else if (types.includes('country')) {
            country = component.long_name;
          }
        }
        
        // Build a clean address string
        let addressParts = [];
        if (neighborhood) addressParts.push(neighborhood);
        else if (sublocality) addressParts.push(sublocality);
        if (city) addressParts.push(city);
        if (state) addressParts.push(state);
        if (country) addressParts.push(country);
        
        if (addressParts.length > 0) {
          const formattedAddress = addressParts.join(', ');
          console.log('Formatted address:', formattedAddress);
          return formattedAddress;
        }
        
        // Fallback to formatted address
        return result.formatted_address;
      } else {
        console.warn('No results from Geocoder');
        return `Location at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      }
    } catch (error) {
      console.warn('Reverse geocoding error:', error);
      return `Location at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  }

  // Method to get a more descriptive address
  static getDescriptiveAddress(latitude, longitude) {
    try {
      // Return a descriptive format with coordinates
      const latDir = latitude >= 0 ? 'N' : 'S';
      const lngDir = longitude >= 0 ? 'E' : 'W';

      return `Current Location (${Math.abs(latitude).toFixed(4)}°${latDir}, ${Math.abs(longitude).toFixed(4)}°${lngDir})`;
    } catch (error) {
      console.warn('Descriptive address error:', error);
      return 'Current Location';
    }
  }

  // Alternative method using a simpler approach
  static getSimpleAddress(latitude, longitude) {
    try {
      // Return a more user-friendly location string
      return `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
    } catch (error) {
      console.warn('Simple address error:', error);
      return 'Current Location';
    }
  }

  // Method for continuous location watching (auto-adjusting)
  static watchLocation(onLocationUpdate, onError) {
    const hasPermission = this.requestLocationPermission();

    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Location permission is required to show your current location.',
        [{ text: 'OK' }]
      );
      return null;
    }

    // Performance optimization: Throttle location updates
    let lastUpdateTime = 0;
    const UPDATE_THROTTLE_MS = 2000; // Minimum 2 seconds between updates

    const watchId = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const currentTime = Date.now();
        
        // Throttle updates to save battery
        if (currentTime - lastUpdateTime < UPDATE_THROTTLE_MS) {
          return;
        }
        
        lastUpdateTime = currentTime;
        
        const locationData = {
          latitude,
          longitude,
          accuracy,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };

        if (onLocationUpdate) {
          onLocationUpdate(locationData);
        }
      },
      (error) => {
        console.warn('Location watch error:', error);
        if (onError) {
          onError(error);
        }
      },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 3000, // Reduced for more frequent updates
          distanceFilter: 3, // Update when user moves 3 meters (more sensitive)
          interval: 5000, // Check every 5 seconds (more frequent)
        }
    );

    return watchId;
  }

  // Method to stop watching location
  static stopWatchingLocation(watchId) {
    if (watchId) {
      Geolocation.clearWatch(watchId);
    }
  }
}

export default LocationService;
