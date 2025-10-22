import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, Alert, PermissionsAndroid, Platform, Text, TouchableOpacity, TextInput } from 'react-native';
import MapView, { Marker, Circle, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { Colors } from '../Themes/MyColors';

const MapViewComponent = forwardRef(({
  style,
  onLocationSelect,
  initialRegion,
  markers = [],
  showUserLocation = true,
  onRegionChange,
  currentLocation = null,
  showCurrentLocationMarker = false,
  showCoordinateDisplay = false,
  onLocationUpdate = null,
  draggableMarker = false,
  onMarkerDragEnd = null,
  destinationMarker = null,
  marker = null,
  routeCoordinates = [],
  onPress = null,
}, ref) => {
  const [region, setRegion] = useState(
    initialRegion || {
      latitude: 0, // Will be set dynamically
      longitude: 0,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    }
  );
  const [userLocation, setUserLocation] = useState(null);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [coordinates, setCoordinates] = useState('');
  const [locationWatchId, setLocationWatchId] = useState(null);
  const mapViewRef = useRef(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    animateToRegion: (region, duration) => {
      if (mapViewRef.current) {
        mapViewRef.current?.animateToRegion(region, duration);
      }
    },
    getCamera: () => {
      if (mapViewRef.current) {
        return mapViewRef.current?.getCamera();
      }
    },
    fitToCoordinates: (coordinates, options) => {
      if (mapViewRef.current) {
        mapViewRef.current?.fitToCoordinates(coordinates, options);
      }
    },
  }));

  useEffect(() => {
    if (currentLocation && showCurrentLocationMarker) {
      setRegion(currentLocation);
      setUserLocation({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      });

      // Update coordinates display
      const coordText = `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`;
      setCoordinates(coordText);

      // Set default accuracy if not provided
      setLocationAccuracy(currentLocation.accuracy || 100);
    } else {
      requestLocationPermission();
    }
  }, [currentLocation, showCurrentLocationMarker]);

  // Real-time location tracking effect
  useEffect(() => {
    if (showCurrentLocationMarker && !currentLocation) {
      // Performance optimization: Throttle location updates
      let lastUpdateTime = 0;
      const UPDATE_THROTTLE_MS = 20000; // Minimum 2 seconds between updates

      const watchId = Geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          const currentTime = Date.now();

          // Throttle updates to save battery
          if (currentTime - lastUpdateTime < UPDATE_THROTTLE_MS) {
            return;
          }

          lastUpdateTime = currentTime;

          const newLocation = { latitude, longitude };
          const newRegion = {
            ...newLocation,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          };
          setRegion(newRegion);
          setUserLocation(newLocation);
          setLocationAccuracy(accuracy);

          // Update coordinates display
          const coordText = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setCoordinates(coordText);

          // Notify parent component of location update
          if (onLocationUpdate) {
            onLocationUpdate({
              latitude,
              longitude,
              accuracy,
              coordinates: coordText,
            });
          }
        },
        (error) => {
          console.warn('Real-time location tracking error in MapView:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 500000,
          distanceFilter: 5, // Update when user moves 5 meters
          interval: 100000, // Check every 10 seconds
        }
      );

      setLocationWatchId(watchId);

      return () => {
        if (watchId) {
          Geolocation.clearWatch(watchId);
        }
      };
    }
  }, [showCurrentLocationMarker, currentLocation, onLocationUpdate]);

  // Cleanup location watching on component unmount
  useEffect(() => {
    return () => {
      if (locationWatchId) {
        Geolocation.clearWatch(locationWatchId);
      }
    };
  }, [locationWatchId]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to show nearby cars.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      getCurrentLocation();
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const newLocation = { latitude, longitude };
        const newRegion = {
          ...newLocation,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        setRegion(newRegion);
        setUserLocation(newLocation);
        setLocationAccuracy(accuracy);

        // Update coordinates display
        const coordText = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        setCoordinates(coordText);

        // Notify parent component of location update
        if (onLocationUpdate) {
          onLocationUpdate({
            latitude,
            longitude,
            accuracy,
            coordinates: coordText,
          });
        }
      },
      (error) => {
        console.warn('Location error:', error);
        // Don't set fallback location, let parent component handle it
      },
      {
        enableHighAccuracy: true,
        timeout: 2000000,
        maximumAge: 500000,
        distanceFilter: 5, // Reduced for more responsive updates
      }
    );
  };

  const handleRegionChange = (newRegion) => {
    setRegion(newRegion);
    if (onRegionChange) {
      onRegionChange(newRegion);
    }
  };

  const handleMapPress = (event) => {
    // Call custom onPress handler if provided
    if (onPress) {
      onPress(event);
    }

    // Also call onLocationSelect for backward compatibility
    if (event.nativeEvent?.coordinate) {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      if (onLocationSelect) {
        onLocationSelect({ latitude, longitude });
      }
    }
  };

  const handleMarkerDrag = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setUserLocation({ latitude, longitude });

    // Update coordinates display
    const coordText = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    setCoordinates(coordText);

    if (onMarkerDragEnd) {
      onMarkerDragEnd({ latitude, longitude, coordinates: coordText });
    }
  };

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapViewRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        // region={region}
        onRegionChangeComplete={handleRegionChange}
        onPress={handleMapPress}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        loadingEnabled={false}
        followsUserLocation={false}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
      >
         {userLocation && (showCurrentLocationMarker || showUserLocation) &&
          typeof userLocation.latitude === 'number' &&
          typeof userLocation.longitude === 'number' &&
          !isNaN(userLocation.latitude) &&
          !isNaN(userLocation.longitude) && (
            <>
              {/* Accuracy Circle */}
              {locationAccuracy && !draggableMarker && (
                <Circle
                  center={userLocation}
                  radius={locationAccuracy}
                  strokeColor="rgba(66, 133, 244, 0.3)"
                  fillColor="rgba(66, 133, 244, 0.1)"
                  strokeWidth={2}
                />
              )}

              {/* Current Location Marker - Home Icon */}
              <Marker
                coordinate={userLocation}
                title="Your Current Location"
                description="Live Location"
                tracksViewChanges={false}
                draggable={draggableMarker}
                onDragEnd={handleMarkerDrag}
                pinColor="green"
              />
            </>
          )}

        {/* Dynamic Route Line */}
        {routeCoordinates && routeCoordinates.length > 0 && routeCoordinates.every(coord =>
          coord && typeof coord.latitude === 'number' && typeof coord.longitude === 'number' &&
          !isNaN(coord.latitude) && !isNaN(coord.longitude)
        ) && (
          <Polyline
            key={`route-${routeCoordinates.length}-${Date.now()}`}
            coordinates={routeCoordinates}
            strokeColor="#FF0000"
            strokeWidth={4}
            lineDashPattern={[1]}
            strokeColors={['#FF0000']}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {/* Simple polyline between current location and destination */}
        {userLocation && destinationMarker && destinationMarker.coordinate &&
         !routeCoordinates &&
         typeof userLocation.latitude === 'number' && typeof userLocation.longitude === 'number' &&
         typeof destinationMarker.coordinate.latitude === 'number' && typeof destinationMarker.coordinate.longitude === 'number' &&
         !isNaN(userLocation.latitude) && !isNaN(userLocation.longitude) &&
         !isNaN(destinationMarker.coordinate.latitude) && !isNaN(destinationMarker.coordinate.longitude) && (
          <Polyline
            key={`simple-route-${userLocation.latitude}-${userLocation.longitude}-${destinationMarker.coordinate.latitude}-${destinationMarker.coordinate.longitude}`}
            coordinates={[userLocation, destinationMarker.coordinate]}
            strokeColor="#FF0000"
            strokeWidth={3}
            strokeColors={['#FF0000']}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {/* Destination Marker */}
        {destinationMarker && destinationMarker.coordinate &&
         typeof destinationMarker.coordinate.latitude === 'number' &&
         typeof destinationMarker.coordinate.longitude === 'number' &&
         !isNaN(destinationMarker.coordinate.latitude) &&
         !isNaN(destinationMarker.coordinate.longitude) && (
          <Marker
            coordinate={destinationMarker.coordinate}
            title={destinationMarker.title || 'Destination'}
            description={destinationMarker.description}
            tracksViewChanges={false}
            pinColor="red"
          />
        )}

        {/* Single Marker */}
        {marker && marker.coordinate &&
         typeof marker.coordinate.latitude === 'number' &&
         typeof marker.coordinate.longitude === 'number' &&
         !isNaN(marker.coordinate.latitude) &&
         !isNaN(marker.coordinate.longitude) && (
          <Marker
            coordinate={marker.coordinate}
            title={marker.title || 'Selected Location'}
            description={marker.description}
            tracksViewChanges={false}
            pinColor="blue"
          />
        )}


        {markers.map((marker, index) => (
          marker && marker.coordinate &&
          typeof marker.coordinate.latitude === 'number' &&
          typeof marker.coordinate.longitude === 'number' &&
          !isNaN(marker.coordinate.latitude) &&
          !isNaN(marker.coordinate.longitude) && (
            <Marker
              key={index}
              coordinate={marker.coordinate}
              title={marker.title}
              description={marker.description}
              onPress={marker.onPress}
              pinColor={marker.color || '#0A91C9'}
            />
          )
        ))}
      </MapView>

      {/* Coordinate Display */}
      {showCoordinateDisplay && coordinates && (
        <View style={styles.coordinateContainer}>
          <Text style={styles.coordinateLabel}>Current Location:</Text>
          <TextInput
            style={styles.coordinateInput}
            value={coordinates}
            editable={false}
            placeholder="Loading coordinates..."
            placeholderTextColor={Colors.PRIMARY_GREY}
          />
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  coordinateContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  coordinateLabel: {
    fontSize: 12,
    color: Colors.PRIMARY_GREY,
    marginBottom: 4,
    fontWeight: '500',
  },
  coordinateInput: {
    fontSize: 14,
    color: Colors.BLACK,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
  },
  // Current Location Marker with Home Icon
  currentLocationMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLocationIconBackground: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#4285F4', // Google Blue
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  // Destination Marker Style with Car Icon
  destinationMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  destinationIconBackground: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EA4335', // Google Red
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  // Single Marker with Large Car Icon
  singleMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  singleMarkerBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF0000', // Bright Red
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});

export default MapViewComponent;
