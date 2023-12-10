import { useEffect, useState } from "react";
import { Box, Flex, Image, keyframes } from "@chakra-ui/react";

export const BeerSlotMachine = ({ beerOptionsPerReel, lockedReelIndexes, spin, onSpinningFinished, onBeerClicked, letterImageSize, specialCharacterSize }) => {

    useEffect(() => {
        if (spin) {
            roll()
        }
    }, [spin]) // eslint-disable-line react-hooks/exhaustive-deps

    const [spinningReels, setSpinningReels] = useState([])

    const roll = () => {
        const [newSpinningReels, rollResults] = beerOptionsPerReel.reduce(([newSpinningReels, rollResults], { beers, isSpecialCharacter }, idx) => {
            if (lockedReelIndexes[idx] || isSpecialCharacter) {
                rollResults.push(beers[0])
            } else {
                const randomOption = Math.floor(Math.random() * beers.length);
                rollResults.push(beers[randomOption])
                newSpinningReels.push(idx)
            }
            return [newSpinningReels, rollResults]
        }, [[], []])

        setSpinningReels(newSpinningReels)

        setTimeout(() => {
            const intervalId = setInterval(() => {
                const idx = newSpinningReels.shift()
                setSpinningReels(newSpinningReels)
                
                if (newSpinningReels.length > 0) {
                    onSpinningFinished({
                        allDone: false,
                        beers: rollResults,
                        idx,
                    })
                }
                else {
                    clearInterval(intervalId)
                    onSpinningFinished({
                        allDone: true,
                        beers: rollResults,
                    })
                }
            }, 500)
        }, 1500);
    };

    const generateAnimationProperty = (idx) => {
        if (!spin || !spinningReels.includes(idx)) {
            return ''
        }

        const minY = (beerOptionsPerReel[idx].beers.length) * 140
        const duration = (beerOptionsPerReel[idx].beers.length) * 0.1
        
        const slotLoop = keyframes({
            '0%': {
                transform: `translateY(-${minY}px)`,
            },
            '100%': {
                transform: 'translateY(0%)',
            },
        })
        return `${slotLoop} ${duration}s linear infinite`
    }

    return (
        <Flex justifyContent='safe center' gap='10' overflowX='auto'>
            {beerOptionsPerReel.map(({ beers, isSpecialCharacter }, idx) => {
                const size = isSpecialCharacter ? specialCharacterSize : letterImageSize
                return (
                    <Flex key={`slot-reel-${idx}`} flexDirection='column' width={size} textAlign='center' onClick={() => onBeerClicked(idx)}>
                        <Box height={size} overflow='hidden'>
                            <Box mt='-40px' animation={generateAnimationProperty(idx)}>
                                <BeerImages beers={beers} size={size} />
                            </Box>
                        </Box>
                        <BeerDetails beer={beers?.[0]} hide={spinningReels.includes(idx)}/>
                    </Flex>
                )
            })}
        </Flex>
    );
}

const BeerImages = ({ beers, size }) => {
    const buildImage = (beer, idx) => (
        <Image
            key={`slot-reel-${idx}-option-${idx}`}
            src={beer.beer_label_file}
            alt={beer.beer_name + ' ' + beer.beer_type}
            boxSize={size}
            my='40px'
            fit='contain' />
    )

    const beerImages = beers.map((beer, idx) => buildImage(beer, idx))

    // add the first beer to the end of the list, this helps smooth out the animations
    // when it loops from the end back to the start
    if (beers.length > 1) {
        beerImages.push(buildImage(beers[0], beers.length))
    }

    return beerImages
}

const BeerDetails = ({ beer, hide }) => {
    return (
        <Box>
            <Box minH='3em'>{!hide && beer?.brewer_name}</Box>
            <Box minH='5em'>{!hide && beer?.beer_name}</Box>
        </Box>
    )
}
