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
        tango: {
            field: {
                borderWidth: '2px',
                borderColor: 'orangered',
                textAlign:'left',
                color:'black',
                _placeholder: {
                    letterSpacing:'normal',
                    textTransform:'none',
                    color:'black',
                },
                _focus: {
                    color:'black',
                    borderColor:'orangered',
                },
            },
        },
    },
})
