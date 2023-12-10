import { debounce,sample, shuffle } from 'lodash-es';
import { UploadManager } from '@bytescale/sdk';
import download from 'downloadjs';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { setBeerLetters, setLockedBeerLetterIdxs } from "./beersSlice";
import { isAtoZ } from '@/lib/utils/utils';
import { setPersonsName } from '../searchSlice';
import { setChallengeModeSpinCount, setIsChallengeMode } from '../challengeModeSlice';
import { pretendServerBeerSearch, pretendServerGetDefaultBeers } from './thunksServer';

export const generateBeerBanner = createAsyncThunk(
    'beers/generateBeerBanner',
    async ({personsName, venueName, freshBanner = true}, {dispatch, getState}) => {

    const beerLetters = []

    let beerDefaults = getState().beers.beerDefaultsPerLetter
    if (Object.keys(beerDefaults).length === 0) {
        beerDefaults = await pretendServerGetDefaultBeers(venueName)
    }

    Array.from(personsName).forEach( (letter, idx) => {
        if(!isAtoZ(letter)) {
            beerLetters.push({
                letter, 
                isSpecialCharacter: true,
            })
        } else if (!freshBanner && getState().beers.lockedBeerLetterIdxs[idx]) {
            beerLetters.push(getState().beers.beerLetters[idx])
        } else {
            const beerOptions = shuffle(beerDefaults[letter.toLowerCase()])
            beerLetters.push({
                letter: letter.toUpperCase(),
                userGeneratedBeer: {},
                beer: sample(beerOptions),
            })
        }
    })

    if (freshBanner) {
        dispatch(setIsChallengeMode(false))
        dispatch(setChallengeModeSpinCount(0))
        dispatch(setLockedBeerLetterIdxs(new Array(beerLetters.length).fill(false)))
    }
    dispatch(setPersonsName(personsName))
    dispatch(setBeerLetters(beerLetters))
});

export const uploadSocialMedia = createAsyncThunk(
    'beers/uploadSocialMedia',
    async ({canvasPromise, personsName, eventName, imageHeight, imageWidth}) => {

        const uploadManager = new UploadManager({
            apiKey: "free", // Get API key: https://www.bytescale.com/get-started
        });

        const canvas = await canvasPromise
        const image = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
        const { fileUrl } = await uploadManager.upload({
            data: image,
            mime: 'image/jpeg',
        });

        const urlSegments = fileUrl.split('/')
        const appId = urlSegments[3]
        const fileId = urlSegments[6].slice(0, -5)

        await fetch('/shared/api', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                personsName,
                eventName,
                fileId,
                fileUrl,
                imageHeight,
                imageWidth,
            }),
        })

        return {
            appId,
            fileId,
            fileUrl,
        }
    }
)

export const downloadImage = createAsyncThunk(
    'beers/downloadImage',
    async (canvasPromise) => {
        const canvas = await canvasPromise
        const dataUrl = canvas.toDataURL('image/jpeg')
        download(dataUrl, 'my-pic.jpg');
    }
)

export const generateBeerDefaults = createAsyncThunk(
    'beers/generateBeerDefaults',
    async (venueName) => {
        return await pretendServerGetDefaultBeers(venueName)
    }
)

export const searchForBeerThunk = createAsyncThunk(
    'beers/searchForBeer',
    async ({query, venueName}) => {
        return await pretendServerBeerSearch(query, venueName)
    }
)
const debouncedSearchForBeer = debounce((arg, dispatch) => dispatch(searchForBeerThunk(arg)), 100);
export const searchForBeer = (arg) => (dispatch) => debouncedSearchForBeer(arg, dispatch)
