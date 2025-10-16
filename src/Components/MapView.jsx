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
  routeCoordinates = [],
  onPress = null,
}, ref) => {
  const [region, setRegion] = useState(
    initialRegion || {
      latitude: 29.4000, // Bahawalpur coordinates as default
      longitude: 71.6833,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    }
  );
  const [userLocation, setUserLocation] = useState(null);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [coordinates, setCoordinates] = useState('');
  const mapViewRef = useRef(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    animateToRegion: (region, duration) => {
      if (mapViewRef.current) {
        mapViewRef.current.animateToRegion(region, duration);
      }
    },
    getCamera: () => {
      if (mapViewRef.current) {
        return mapViewRef.current.getCamera();
      }
    },
    fitToCoordinates: (coordinates, options) => {
      if (mapViewRef.current) {
        mapViewRef.current.fitToCoordinates(coordinates, options);
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
        console.log('Location access failed, waiting for parent to provide location');
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 5000,
        distanceFilter: 10,
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
        region={region}
        onRegionChangeComplete={handleRegionChange}
        onPress={handleMapPress}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        mapType="standard"
        loadingEnabled={false}
        onMapReady={() => console.log('Map is ready!')}
        onError={(error) => console.log('Map error:', error)}
        followsUserLocation={true}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
      >
        {userLocation && (showCurrentLocationMarker || showUserLocation) && (
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

            {/* Current Location Marker - Google Maps Style */}
            <Marker
              coordinate={userLocation}
              title="Your Current Location"
              description="Live Location"
              tracksViewChanges={false}
              draggable={draggableMarker}
              onDragEnd={handleMarkerDrag}
            >
              <View style={styles.markerContainer}>
                {/* Google Maps Blue Dot Style */}
                <View style={styles.markerDot}>
                  <View style={styles.markerDotInner} />
                </View>
              </View>
            </Marker>
          </>
        )}
        
        {/* Route Line */}
        {routeCoordinates && routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#4285F4"
            strokeWidth={4}
            lineDashPattern={[1]}
            strokeColors={['#4285F4']}
          />
        )}

        {/* Destination Marker */}
        {destinationMarker && (
          <Marker
            coordinate={destinationMarker.coordinate}
            title={destinationMarker.title || "Destination"}
            description={destinationMarker.description}
            tracksViewChanges={false}
          >
            <View style={styles.destinationMarkerContainer}>
              <View style={styles.destinationPin}>
                <View style={styles.destinationPinInner} />
              </View>
              <View style={styles.destinationPinPoint} />
            </View>
          </Marker>
        )}
        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
            onPress={marker.onPress}
          >
            <View style={{
              width: 30,
              height: 40,
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}>
              {/* Custom Marker Icon */}
              <View style={{
                backgroundColor: marker.color || '#0A91C9',
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 3,
                borderColor: 'white',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 5,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <View style={{
                  backgroundColor: 'white',
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                }} />
              </View>
              {/* Pin Point */}
              <View style={{
                backgroundColor: marker.color || '#0A91C9',
                width: 4,
                height: 15,
                borderBottomLeftRadius: 2,
                borderBottomRightRadius: 2,
                marginTop: -2,
              }} />
            </View>
          </Marker>
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
  // Google Maps Style Current Location Marker
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#4285F4', // Google Blue
    borderWidth: 4,
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
  markerDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  // Destination Marker Style
  destinationMarkerContainer: {
    width: 30,
    height: 45,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  destinationPin: {
    width: 30,
    height: 30,
    borderRadius: 15,
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
  destinationPinInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  destinationPinPoint: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#EA4335',
    marginTop: -3,
  },
});

export default MapViewComponent;
