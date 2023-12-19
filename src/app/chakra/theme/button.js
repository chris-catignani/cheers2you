import { defineStyleConfig } from '@chakra-ui/react'

export const ThemedButton = defineStyleConfig({
    variants: {
        primary: {
            background: 'orangered',
            color: 'white',
            _hover: {
                background: 'orange.500',
                _disabled: {
                    background: 'orangered',
                }
            },
        },
        secondary: {
            background: 'white',
            color: 'orangered',
            borderWidth: '2px',
            borderColor: 'orangered',
            _hover: {
                background: 'orange.100',
                _disabled: {
                    background: 'white',
                }
            },
        },
        dark: {
            background: 'gray.900',
            color: 'white',
            _hover: {
                background: 'gray.700',
                _disabled: {
                    background: 'gray.900',
                }
            },
        },
        link: {
            color: 'orangered',
        }
    },
})
