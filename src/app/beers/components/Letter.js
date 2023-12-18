import { Box, Text } from "@chakra-ui/react"

export const Letter = ({ beer: {beer, matchedFields}, onClick } = {}) => {    

    /**
     * TODO ellipses if truncation.
     * Text has a method noOfLines which uses webkit-box under the hood.
     * our library which captures the images does not support webkit-box. So it renders funny in downloads/screenshots
     */
    const buildTextField = (fieldName, mt=0) => {
        let textContent = beer?.[fieldName]

        // if the field should be bolded
        if (matchedFields?.[0].field === fieldName) {

            // if we match the first letter of the field, highlight every word in the field
            if (matchedFields?.[0].index === 0) {
                textContent = (
                    <Box as='span' color='orangered'>{textContent}</Box>
                )
            }
            // if we matched somewhere in the middle of the field, only highlight the single matched word
            else {
                const startIndex = matchedFields?.[0].index
                const endIndex = startIndex + beer?.[fieldName].slice(startIndex).trim().split(' ')[0].length
                textContent = (
                    <Box as='span'>
                        {textContent.slice(0, startIndex)}
                        <Box as='span' color='orangered'>{textContent.slice(startIndex, endIndex)}</Box>
                        {textContent.slice(endIndex)}
                    </Box>
                )
            }
        }

        return (
            <Text maxHeight='2.3em' overflow='hidden' lineHeight='1.1em' height='2.3em' mt={mt}>
                {textContent}
            </Text>
        )
    }

    return (
        <Box paddingTop='2' paddingBottom='2' textAlign='center' onClick={onClick} fontFamily={`'Inter Tight Variable', sans-serif`}>
            {buildTextField('brewer_name')}
            {buildTextField('beer_name', 2)}
            {buildTextField('beer_type', 2)}
        </Box>
    )
}
