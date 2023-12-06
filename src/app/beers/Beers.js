'use client'

import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useRef, useState } from 'react';
import { DownloadIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { Letter } from './components/Letter';
import { SocialShareModal } from './components/SocialShareModal';
import { BeerModalContent, SelectBeerModal } from './components/SelectBeerModal';
import { downloadImage, searchForBeer, selectBeerLetters, selectBeerOptionsAtIdx, selectBeerSearchResults, selectDownloadGeneratedImageStatus, selectLockedBeerLetterIdxs, selectOpenBeerIdx, setBeerLetterAtIndex, setBeerSearchResults, setOpenBeerIdx, toggleLockedBeerLetterIdx, generateBeerBanner, uploadSocialMedia, selectUploadSocialMediaStatus, selectUploadedSocialMediaData, setUploadedSocialMediaData, generateBeerDefaults, selectBeerDefaultsPerLetter, selectPersonsName, selectIsChallangeMode, selectIsChallengeModeExplainerDisplayed, setIsChallengeModeExplainerDisplayed, setIsChallengeMode, incrementChallengeModeSpinCount, selectChallengeModeSpinCount } from '@/lib/redux';
import { Box, Button, ButtonGroup, Center, Container, Flex, Heading, IconButton, Text, useDisclosure, useMediaQuery } from '@chakra-ui/react';
import { isAtoZ, getSocialMediaShareUrl, wrapIndex } from '@/lib/utils/utils';
import html2canvas from 'html2canvas';
import { ChallangeModeExplainerModal } from './components/ChallangeModeExplainerModal';


export const Beers = ({personsName, venueName}) => {
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
            dispatch(generateBeerBanner({personsName}))
        }
    }, [dispatch, storedPersonsName, personsName])

    const [{animateRunCount, maxAnimateRunCountPerIdx}, setAnimationProps] = useState({animateRunCount: -1, maxAnimateRunCountPerIdx: []})
    const [isLandscapePhone] = useMediaQuery('(max-height: 450px)')
    const lockedBeerIdxs = useSelector(selectLockedBeerLetterIdxs);

    const generatedPicRef = useRef(null)

    const spinUnlockedBeersPressed = () => {
        dispatch(incrementChallengeModeSpinCount())
        dispatch(generateBeerBanner({personsName, freshBanner: false}))

        let maxAnimateRunCount = 8
        let maxAnimateRunCountPerIdx = []
        for(let i = 0; i < personsName.length; i++) {
            if (lockedBeerIdxs[i] || !isAtoZ(personsName[i])) {
                maxAnimateRunCountPerIdx.push(-1)
            } else {
                maxAnimateRunCount += 4
                maxAnimateRunCountPerIdx.push(maxAnimateRunCount)
            }
        }

        let animateRunCount = 0
        setAnimationProps({animateRunCount, maxAnimateRunCountPerIdx})
        
        const intervalId = setInterval(() => {
            animateRunCount += 1
            if(animateRunCount > maxAnimateRunCount) {
                clearInterval(intervalId)
                setAnimationProps({
                    animateRunCount: -1,
                    maxAnimateRunCountPerIdx: []
                })
            } else {
                setAnimationProps({animateRunCount, maxAnimateRunCountPerIdx})
            }
        }, 100);
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
                isLoading={animateRunCount !== -1} />
            <BeerLetters
                animateRunCount={animateRunCount}
                maxAnimateRunCountPerIdx={maxAnimateRunCountPerIdx}
                generatedPicRef={generatedPicRef}/>
            <ChallengeModeModal />
            <BeerModal />
            <ShareModal />
            <Box marginTop='5' float='right' {...landscapePhoneShareButtonProps}>
                <ShareButtons generatedPicRef={generatedPicRef} />
            </Box>
        </Container>
    )
}

const BeersHeader = ({onSpinUnlockedBeersPressed, onChallengeModePressed, isLoading}) => {
    const isChallengeMode = useSelector(selectIsChallangeMode);
    const challengeModeSpinCount = useSelector(selectChallengeModeSpinCount)
    
    if(isChallengeMode) {
        const maxSpinsReached = challengeModeSpinCount >= 3
        return (
            <Container maxW='md' padding={0}>
                <Button
                    width='full'
                    onClick={onSpinUnlockedBeersPressed}
                    isLoading={isLoading}
                    isDisabled={maxSpinsReached}
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
                        <Text as="span" whiteSpace='nowrap' _after={{content: '"\\00a0"'}}>
                            Tap the suggested beers to choose your own.
                        </Text>
                        <Text as="span" whiteSpace='nowrap'>
                            <Text as="span" _after={{content: '" "'}}>
                                Feeling Frisky? Try the
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
const BeerLetters = ({animateRunCount, maxAnimateRunCountPerIdx, generatedPicRef}) => {
    const dispatch = useDispatch();

    const isChallengeMode = useSelector(selectIsChallangeMode);
    const beerLetters = useSelector(selectBeerLetters);
    const beerOptionsAtIdx = useSelector(selectBeerOptionsAtIdx);
    const lockedBeerIdxs = useSelector(selectLockedBeerLetterIdxs);

    const letters = []
    const letterEdits = []

    const beerClicked = (idx) => {
        if (!isChallengeMode) {
            dispatch(setOpenBeerIdx(idx))
        }
    }

    beerLetters.forEach( ({letter, beer, userGeneratedBeer, isSpecialCharacter}, idx) => {
        let beerToShow = beer || userGeneratedBeer
        if(animateRunCount !== -1 && animateRunCount < maxAnimateRunCountPerIdx[idx] && !isSpecialCharacter) {
            const animateIdx = wrapIndex(0, beerOptionsAtIdx[idx].length, animateRunCount)
            beerToShow = beerOptionsAtIdx[idx][animateIdx]
        }

        if (isSpecialCharacter) {
            letters.push(
                <Heading as='h5' size='sm' width='20px' textAlign='center' textTransform='uppercase' key={`beer-letter-${idx}`}>{letter}</Heading>
            )
            letterEdits.push(
                <Box width='20px' key={`beer-letter-edit-${idx}`}></Box>
            )
        } else {
            letters.push(
                <Flex flexDirection='column' textAlign='center' key={`beer-letter-${idx}`}>
                    <Heading as='h5' size='sm' mb='5' textTransform='uppercase'>{letter}</Heading>
                    <Letter beer={beerToShow} width='100px' onClick={() => beerClicked(idx)}/>
                </Flex>
            )
            const lockButtonText = lockedBeerIdxs[idx] ? 'Unlock Beer' : 'Lock Beer'
            letterEdits.push(
                <Button
                    width='100px'
                    marginBottom='1'
                    key={`beer-letter-lock-${idx}`}
                    onClick={() => dispatch(toggleLockedBeerLetterIdx(idx))}
                >
                    {lockButtonText}
                </Button>
            )
        }
    })

    return (
        <Flex overflowX='auto' flexDirection='column' flexWrap='wrap' marginBottom='2'>
            {/* marginTop defined below so screen looks nice */}
            <Box marginTop='5' ref={generatedPicRef}>
                <Flex justifyContent='safe center' gap='10'>
                    {letters}
                </Flex>
            </Box>
            <Flex justifyContent='safe center' gap='10'>
                {isChallengeMode && letterEdits}
            </Flex>
        </Flex>
    )
}

const ShareButtons = ({generatedPicRef}) => {
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
            proxy: '/beers/api',
        })
        dispatch(downloadImage(canvasPromise))
    }

    const uploadOutput = async () => {
        const node = generatedPicRef.current;
        const canvasPromise = html2canvas(node, {
            backgroundColor: 'white',
            width: node.scrollWidth,
            height: node.scrollHeight,
            proxy: '/beers/api'
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
                icon={<ExternalLinkIcon />}/>
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
        if (Object.keys(uploadedSocialMediaData).length === 0) {return}
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

    const beerLetters = useSelector(selectBeerLetters);
    const openBeerIdx = useSelector(selectOpenBeerIdx);
    const beerSearchResults = useSelector(selectBeerSearchResults);
    const beerDefaultsPerLetter = useSelector(selectBeerDefaultsPerLetter);

    const clearDataOnClose = () => {
        dispatch(setOpenBeerIdx(-1));
        dispatch(setBeerSearchResults([]))
        onClose()
    }

    const onBeerSelected = ({beer, userGeneratedBeer}) => {
        dispatch(setBeerLetterAtIndex({
            idx: openBeerIdx,
            beer,
            userGeneratedBeer,
        }))
        clearDataOnClose()
    }

    const onChangeBeerSearchQuery = (bearSearchQuery) => {
        dispatch(searchForBeer(bearSearchQuery))
    }

    const letter = openBeerIdx !== -1 ? beerLetters[openBeerIdx]['letter'] : ''

    // Open the Modal if we have an openBeerIndex
    useEffect(() => {
        if (openBeerIdx !== -1) {
            dispatch(setBeerSearchResults(beerDefaultsPerLetter[letter.toLowerCase()]))
            onOpen()
        }
    }, [openBeerIdx, onOpen, letter, beerDefaultsPerLetter, dispatch])

    return (
        <SelectBeerModal 
            isOpen={isOpen}
            onClose={clearDataOnClose}
            header={`Pick Your Beer For "${letter.toUpperCase()}"`}
        >
            <BeerModalContent
                onBeerSelected={onBeerSelected}
                onChangeBeerSearchQuery={onChangeBeerSearchQuery}
                beerSearchResults={beerSearchResults}
            />
        </SelectBeerModal>
    )
}
