import beerRules from '../../data/beer_rules.json';
import beerLists from '../../data/beer_lists.json';
import { escapeRegExp, sample, shuffle } from 'lodash-es';
import Fuse from "fuse.js";
import { UploadManager } from '@bytescale/sdk';
import download from 'downloadjs';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { setBeerDefaultsPerLetter, setBeerLetters, setBeerOptionsAtIdx, setBeerSearchResults, setLockedBeerLetterIdxs } from "./beersSlice";
import { isAtoZ, tokeniseStringWithQuotesBySpaces } from '@/lib/utils/utils';
import { setPersonsName } from '../searchSlice';
import { setChallengeModeSpinCount, setIsChallengeMode } from '../challengeModeSlice';

const formatBeers = (beers) => {
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
    const beerTypeRegexes = beerRules.beerType.regexes.map(({regex, replacement}) => {
        return {
            regex: new RegExp(escapeRegExp(regex)),
            replacement,
        }
    })
    const multispaceRegex = new RegExp(' {2,}', 'g')
    const wordsToKeepCapitalized = beerRules?.beerName?.wordsToKeepCapitalized.join('|')
    const beerNameCapitalLettersRegex = new RegExp(`(?!${wordsToKeepCapitalized})\\b([A-Z]+)\\b`, 'g')

    const formatBreweryName = (breweryName) => {
        const trimmedString = breweryName.toString().replace(breweryWordsToTrim, '').trim().replace(multispaceRegex, ' ')
        return trimmedString.toLowerCase().replace(/\b\w/g, s => s.toUpperCase()) // title case
    }

    const formatBeerName = (beerName, breweryName) => {
        let formattedBeerName = beerName.toString()
        beerNameRegexes.forEach( ({regex, replacement}) => {
            formattedBeerName = formattedBeerName.replace(regex, replacement).trim().replace(multispaceRegex, ' ')
        })
        formattedBeerName = formattedBeerName.replace(new RegExp(`^${escapeRegExp(breweryName)} `,'i'), '')
        return formattedBeerName.replace(beerNameCapitalLettersRegex, s => s.toLowerCase().replace(/\b\w/g, s => s.toUpperCase())) // title case except certain terms
    }

    const formatBeerType = (beerType) => {
        let formattedBeerType = beerType.toString()
        beerTypeRegexes.forEach( ({regex, replacement}) => {
            formattedBeerType = formattedBeerType.replace(regex, replacement).trim().replace(multispaceRegex, ' ')
        })
        return formattedBeerType
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
        const beerType = formatBeerType(beer['beer_type'])
        const beerLabelFile = formatBeerLabelFile(beer)
        // console.log("formatted brewery: \"" + beer['brewer_name'] + "\" -> \"" + breweryName + "\"")
        // console.log("formatted beer: \"" + beer['beer_name'] + "\" -> \"" + beerName + "\"")
        return {
            'beer_name': beerName,
            'brewer_name': breweryName,
            'beer_type': beerType,
            'beer_label_file': beerLabelFile,
        }
    })
}

const fuses = (() => {
    return beerLists.reduce( (results, beerList) => {
        const beers = formatBeers(require(`../../data/${beerList.fileName}`))
        const fuseOptions = {
            keys: ['beer_name', 'brewer_name', 'beer_type'],
            includeScore: true,
            includeMatches: true,
            ignoreLocation: true,
            useExtendedSearch: true,
        }
        results[beerList.urlParam] = {
            'urlParam': beerList.urlParam,
            'venueName': beerList.venueName,
            'fuse': new Fuse(beers, fuseOptions)
        }
        return results
    }, {})
})()

export const searchForBeer = ({query, venueName}) => (dispatch, getState) => {

    /**
     * Fuse.js does not allow searching across multiple fields.
     * So if you search for brewer + beer_name, it will return 0 results.
     * Thus, we tokenize the search query by spaces, and search multiple fields at once.
     * https://github.com/krisk/Fuse/issues/235#issuecomment-850269634
     */
    const tokenizedQuery = tokeniseStringWithQuotesBySpaces(query)

    const extendedQuery = {
        $and: tokenizedQuery.map((searchToken) => {
            const orFields = [
                { 'beer_name': searchToken },
                { 'brewer_name': searchToken },
                { 'beer_type': searchToken },
            ];
        
            return {
                $or: orFields,
            };
        })
    }

    const beerSearchResults = fuseSearch(extendedQuery, venueName)
    dispatch(setBeerSearchResults(beerSearchResults, {scoreThreshold: 0.40}))
}

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

export const generateBeerDefaults = (venueName) => (dispatch, getState) => {
    const beerDefaultsPerLetter = {}

    // Using for loop for (a-z):
    for (let i = 97; i <= 122; i++) {
        const letter = String.fromCharCode(i)
        beerDefaultsPerLetter[letter] = getDefaultBeersForLetter(letter, venueName)
    }

    dispatch(setBeerDefaultsPerLetter(beerDefaultsPerLetter))
}

const getDefaultBeersForLetter = (letter, venueName) => {
    const beers = []

    const defaultBeerLetterSearch = (fieldRegex) => {
        if (beers.length < 10) {
            const results = fuseSearch(fieldRegex, venueName)
            beers.push(...results.map(result => result.beer))
        }
    }

    defaultBeerLetterSearch({beer_name: `^${letter}`}) // beer name starts with letter
    defaultBeerLetterSearch({brewer_name: `^${letter}`}) // brewer starts with letter
    defaultBeerLetterSearch({beer_name: `" ${letter}"`}) // beer name has other words starting with letter
    defaultBeerLetterSearch({brewer_name: `" ${letter}"`}) // brewer has other words starting with letter

    return shuffle(beers)
}

const fuseSearch = (query, venueName, {limit = 10, scoreThreshold = 0.3} = {}) => {
    if (!query) {
        return []
    }

    const getMatchedFields = (result) => {
        const biggestMatch = result['matches'].reduce( (biggestMatch, curMatch) => {
            const curMatchLength = curMatch['indices'].reduce( (a, b) => {
                return Math.max( a, (b[1] - b[0]) )
            }, 0)

            if (curMatchLength > biggestMatch['matchLength']) {
                return {
                    match: curMatch,
                    matchLength: curMatchLength,
                }
            }
            return biggestMatch
        },
        // acculumlator defaults to the first element, but with a 0 match length
        {
            match: result['matches']?.[0],
            matchLength: 0,
        })

        // currently only returning one field
        return [ biggestMatch['match']['key'] ]
    }

    const fuse = fuses[venueName]?.fuse || fuses[beerLists[0].urlParam].fuse
    const fuseResults = fuse.search(query, {limit})
    return fuseResults.reduce((results, result) => {
        if (result['score'] < scoreThreshold) {
            results.push({
                'beer': result['item'],
                'score': result['score'],
                'matchedFields': getMatchedFields(result),
            })
        }
        return results
    }, [])
}
