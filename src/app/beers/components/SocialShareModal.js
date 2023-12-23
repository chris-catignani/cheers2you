import { CopyIcon, DownloadIcon } from "@chakra-ui/icons"
import { Box, Button, Link, Center, Flex, IconButton, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useBreakpointValue } from "@chakra-ui/react"
import { EmailIcon, EmailShareButton, FacebookIcon, FacebookShareButton, TwitterShareButton, WhatsappIcon, WhatsappShareButton, XIcon } from "react-share"
import download from 'downloadjs'

export const SocialShareModal = ({isOpen, onClose, shareUrl, imageUrl, personsName}) => {

    const title = `Raise a toast to ${personsName} with Cheers2You!`

    const modalSize = useBreakpointValue(
        {
            base: 'full',
            lg: '4xl',
        },
        {
            fallback: 'lg',
        },
    )

    return (
        <Modal isOpen={isOpen} onClose={onClose} size={modalSize} allowPinchZoom={true}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader margin='auto'>Share your plaque</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Image src={imageUrl} alt={`${personsName} beer plaque`} />
                    <Text mt='5' textAlign='center'>
                        Long press on your plaque above to save or share it with friends!
                    </Text>
                    <Text mt='2' textAlign='center'>
                        Or use one of our handy share buttons below:
                    </Text>
                    <Center>
                        <ShareButtons shareUrl={shareUrl} imageUrl={imageUrl} personsName={personsName} title={title} />
                    </Center>
                    <Box mt='5'>
                        <Text as='span'>Send feeback and ideas to </Text>
                        <Link href='mailto:teamcheers2you@gmail.com?subject=Feedback'  isExternal textDecoration='underline' >
                            teamcheers2you@gmail.com
                        </Link>
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button variant={'secondary'} onClick={onClose}>
                        Cancel
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

const ShareButtons = ({shareUrl, imageUrl, personsName, title}) => {
    return (
        <Flex gap='2' mt='3'>
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
                onClick={() => fetch(imageUrl).then(response => response.blob().then(blob => download(blob, 'Beer Banner.jpeg')))}
                icon={<DownloadIcon />} />
            <IconButton
                isRound={true}
                onClick={() => navigator.clipboard.writeText(shareUrl)}
                icon={<CopyIcon />} />
        </Flex>
    )
}
