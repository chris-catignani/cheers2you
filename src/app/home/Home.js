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
        dispatch(generateBeerBanner({personsName}))
        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.set('name', personsName)
        router.push(`/beers?${newSearchParams}`)
    }

    return (
        // RHYS: I set font weight (500) here for the body text like BrewDog - probably easier way of doing it globally?
        <Container maxW='xl' fontWeight={500}> 
            <Flex flexDirection='column' gap='5'>
                <Heading color='orangered' as='h2' size='2xl' textAlign='center'>
                    Cheers2You
                </Heading>
                <Text as='h3' fontSize='1.2em' fontWeight='600' textAlign='center'>
                    The celebrate a name with beer app
                </Text>
                <Box>
                    <Text>
                        Looking for a new way to celebrate a special occasion? 
                    </Text>                 
                    <Text mt='3' mb='3'>
                        {"Here's how it works:"} 
                    </Text>
                    <UnorderedList spacing={1}>
                        <ListItem>Visit a pub with your friends</ListItem>
                        <ListItem>To celebrate, each drink a different beer for every letter in a name</ListItem>
                        <ListItem>Then download and share our cool beer label trophy</ListItem>
                    </UnorderedList>
                </Box>
                <Box border='2px' borderColor='lightgray'>
                    <Image
                        src='/janet-plaque-short-ani1.gif'
                        alt='Janet beer banner example'
                        htmlWidth={800}
                        htmlHeight={500}/>
                </Box>
                <Box>
                    <Input
                        width='100%'
                        variant='tango'
                        placeholder='Type a name'
                        _focus={{letterSpacing:'4px', textTransform:'upperCase', fontWeight:'bold'}}
                        value={personsName}
                        onChange={e => dispatch(setPersonsName(e.target.value))}
                    />
                    <Button
                        mt='4'
                        width='100%'
                        variant='primary'
                        onClick={onSearchClick}
                    >
                        GIVE IT A GO
                    </Button>
                </Box>
                <Box>
                    <Text>
                        Celebrate birthdays, graduations, engagements, births, marriages etc.
                    </Text>
                    <Text mt='2'>
                        Share the badge on your socials and use it to create a personalised gift, card, plaque, poster, t-shirt, anything!
                    </Text>
                </Box>
                <Box border='1px' borderColor='lightgray'>
                    <Image
                        src='/david-mug.png'
                        alt='David Mug example'
                        htmlWidth={800}
                        htmlHeight={30}
                        loading="lazy"/>
                </Box>
                <Box border='1px' borderColor='lightgray'>
                    <Image
                        src='/janet-box.png'
                        alt='Janet Box example'
                        htmlWidth={800}
                        htmlHeight={30}
                        loading="lazy"/>
                </Box>
                <Box border='1px' borderColor='lightgray'>             
                <Image
                        src='/david-t-shirt2.png'
                        alt='David T-Shirt example'
                        htmlWidth={800}
                        htmlHeight={30}
                        loading="lazy"/>
                </Box>
                <Box border='1px' borderColor='lightgray'>
                    <Image
                        src='/david-plaque-wall.png'
                        alt='David Wall example'
                        htmlWidth={800}
                        htmlHeight={30}
                        loading="lazy"/>
                </Box>
            </Flex>
        </Container>
    )
}
