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
        <Box textAlign='center' onClick={onClick}>
            <Box noOfLines='2' overflow='hidden' lh='1em' height='3em' mH='2em' {...brewerNameProps}>{beer?.brewer_name}</Box>
            <Box fontStyle='italic' noOfLines='2' overflow='hidden' lh='1em' height='3em' mH='2em' {...beerNameProps}>{beer?.beer_name}</Box>
            <Box noOfLines='2' overflow='hidden' lh='1em' height='3em' mH='2em' {...beerTypeProps}>{beer?.beer_type}</Box>
        </Box>
    )
}
