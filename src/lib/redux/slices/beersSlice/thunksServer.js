import beerRules from './data/beer_rules.json';
import beerLists from './data/beer_lists.json';
import { escapeRegExp, shuffle } from 'lodash-es';
import Fuse from "fuse.js";

/**
 * This file has beer search functionality like it would be on a server.
 * Allowing us to hopefully make that cut a bit cleaner later
 */

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
    const wordsToKeepCapitalized = '\\b' + beerRules?.beerName?.wordsToKeepCapitalized.join('\\b|\\b') + '\\b'
    const beerNameCapitalLettersRegex = new RegExp(`(?!${wordsToKeepCapitalized})\\b(\\S+)\\b`, 'g')

    const toTitleCase = (aString) => {
        return aString.replace(
            /\w\S*/g,
            txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        )
    }

    const formatBreweryName = (breweryName) => {
        const trimmedString = breweryName.toString().replace(breweryWordsToTrim, '').trim().replace(multispaceRegex, ' ')
        return toTitleCase(trimmedString)
    }

    const formatBeerName = (beerName, breweryName) => {
        let formattedBeerName = beerName.toString()
        beerNameRegexes.forEach( ({regex, replacement}) => {
            formattedBeerName = formattedBeerName.replace(regex, replacement).trim().replace(multispaceRegex, ' ')
        })
        formattedBeerName = formattedBeerName.replace(new RegExp(`^${escapeRegExp(breweryName)} `,'i'), '')
        return formattedBeerName.replace(beerNameCapitalLettersRegex, s => toTitleCase(s))
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
    const start = performance.now()
    const results = beerLists.reduce( (results, beerList) => {
        const beers = formatBeers(require(`./data/${beerList.fileName}`))
        const fuseOptions = {
            keys: ['beer_name', 'brewer_name', 'beer_type'],
            includeScore: true,
            includeMatches: true,
            ignoreLocation: true,
            useExtendedSearch: true,
            threshold: 0.3,
        }
        results[beerList.urlParam] = {
            'urlParam': beerList.urlParam,
            'venueName': beerList.venueName,
            'fuse': new Fuse(beers, fuseOptions)
        }
        return results
    }, {})
    const end = performance.now()
    console.log(`fuse.js spin up time: ${end - start}ms`)
    return results
})()

const fuseSearch = (query, venueName, {limit = 10} = {}) => {
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
    return fuseResults.map((result) => {
        return {
            'beer': result['item'],
            'score': result['score'],
            'matchedFields': getMatchedFields(result),
        }
    })
}

const tokeniseStringWithQuotesBySpaces = (string) => {
    return string.match(/("[^"]*?"|[^"\s]+)+(?=\s*|\s*$)/g) ?? []
}

const searchBeers = (query, venueName) => {
    /**
     * Fuse.js does not allow searching across multiple fields.
     * So if you search for brewer + beer_name, it will return 0 results.
     * Thus, we tokenize the search query by spaces, and search multiple fields at once.
     * Based on: https://github.com/krisk/Fuse/issues/235#issuecomment-850269634 but with some changes
     */
    const tokenizedQuery = tokeniseStringWithQuotesBySpaces(query)

    const orFields = (searchToken) => {
        return [
            { 'beer_name': searchToken },
            { 'brewer_name': searchToken },
            { 'beer_type': searchToken },
        ];
    }

    const extendedQuery = {
        $or: [
            // search for the entire query
            {
                $or: orFields(query),
            },
            // tokenize and search for each word across the various fields
            {
                $and: tokenizedQuery.map((searchToken) => {
                    return {
                        $or: orFields(searchToken),
                    };
                })
            }
        ]
    }

    return fuseSearch(extendedQuery, venueName)
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

const getDefaultBeers = (venueName) => {
    const beerDefaultsPerLetter = {}

    // Using for loop for (a-z):
    for (let i = 97; i <= 122; i++) {
        const letter = String.fromCharCode(i)
        beerDefaultsPerLetter[letter] = getDefaultBeersForLetter(letter, venueName)
    }

    return beerDefaultsPerLetter
}

const stall = async (stallTime = 100) => {
    await new Promise(resolve => setTimeout(resolve, stallTime));
}

export const pretendServerBeerSearch = async (query, venueName) => {
    await stall()

    return searchBeers(query, venueName)
}

export const pretendServerGetDefaultBeers = async (venueName) => {
    await stall()

    return getDefaultBeers(venueName)
}