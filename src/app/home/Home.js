'use client'

import { generateBeerBanner, generateBeerDefaults, setPersonsName, selectPersonsName } from "@/lib/redux"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Box, Button, Container, Flex, Heading, Image, Input, Text } from "@chakra-ui/react"
import { useRouter, useSearchParams } from 'next/navigation'

export const Home = ({venueName}) => {
    const dispatch = useDispatch();
    const searchParams = useSearchParams()
    const router = useRouter()

    useEffect(() => {
        dispatch(generateBeerDefaults(venueName))
    }, [dispatch, venueName])

    const personsName = useSelector(selectPersonsName)

    const onSearchClick = () => {
        dispatch(generateBeerBanner({personsName, venueName}))
        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.set('name', personsName)
        router.push(`/beers?${newSearchParams}`)
    }

    return (
        <Container maxW='xl'>
            <Flex flexDirection='column' gap='5'>
                <Heading as='h2' size='2xl' textAlign='center'>
                    Cheers2You
                </Heading>
                <Box>
                    <Text>
                        Do you and your friends love beer? Need a new reason to drink a few?
                    </Text>
                    <Text mt='2'>
                        Celebrate a special event by drinking beers to spell a friends name. Each beer will represent a letter in the name… get creative
                    </Text>
                </Box>
                <Box border='2px' borderColor='gray.600'>
                    <Image
                        src='/david_logo_example.png'
                        alt='David beer banner example'
                        htmlWidth={800}
                        htmlHeight={500}/>
                </Box>
                <Box>
                    <Input
                        width='100%'
                        placeholder='Type a name'
                        textAlign='left'
                        variant='dark'
                        value={personsName}
                        onChange={e => dispatch(setPersonsName(e.target.value))}
                    />
                    <Button
                        mt='4'
                        width='100%'
                        variant='dark'
                        onClick={onSearchClick}
                    >
                        GIVE IT A GO
                    </Button>
                </Box>
                <Box>
                    <Text>
                        Commemorate birthdays, graduations, engagements, marriages etc..
                    </Text>
                    <Text mt='2'>
                        Share the C2U badge on your socials and use it to create a memorable gift, card, plaque, poster, t-shirt, anything!
                    </Text>
                </Box>
                <Box border='2px' borderColor='gray.600'>
                    <Image
                        src='/sarah_logo_example.png'
                        alt='Sarah beer banner example'
                        htmlWidth={800}
                        htmlHeight={500}/>
                </Box>
            </Flex>
        </Container>
    )
}
