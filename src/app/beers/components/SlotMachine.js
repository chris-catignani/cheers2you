import { useEffect, useRef, useState } from "react";
import { Box, Flex, Image } from "@chakra-ui/react";

export const Slots = ({ slotReelsOptions, slotItemSize, lockedSlotIndexes, spin, onSpinningFinished, onBeerClicked }) => {
    const slotRefs = []
    const rollStates = []
    slotReelsOptions.forEach(({ beers }) => {
        slotRefs.push(useRef(null))

        const [roll, setRoll] = useState(beers[0]);
        rollStates.push({roll, setRoll})
    })

    useEffect(() => {
        if (spin) {
            roll()
        }
    }, [spin])

    // to trigger roolling and maintain state
    const roll = () => {
        setTimeout(() => {
            const curBeers = rollStates.map(({roll}) => roll)
            onSpinningFinished(curBeers)
        }, 700);

        // looping through all slots to start rolling
        slotRefs.forEach((slotRef, idx) => {
            if (lockedSlotIndexes[idx] || slotReelsOptions[idx].isSpecialCharacter) {
                return
            }

            // this will trigger rolling effect
            const selected = triggerSlotRotation(slotRef.current, idx);
            rollStates[idx].setRoll(selected)
            rollStates[idx].roll = selected
        });
    };

    // this will create a rolling effect and return random selected option
    const triggerSlotRotation = (ref, idx) => {
        function setTop(top) {
            ref.style.top = `${top}px`;
        }
        let options = ref.children;
        let randomOption = Math.floor(
            Math.random() * slotReelsOptions[idx].beers.length
        );
        let choosenOption = options[randomOption];
        setTop(-choosenOption.offsetTop + 2);
        return slotReelsOptions[idx].beers[randomOption];
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
            <Image key={`slot-reel-${idx}-option-${idx}`} src={beer.beer_label_file} alt={beer.beer_name + ' ' + beer.beer_type} boxSize={slotItemSize} fit='contain' />
        ))
    }

    return (
        <Flex justifyContent='safe center' gap='10' overflowX='auto'>
            {slotReelsOptions.map(({ beers, isSpecialCharacter }, idx) => {
                const width = isSpecialCharacter ? '25px' : slotItemSize
                return (
                    <Box key={`slot-reel-${idx}`}>
                        <Flex flexDirection='column' textAlign='center' key={`beer-letter-${idx}`} onClick={() => onBeerClicked(idx)}>
                            <Box width={width}>
                                <Box height={slotItemSize} width={width} position='relative' overflow='hidden'>
                                    <Box position='absolute' overflow='hidden' height={slotItemSize} width={width}>
                                        <Box position='absolute' transition='top ease-in-out 0.5s' ref={slotRefs[idx]}>
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
