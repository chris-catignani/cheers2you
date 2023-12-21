import { useState } from "react";
import { Camera } from "./Camera";
import { Button, Input } from "@chakra-ui/react";

export const BeerUGCInput = ({onClick}) => {
    const [ugcBeerPic, setUgcBeerPic] = useState('');
    const [beerName, setBeerName] = useState('');
    const [beerType, setBeerType] = useState('');
    const [brewery, setBrewery] = useState('');

    return (
        <>
            <Input
                placeholder='add Brewer name'
                variant='tango'
                marginBottom='3px'
                value={brewery}
                onChange={e => setBrewery(e.target.value)}
            />
            <Input
                placeholder='add Beer name'
                variant='tango'
                value={beerName}
                marginBottom='3px'
                onChange={e => setBeerName(e.target.value)}
            />
            <Input
                placeholder='add Beer type'
                variant='tango'
                value={beerType}
                marginBottom='3px'
                onChange={e => setBeerType(e.target.value)}
            />
            <Camera
                onPictureTaken={(image) => setUgcBeerPic(image)}
                currentPicture={ugcBeerPic}
                marginBottom='3px'
            />
            <Button mt='1' variant='primary' onClick={() => onClick({
                'beer_label_file': ugcBeerPic,
                'beer_name': beerName,
                'beer_type': beerType,
                'brewer_name': brewery,
            })}>
                Save
            </Button>
        </>
    )
}
