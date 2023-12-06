import { Button, Flex, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useBreakpointValue, useMediaQuery } from "@chakra-ui/react";
import { useState } from "react";
import { BeerUGCInput } from "./BeerUGCInput";
import { AddYourOwn } from "./AddYourOwn";
import { Letter } from "./Letter";

export const SelectBeerModal = ({isOpen, onClose, header, children}) => {
    
    const modalSize = useBreakpointValue(
        {
            base: 'full',
            lg: '2xl',
        },
        {
            fallback: 'lg',
        },
    )

    return (
        <Modal isOpen={isOpen} onClose={onClose} scrollBehavior='inside' size={modalSize}>
            <ModalOverlay />
            <ModalContent margin='auto'>
                <ModalHeader margin='auto'>{header}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {children}
                </ModalBody>
                <BeerModalFooter onClose={onClose} />
            </ModalContent>
        </Modal>
    )
}

export const BeerModalContent = ({onBeerSelected, onChangeBeerSearchQuery, beerSearchResults}) => {
    const [isInBeerUGCMode, setIsInBeerUGCMode] = useState(false);
    const [beerSearchQuery, setBeerSearchQuery] = useState('');
    const [useHorizontalLayout] = useMediaQuery('(max-height: 450px)')

    if (isInBeerUGCMode) {
        return (
            <BeerUGCInput onClick={(userGeneratedBeer) => {
                onBeerSelected({userGeneratedBeer})
            }} />
        )
    }

    const beerSearchResultsAsLetters = beerSearchResults.map( (beer, idx) => {
        return (
            <Letter
                beer={beer}
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
                mb='5'
                onChange={e => {
                    setBeerSearchQuery(e.target.value);
                    onChangeBeerSearchQuery(e.target.value);
                }}
            />
            <Flex justifyContent='safe center' gap='5' overflow='auto' {...flexProperties}>
                {beerSearchResultsAsLetters}
                <AddYourOwn 
                    onClick={() => setIsInBeerUGCMode(true)}
                />
            </Flex>
        </>
    )
}

const BeerModalFooter = ({onClose}) => {
    const [useHorizontalLayout] = useMediaQuery('(max-height: 450px)')
    if (useHorizontalLayout) {
        return <></>
    }


    return (
        <ModalFooter>
            <Button onClick={onClose}>
                Cancel
            </Button>
        </ModalFooter>
    )
}
