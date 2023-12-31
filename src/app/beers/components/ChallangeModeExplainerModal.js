import { Button, ButtonGroup, Center, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, List, UnorderedList, OrderedList, ListItem, ListIcon} from "@chakra-ui/react"


export const ChallangeModeExplainerModal = ({isOpen, onClose, onOptIn}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size='xl' isCentered={true}>
            <ModalOverlay />
            <ModalContent>
            <ModalHeader margin='auto'>The Beer Spin Challenge</ModalHeader>
            <ModalCloseButton />
            <ModalBody fontWeight={500}>
                <UnorderedList spacing={1}>
                    <ListItem>It works like an old school fruit machine.</ListItem>
                    <ListItem>Hold the beers you like and spin the rest.</ListItem>
                    <ListItem>You get 3 spins then you have to drink!</ListItem>
                </UnorderedList>
            </ModalBody>
            <ModalFooter margin='auto'>
                <ButtonGroup spacing='20'>
                    <Button variant={'primary'} onClick={onOptIn}>
                        {"I'm in!"}
                    </Button>
                    <Button variant={'secondary'} onClick={onClose}>
                        {"I'll choose my own"}
                    </Button>
                </ButtonGroup>
            </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
