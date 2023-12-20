import { useEffect, useState } from "react";
import { Box, Flex, Image, Text, keyframes } from "@chakra-ui/react";
import { Letter } from "./Letter";
import { getFallbackImageUrl } from "@/lib/utils/ui";

export const BeerSlotMachine = ({ beerOptionsPerReel, lockedReelIndexes, randomize, spin, spinMode, onSpinningFinished, onBeerClicked, letterImageSize, specialCharacterSize }) => {

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
                const beerIdx = randomize ? Math.floor(Math.random() * beers.length) : 0
                rollResults.push(beers[beerIdx])
                newSpinningReels.push(idx)
            }
            return [newSpinningReels, rollResults]
        }, [[], []])

        setSpinningReels(newSpinningReels)

        setTimeout(() => {
            if (spinMode === 'all') {
                setSpinningReels([])
                onSpinningFinished({
                    allDone: true,
                    beers: rollResults,
                })
                return
            }

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
        const duration = (beerOptionsPerReel[idx].beers.length) * 0.15 //0.1
        
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

    const BeerDescription = ({beer, letter, idx}) => {
        if (Object.keys(beer || {}).length !== 0) {
            return (
                <Letter beer={!spinningReels.includes(idx) && beer} />
            )
        } else {
            return (
                <Flex my='8' height='100%' alignItems='center'>
                    <Text>
                        Pick a beer for <Box as='span' color='orangered'>{letter}</Box>
                    </Text>
                </Flex>
            )
        }
    }

    return (
        <Flex justifyContent='safe center' overflowX='auto'>
            {beerOptionsPerReel.map(({ beers, letter, isSpecialCharacter }, idx) => {
                const size = isSpecialCharacter ? specialCharacterSize : letterImageSize
                return (
                    <Flex key={`slot-reel-${idx}`} mx='5' flexDirection='column' width={size} textAlign='center' cursor='pointer' onClick={() => onBeerClicked(idx)}>
                        <Box height={size} minHeight={size} overflow='hidden'>
                            <Box mt='-40px' animation={generateAnimationProperty(idx)}>
                                <BeerImages beers={beers} size={size} />
                            </Box>
                        </Box>
                        <BeerDescription beer={beers[0]} letter={letter} idx={idx} />
                    </Flex>
                )
            })}
        </Flex>
    );
}

const BeerImages = ({ beers, size }) => {
    const buildImage = ({beer}, idx) => (
        <Image
            key={`slot-reel-${idx}-option-${idx}`}
            src={beer?.beer_label_file}
            fallbackSrc={getFallbackImageUrl()}
            alt={beer ? `${beer.beer_name} ${beer.beer_type}` : 'choose your beer'}
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
