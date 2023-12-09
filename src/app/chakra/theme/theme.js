import { extendTheme } from '@chakra-ui/react'
import { ThemedButton } from './button'
import { ThemedInput } from './input'

export const cheers2YouTheme = extendTheme({
    components: {
        Button: ThemedButton,
        Input: ThemedInput,
    },
})
