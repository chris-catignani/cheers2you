import { Box, Image } from "@chakra-ui/react"


export const Shared = ({socialMediaInfo: {imageUrl, personsName}}) => {

    return (
        <>
            <Box>
                {/* <Image src={`https://upcdn.io/${appId}/raw/demo/${fileId}.jpeg`}/> */}
                <Image src={imageUrl} alt={`Beer banner for ${personsName}`}/>
            </Box>
        </>
    )
}
