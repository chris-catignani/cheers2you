import { defineStyleConfig } from '@chakra-ui/react'

export const ThemedButton = defineStyleConfig({
    variants: {
        dark: {
            background: 'black',
            color: 'white',
            _hover: { bg: 'white', color: 'black', borderWidth: '2px', borderColor: 'black' },
        },
    },
})
