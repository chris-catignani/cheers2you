'use client'

import "@fontsource-variable/inter"; // Defaults to wght axis
import "@fontsource-variable/inter/wght.css"; // Specify axis
import "@fontsource-variable/inter/slnt.css";
import "@fontsource-variable/inter/standard.css";

import "@fontsource-variable/inter-tight"; // Defaults to wght axis
import "@fontsource-variable/inter-tight/wght.css"; // Specify axis
import "@fontsource-variable/inter-tight/wght-italic.css"; // Specify axis and style

import "@fontsource-variable/familjen-grotesk"; // Defaults to wght axis
import "@fontsource-variable/familjen-grotesk/wght.css"; // Specify axis
import "@fontsource-variable/familjen-grotesk/wght-italic.css"; // Specify axis and style

import { Provider } from 'react-redux'
import { ChakraProvider } from '@chakra-ui/react'
import { CacheProvider } from '@chakra-ui/next-js'
import { reduxStore } from '@/lib/redux'
import { cheers2YouTheme } from '@/app/chakra/theme/theme'

export const Providers = (props) => {
  return (
    <Provider store={reduxStore}>
      <ChakraProvider theme={cheers2YouTheme}>
        <CacheProvider>
          {props.children}
        </CacheProvider>
      </ChakraProvider>
    </Provider>
  )
}
