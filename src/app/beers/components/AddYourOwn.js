import { AddIcon } from "@chakra-ui/icons"
import { Box, Center, Text } from "@chakra-ui/react"

export const AddYourOwn = ({onClick} = {}) => {
    return (
        <Box as='button' onClick={onClick}>
            <Center flexDirection='column'>
                <AddIcon />
                <Text>
                    Add your own
                </Text>
            </Center>
        </Box>
    )
}
