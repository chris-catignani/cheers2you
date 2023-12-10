import { useEffect, useRef, useState } from "react";
import { Box, Flex, Image, keyframes } from "@chakra-ui/react";

export const Slots = ({ slotReelsOptions, lockedSlotIndexes, spin, onSpinningFinished, onBeerClicked, letterImageSize, specialCharacterSize }) => {
    const slotRefs = []
    const rollStates = []
    slotReelsOptions.forEach(({ beers }) => {
        slotRefs.push(useRef(null)) // eslint-disable-line

        const [roll, setRoll] = useState(beers[0]); // eslint-disable-line
        rollStates.push({roll, setRoll})
    })

    /*
    TODOs:
    - reels should stop left to right
    - Possibly can remove slotrefs array?
    */
    
    useEffect(() => {
        if (spin) {
            roll()
        }
    }, [spin]) // eslint-disable-line react-hooks/exhaustive-deps

    const roll = () => {
        setTimeout(() => {
            const curBeers = rollStates.map(({roll}) => roll)
            onSpinningFinished(curBeers)
        }, 2000);

        slotRefs.forEach((slotRef, idx) => {
            if (lockedSlotIndexes[idx] || slotReelsOptions[idx].isSpecialCharacter) {
                return
            }

            const randomOption = Math.floor(
                Math.random() * slotReelsOptions[idx].beers.length
            );
            const selected = slotReelsOptions[idx].beers[randomOption];
            rollStates[idx].setRoll(selected)
            rollStates[idx].roll = selected
        });
    };

    const BeerDetails = ({beer}) => {
        return (
            <Box>
                <Box minH='3em'>{!spin && beer?.brewer_name}</Box>
                <Box minH='5em'>{!spin && beer?.beer_name}</Box>
            </Box>
        )
    }

    const BeerImages = ({beers, size}) => {
        const buildImage = (beer, idx) => (
            <Image
                key={`slot-reel-${idx}-option-${idx}`}
                src={beer.beer_label_file}
                alt={beer.beer_name + ' ' + beer.beer_type}
                boxSize={size}
                my='2px'
                fit='contain' />
        )

        const beerImages = beers.map((beer, idx) => {
            return buildImage(beer, idx)
        })

        // add the first beer to the end of the list, this helps smooth out the animations
        // when it loops from the end back to the start
        if (beers.length > 1) {
            beerImages.push(buildImage(beers[0], beers.length))
        }

        return beerImages
    }

    const generateAnimationProperty = (idx) => {
        if (!spin || lockedSlotIndexes[idx]) {
            return ''
        }

        const minY = (slotReelsOptions[idx].beers.length - 1) * 102       
        const duration = (slotReelsOptions[idx].beers.length - 1) * 0.1
        
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
                            <Box ref={slotRefs[idx]} animation={generateAnimationProperty(idx)}>
                                <BeerImages beers={beers} size={size} />
                            </Box>
                        </Box>
                        <BeerDetails beer={beers?.[0]} />
                    </Flex>
                )
            })}
        </Flex>
    );
}
