'use client'

import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useRef, useState } from 'react';
import { DownloadIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { SocialShareModal } from './components/SocialShareModal';
import { SelectBeerModal } from './components/SelectBeerModal';
import { downloadImage, searchForBeer, selectBeerLetters, selectBeerSearchResults, selectDownloadGeneratedImageStatus, selectLockedBeerLetterIdxs, selectOpenBeerIdx, setBeerLetterAtIndex, setBeerSearchResults, setOpenBeerIdx, toggleLockedBeerLetterIdx, generateBeerBanner, uploadSocialMedia, selectUploadSocialMediaStatus, selectUploadedSocialMediaData, setUploadedSocialMediaData, generateBeerDefaults, selectBeerDefaultsPerLetter, selectPersonsName, selectIsChallangeMode, selectIsChallengeModeExplainerDisplayed, setIsChallengeModeExplainerDisplayed, setIsChallengeMode, incrementChallengeModeSpinCount, selectChallengeModeSpinCount, selectVenueName, setBeerLetters } from '@/lib/redux';
import { Box, Button, ButtonGroup, Center, Container, Flex, Heading, IconButton, Text, useDisclosure, useMediaQuery } from '@chakra-ui/react';
import { getSocialMediaShareUrl } from '@/lib/utils/utils';
import html2canvas from 'html2canvas';
import { ChallangeModeExplainerModal } from './components/ChallangeModeExplainerModal';
import { Slots } from './components/SlotMachine';


export const Beers = ({ personsName, venueName }) => {
    const dispatch = useDispatch();

    const beerDefaultsPerLetter = useSelector(selectBeerDefaultsPerLetter)
    useEffect(() => {
        if (Object.keys(beerDefaultsPerLetter).length === 0) {
            dispatch(generateBeerDefaults(venueName))
        }
    }, [dispatch, beerDefaultsPerLetter, venueName])

    const storedPersonsName = useSelector(selectPersonsName)
    useEffect(() => {
        if (storedPersonsName !== personsName) {
            dispatch(generateBeerBanner({ personsName, venueName }))
        }
    }, [dispatch, storedPersonsName, personsName, venueName])

    const [isLandscapePhone] = useMediaQuery('(max-height: 450px)')
    const [isSpinning, setSpinning] = useState(false);

    const generatedPicRef = useRef(null)

    const spinUnlockedBeersPressed = () => {
        setSpinning(true)
        dispatch(incrementChallengeModeSpinCount())
    }

    const onChallengeModePressed = () => {
        dispatch(setIsChallengeModeExplainerDisplayed(true))
    }

    let landscapePhoneShareButtonProps = {}
    if (isLandscapePhone) {
        landscapePhoneShareButtonProps = {
            position: 'absolute',
            right: '10px',
            top: '-20px',
        }
    }

    return (
        <Container maxW='4xl' padding={0}>
            <BeersHeader
                onSpinUnlockedBeersPressed={spinUnlockedBeersPressed}
                onChallengeModePressed={onChallengeModePressed}
                isLoading={isSpinning} />
            <BeerLetters
                isSpinning={isSpinning}
                setSpinning={setSpinning}
                generatedPicRef={generatedPicRef} />
            <ChallengeModeModal />
            <BeerModal />
            <ShareModal />
            <Box marginTop='5' float='right' {...landscapePhoneShareButtonProps}>
                <ShareButtons generatedPicRef={generatedPicRef} />
            </Box>
        </Container>
    )
}

const BeersHeader = ({ onSpinUnlockedBeersPressed, onChallengeModePressed, isLoading }) => {
    const isChallengeMode = useSelector(selectIsChallangeMode);
    const challengeModeSpinCount = useSelector(selectChallengeModeSpinCount)

    if (isChallengeMode) {
        const maxSpinsReached = challengeModeSpinCount >= 3
        return (
            <Container maxW='md' padding={0}>
                <Button
                    width='full'
                    onClick={onSpinUnlockedBeersPressed}
                    isLoading={isLoading}
                    // isDisabled={maxSpinsReached}
                >
                    {maxSpinsReached ? 'No more spins. Drink up!' : 'Spin unlocked beers'}
                </Button>
                <Center>
                    <Text>Spins remaining: {3 - challengeModeSpinCount}</Text>
                </Center>
            </Container>
        )
    } else {
        return (
            <Container maxW='xl'>
                <Heading as='h5' size='sm'>
                    <Flex flexWrap='wrap' justifyContent='center'>
                        <Text as="span" whiteSpace='nowrap'>
                            Tap the suggested beers to choose your own.
                        </Text>
                        <Text as="span" whiteSpace='nowrap'>
                            <Text as="span" _after={{content: '" "'}}>
                                Feeling frisky? Try the
                            </Text>
                            <Button onClick={onChallengeModePressed} variant='link' colorScheme='teal'>C2Y Challenge</Button>
                        </Text>
                    </Flex>
                </Heading>
            </Container>
        )
    }
}

// TODO refactor this. Use a helper to do the layout stuff, pass in react components
const BeerLetters = ({ generatedPicRef, isSpinning, setSpinning }) => {
    const dispatch = useDispatch();

    const isChallengeMode = useSelector(selectIsChallangeMode);
    const beerLetters = useSelector(selectBeerLetters);
    const lockedBeerIdxs = useSelector(selectLockedBeerLetterIdxs);
    const beerDefaultsPerLetter = useSelector(selectBeerDefaultsPerLetter)

    const beerClicked = (idx) => {
        if (!isChallengeMode) {
            dispatch(setOpenBeerIdx(idx))
        }
    }

    const [headers, lockButtons] = beerLetters.reduce(([headers, lockButtons], { letter, isSpecialCharacter }, idx) => {
        if (isSpecialCharacter) {
            headers.push(
                <Heading as='h5' size='md' fontWeight='800' width='10px' textAlign='center' textTransform='uppercase' key={`beer-letter-${idx}`}>{letter}</Heading>
            )
            lockButtons.push(<Box width='10px' />)
        } else {
            headers.push(
                <Heading as='h5' size='md' fontWeight='800' width='100px' textAlign='center' textTransform='uppercase' key={`beer-letter-${idx}`}>{letter}</Heading>
            )

            const lockButtonText = lockedBeerIdxs[idx] ? 'Unlock Beer' : 'Lock Beer'
            lockButtons.push(
                <Button
                    width='100px'
                    marginBottom='1'
                    key={`beer-letter-lock-${idx}`}
                    onClick={() => dispatch(toggleLockedBeerLetterIdx(idx))}
                    hidden={isSpinning}
                >
                    {lockButtonText}
                </Button>
            )
        }
        return [headers, lockButtons]
    }, [[], []])

    const slotReelsOptions = beerLetters.map( ({letter, beer, userGeneratedBeer, isSpecialCharacter}) => {
        return {
            isSpecialCharacter,
            beers: isSpecialCharacter ? [] : [beer || userGeneratedBeer, ...beerDefaultsPerLetter[letter.toLowerCase()] || []]
        }
    })

    const onSpinningFinished = (beers) => {
        setSpinning(false)
        const newBeerLetters = beerLetters.map((beerLetter, idx) => {
            return {
                ...beerLetter,
                beer: beers[idx],
                userGeneratedBeer: {}, // TODO for now
            }
        })
        dispatch(setBeerLetters(newBeerLetters))
    }

    return (
        <Flex overflowX='auto' flexDirection='column' flexWrap='wrap' marginBottom='2' marginTop='3'>
            {/* padding defined below so that border of the element inside it shows in the screencapture */}
            <Box p='1' ref={generatedPicRef}>
                {/* padding top here to ensure the border is not directly on top of the letters */}
                <Box pt='5' border='3px double black'>
                    <Flex justifyContent='safe center' gap='10'>
                        {headers}
                    </Flex>
                    <Box mt='5'>
                        <Slots
                            spin={isSpinning}
                            onSpinningFinished={onSpinningFinished}
                            slotReelsOptions={slotReelsOptions}
                            lockedSlotIndexes={lockedBeerIdxs}
                            onBeerClicked={beerClicked} />
                    </Box>

                </Box>
            </Box>
            <Flex justifyContent='safe center' gap='10'>
                {lockButtons}
            </Flex>
        </Flex>
    )
}

const ShareButtons = ({ generatedPicRef }) => {
    const dispatch = useDispatch();
    const personsName = useSelector(selectPersonsName)
    const downloadGeneratedImageStatus = useSelector(selectDownloadGeneratedImageStatus);
    const uploadSocialMediaStatus = useSelector(selectUploadSocialMediaStatus)

    const donwloadOutput = async () => {
        const node = generatedPicRef.current;
        const canvasPromise = html2canvas(node, {
            backgroundColor: 'white',
            width: node.scrollWidth,
            height: node.scrollHeight,
            proxy: '/beers/api/imageProxy',
        })
        dispatch(downloadImage(canvasPromise))
    }

    const uploadOutput = async () => {
        const node = generatedPicRef.current;
        const canvasPromise = html2canvas(node, {
            backgroundColor: 'white',
            width: node.scrollWidth,
            height: node.scrollHeight,
            proxy: '/beers/api/imageProxy',
        })
        dispatch(uploadSocialMedia({
            canvasPromise,
            personsName,
            imageHeight: node.scrollHeight,
            imageWidth: node.scrollWidth,
        }))
    }

    return (
        <ButtonGroup>
            <IconButton
                isLoading={uploadSocialMediaStatus === 'uploading'}
                onClick={() => uploadOutput()}
                icon={<ExternalLinkIcon />} />
            <IconButton
                isLoading={downloadGeneratedImageStatus === 'downloading'}
                onClick={() => donwloadOutput()}
                icon={<DownloadIcon />} />
        </ButtonGroup>
    )
}

const ChallengeModeModal = () => {
    const dispatch = useDispatch();
    const { isOpen, onOpen, onClose } = useDisclosure()

    const isChallengeModeExplainerDisplayed = useSelector(selectIsChallengeModeExplainerDisplayed)

    useEffect(() => {
        if (isChallengeModeExplainerDisplayed) {
            onOpen()
        }
    }, [isChallengeModeExplainerDisplayed, onOpen])

    const onCloseModal = () => {
        dispatch(setIsChallengeModeExplainerDisplayed(false))
        onClose()
    }

    const onOptIn = () => {
        dispatch(setIsChallengeMode(true))
        onCloseModal()
    }

    return (
        <ChallangeModeExplainerModal
            isOpen={isOpen}
            onClose={onCloseModal}
            onOptIn={onOptIn}
        />
    )
}

const ShareModal = () => {
    const dispatch = useDispatch();
    const { isOpen, onOpen, onClose } = useDisclosure()

    const personsName = useSelector(selectPersonsName)
    const uploadedSocialMediaData = useSelector(selectUploadedSocialMediaData)
    const shareUrl = getSocialMediaShareUrl(uploadedSocialMediaData['fileId'])

    // Open the Modal if we have uploaded the image data
    useEffect(() => {
        if (Object.keys(uploadedSocialMediaData).length === 0) { return }
        onOpen()
    }, [uploadedSocialMediaData, onOpen])

    const clearDataOnClose = () => {
        dispatch(setUploadedSocialMediaData({}))
        onClose()
    }

    return (
        <SocialShareModal
            isOpen={isOpen}
            onClose={clearDataOnClose}
            shareUrl={shareUrl}
            personsName={personsName}
        />
    )
}

const BeerModal = () => {
    const dispatch = useDispatch();
    const { isOpen, onOpen, onClose } = useDisclosure()

    const venueName = useSelector(selectVenueName);
    const beerLetters = useSelector(selectBeerLetters);
    const openBeerIdx = useSelector(selectOpenBeerIdx);
    const beerSearchResults = useSelector(selectBeerSearchResults);
    const beerDefaultsPerLetter = useSelector(selectBeerDefaultsPerLetter);

    const letter = openBeerIdx !== -1 ? beerLetters[openBeerIdx]['letter'].toLowerCase() : ''

    const clearDataOnClose = () => {
        dispatch(setOpenBeerIdx(-1));
        dispatch(setBeerSearchResults([]))
        onClose()
    }

    const onBeerSelected = ({ beer, userGeneratedBeer }) => {
        dispatch(setBeerLetterAtIndex({
            idx: openBeerIdx,
            beer,
            userGeneratedBeer,
        }))
        clearDataOnClose()
    }

    const onChangeBeerSearchQuery = (beerSearchQuery) => {
        if (!beerSearchQuery) {
            dispatch(setBeerSearchResults(beerDefaultsPerLetter[letter].map(beer => { return { beer } })))
        } else {
            dispatch(searchForBeer({
                query: beerSearchQuery,
                venueName
            }))
        }
    }

    // Open the Modal if we have an openBeerIndex
    useEffect(() => {
        if (openBeerIdx !== -1) {
            dispatch(setBeerSearchResults(beerDefaultsPerLetter[letter].map(beer => { return { beer } })))
            onOpen()
        }
    }, [openBeerIdx, onOpen, letter, beerDefaultsPerLetter, dispatch])

    return (
        <SelectBeerModal
            isOpen={isOpen}
            onClose={clearDataOnClose}
            letter={letter.toUpperCase()}
            onBeerSelected={onBeerSelected}
            onChangeBeerSearchQuery={onChangeBeerSearchQuery}
            beerSearchResults={beerSearchResults}
        />
    )
}
