import { Box, Image, Spinner } from "@chakra-ui/react"

export const Letter = ({ beer, onClick, width = '150px', displayBeerType = false, isAnimating = false, matchedFields = [] } = {}) => {    
    if (isAnimating) {
        return (
            <AnimatingLetter
                beer={beer}
                width={width} />
        )
    } else {
        return (
            <NonAnimatingLetter 
                beer={beer}
                onClick={onClick}
                width={width}
                displayBeerType={displayBeerType}
                matchedFields={matchedFields} />
        )
    }
}

const NonAnimatingLetter = ({ beer, onClick, width, displayBeerType, matchedFields }) => {    

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
        <Box textAlign='center' width={width} minWidth={width} onClick={onClick}>
            <Image src={beer?.beer_label_file} alt={beer?.beer_name + ' ' + beer?.beer_type} boxSize={width} fit='contain'/>
            <Box {...brewerNameProps}>{beer?.brewer_name}</Box>
            <Box minH='5em' {...beerNameProps}>{beer?.beer_name}</Box>
            {displayBeerType && <Box {...beerTypeProps}>{beer?.beer_type}</Box>}
        </Box>
    )
}

const AnimatingLetter = ({ beer, width }) => {
    return (
        <Box textAlign='center' width={width} minWidth={width}>
            <Image src={beer?.beer_label_file} alt={beer?.beer_name + ' ' + beer?.beer_type} boxSize={width} fit='contain' />
        </Box>
    )
}
