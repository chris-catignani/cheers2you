import { Box, Image } from "@chakra-ui/react"


export const Shared = ({socialMediaInfo}) => {

    return (
        <>
            <Box>
                {/* <Image src={`https://upcdn.io/${appId}/raw/demo/${fileId}.jpeg`}/> */}
                <Image src={socialMediaInfo.imageUrl}/>
            </Box>
        </>
    )
}
