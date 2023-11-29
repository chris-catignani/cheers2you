import { Button, Flex, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from "@chakra-ui/react";
import { useState } from "react";
import { BeerUGCInput } from "./BeerUGCInput";
import { AddYourOwn } from "./AddYourOwn";
import { Letter } from "./Letter";

export const SelectBeerModal = ({isOpen, onClose, header, children}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size='xl'>
            <ModalOverlay />
            <ModalContent margin='auto'>
                <ModalHeader margin='auto'>{header}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {children}
                </ModalBody>
                <ModalFooter>
                <Button onClick={onClose}>
                    Cancel
                </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

export const BeerModalContent = ({onBeerSelected, onChangeBeerSearchQuery, beerSearchResults}) => {
    const [isInBeerUGCMode, setIsInBeerUGCMode] = useState(false);

    if (isInBeerUGCMode) {
        return (
            <BeerUGCInput onClick={(userGeneratedBeer) => {
                onBeerSelected({userGeneratedBeer})
            }} />
        )
    }

    return (
        <Flex justifyContent='safe center' flexWrap='wrap' columnGap='5'>
            <BeerSearch
                beerSearchResults={beerSearchResults}
                onChangeBeerSearchQuery={onChangeBeerSearchQuery}
                onBeerSelected={onBeerSelected} />
            <AddYourOwn 
                onClick={() => setIsInBeerUGCMode(true)}
            />
        </Flex>
    )
}

export const BeerSearch = ({onBeerSelected, onChangeBeerSearchQuery, beerSearchResults}) => {
    const [beerSearchQuery, setBeerSearchQuery] = useState('');

    const beerSearchResultsAsLetters = beerSearchResults.map( (beer, idx) => {
        return (
            <Letter
                beer={beer}
                width='100px'
                onClick={() => onBeerSelected({beer})}
                key={`beer-picker-${idx}}`}>
            </Letter>
        )
    })

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
            {beerSearchResultsAsLetters}
        </>
    )
}
