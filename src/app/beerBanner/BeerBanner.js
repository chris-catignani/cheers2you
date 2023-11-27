'use client'

import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useRef, useState } from 'react';
import { toJpeg } from 'html-to-image';
import { DownloadIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { EventInput } from './components/EventInput'
import { Letter } from './components/Letter';
import { SocialShareModal } from './components/SocialShareModal';
import { BeerModalContent, SelectBeerModal } from './components/SelectBeerModal';
import { downloadImage, searchForBeer, selectEventName, selectBeerLetters, selectBeerOptionsAtIdx, selectBeerSearchResults, selectDownloadGeneratedImageStatus, selectLockedBeerLetterIdxs, selectOpenBeerIdx, selectPersonsName, selectUploadGeneratedImageStatus, selectUploadedImageData, setBeerLetterAtIndex, setBeerSearchResults, setOpenBeerIdx, setsUploadedImageData, toggleLockedBeerLetterIdx, uploadImage, generateBeerBanner } from '@/lib/redux';
import { Box, Button, ButtonGroup, Flex, Heading, IconButton, useDisclosure } from '@chakra-ui/react';
import { isAtoZ, wrapIndex } from '@/lib/utils/utils';


export const BeerBanner = () => {
    const dispatch = useDispatch();

    const eventName = useSelector(selectEventName);
    const personsName = useSelector(selectPersonsName);
    const lockedBeerIdxs = useSelector(selectLockedBeerLetterIdxs);
    const downloadGeneratedImageStatus = useSelector(selectDownloadGeneratedImageStatus);
    const uploadGeneratedImageStatus = useSelector(selectUploadGeneratedImageStatus)

    const [{animateRunCount, maxAnimateRunCountPerIdx}, setAnimationProps] = useState({animateRunCount: -1, maxAnimateRunCountPerIdx: []})

    const generatedPicRef = useRef(null)

    const generatePressed = (personsName, eventName) => {
        dispatch(generateBeerBanner(personsName, eventName))

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
        dispatch(uploadImage(dataUrlPromise))
    }

    return (
        <Box>
            <EventInput
                personsName={personsName}
                eventName={eventName}
                isGenerating={animateRunCount !== -1}
                onClick={generatePressed}
            />
            <Flex overflowX='auto' flexDirection='column' flexWrap='wrap'>
                <Box ref={generatedPicRef}>
                    <Heading as='h3' size='lg' textAlign='center'>{eventName}</Heading>
                    <BeerLetters animateRunCount={animateRunCount} maxAnimateRunCountPerIdx={maxAnimateRunCountPerIdx}/>
                </Box>
            </Flex>
            <BeerModal />
            <ShareModal />
            <ButtonGroup float={'right'}>
                <IconButton
                    isLoading={uploadGeneratedImageStatus === 'uploading'}
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

export const BeerLetters = ({animateRunCount, maxAnimateRunCountPerIdx}) => {
    const dispatch = useDispatch();

    const beerLetters = useSelector(selectBeerLetters);
    const beerOptionsAtIdx = useSelector(selectBeerOptionsAtIdx);
    const lockedBeerIdxs = useSelector(selectLockedBeerLetterIdxs);

    const letters = beerLetters.map( ({letter, beer, userGeneratedBeer, isSpecialCharacter}, idx) => {
        let beerToShow = beer || userGeneratedBeer
        if(animateRunCount !== -1 && animateRunCount < maxAnimateRunCountPerIdx[idx] && !isSpecialCharacter) {
            const animateIdx = wrapIndex(0, beerOptionsAtIdx[idx].length, animateRunCount)
            beerToShow = beerOptionsAtIdx[idx][animateIdx]
        }
        return (
            <Flex flexDirection='column' textAlign='center' key={`beer-letter-${idx}`}>
                <Heading as='h5' size='sm' mb='5' textTransform='uppercase'>{letter}</Heading>
                {!isSpecialCharacter &&
                    <>
                        <Letter 
                            beer={beerToShow}
                            onClick={() => dispatch(setOpenBeerIdx(idx)) } >
                        </Letter>
                        <Button mt='auto' onClick={() => dispatch(toggleLockedBeerLetterIdx(idx))}>
                            {lockedBeerIdxs[idx] ? 'Unlock beer' : 'Lock beer'}
                        </Button>
                    </>
                }
            </Flex>
        )
    })
    return (
        <Flex justifyContent='safe center' gap='10' p='5'>
            {letters}
        </Flex>
    )
}

export const ShareModal = () => {
    const dispatch = useDispatch();
    const { isOpen, onOpen, onClose } = useDisclosure()

    const eventName = useSelector(selectEventName);
    const uploadedImageData = useSelector(selectUploadedImageData)
    const shareUrl = 'https://chris-catignani.github.io/cheers-to-you/#/shared/' + uploadedImageData['appId'] + '/' + uploadedImageData['fileId']

    // Open the Modal if we have uploaded the image data
    useEffect(() => {
        if (Object.keys(uploadedImageData).length === 0) {return}
        onOpen()
    }, [uploadedImageData, onOpen])

    const clearDataOnClose = () => {
        dispatch(setsUploadedImageData({}))
        onClose()
    }
    
    return (
        <SocialShareModal 
            isOpen={isOpen}
            onClose={clearDataOnClose}
            shareUrl={shareUrl}
            eventName={eventName}
        />
    )
}

export const BeerModal = () => {
    const dispatch = useDispatch();
    const { isOpen, onOpen, onClose } = useDisclosure()

    const beerLetters = useSelector(selectBeerLetters);
    const openBeerIdx = useSelector(selectOpenBeerIdx);
    const beerSearchResults = useSelector(selectBeerSearchResults);

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

    // Open the Modal if we have an openBeerIndex
    useEffect(() => {
        if (openBeerIdx !== -1) {
            onOpen()
        }
    }, [openBeerIdx, onOpen])

    const letter = openBeerIdx !== -1 ? beerLetters[openBeerIdx]['letter'] : ''

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
