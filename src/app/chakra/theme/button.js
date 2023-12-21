import { defineStyleConfig } from '@chakra-ui/react'

export const ThemedButton = defineStyleConfig({
    variants: {
        primary: () => ({
            background: 'orangered',
            color: 'white',
            _hover: {
                _disabled: {
                    background: 'orangered',
                },
            },

            // rules if hover is supported
            "@media(hover: hover)": {
                _hover: {
                    background: 'orange.500',
                },
            },
        }),
        secondary: () => ({
            background: 'white',
            color: 'black',
            borderWidth: '2px',
            borderColor: 'orangered',
            _hover: {
                _disabled: {
                    background: 'white',
                }
            },

            // rules if hover is supported
            '@media(hover: hover)': {
                _hover: {
                    background: 'orange.100',
                },
            },
        }),
        dark: () => ({
            background: 'gray.900',
            color: 'white',
            _hover: {
                _disabled: {
                    background: 'gray.900',
                }
            },

            // rules if hover is supported
            '@media(hover: hover)': {
                _hover: {
                    background: 'gray.700',
                },
            },
        }),
        link: {
            color: 'orangered',
        },
    },
})
