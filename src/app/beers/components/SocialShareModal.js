import { CopyIcon } from "@chakra-ui/icons"
import { Button, Flex, IconButton, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from "@chakra-ui/react"
import { EmailIcon, EmailShareButton, FacebookIcon, FacebookShareButton, TwitterShareButton, WhatsappIcon, WhatsappShareButton, XIcon } from "react-share"

export const SocialShareModal = ({isOpen, onClose, shareUrl, personsName}) => {

    const title = `Raise a toast to ${personsName} with Cheers2You!`

    return (
        <Modal isOpen={isOpen} onClose={onClose} size='xl'>
            <ModalOverlay />
            <ModalContent margin='auto'>
            <ModalHeader margin='auto'>Share your design</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                <Flex gap='2'>
                    <FacebookShareButton
                        url={shareUrl}
                        hashtag={'#Cheers2You'}
                    >
                        <FacebookIcon size={40} round />
                    </FacebookShareButton>
                    <TwitterShareButton
                        url={shareUrl}
                        title={title}
                        hashtags={['Cheers2You']}
                    >
                        <XIcon size={40} round />
                    </TwitterShareButton>
                    <WhatsappShareButton
                        url={shareUrl}
                        title={title}
                        separator=' '
                    >
                        <WhatsappIcon size={40} round />
                    </WhatsappShareButton>
                    <EmailShareButton
                        url={shareUrl}
                        subject={title}
                        body={`Check out this beer banner made for ${personsName} using Cheers2You:`}
                        separator=' '
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