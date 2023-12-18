import { defineStyleConfig } from '@chakra-ui/react'

export const ThemedButton = defineStyleConfig({
    variants: {
        primary: {
            background: 'orangered',
            color: 'white',
            _hover: {
                bg: 'white',
                color: 'black',
                borderWidth: '2px',
                borderColor: 'black',
            },
        },
        link: {
            color: 'orangered',
        }
    },
})
