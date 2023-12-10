import { useEffect, useState } from "react";
import { Box, Flex, Image, keyframes } from "@chakra-ui/react";

export const Slots = ({ slotReelsOptions, lockedSlotIndexes, spin, onSpinningFinished, onBeerClicked, letterImageSize, specialCharacterSize }) => {

    useEffect(() => {
        if (spin) {
            roll()
        }
    }, [spin]) // eslint-disable-line react-hooks/exhaustive-deps

    const [spinningReels, setSpinningReels] = useState([])

    const roll = () => {
        const spinOutcomes = slotReelsOptions.map(({ beers }) => beers[0])
        const reelsToSpin = slotReelsOptions.reduce((reelsToSpin, { isSpecialCharacter }, idx) => {
            if (!lockedSlotIndexes[idx] && !isSpecialCharacter) {
                reelsToSpin.push(idx)
            }
            return reelsToSpin
        }, [])
        setSpinningReels(reelsToSpin)

        reelsToSpin.forEach((reelIdxToSpin) => {
            const randomOption = Math.floor(
                Math.random() * slotReelsOptions[reelIdxToSpin].beers.length
            );
            spinOutcomes[reelIdxToSpin] = slotReelsOptions[reelIdxToSpin].beers[randomOption];
        });

        setTimeout(() => {
            const intervalId = setInterval(() => {
                const idx = reelsToSpin.shift()
                
                if (reelsToSpin.length > 0) {
                    setSpinningReels(reelsToSpin)
                    onSpinningFinished({
                        allDone: false,
                        beers: spinOutcomes,
                        idx,
                    })
                }
                else {
                    clearInterval(intervalId)
                    onSpinningFinished({
                        allDone: true,
                        beers: spinOutcomes,
                    })
                }
            }, 500)
        }, 1500);
    };

    const generateAnimationProperty = (idx) => {
        if (!spin || !spinningReels.includes(idx)) {
            return ''
        }

        const minY = (slotReelsOptions[idx].beers.length) * 102       
        const duration = (slotReelsOptions[idx].beers.length) * 0.1
        
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
            {slotReelsOptions.map(({ beers, isSpecialCharacter }, idx) => {
                const size = isSpecialCharacter ? specialCharacterSize : letterImageSize
                return (
                    <Flex key={`slot-reel-${idx}`} flexDirection='column' width={size} textAlign='center' onClick={() => onBeerClicked(idx)}>
                        <Box height={size} overflow='hidden'>
                            <Box animation={generateAnimationProperty(idx)}>
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
            my='2px'
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
