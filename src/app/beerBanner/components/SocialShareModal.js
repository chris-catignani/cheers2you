import { CopyIcon } from "@chakra-ui/icons"
import { Button, Flex, IconButton, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from "@chakra-ui/react"
import { EmailIcon, EmailShareButton, FacebookIcon, FacebookShareButton, TwitterShareButton, WhatsappIcon, WhatsappShareButton, XIcon } from "react-share"

export const SocialShareModal = ({isOpen, onClose, shareUrl, eventName}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size='xl'>
            <ModalOverlay />
            <ModalContent margin='auto'>
            <ModalHeader margin='auto'>Share your design</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                <Flex gap='2'>
                    <FacebookShareButton url={shareUrl}>
                        <FacebookIcon size={40} round />
                    </FacebookShareButton>
                    <TwitterShareButton
                        url={shareUrl}
                        title={eventName}
                    >
                        <XIcon size={40} round />
                    </TwitterShareButton>
                    <WhatsappShareButton
                        url={shareUrl}
                        title={eventName}
                        separator=":: "
                    >
                        <WhatsappIcon size={40} round />
                    </WhatsappShareButton>
                    <EmailShareButton
                        url={shareUrl}
                        subject={eventName}
                        body="body"
                    >
                        <EmailIcon size={40} round />
                    </EmailShareButton>
                    <IconButton
                        isRound={true}
                        onClick={() => navigator.clipboard.writeText(shareUrl)} 
                        icon={<CopyIcon />}/>
                </Flex>
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