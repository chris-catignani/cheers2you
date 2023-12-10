import { useEffect, useRef, useState } from "react";
import { Box, Flex, Image, keyframes } from "@chakra-ui/react";

export const Slots = ({ slotReelsOptions, lockedSlotIndexes, spin, onSpinningFinished, onBeerClicked }) => {
    const slotRefs = []
    const rollStates = []
    slotReelsOptions.forEach(({ beers }) => {
        slotRefs.push(useRef(null))

        const [roll, setRoll] = useState(beers[0]);
        rollStates.push({roll, setRoll})
    })

    /*
    TODOs:
    - add first beer to end in this class not beers.json
    - make sure the 2 first beers in the list dont bias the randomization
    - reels should stop left to right
    - Possibly can remove slotrefs array?
    */

    useEffect(() => {
        if (spin) {
            roll()
        }
    }, [spin])

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
            <>
                <Box minH='3em'>{!spin && beer?.brewer_name}</Box>
                <Box minH='5em'>{!spin && beer?.beer_name}</Box>
            </>
        )
    }

    const BeerImages = ({beers}) => {
        return beers.map((beer, idx) => (
            <Image
                key={`slot-reel-${idx}-option-${idx}`}
                src={beer.beer_label_file}
                alt={beer.beer_name + ' ' + beer.beer_type}
                boxSize='100px'
                my='2px'
                fit='contain' />
        ))
    }

    const generateAnimationProperty = (idx) => {
        if (!spin) {
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
                const width = isSpecialCharacter ? '10px' : '100px'
                const height = '100px'
                return (
                    <Box key={`slot-reel-${idx}`}>
                        <Flex flexDirection='column' textAlign='center' key={`beer-letter-${idx}`} onClick={() => onBeerClicked(idx)}>
                            <Box width={width}>
                                <Box height={height} width={width} position='relative' overflow='hidden'>
                                    <Box position='relative' overflow='hidden' height={height} width={width}>
                                        <Box position='relative' ref={slotRefs[idx]} animation={generateAnimationProperty(idx)}>
                                            <BeerImages beers={beers} />
                                        </Box>
                                    </Box>
                                </Box>
                                <BeerDetails beer={beers?.[0]} />
                            </Box>
                        </Flex>
                    </Box>
                )
            })}
        </Flex>
    );
}
