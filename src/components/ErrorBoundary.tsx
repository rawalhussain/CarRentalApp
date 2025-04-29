import React from 'react'
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Translation } from 'react-i18next'

interface IProps {
  children: React.ReactNode
}

interface IState {
  error?: Error
  errorInfo?: React.ErrorInfo
  hasError: boolean
  showDetails: boolean
}

export default class ErrorBoundary extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      error: undefined,
      errorInfo: undefined,
      hasError: false,
      showDetails: false,
    }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  render() {
    // @ts-ignore
    return this.state.hasError ? (
      <Translation>
        {t => (
          <View
            style={{ width: Dimensions.get('window').width, flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={styles.text}>{t('something_went_wrong')}</Text>
            <Text
              style={[styles.text, { textDecorationLine: 'underline' }]}
              onPress={() => {
                this.setState({ showDetails: true })
              }}
            >
              {t('view_details')}
            </Text>
            {this.state.showDetails && (
              <ScrollView>
                <Text style={styles.text}>
                  {t('name')} :{this.state.error!.name}
                  {'\n'}
                </Text>
                <Text style={styles.text}>
                  {t('message')} : {this.state.error!.message}
                  {'\n'}
                </Text>
                <Text style={styles.text}>
                  {t('stack')} : {this.state.error!.stack?.replace(/\n/g, '\n\n')}
                  {'\n'}
                </Text>
                <Text style={styles.text} />
              </ScrollView>
            )}
          </View>
        )}
      </Translation>
    ) : (
      this.props.children
    )
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ error, errorInfo })
  }
}

const styles = StyleSheet.create({
  text: {
    color: 'gray',
  },
})
