'use client'

import { generateBeerBanner, generateBeerDefaults, setBeerLetters } from "@/lib/redux"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import Image from 'next/image'
import { Box, Button, Container, Flex, Heading, Input, Text } from "@chakra-ui/react"
import { useRouter } from 'next/navigation'
import { selectPersonsName } from "@/lib/redux/slices/searchSlice"
import { setPersonsName } from "@/lib/redux/slices/searchSlice/searchSlice"

export const Home = () => {
    const dispatch = useDispatch();
    const router = useRouter()

    useEffect(() => {
        dispatch(generateBeerDefaults())
    }, [dispatch])

    const personsName = useSelector(selectPersonsName)

    const onSearchClick = () => {
        dispatch(generateBeerBanner({personsName}))
        router.push(`/beers?name=${encodeURIComponent(personsName)}`)
    }

    return (
        <Container maxW='xl'>
            <Flex flexDirection='column' gap='5'>
                <Heading as='h2' size='3xl' textAlign='center'>
                    Cheers2You
                </Heading>
                <Box>
                    <Text>
                        Raise a toast by spelling names with beers.
                    </Text>
                    <Text mt='2'>
                        Enter a name and search our database for beers to match each letter.
                    </Text>
                </Box>

                <Box>
                    <Input
                        placeholder='Type a name'
                        value={personsName}
                        onChange={e => dispatch(setPersonsName(e.target.value))}
                    />
                    <Button
                        mt='2'
                        width='full'
                        onClick={onSearchClick}
                    >
                        Search for matching beers
                    </Button>
                </Box>
                <Box>
                    <Text>
                        Celebrate birthdays, engagements, births, deaths or marriages.
                    </Text>
                    <Text mt='2'>
                        We create a memorable keepsake to share on your socials. Also download the design to create a card, plaque, poster, t-shirt etc.
                    </Text>
                </Box>
                <Box border='2px' borderColor='gray.600'>
                    {/* Below is a Nextjs Image not a Chakra Image */}
                    <Image
                        src={'/david_logo_example.png'}
                        alt='David beer banner example'
                        width={800}
                        height={500}/>
                </Box>
                <Box border='2px' borderColor='gray.600'>
                    {/* Below is a Nextjs Image not a Chakra Image */}
                    <Image
                        src={'/sarah_logo_example.png'}
                        alt='Sarah beer banner example'
                        width={800}
                        height={500}/>
                </Box>
            </Flex>
        </Container>
    )
}
