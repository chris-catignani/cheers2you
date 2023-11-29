'use client'

import { generateBeerDefaults, selectBeerDefaultsPerLetter } from "@/lib/redux"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button, Container, Input } from "@chakra-ui/react"
import { useRouter } from 'next/navigation'
import { selectPersonsName } from "@/lib/redux/slices/searchSlice"
import { setPersonsName } from "@/lib/redux/slices/searchSlice/searchSlice"

export const Home = () => {
    const dispatch = useDispatch();
    const router = useRouter()

    const beerDefaultsPerLetter = useSelector(selectBeerDefaultsPerLetter)
    useEffect(() => {
        if (Object.keys(beerDefaultsPerLetter).length === 0) {
            dispatch(generateBeerDefaults())
        }
    }, [dispatch, beerDefaultsPerLetter])

    const personsName = useSelector(selectPersonsName)

    return (
        <Container maxW='md'>
            <Input
                placeholder='Type a name'
                value={personsName}
                onChange={e => dispatch(setPersonsName(e.target.value))}
            />
            <Button
                width='full'
                onClick={() => router.push(`/beers?name=${personsName}`)}
            >
                Search for matching beers
            </Button>
        </Container>
    )
}
