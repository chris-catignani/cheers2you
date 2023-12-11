import { Box, Flex, Text, keyframes } from "@chakra-ui/react"

export const PhoneRotationSuggestion = ({text}) => {

    const rotate = keyframes({
        '0%': {
            transform: 'rotate(90deg)'
        },
        '50%': {
            transform: 'rotate(0deg)'
        },
        '100%': {
            transform: 'rotate(0deg)'
        }
    })

    return (
        <Flex
            justifyContent='center'
            alignItems='center'
            flexDirection='column'
        >
            <Box
                height='200px'
                width='100px'
                border='3px solid black'
                borderRadius='10px'
                mt='1'
                animation={`${rotate} 1.5s ease-in-out infinite alternate`}
            />
            <Text color='black' mt='6'>
                {text}
            </Text>
        </Flex>
    )
}
