'use client'

/* Core */
import { Provider } from 'react-redux'
import { ChakraProvider } from '@chakra-ui/react'
import { CacheProvider } from '@chakra-ui/next-js'

/* Instruments */
import { reduxStore } from '@/lib/redux'

export const Providers = (props) => {
  return (
    <Provider store={reduxStore}>
      <ChakraProvider>
        <CacheProvider>
          {props.children}
        </CacheProvider>
      </ChakraProvider>
    </Provider>
  )
}