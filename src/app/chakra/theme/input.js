import { defineStyleConfig } from '@chakra-ui/react'

export const ThemedInput = defineStyleConfig({
    variants: {
        dark: {
            field: {
                borderWidth: '3px',
                borderColor: 'black',
                _focus: {
                    color: 'black',
                    borderColor: 'black',
                    fontSize: '18px',
                    fontWeight: 'bold',
                },
            },
        },
    },
})
