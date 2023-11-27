'use client'

import { useDispatch, useSelector } from 'react-redux';
import React from 'react';
import { EventInput } from './components/EventInput'
import { Box, Flex, Heading } from '@chakra-ui/react';
import { generateBeerBanner, selectEventName, selectPersonsName } from '@/lib/redux';

export const BeerBanner = () => {
    const dispatch = useDispatch();

    const eventName = useSelector(selectEventName);
    const personsName = useSelector(selectPersonsName);

    const generatePressed = (personsName, eventName) => {
        dispatch(generateBeerBanner(personsName, eventName))
    }

    return (
        <Box>
            <EventInput
                personsName={personsName}
                eventName={eventName}
                onClick={generatePressed}
            />
            <Flex overflowX='auto' flexDirection='column' flexWrap='wrap'>
                <Heading as='h3' size='lg' textAlign='center'>{eventName}</Heading>
            </Flex>
        </Box>
    )
}
