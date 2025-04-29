import { useThemeColors } from '@themes/useThemeColor'
import React from 'react'
import { Text, StyleSheet } from 'react-native'
import { Images, R } from '@themes/index'
import { Fonts } from '@lib/utils/constants'
import { useTranslation } from 'react-i18next'

interface TabLabelProps {
  focused: boolean
  label: string
}

const TabLabel: React.FC<TabLabelProps> = ({ focused, label }) => {
  const Colors = useThemeColors()
  const styles = createStyles(Colors)
  const { t } = useTranslation()
  return <Text style={[styles.text, focused && { color: Colors.themeGreen }]}>{t(label)}</Text>
}

const createStyles = Colors =>
  StyleSheet.create({
    text: {
      position: 'absolute',
      bottom: R.verticalScale(7),
      fontSize: R.verticalScale(12),
      color: Colors.haydiiContent500,
      textAlign: 'center',
      marginBottom: R.verticalScale(11),
      fontFamily: Fonts.regular,
    },
  })

export default TabLabel
