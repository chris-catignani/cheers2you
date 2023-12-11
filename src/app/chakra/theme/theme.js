import { extendTheme } from '@chakra-ui/react'
import { ThemedButton } from './button'
import { ThemedInput } from './input'

export const cheers2YouTheme = extendTheme({
    components: {
        Button: ThemedButton,
        Input: ThemedInput,
    },
    fonts: {
        heading: `'Familjen Grotesk Variable', sans-serif`,
        body: `'Inter Variable', sans-serif;`
    }
})
