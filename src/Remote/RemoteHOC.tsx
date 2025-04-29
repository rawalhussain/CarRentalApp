import { useGetComponentMutation } from '@domain/remote'
import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { RemoteSelectors } from '../Redux/RemoteRedux'
// eslint-disable-next-line import/no-named-as-default
import Remote from './Remote'

interface Props {
  config: {
    useRemoteComponent: boolean
  }
  code?: string
  [key: string]: any
}

// TODO: Refactor
// eslint-disable-next-line @typescript-eslint/ban-types
const withRemote = (LocalComponent: React.ComponentType) => (componentPath: string, remoteProps?: {}) => {
  const LocalComponentWithRemote = React.memo(function ({ config, code, ...rest }: Props) {
    const getComponentMutation = useGetComponentMutation()
    useEffect(() => {
      getComponentMutation.mutate(componentPath)
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // Can render remote component?
    // if (config.useRemoteComponent === true && code !== null) {
    //   return <Remote {...rest} code={code!} remoteProps={remoteProps} />
    // }

    // Else, render local component.
    return <LocalComponent {...rest} />
  })

  // const mapStateToProps = (state: any, ownProps: any) => {
  //   return {
  //     config: RemoteSelectors.getConfig(state),
  //     code: RemoteSelectors.getComponentCode(state, componentPath),
  //     remote: ownProps?.remote ?? true,
  //   }
  // }

  return LocalComponentWithRemote
}

export default withRemote
