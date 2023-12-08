import { Button, ButtonGroup, Center, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text } from "@chakra-ui/react"


export const ChallangeModeExplainerModal = ({isOpen, onClose, onOptIn}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size='xl'>
            <ModalOverlay />
            <ModalContent margin='auto'>
            <ModalHeader margin='auto'>The Cheers2You Challenge</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                <Text>
                    It works a little like an old school slot or fruit machine.
                    You spin the beers for the name and you get to hold the ones you like and spin the others.
                    You only have a maximum of 3 spins then you have to drink the beers!
                </Text>
            </ModalBody>
            <ModalFooter margin='auto'>
                <ButtonGroup spacing='20'>
                    <Button onClick={onOptIn}>
                        {"I'm in"}
                    </Button>
                    <Button onClick={onClose}>
                        {"I'm out"}
                    </Button>
                </ButtonGroup>
            </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
