'use client'

import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useRef, useState } from 'react';
import { DownloadIcon } from '@chakra-ui/icons';
import { SocialShareModal } from './components/SocialShareModal';
import { SelectBeerModal } from './components/SelectBeerModal';
import { downloadImage, searchForBeer, selectBeerLetters, selectBeerSearchResults, selectDownloadGeneratedImageStatus, selectLockedBeerLetterIdxs, selectOpenBeerIdx, setBeerLetterAtIndex, setBeerSearchResults, setOpenBeerIdx, toggleLockedBeerLetterIdx, uploadSocialMedia, selectUploadSocialMediaStatus, selectUploadedSocialMediaData, setUploadedSocialMediaData, generateBeerDefaults, selectBeerDefaultsPerLetter, selectPersonsName, selectIsChallangeMode, selectIsChallengeModeExplainerDisplayed, setIsChallengeModeExplainerDisplayed, setIsChallengeMode, incrementChallengeModeSpinCount, selectChallengeModeSpinCount, selectVenueName, setBeerLetters, selectAreBeersSpinning, setBeersSpinning } from '@/lib/redux';
import { Box, Button, ButtonGroup, Container, Flex, Heading, IconButton, Show, Text, useDisclosure, useMediaQuery } from '@chakra-ui/react';
import { getSocialMediaShareUrl } from '@/lib/utils/utils';
import html2canvas from 'html2canvas';
import { ChallangeModeExplainerModal } from './components/ChallangeModeExplainerModal';
import { BeerSlotMachine } from './components/SlotMachine';
import { PhoneRotationSuggestion } from './components/PhoneRotationSuggestion';


const MAX_CHALLANEGE_MODE_SPINS = 3


export const Beers = ({ venueName }) => {
    const dispatch = useDispatch();

    const beerDefaultsPerLetter = useSelector(selectBeerDefaultsPerLetter)
    useEffect(() => {
        if (Object.keys(beerDefaultsPerLetter).length === 0) {
            dispatch(generateBeerDefaults(venueName))
        }
    }, [dispatch, beerDefaultsPerLetter, venueName])

    const [isLandscapePhone] = useMediaQuery('(max-height: 450px)')

    // CHRIS: TODO move this into redux?
    const [showDefaultBeer, setShowDefaultBeers] = useState(false)

    // CHRIS: Possibly should add an ignore flag in useEffects above too?
    useEffect(() => {
        let ignore = false;
        if (!ignore) {
            setShowDefaultBeers(true)
            dispatch(setBeersSpinning(true))
        }
        return () => ignore = true
    }, [dispatch, setShowDefaultBeers]);

    const generatedPicRef = useRef(null)

    const spinUnlockedBeers = () => {
        dispatch(setBeersSpinning(true))
        dispatch(incrementChallengeModeSpinCount())
    }

    const onChallengeModePressed = () => {
        dispatch(setIsChallengeModeExplainerDisplayed(true))
    }

    const onOptIntoChallengeMode = () => {
        setShowDefaultBeers(false)
        spinUnlockedBeers()
    }

    const shareButtons = (
        <ShareButtons generatedPicRef={generatedPicRef} />
    )

    return (
       // RHYS: I set font weight (500) here for the body text like BrewDog - probably easier way of doing it globally?
        <Container maxW='4xl' padding={0} fontWeight={500}>
            <BeersHeader
                onSpinUnlockedBeersPressed={spinUnlockedBeers}
                onChallengeModePressed={onChallengeModePressed}
                shareButtons={isLandscapePhone && shareButtons} />
            <BeerLetters
                showDefaultBeer={showDefaultBeer}
                generatedPicRef={generatedPicRef} />
            <ChallengeModeModal
                onOptIntoChallengeMode={onOptIntoChallengeMode} />
            <BeerModal />
            <ShareModal />
            <Box float='right'>
                {!isLandscapePhone && shareButtons}
            </Box>
            <Show below='sm'>
                <Flex width='100%' justifyContent='center'>
                    <PhoneRotationSuggestion text={'Rotate phone for easier use'} />
                </Flex>
            </Show>
        </Container>
    )
}

const BeersHeader = ({ onSpinUnlockedBeersPressed, onChallengeModePressed, shareButtons }) => {
    const areBeersSpinning = useSelector(selectAreBeersSpinning)
    const isChallengeMode = useSelector(selectIsChallangeMode);
    const challengeModeSpinCount = useSelector(selectChallengeModeSpinCount)

    let headerContent = null;

    if (isChallengeMode) {
        const maxSpinsReached = challengeModeSpinCount >= MAX_CHALLANEGE_MODE_SPINS
        headerContent = (
            <Button
                width='sm'
                variant='primary'
                background='black'
                onClick={onSpinUnlockedBeersPressed}
                isLoading={areBeersSpinning}
                isDisabled={maxSpinsReached}
            >
                {maxSpinsReached ? 'No more spins. Drink up!' : 'Spin unlocked beers'}
            </Button>
        )
    } else {
        /* <Text as="span" whiteSpace='nowrap'>
        Tap the suggested beers to choose your own.
        </Text>*/
        headerContent = (
            <Heading as='h5' size='sm' textAlign='center'>
                <Flex justifyContent='center' flexDirection='column'>
                    <Text as="span" mt='1' whiteSpace='nowrap'>
                        <Text as="span" _after={{content: '" "'}}>
                            Feeling frisky? Try the
                        </Text>
                        <Button onClick={onChallengeModePressed} variant='link' textDecoration='underline'>Beer Spin Challenge</Button>
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
const BeerLetters = ({ generatedPicRef, showDefaultBeer }) => {
    const dispatch = useDispatch();

    const areBeersSpinning = useSelector(selectAreBeersSpinning)
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
//            textShadow='1px 2px 0px rgba(0,0,0,0.4)'   
//            textShadow='2px 2px 1px rgba(0,0,0,0.4),0px 4px 6px rgba(0,0,0,0.1),0px 9px 12px rgba(0,0,0,0.1)'
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

            const maxSpinsReached = challengeModeSpinCount >= MAX_CHALLANEGE_MODE_SPINS
            const lockButtonText = lockedBeerIdxs[idx] ? 'Unlock' : 'Lock Beer'
            lockButtons.push(
                <Button
                    variant='primary'
                    width={letterImageSize}
                    size='sm'
                    mx='5'
                    key={`beer-letter-lock-${idx}`}
                    onClick={() => dispatch(toggleLockedBeerLetterIdx(idx))}
                    isDisabled={maxSpinsReached || areBeersSpinning}
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
            ...(beerDefaultsPerLetter[letter.toLowerCase()] || []).filter((beerDefault) => (
                beerDefault.beer.beer_name !== beer?.beer_name && beerDefault.beer.brewer_name !== beer?.brewer_name
            ))
        ]

        if(!showDefaultBeer && Object.keys(beers[0]).length === 0) {
            beers.shift()
        }

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
            dispatch(setBeersSpinning(false))
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
                            spin={areBeersSpinning}
                            spinMode={isChallengeMode ? 'individual' : 'all'}
                            randomize={isChallengeMode}
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

const ChallengeModeModal = ({onOptIntoChallengeMode}) => {
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
        onOptIntoChallengeMode()
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
            dispatch(setBeerSearchResults(beerDefaultsPerLetter[letter]))
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
            dispatch(setBeerSearchResults(beerDefaultsPerLetter[letter]))
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
