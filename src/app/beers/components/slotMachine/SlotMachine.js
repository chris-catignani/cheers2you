import { useRef, useState } from "react";
import { Box, Flex, Image, Text } from "@chakra-ui/react";

import './SlotMachine.css'

export const Slots = ({slotReelsOptions, slotItemSize}) => {

    const slotRefs = []
    const rollStates = []
    slotReelsOptions.forEach( (slotReelOptions) => {
        slotRefs.push(useRef(null))

        const [roll, setRoll] = useState(slotReelOptions[0]);
        rollStates.push(setRoll)
    })

    const [rolling, setRolling] = useState(false);

    // to trigger roolling and maintain state
    const roll = () => {
        setRolling(true);
        setTimeout(() => {
            setRolling(false);
        }, 700);

        // looping through all slots to start rolling
        slotRefs.forEach((slotRef, idx) => {
            // this will trigger rolling effect
            const selected = triggerSlotRotation(slotRef.current, idx);
            rollStates[idx](selected)
        });
    };

    // this will create a rolling effect and return random selected option
    const triggerSlotRotation = (ref, idx) => {
        function setTop(top) {
            ref.style.top = `${top}px`;
        }
        let options = ref.children;
        let randomOption = Math.floor(
            Math.random() * slotReelsOptions[idx].length
        );
        let choosenOption = options[randomOption];
        setTop(-choosenOption.offsetTop + 2);
        return slotReelsOptions[idx][randomOption];
    };

    // TODO can i get rid of any of these tags?

    return (
        <>
        <Flex justifyContent='safe center' gap='10'>
            {slotReelsOptions.map((slotReelOptions, idx) => (
                <Box>
                    <div className="slot" key={`slot-reel-${idx}`}>
                        <section className="slotSection">
                            <div className="container" ref={slotRefs[idx]}>
                                {slotReelOptions.map((beer, idx) => (
                                    <div key={`slot-reel-${idx}-option-${idx}`}>
                                        <span>
                                            <Image src={beer.beer_label_file} alt={beer.beer_name + ' ' + beer.beer_type} boxSize={slotItemSize} fit='contain' />
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                    <Box>{slotReelOptions?.[0]?.brewer_name}</Box>
                    <Box minH='5em'>{slotReelOptions?.[0]?.beer_name}</Box>
                </Box>
            ))}
        </Flex>
        <div
            onClick={() => {!rolling && roll()}}
            disabled={rolling}>
            {rolling ? "Rolling..." : "ROLL"}
        </div>
        </>
    );
}
