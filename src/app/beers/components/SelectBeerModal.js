import { Box, Button, Center, Flex, Image, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useBreakpointValue, useMediaQuery } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { BeerUGCInput } from "./BeerUGCInput";
import { AddYourOwn } from "./AddYourOwn";
import { Letter } from "./Letter";

export const SelectBeerModal = ({isOpen, onClose, letter, onBeerSelected, onChangeBeerSearchQuery, beerSearchResults}) => {
    const [useHorizontalLayout] = useMediaQuery('(max-height: 450px)')

    const modalSize = useBreakpointValue(
        {
            base: 'full',
            lg: '2xl',
        },
        {
            fallback: 'lg',
        },
    )

    const headerFooterProps = {
        py: useHorizontalLayout ? '2' : '4'
    }

    const initialFocusRef = useRef(null)
    const [isInBeerUGCMode, setIsInBeerUGCMode] = useState(false);
    const [beerSearchQuery, setBeerSearchQuery] = useState('');

    const onCloseInner = () => {
        onClose()
        setIsInBeerUGCMode(false)
        setBeerSearchQuery('')
    }

    const onBeerSelectedInner = (beer) => {
        onBeerSelected(beer)
        setIsInBeerUGCMode(false)
        setBeerSearchQuery('')
    }

    const onChangeBeerSearchQueryInner = (query) => {
        setBeerSearchQuery(query)
        onChangeBeerSearchQuery(query)
    }

    return (
        <Modal initialFocusRef={initialFocusRef} isOpen={isOpen} onClose={onCloseInner} scrollBehavior='inside' size={modalSize}>
            <ModalOverlay />
            <ModalContent margin='auto'>
                <BeerModalHeader
                    {...headerFooterProps}
                    letter={letter}
                    beerSearchQuery={beerSearchQuery}
                    onChangeBeerSearchQuery={onChangeBeerSearchQueryInner} />
                <ModalCloseButton />
                <ModalBody py='0'>
                    <BeerUGCModalContent
                        isInBeerUGCMode={isInBeerUGCMode}
                        onUGCBeerCreated={onBeerSelectedInner} />
                    <BeerPickerModalContent
                        isInBeerUGCMode={isInBeerUGCMode}
                        letter={letter}
                        useHorizontalLayout={useHorizontalLayout}
                        onBeerSelected={onBeerSelectedInner}
                        beerSearchResults={beerSearchResults} />
                    <NoSearchResults
                        isInBeerUGCMode={isInBeerUGCMode}
                        beerSearchResults={beerSearchResults}
                        setIsInBeerUGCMode={setIsInBeerUGCMode}
                        onChangeBeerSearchQuery={onChangeBeerSearchQueryInner} />
                </ModalBody>
                <BeerModalFooter
                    initialFocusRef={initialFocusRef}
                    {...headerFooterProps}
                    onClose={onCloseInner}
                    onAddYourOwn={() => setIsInBeerUGCMode(true)} />
            </ModalContent>
        </Modal>
    )
}

const BeerModalHeader = ({onChangeBeerSearchQuery, beerSearchQuery, letter, py}) => {
    return (
        <ModalHeader py={py}>
            <Center>
                <Input
                    placeholder={`Search for "${letter}" beers`}
                    value={beerSearchQuery}
                    width='90%'
                    onChange={e => {
                        onChangeBeerSearchQuery(e.target.value);
                    }}
                />
            </Center>
        </ModalHeader>
    )
}

const BeerUGCModalContent = ({isInBeerUGCMode, onUGCBeerCreated}) => {
    if (isInBeerUGCMode) {
        return (
            <BeerUGCInput 
                onClick={(userGeneratedBeer) => {
                    onUGCBeerCreated({userGeneratedBeer: {beer: userGeneratedBeer}})
                }}
            />
        )
    }

    return (<></>)
}


const BeerPickerModalContent = ({isInBeerUGCMode, letter, useHorizontalLayout, onBeerSelected, beerSearchResults}) => {
    if (isInBeerUGCMode) {
        return (<></>)
    }

    const beerSearchResultsAsLetters = beerSearchResults.map( (beer, idx) => {
        return (
            <Box key={`beer-picker-${idx}}`} width='100px' minW='100px'>
                <Image
                    src={beer?.beer?.beer_label_file}
                    alt={beer?.beer?.beer_name + ' ' + beer?.beer?.beer_type}
                    boxSize='100px'
                    fit='contain'
                    onClick={() => onBeerSelected({ beer })}/>
                <Letter
                    beer={beer}
                    onClick={() => onBeerSelected({ beer })} />
            </Box>
        )
    })

    const flexProperties = {
        flexWrap: useHorizontalLayout ? '' : 'wrap'
    }

    return (
        <>
            <Divider mb='1' text={`Suggested beers for "${letter}"`} />
            <Flex justifyContent='safe center' gap='5' overflow='auto' {...flexProperties}>
                {beerSearchResultsAsLetters}
            </Flex>
        </>
    )
}

const NoSearchResults = ({isInBeerUGCMode, beerSearchResults, setIsInBeerUGCMode, onChangeBeerSearchQuery}) => {
    if (isInBeerUGCMode || (beerSearchResults && Object.keys(beerSearchResults).length > 0)) {
        return (<></>)
    }

    return (
        <Flex flexDirection='column' textAlign='center' my='15' gap='2'>
            <Box>
                <Text>
                    Uh oh, no beers found for your search!
                </Text>
            </Box>
            <Box>
                <Text as='span' _after={{content: '" "'}}>
                    Try searching for a different beer,
                </Text>
                <Button onClick={() => onChangeBeerSearchQuery('')} variant='link'>view our suggestions</Button>
                <Text as='span' _before={{content: '" "'}} _after={{content: '" "'}}>
                    or
                </Text>
                <Button onClick={() => setIsInBeerUGCMode(true)} variant='link'>upload your own</Button>
            </Box>
        </Flex>
    )
}

const BeerModalFooter = ({initialFocusRef, onClose, onAddYourOwn, py}) => {
    return (
        <ModalFooter display='block' py={py}>
            <Divider text="Can't find what you want?" />
            <Flex justifyContent='space-between'>
                <AddYourOwn 
                    onClick={onAddYourOwn}
                />
                <Button onClick={onClose} ref={initialFocusRef} >
                    Cancel
                </Button>
            </Flex>
        </ModalFooter>
    )
}

const Divider = ({text, mb=0} = {}) => {
    return (
        <Box as='fieldset' mb={mb} borderTop='1px' borderColor='gray.600'>
            <Box as='legend' textAlign='center' px='2'>{text}</Box>
        </Box>
    )
}
