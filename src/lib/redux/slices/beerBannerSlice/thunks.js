import beers from '../../data/beers2.json';
import beerRules from '../../data/beer_rules.json';
import { sample, shuffle } from 'lodash-es';
import Fuse from "fuse.js";
import { UploadManager } from '@bytescale/sdk';
import download from 'downloadjs';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { setBeerLetters, setBeerOptionsAtIdx, setBeerSearchResults, setEventName, setLockedBeerLetterIdxs, setPersonsName } from "./beerBannerSlice";
import { isAtoZ } from '@/lib/utils/utils';


const formattedBeers = ((beers) => {
    const breweryWordsToTrim = new RegExp(beerRules['brewery']['wordsToTrim'].join('|'), 'gi')
    const beerNameRegexes = [
        {
            regex: new RegExp(beerRules['beerName']['wordsToTrim'].join('|'), 'gi'),
            replacement: '',
        },
        ...beerRules.beerName.regexes.map(({regex, replacement}) => {
            return {
                regex: new RegExp(regex),
                replacement,
            }
        })
    ]
    const multispaceRegex = new RegExp(' {2,}', 'g')

    const formatBreweryName = (breweryName) => {
        const trimmedString = breweryName.replace(breweryWordsToTrim, '').trim().replace(multispaceRegex, ' ')
        return trimmedString.toLowerCase().replace(/\b\w/g, s => s.toUpperCase()) // title case
    }

    const formatBeerName = (beerName, breweryName) => {
        let formattedBeerName = beerName
        beerNameRegexes.forEach( ({regex, replacement}) => {
            formattedBeerName = formattedBeerName.replace(regex, replacement).trim().replace(multispaceRegex, ' ')
        })
        formattedBeerName = formattedBeerName.replace(new RegExp(`^${breweryName} `,'i'), '')
        return formattedBeerName.toLowerCase().replace(/\b\w/g, s => s.toUpperCase()) // title case
    }

    return Object.values(beers).map(beer => {
        const breweryName = formatBreweryName(beer['brewer_name'])
        const beerName = formatBeerName(beer['beer_name'], breweryName)
        // console.log("formatted brewery: \"" + beer['brewer_name'] + "\" -> \"" + breweryName + "\"")
        // console.log("formatted beer: \"" + beer['beer_name'] + "\" -> \"" + beerName + "\"")
        return {
            'beer_name': beerName,
            'brewer_name': breweryName,
            'beer_type': beer['beer_type'],
            'beer_label_file': beer['beer_label_file_big'],
        }
    })
})(beers)

const fuse = new Fuse(formattedBeers, {
    keys: [
        'beer_name',
        'brewer_name',
    ],
    includeScore: true,
    ignoreLocation: true,
    useExtendedSearch: true,
});

export const searchForBeer = (beerSearchQuery) => (dispatch, getState) => {
    const beerSearchResults = fuseSearch(beerSearchQuery)
    dispatch(setBeerSearchResults(beerSearchResults, {scoreThreshold: 0.40}))
}

export const generateBeerBanner = (personsName, eventName) => (dispatch, getState) => {
    const state = getState()

    const beerLetters = []
    const beerOptionsAtIdx = []

    if (state.beerBanner.personsName !== personsName) {
        Array.from(personsName).forEach((letter, idx) => {
            if(!isAtoZ(letter)) {
                beerLetters.push({
                    letter, 
                    isSpecialCharacter: true,
                })
                beerOptionsAtIdx.push([])
            } else {
                const beerOptions = getDefaultBeersForLetter(letter)
                beerOptionsAtIdx.push(beerOptions)
                beerLetters.push({
                    letter: letter.toUpperCase(),
                    userGeneratedBeer: {},
                    beer: sample(beerOptions),
                })
            }
        })
        dispatch(setLockedBeerLetterIdxs(new Array(beerLetters.length).fill(false)))
    } else {
        Array.from(personsName).forEach( (letter, idx) => {
            if(!isAtoZ(letter)) {
                beerLetters.push({
                    letter, 
                    isSpecialCharacter: true,
                })
                beerOptionsAtIdx.push([])
            } else if (state.beerBanner.lockedBeerLetterIdxs[idx]) {
                beerLetters.push(state.beerBanner.beerLetters[idx])
                beerOptionsAtIdx.push(state.beerBanner.beerOptionsAtIdx[idx])
            } else {
                const beerOptions = getDefaultBeersForLetter(letter)
                beerOptionsAtIdx.push(beerOptions)
                beerLetters.push({
                    letter: letter.toUpperCase(),
                    userGeneratedBeer: {},
                    beer: sample(beerOptions),
                })
            }
        })
    }

    dispatch(setBeerLetters(beerLetters))
    dispatch(setBeerOptionsAtIdx(beerOptionsAtIdx))
    dispatch(setEventName(eventName));
    dispatch(setPersonsName(personsName));
};

export const uploadSocialMedia = createAsyncThunk(
    'beerBanner/uploadSocialMedia',
    async ({dataUrlPromise, personsName, eventName}) => {

        const uploadManager = new UploadManager({
            apiKey: "free", // Get API key: https://www.bytescale.com/get-started
        });

        const dataUrl = await dataUrlPromise
        const image = await fetch(dataUrl)
        const imageArrayBuffer = await image.arrayBuffer()
        const { fileUrl } = await uploadManager.upload({
            data: imageArrayBuffer,
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
    'beerBanner/downloadImage',
    async (dataUrlPromise) => {
        const dataUrl = await dataUrlPromise
        download(dataUrl, 'my-pic.jpg');
    }
)

const getDefaultBeersForLetter = (letter) => {
    const fuseSearchQuery = {
        $or: [
            { beer_name: `^${letter}` },
            { beer_name: `" ${letter}"` },
            { brewer_name: `^${letter}` },
            { brewer_name: `" ${letter}"` },
        ]
    }

    return shuffle(fuseSearch(fuseSearchQuery, {scoreThreshold: 0.5}))
}

const fuseSearch = (query, {limit = 10, scoreThreshold = 0.5} = {}) => {
    if (!query) {
        return []
    }

    const fuseResults = fuse.search(query, {limit})
    return fuseResults.reduce((results, result) => {
        if (result['score'] < scoreThreshold) {
            results.push(result['item'])
        }
        return results
    }, [])
}
