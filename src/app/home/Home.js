'use client'

import { generateBeerBanner, generateBeerDefaults, setPersonsName, selectPersonsName } from "@/lib/redux"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Box, Button, Container, Flex, Heading, Image, Input, Text, List, UnorderedList, OrderedList, ListItem, ListIcon } from "@chakra-ui/react"
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
        // RHYS: I set font weight (500) here for the body text like BrewDog - probably easier way of doing it globally?
        <Container maxW='xl' fontWeight={500}> 
            <Flex flexDirection='column' gap='5'>
                <Heading as='h2' size='2xl' textAlign='center'>
                    Cheers2You
                </Heading>
                <Text as='h3' fontSize='1.2em' fontWeight='600' textAlign='center'>
                    The spell a name with beers app
                </Text>
                <Box>
                    <Text>
                        Looking for a new way to celebrate a special occasion? Do you and your friends love beer? 
                    </Text>                 
                    <Text mt='3' mb='3'>
                        {"Here's how it works:"} 
                    </Text>
                    <UnorderedList spacing={1}>
                        <ListItem>Drink a beer for each letter in a name</ListItem>
                        <ListItem>Each beer drunk should represent a letter</ListItem>
                        <ListItem>Then share or download our stylish beer lable based memento</ListItem>
                    </UnorderedList>
                </Box>
                <Box border='2px' borderColor='lightgray'>
                    <Image
                        src='/janet-plaque3png'
                        alt='Janet beer banner example'
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
                        Celebrate birthdays, graduations, engagements, marriages etc.
                    </Text>
                    <Text mt='2'>
                        Share the badge on your socials and use it to create a memorable gift, card, plaque, poster, t-shirt, anything!
                    </Text>
                </Box>
                <Box border='1px' borderColor='lightgray'>
                    <Image
                        src='/david-t-shirt2.png'
                        alt='David T-Shirt example'
                        htmlWidth={800}
                        htmlHeight={30}/>
                </Box>
                <Box border='1px' borderColor='lightgray'>
                    <Image
                        src='/david-card2.png'
                        alt='David Card example'
                        htmlWidth={800}
                        htmlHeight={30}/>
                </Box>
            </Flex>
        </Container>
    )
}
