import beers from '../../data/beers2.json';
import beerRules from '../../data/beer_rules.json';
import { sample, shuffle } from 'lodash-es';
import Fuse from "fuse.js";
import { UploadManager } from '@bytescale/sdk';
import download from 'downloadjs';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { setBeerDefaultsPerLetter, setBeerLetters, setBeerOptionsAtIdx, setBeerSearchResults } from "./beersSlice";
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
    const wordsToKeepCapitalized = beerRules?.beerName?.wordsToKeepCapitalized.join('|')
    const beerNameCapitalLettersRegex = new RegExp(`(?!${wordsToKeepCapitalized})\\b([A-Z]+)\\b`, 'g')

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
        return formattedBeerName.replace(beerNameCapitalLettersRegex, s => s.toLowerCase().replace(/\b\w/g, s => s.toUpperCase())) // title case except certain terms
    }

    const formatBeerLabelFile = (beer) => {
        if (beer['beer_label_file_big'] === 'https://assets.untappd.com/site/assets/images/temp/badge-beer-default.png') {
            return beer['brewer_logo_file_big']
        }
        return beer['beer_label_file_big']
    }

    return Object.values(beers).map(beer => {
        const breweryName = formatBreweryName(beer['brewer_name'])
        const beerName = formatBeerName(beer['beer_name'], breweryName)
        const beerLabelFile = formatBeerLabelFile(beer)
        // console.log("formatted brewery: \"" + beer['brewer_name'] + "\" -> \"" + breweryName + "\"")
        // console.log("formatted beer: \"" + beer['beer_name'] + "\" -> \"" + beerName + "\"")
        return {
            'beer_name': beerName,
            'brewer_name': breweryName,
            'beer_type': beer['beer_type'],
            'beer_label_file': beerLabelFile,
        }
    })
})(beers)

const fuse = new Fuse(formattedBeers, {
    keys: [
        'beer_name',
        'brewer_name',
        'beer_type',
    ],
    includeScore: true,
    ignoreLocation: true,
    useExtendedSearch: true,
});

export const searchForBeer = (beerSearchQuery) => (dispatch, getState) => {
    const beerSearchResults = fuseSearch(beerSearchQuery)
    dispatch(setBeerSearchResults(beerSearchResults, {scoreThreshold: 0.40}))
}

export const generateBeerBanner = (personsName) => (dispatch, getState) => {
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
        } else if (state.beers.lockedBeerLetterIdxs[idx]) {
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

    dispatch(setBeerLetters(beerLetters))
    dispatch(setBeerOptionsAtIdx(beerOptionsAtIdx))
};

export const uploadSocialMedia = createAsyncThunk(
    'beers/uploadSocialMedia',
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
    'beers/downloadImage',
    async (dataUrlPromise) => {
        const dataUrl = await dataUrlPromise
        download(dataUrl, 'my-pic.jpg');
    }
)

export const generateBeerDefaults = () => (dispatch, getState) => {
    const beerDefaultsPerLetter = {}

    // Using for loop for (a-z):
    for (let i = 97; i <= 122; i++) {
        const letter = String.fromCharCode(i)
        beerDefaultsPerLetter[letter] = getDefaultBeersForLetter(letter)
    }

    dispatch(setBeerDefaultsPerLetter(beerDefaultsPerLetter))
}

const getDefaultBeersForLetter = (letter) => {
    const beers = []

    const defaultBeerLetterSearch = (fieldRegex) => {
        if (beers.length < 10) {
            const results = fuseSearch(fieldRegex, {scoreThreshold: 0.5})
            beers.push(...results)
        }
    }

    defaultBeerLetterSearch({beer_name: `^${letter}`}) // beer name starts with letter
    defaultBeerLetterSearch({brewer_name: `^${letter}`}) // brewer starts with letter
    defaultBeerLetterSearch({beer_name: `" ${letter}"`}) // beer name has other words starting with letter
    defaultBeerLetterSearch({brewer_name: `" ${letter}"`}) // brewer has other words starting with letter

    return shuffle(beers)
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
