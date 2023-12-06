import { Box, Image } from "@chakra-ui/react"

export const Letter = ({beer, onClick, width='150px', displayBeerType=false} = {}) => {    
    return (
        <Box textAlign='center' width={width} minWidth={width} onClick={onClick}>
            <Image src={beer?.beer_label_file} alt={beer?.beer_name + ' ' + beer?.beer_type} boxSize={width} fit='contain'/>
            <Box>{beer?.brewer_name}</Box>
            <Box minH='5em'>{beer?.beer_name}</Box>
            {displayBeerType && <Box>{beer?.beer_type}</Box>}
        </Box>
    )
}
