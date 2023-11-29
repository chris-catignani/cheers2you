'use client'

import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useRef, useState } from 'react';
import { toJpeg } from 'html-to-image';
import { DownloadIcon, EditIcon, ExternalLinkIcon, LockIcon, UnlockIcon } from '@chakra-ui/icons';
import { Letter } from './components/Letter';
import { SocialShareModal } from './components/SocialShareModal';
import { BeerModalContent, SelectBeerModal } from './components/SelectBeerModal';
import { downloadImage, searchForBeer, selectBeerLetters, selectBeerOptionsAtIdx, selectBeerSearchResults, selectDownloadGeneratedImageStatus, selectLockedBeerLetterIdxs, selectOpenBeerIdx, setBeerLetterAtIndex, setBeerSearchResults, setOpenBeerIdx, toggleLockedBeerLetterIdx, generateBeerBanner, uploadSocialMedia, selectUploadSocialMediaStatus, selectUploadedSocialMediaData, setUploadedSocialMediaData, generateBeerDefaults, selectBeerDefaultsPerLetter } from '@/lib/redux';
import { Box, Button, ButtonGroup, Container, Flex, Heading, IconButton, useDisclosure } from '@chakra-ui/react';
import { isAtoZ, getSocialMediaShareUrl, wrapIndex } from '@/lib/utils/utils';


export const Beers = ({personsName}) => {
    const dispatch = useDispatch();

    const beerDefaultsPerLetter = useSelector(selectBeerDefaultsPerLetter)
    useEffect(() => {
        if (Object.keys(beerDefaultsPerLetter).length === 0) {
            dispatch(generateBeerDefaults())
        }
    }, [dispatch, beerDefaultsPerLetter])
    useEffect(() => {
        dispatch(generateBeerBanner(personsName))
    }, [dispatch, personsName])

    const lockedBeerIdxs = useSelector(selectLockedBeerLetterIdxs);
    const downloadGeneratedImageStatus = useSelector(selectDownloadGeneratedImageStatus);
    const uploadSocialMediaStatus = useSelector(selectUploadSocialMediaStatus)

    const [{animateRunCount, maxAnimateRunCountPerIdx}, setAnimationProps] = useState({animateRunCount: -1, maxAnimateRunCountPerIdx: []})

    const generatedPicRef = useRef(null)

    const generatePressed = () => {
        dispatch(generateBeerBanner(personsName))

        let animateRunCount = 0
        let maxAnimateRunCount = 0
        let maxAnimateRunCountPerIdx = []
        for(let i = 0; i < personsName.length; i++) {
            if (lockedBeerIdxs[i] || !isAtoZ(personsName[i])) {
                maxAnimateRunCountPerIdx.push(-1)
            } else {
                maxAnimateRunCount += 4
                maxAnimateRunCountPerIdx.push(maxAnimateRunCount)
            }
        }

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
        }, 200);
    }

    const donwloadOutput = async (ref) => {
        const node = ref.current;
        const dataUrlPromise = toJpeg(node, { backgroundColor: 'white', cacheBust: true, width: node.scrollWidth, height: node.scrollHeight })
        dispatch(downloadImage(dataUrlPromise))
    }

    const uploadOutput = async (ref) => {
        const node = ref.current;
        const dataUrlPromise = toJpeg(node, { backgroundColor: 'white', cacheBust: true, width: node.scrollWidth, height: node.scrollHeight })
        dispatch(uploadSocialMedia({dataUrlPromise, personsName}))
    }

    return (
        <Box>
            <Container maxW='md'>
                <Button
                    width='full'
                    onClick={generatePressed}
                    isLoading={animateRunCount !== -1}
                >
                    Spin unlocked beers
                </Button>
            </Container>
            <Container maxW='max'>
                <Flex overflowX='auto' flexDirection='column' flexWrap='wrap'>
                    <BeerLetters
                        animateRunCount={animateRunCount}
                        maxAnimateRunCountPerIdx={maxAnimateRunCountPerIdx}
                        generatedPicRef={generatedPicRef}/>
                </Flex>
            </Container>
            <BeerModal />
            <ShareModal />
            <ButtonGroup float={'right'}>
                <IconButton
                    isLoading={uploadSocialMediaStatus === 'uploading'}
                    onClick={() => uploadOutput(generatedPicRef)} 
                    icon={<ExternalLinkIcon />}/>
                <IconButton
                    isLoading={downloadGeneratedImageStatus === 'downloading'}
                    onClick={() => donwloadOutput(generatedPicRef)}
                    icon={<DownloadIcon />} />
            </ButtonGroup>
        </Box>
    )
}

// TODO refactor this. Use a helper to do the layout stuff, pass in react components
export const BeerLetters = ({animateRunCount, maxAnimateRunCountPerIdx, generatedPicRef}) => {
    const dispatch = useDispatch();

    const beerLetters = useSelector(selectBeerLetters);
    const beerOptionsAtIdx = useSelector(selectBeerOptionsAtIdx);
    const lockedBeerIdxs = useSelector(selectLockedBeerLetterIdxs);

    const letters = []
    const letterEdits = []

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
                    <Letter beer={beerToShow} />
                </Flex>
            )
            const lockIcon = lockedBeerIdxs[idx] ? <UnlockIcon /> : <LockIcon />
            letterEdits.push(
                <ButtonGroup width='150px' justifyContent='center' key={`beer-letter-edit-${idx}`}>
                    <IconButton onClick={() => dispatch(setOpenBeerIdx(idx))} icon={<EditIcon />}/>
                    <IconButton onClick={() => dispatch(toggleLockedBeerLetterIdx(idx))} icon={lockIcon} />
                </ButtonGroup>
            )
        }

        return (
            <Flex flexDirection='column' textAlign='center' key={`beer-letter-${idx}`}>
                <Heading as='h5' size='sm' mb='5' textTransform='uppercase'>{letter}</Heading>
                <Letter 
                    beer={beerToShow}
                    onClick={() => dispatch(setOpenBeerIdx(idx)) } >
                </Letter>
            </Flex>
        )
    })

    return (
        <Box marginY='10'>
            <Box ref={generatedPicRef}>
                <Flex justifyContent='safe center' gap='10'>
                    {letters}
                </Flex>
            </Box>
            <Flex justifyContent='safe center' gap='10'>
                {letterEdits}
            </Flex>
        </Box>

    )
}

export const ShareModal = () => {
    const dispatch = useDispatch();
    const { isOpen, onOpen, onClose } = useDisclosure()

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
        />
    )
}

export const BeerModal = () => {
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
