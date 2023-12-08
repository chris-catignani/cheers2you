import { Box, Button, Flex, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useBreakpointValue, useMediaQuery } from "@chakra-ui/react";
import { useState } from "react";
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

    const [isInBeerUGCMode, setIsInBeerUGCMode] = useState(false);

    const onCloseInner = () => {
        onClose()
        setIsInBeerUGCMode(false)
    }

    return (
        <Modal isOpen={isOpen} onClose={onCloseInner} scrollBehavior='inside' size={modalSize}>
            <ModalOverlay />
            <ModalContent margin='auto'>
                <ModalHeader margin='auto' {...headerFooterProps}>Pick Your Beer For "{letter.toUpperCase()}"</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <BeerUGCModalContent
                        isInBeerUGCMode={isInBeerUGCMode}
                        onUGCBeerCreated={onBeerSelected} />
                    <BeerPickerModalContent
                        isInBeerUGCMode={isInBeerUGCMode}
                        letter={letter}
                        useHorizontalLayout={useHorizontalLayout}
                        onBeerSelected={onBeerSelected}
                        onChangeBeerSearchQuery={onChangeBeerSearchQuery}
                        beerSearchResults={beerSearchResults} />
                </ModalBody>
                <BeerModalFooter {...headerFooterProps} onClose={onCloseInner} onAddYourOwn={() => setIsInBeerUGCMode(true)}/>
            </ModalContent>
        </Modal>
    )
}

const BeerUGCModalContent = ({isInBeerUGCMode, onUGCBeerCreated}) => {
    if (isInBeerUGCMode) {
        return (
            <BeerUGCInput 
                onClick={(userGeneratedBeer) => {onUGCBeerCreated({userGeneratedBeer})}}
            />
        )
    }

    return (<></>)
}


const BeerPickerModalContent = ({isInBeerUGCMode, letter, useHorizontalLayout, onBeerSelected, onChangeBeerSearchQuery, beerSearchResults}) => {
    const [beerSearchQuery, setBeerSearchQuery] = useState('');

    if (isInBeerUGCMode) {
        return (<></>)
    }

    const beerSearchResultsAsLetters = beerSearchResults.map( ({beer, matchedFields}, idx) => {
        return (
            <Letter
                beer={beer}
                matchedFields={matchedFields}
                width='100px'
                displayBeerType={true}
                onClick={() => onBeerSelected({beer})}
                key={`beer-picker-${idx}}`}>
            </Letter>
        )
    })

    const flexProperties = {
        flexWrap: useHorizontalLayout ? '' : 'wrap'
    }

    return (
        <>
            <Input
                placeholder='Search for beer'
                value={beerSearchQuery}
                mb='1'
                onChange={e => {
                    setBeerSearchQuery(e.target.value);
                    onChangeBeerSearchQuery(e.target.value);
                }}
            />
            <Divider mb='1' text={`Suggested beers for "${letter}"`} />
            <Flex justifyContent='safe center' gap='5' overflow='auto' {...flexProperties}>
                {beerSearchResultsAsLetters}
            </Flex>
        </>
    )
}

const BeerModalFooter = ({onClose, onAddYourOwn, py}) => {
    return (
        <ModalFooter display='block' py={py}>
            <Divider text="Can't find what you want?" />
            <Flex justifyContent='space-between'>
                <AddYourOwn 
                    onClick={onAddYourOwn}
                />
                <Button onClick={onClose}>
                    Cancel
                </Button>
            </Flex>
        </ModalFooter>
    )
}

const Divider = ({text, mb=0} = {}) => {
    return (
        <Box as='fieldset' mb={mb} borderTop='1px solid black'>
            <Box as='legend' textAlign='center' px='2'>{text}</Box>
        </Box>
    )
}
