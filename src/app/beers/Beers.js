'use client'

import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useRef, useState } from 'react';
import { DownloadIcon } from '@chakra-ui/icons';
import { SocialShareModal } from './components/SocialShareModal';
import { SelectBeerModal } from './components/SelectBeerModal';
import { downloadImage, searchForBeer, selectBeerLetters, selectBeerSearchResults, selectDownloadGeneratedImageStatus, selectLockedBeerLetterIdxs, selectOpenBeerIdx, setBeerLetterAtIndex, setBeerSearchResults, setOpenBeerIdx, toggleLockedBeerLetterIdx, generateBeerBanner, uploadSocialMedia, selectUploadSocialMediaStatus, selectUploadedSocialMediaData, setUploadedSocialMediaData, generateBeerDefaults, selectBeerDefaultsPerLetter, selectPersonsName, selectIsChallangeMode, selectIsChallengeModeExplainerDisplayed, setIsChallengeModeExplainerDisplayed, setIsChallengeMode, incrementChallengeModeSpinCount, selectChallengeModeSpinCount, selectVenueName, setBeerLetters } from '@/lib/redux';
import { Box, Button, ButtonGroup, Container, Flex, Heading, IconButton, Show, Text, useDisclosure, useMediaQuery } from '@chakra-ui/react';
import { getSocialMediaShareUrl } from '@/lib/utils/utils';
import html2canvas from 'html2canvas';
import { ChallangeModeExplainerModal } from './components/ChallangeModeExplainerModal';
import { BeerSlotMachine } from './components/SlotMachine';
import { PhoneRotationSuggestion } from './components/PhoneRotationSuggestion';


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

    const shareButtons = (
        <ShareButtons generatedPicRef={generatedPicRef} />
    )

    return (
        <Container maxW='4xl' padding={0}>
            <BeersHeader
                onSpinUnlockedBeersPressed={spinUnlockedBeersPressed}
                onChallengeModePressed={onChallengeModePressed}
                shareButtons={isLandscapePhone && shareButtons}
                isLoading={isSpinning} />
            <BeerLetters
                isSpinning={isSpinning}
                setSpinning={setSpinning}
                generatedPicRef={generatedPicRef} />
            <ChallengeModeModal />
            <BeerModal />
            <ShareModal />
            <Box float='right'>
                {!isLandscapePhone && shareButtons}
            </Box>
            <Show below='sm'>
                <Flex width='100%' justifyContent='center'>
                    <PhoneRotationSuggestion text={'Try rotating your phone'} />
                </Flex>
            </Show>
        </Container>
    )
}

const BeersHeader = ({ onSpinUnlockedBeersPressed, onChallengeModePressed, shareButtons, isLoading }) => {
    const isChallengeMode = useSelector(selectIsChallangeMode);
    const challengeModeSpinCount = useSelector(selectChallengeModeSpinCount)

    let headerContent = null;

    if (isChallengeMode) {
        const maxSpinsReached = challengeModeSpinCount >= 3
        headerContent = (
            <Button
                width='sm'
                onClick={onSpinUnlockedBeersPressed}
                isLoading={isLoading}
                isDisabled={maxSpinsReached}
            >
                {maxSpinsReached ? 'No more spins. Drink up!' : 'Spin unlocked beers'}
            </Button>
        )
    } else {
        headerContent = (
            <Heading as='h5' size='sm' textAlign='center'>
                <Flex justifyContent='center' flexDirection='column'>
                    <Text as="span" whiteSpace='nowrap'>
                        Tap the suggested beers to choose your own.
                    </Text>
                    <Text as="span" mt='1' whiteSpace='nowrap'>
                        <Text as="span" _after={{content: '" "'}}>
                            Feeling frisky? Try the
                        </Text>
                        <Button onClick={onChallengeModePressed} variant='link' colorScheme='orange' >C2Y Challenge</Button>
                    </Text>
                </Flex>
            </Heading>
        )
    }

    return (
        // flex layout with 3 items. (1) full width empty spacer div (2) header content (3) full width div containing share buttons, right justified
        <Flex>
            <Box flex={1} />
            {headerContent}
            <Flex flex={1} justifyContent='right'>
                {shareButtons}
            </Flex>
        </Flex>
    )
}

// TODO refactor this. Use a helper to do the layout stuff, pass in react components
const BeerLetters = ({ generatedPicRef, isSpinning, setSpinning }) => {
    const dispatch = useDispatch();

    const isChallengeMode = useSelector(selectIsChallangeMode);
    const challengeModeSpinCount = useSelector(selectChallengeModeSpinCount)
    const beerLetters = useSelector(selectBeerLetters);
    const lockedBeerIdxs = useSelector(selectLockedBeerLetterIdxs);
    const beerDefaultsPerLetter = useSelector(selectBeerDefaultsPerLetter)

    const beerClicked = (idx) => {
        if (!isChallengeMode) {
            dispatch(setOpenBeerIdx(idx))
        }
    }

    const letterImageSize = '100px'
    const specialCharacterSize = '10px'

    const buildHeader = (letter, width, idx) => (
        <Heading
            as='h5'
            size='xl'
            mx='5'
            color='black'
            width={width}
            fontWeight='700'
            textAlign='center'
            textTransform='uppercase'
            key={`beer-letter-header-${idx}`}
        >
            {letter}
        </Heading>
    )

    const [headers, lockButtons] = beerLetters.reduce(([headers, lockButtons], { letter, isSpecialCharacter }, idx) => {
        if (isSpecialCharacter) {
            headers.push(buildHeader(letter, specialCharacterSize, idx))
            lockButtons.push(<Box width={specialCharacterSize} mx='5' key={`beer-letter-lock-${idx}`}  />)
        } else {
            headers.push(buildHeader(letter, letterImageSize, idx))

            const maxSpinsReached = challengeModeSpinCount >= 3
            const lockButtonText = lockedBeerIdxs[idx] ? 'Unlock Beer' : 'Lock Beer'
            lockButtons.push(
                <Button
                    width={letterImageSize}
                    size='sm'
                    mx='5'
                    key={`beer-letter-lock-${idx}`}
                    onClick={() => dispatch(toggleLockedBeerLetterIdx(idx))}
                    isDisabled={maxSpinsReached || isSpinning}
                >
                    {lockButtonText}
                </Button>
            )
        }
        return [headers, lockButtons]
    }, [[], []])

    const beerOptionsPerSlotReel = beerLetters.map( ({letter, beer, userGeneratedBeer, isSpecialCharacter}) => {
        const beers = isSpecialCharacter ? [] : [
            beer || userGeneratedBeer,
            ...(beerDefaultsPerLetter[letter.toLowerCase()] || []).filter((aBeer) => (
                aBeer.beer_name !== beer?.beer_name && aBeer.brewer_name !== beer?.brewer_name
            ))
        ]
        return {
            isSpecialCharacter,
            beers: beers
        }
    })

    const onSpinningFinished = ({allDone, beers, idx}) => {
        if (allDone) {
            const newBeerLetters = beerLetters.map((beerLetter, idx) => {
                return {
                    ...beerLetter,
                    beer: beers[idx],
                    userGeneratedBeer: {}, // TODO for now
                }
            })
            dispatch(setBeerLetters(newBeerLetters))
            setSpinning(false)
        } else {
            dispatch(setBeerLetterAtIndex({
                idx,
                beer: beers[idx],
            }))
        }
    }

    return (
        <Flex overflowX='auto' flexDirection='column' flexWrap='wrap' marginBottom='2' marginTop='2'>
            <Flex justifyContent='safe center'>
                {isChallengeMode && lockButtons}
            </Flex>
            
            {/* padding defined below so that border of the element inside it shows in the screencapture */}
            <Box mt='1' p='1' ref={generatedPicRef}>
                {/* padding top here to ensure the border is not directly on top of the letters */}
                <Box pt='3' border='3px double black'>
                    <Flex justifyContent='safe center'>
                        {headers}
                    </Flex>
                    <Box mt='5'>
                        <BeerSlotMachine
                            spin={isSpinning}
                            onSpinningFinished={onSpinningFinished}
                            beerOptionsPerReel={beerOptionsPerSlotReel}
                            lockedReelIndexes={lockedBeerIdxs}
                            letterImageSize={letterImageSize}
                            specialCharacterSize={specialCharacterSize}
                            onBeerClicked={beerClicked} />
                    </Box>

                </Box>
            </Box>
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
            <Button isLoading={uploadSocialMediaStatus === 'uploading'} onClick={() => uploadOutput()}>Share</Button>
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
