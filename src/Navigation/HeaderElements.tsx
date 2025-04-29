import React from 'react'
import { StyleSheet, TouchableOpacity, View, Image, ViewStyle } from 'react-native'
import { Icon } from 'react-native-elements'
import { useNavigation } from '@react-navigation/native'

import { Images } from '@themes'

const ICON_SIZE = 26
const styles = StyleSheet.create({
  style1: {
    top: 10,
    bottom: 10,
    left: 5,
    right: 10,
  },
  style2: {
    marginRight: 10,
  },
  style3: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  style4: {
    flexDirection: 'row',
  },
  style5: {
    flexDirection: 'row',
    marginRight: 15,
  },
  style6: {
    flexDirection: 'row',
    marginLeft: 15,
  },
  bilditLogo: {
    height: 22,
    width: 98,
  },
  icon: {
    height: 24,
    width: 24,
  },
  backIcon: {
    height: 30,
    width: 30,
  },
})

interface HeaderProps {
  tintColor: string
  onClick?: () => void
  containerStyle?: ViewStyle
}

/**
 * Logo Title
 *
 * @returns JSX.Element
 */
export const LogoTitle: any = () => {
  return <Image source={Images.bildit_logo} style={styles.bilditLogo} />
}

/**
 * Header Right
 *
 * @param props
 * @typeParam HeaderProps
 * @returns JSX.Element
 */
export const HeaderRight: any = (props: HeaderProps) => {
  const { tintColor, containerStyle } = props
  const navigation = useNavigation()

  return (
    <View style={[styles.style4, containerStyle]}>
      <TouchableOpacity
        accessibilityRole='button'
        hitSlop={styles.style1}
        style={styles.style2}
        onPress={() => navigation.navigate('Search' as never)}
      >
        <Image source={Images.ic_search} style={[styles.icon, { tintColor }]} />
      </TouchableOpacity>
    </View>
  )
}

/**
 * Header Right
 *
 * @param props
 * @typeParam HeaderProps
 * @returns JSX.Element
 */
export const CartIcon: any = (props: HeaderProps) => {
  const { tintColor, containerStyle } = props
  const navigation = useNavigation()

  return (
    <View style={[styles.style4, containerStyle]}>
      <TouchableOpacity
        accessibilityRole='button'
        hitSlop={styles.style1}
        style={styles.style2}
        onPress={() => navigation.navigate('Bag' as never)}
      >
        <Image source={Images.ic_shopping_cart} style={[styles.icon, { tintColor }]} />
      </TouchableOpacity>
    </View>
  )
}

/**
 * Favourite Button
 *
 * @param props
 * @typeParam HeaderProps
 * @returns JSX.Element
 */
export const FavouriteButton = (props: HeaderProps) => {
  const { tintColor, containerStyle } = props

  return (
    <View style={[styles.style5, containerStyle]}>
      <TouchableOpacity accessibilityRole='button' hitSlop={styles.style1} style={styles.style2}>
        <Icon name='heart-o' type='font-awesome' color={tintColor} size={ICON_SIZE} tvParallaxProperties />
      </TouchableOpacity>
    </View>
  )
}

/**
 * Long Back Button
 *
 * @param props
 * @typeParam HeaderProps
 * @returns JSX.Element
 */
export const LongBackButton: any = (props: HeaderProps) => {
  const { tintColor, containerStyle } = props
  const navigation = useNavigation()
  return (
    <View style={[styles.style3, containerStyle]}>
      <TouchableOpacity
        accessibilityRole='button'
        hitSlop={styles.style1}
        style={styles.style2}
        onPress={() => navigation.goBack()}
      >
        <Icon name='arrow-left-l' type='fontisto' color={tintColor} size={30} tvParallaxProperties />
      </TouchableOpacity>
    </View>
  )
}

/**
 * Back Button
 *
 * @param props
 * @typeParam HeaderProps
 * @returns JSX.Element
 */
export const BackButton = (props: HeaderProps) => {
  const { tintColor, containerStyle } = props
  const navigation = useNavigation()

  return (
    <View style={[styles.style6, containerStyle]}>
      <TouchableOpacity
        accessibilityRole='button'
        hitSlop={styles.style1}
        style={styles.style2}
        onPress={() => navigation.goBack()}
      >
        <Image source={Images.ic_back} style={[styles.backIcon, { tintColor }]} />
      </TouchableOpacity>
    </View>
  )
}

/**
 * Add Button
 *
 * @param props
 * @typeParam HeaderProps
 * @returns JSX.Element
 */
export const AddButton = (props: HeaderProps) => {
  const { onClick, tintColor, containerStyle } = props
  return (
    <View style={[styles.style5, containerStyle]}>
      <TouchableOpacity accessibilityRole='button' hitSlop={styles.style1} onPress={onClick}>
        <Icon name='add' type='material-design' color={tintColor} size={ICON_SIZE} tvParallaxProperties />
      </TouchableOpacity>
    </View>
  )
}
