import { sample, shuffle } from 'lodash-es';
import { UploadManager } from '@bytescale/sdk';
import download from 'downloadjs';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { setBeerLetters, setBeerOptionsAtIdx, setLockedBeerLetterIdxs } from "./beersSlice";
import { isAtoZ } from '@/lib/utils/utils';
import { setPersonsName } from '../searchSlice';
import { setChallengeModeSpinCount, setIsChallengeMode } from '../challengeModeSlice';

export const generateBeerBanner = ({personsName, freshBanner = true} = {}) => (dispatch, getState) => {
    const state = getState()

    const beerLetters = []
    const beerOptionsAtIdx = []

    Array.from(personsName).forEach( (letter, idx) => {
        if(!isAtoZ(letter)) {
            beerLetters.push({
                letter, 
                isSpecialCharacter: true,
            })
            beerOptionsAtIdx.push([])
        } else if (!freshBanner && state.beers.lockedBeerLetterIdxs[idx]) {
            beerLetters.push(state.beers.beerLetters[idx])
            beerOptionsAtIdx.push(state.beers.beerOptionsAtIdx[idx])
        } else {
            const beerOptions = shuffle(state.beers.beerDefaultsPerLetter[letter.toLowerCase()])
            beerOptionsAtIdx.push(beerOptions)
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
    dispatch(setBeerOptionsAtIdx(beerOptionsAtIdx))
};

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

// TODO:
// error handling
// statuses
// throttle requests
// default venues

export const generateBeerDefaults = createAsyncThunk(
    'beers/generateBeerDefaults',
    async (venueName) => {
        const searchParams = new URLSearchParams()
        searchParams.set('op', 'defaults');
        searchParams.set('venue', venueName)

        const response = await fetch(`beers/api?${searchParams.toString()}`)
        return response.json()
    }
)

export const searchForBeer = createAsyncThunk(
    'beers/searchForBeer',
    async ({query, venueName}) => {
        const searchParams = new URLSearchParams()
        searchParams.set('op', 'search');
        searchParams.set('venue', venueName)
        searchParams.set('q', query)

        const response = await fetch(`beers/api?${searchParams.toString()}`)
        return response.json()
    }
)
