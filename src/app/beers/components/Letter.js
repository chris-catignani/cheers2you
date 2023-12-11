import { Box, Image } from "@chakra-ui/react"

export const Letter = ({ beer, onClick, matchedFields = [] } = {}) => {    
    const brewerNameProps = {}
    const beerNameProps = {}
    const beerTypeProps = {}
    
    if (matchedFields.includes('brewer_name')) {
        brewerNameProps['fontWeight'] = 'bold'
    }

    if (matchedFields.includes('beer_name')) {
        beerNameProps['fontWeight'] = 'bold'
    }

    if (matchedFields.includes('beer_type')) {
        beerTypeProps['fontWeight'] = 'bold'
    }

    return (
        <Box paddingTop='2' paddingBottom='2' textAlign='center' onClick={onClick} fontFamily={`'Inter Tight Variable', sans-serif`}>
            <Box noOfLines='2' overflow='hidden' lineHeight='1.1em' height='2.3em' {...brewerNameProps}>{beer?.brewer_name}</Box>
            <Box noOfLines='2' overflow='hidden' lineHeight='1.1em' height='2.3em' marginTop='2' {...beerNameProps}>{beer?.beer_name}</Box>
            <Box noOfLines='2' overflow='hidden' lineHeight='1.1em' height='2.3em' marginTop='2' {...beerTypeProps}>{beer?.beer_type}</Box>
        </Box>
    )
}
