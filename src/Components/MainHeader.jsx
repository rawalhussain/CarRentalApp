import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { Colors } from '../Themes/MyColors';
import Fonts from '../Themes/Fonts';
import Metrics from '../Themes/Metrics';

const MainHeader = ({
  title = 'Header',
  showBackButton = true,
  showOptionsButton = true,
  onBackPress,
  onOptionsPress,
  backButtonColor = Colors.PRIMARY,
  backButtonIcon = 'chevron-back',
  optionsButtonIcon = 'ellipsis-horizontal',
  titleColor = Colors.black,
  backgroundColor = Colors.white,
  showBorder = true,
  borderColor = "#D7D7D7",
  customLeftComponent,
  customRightComponent,
  customTitleComponent,
  headerHeight = 56,
}) => {
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    }
  };

  const handleOptionsPress = () => {
    if (onOptionsPress) {
      onOptionsPress();
    }
  };

  const renderLeftComponent = () => {
    if (customLeftComponent) {
      return customLeftComponent;
    }

    if (!showBackButton) {
      return <View style={styles.placeholder} />;
    }

    return (
      <TouchableOpacity
        style={[styles.button, { backgroundColor: backButtonColor }]}
        onPress={handleBackPress}
        hitSlop={Metrics.hitSlop}
        activeOpacity={0.7}
      >
        <Icon
          name={backButtonIcon}
          size={Metrics.icons.small}
          color={Colors.white}
        />
      </TouchableOpacity>
    );
  };

  const renderRightComponent = () => {
    if (customRightComponent) {
      return customRightComponent;
    }

    if (!showOptionsButton) {
      return <View style={styles.placeholder} />;
    }

    return (
      <TouchableOpacity
        style={[styles.button, styles.optionsButton]}
        onPress={handleOptionsPress}
        hitSlop={Metrics.hitSlop}
        activeOpacity={0.7}
      >
        <Icon
          name={optionsButtonIcon}
          size={Metrics.icons.small}
          color={Colors.black}
        />
      </TouchableOpacity>
    );
  };

  const renderTitle = () => {
    if (customTitleComponent) {
      return customTitleComponent;
    }

    return (
      <Text
        style={[
          styles.title,
          {
            color: titleColor,
          },
        ]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {title}
      </Text>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          height: headerHeight,
        },
      ]}
    >
      <View style={styles.content}>
        {renderLeftComponent()}
        <View style={styles.titleContainer}>
          {renderTitle()}
        </View>
        {renderRightComponent()}
      </View>
      {showBorder && (
        <View
          style={[
            styles.border,
            {
              backgroundColor: borderColor,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Metrics.baseMargin,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Metrics.baseMargin,
  },
  title: {
    ...Fonts.style.semiBold,
    fontSize: 20,
    textAlign: 'center',
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray5,
  },
  placeholder: {
    width: 40,
    height: 40,
  },
  border: {
    height: 1,
    width: '100%',

  },
});

export default MainHeader;
