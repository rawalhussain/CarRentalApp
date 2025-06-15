import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
} from 'react-native';
import Swiper from 'react-native-swiper';
import styles from './styles';

const slides = [
  {
    id: 1,
    bg: require('../../../assets/bg.png'),
    title: ['Welcome to Lowest', 'Transport'],
  },
  {
    id: 2,
    bg: require('../../../assets/bg2.png'),
    title: ['Lets Start', 'A New Experience', 'With Car rental.'],
  },
];

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      {/* Background Swiper */}
      <Swiper
        loop={false}
        showsPagination={true}
        dotColor="#ccc"
        activeDotColor="#fff"
        autoplay={false}
        scrollEnabled={true}
      >
        {slides.map((slide) => (
          <ImageBackground
            key={slide.id}
            source={slide.bg}
            style={styles.backgroundImage}
            resizeMode="cover"
          >
            {/* Only changing text inside the background */}
            <View style={styles.titleWrapper}>
              {slide.title.map((line, idx) => (
                <Text key={idx} style={styles.title}>
                  {line}
                </Text>
              ))}
            </View>
          </ImageBackground>
        ))}
      </Swiper>

       {/* Fixed Car Icon */}
       <View style={styles.overlayContainer}>
        <View style={styles.iconWrapper}>
        <Image
              source={require('../../../assets/caricon.png')}
              style={styles.carIcon}
            />
        </View>

        {/* Fixed Get Started Button */}
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WelcomeScreen;
