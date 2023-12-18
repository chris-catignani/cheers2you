import beerRules from './data/beer_rules.json';
import beerLists from './data/beer_lists.json';
import { escapeRegExp } from 'lodash-es';
import Fuse from "fuse.js";

const NUM_BEER_DEFAULTS_PER_LETTER = 10

/**
 * This file has beer search functionality like it would be on a server.
 * Allowing us to hopefully make that cut a bit cleaner later
 */

const formatBeers = (beers) => {
    const getRegexes = (fieldType) => {
        return [
            {
                regex: new RegExp(beerRules[fieldType].wordsToTrim.join('|'), 'gi'),
                replacement: '',
            },
            ...beerRules[fieldType].regexes.map(({ regex, replacement }) => {
                return {
                    regex: new RegExp(regex),
                    replacement,
                }
            })
        ]
    }

    const breweryNameRegexes = getRegexes('brewery')
    const beerNameRegexes = getRegexes('beerName')
    const beerTypeRegexes = getRegexes('beerType')

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
        let formattedBreweryName = breweryName.toString()
        breweryNameRegexes.forEach(({ regex, replacement }) => {
            formattedBreweryName = formattedBreweryName.replace(regex, replacement).trim().replace(multispaceRegex, ' ')
        })
        return toTitleCase(formattedBreweryName)
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

/**
 * Get json object of beer defaults per letter
 * 
 * implementation:
 * 1. initialize empty sort buckets for each letter
 * 2. populate sort buckets for each letter
 * 3. combine the sort buckets into a single list of beers
 */
const getBeerDefaultsPerLetter = (beers) => {
    const sortProps = ['beerNameFirstLetterMatches', 'brewerFirstLetterMatches', 'beerTypeFirstLetterMatches', 'brewerNameSecondWordMatches', 'beerNameSecondWordMatches', 'beerNameThirdWordMatches', 'beerNameFourthWordMatches']
    const ariclesToIgnore = new Set(['a', 'it', 'an', 'the', 'of', 'to', 'in', 'on', 'for', 'or', 'to', 'no', 'at', 'are'])
    const alphaRegex = new RegExp(/\b[a-z]\w*/, 'g')

    const getAlphaWord = (string, wordIdx, ignoreArticles) => {
        const wordMatches = [...string.matchAll(alphaRegex)]
        if (wordIdx >= wordMatches.length) {
            return undefined
        }

        if (!ignoreArticles) {
            return {
                word: wordMatches[wordIdx][0],
                index: wordMatches[wordIdx]['index'],
            }
        } else {
            const wordMatchesNoArticles = wordMatches.filter(wordMatch => !ariclesToIgnore.has(wordMatch[0]))
            if (wordIdx >= wordMatchesNoArticles.length) {
                return undefined
            }

            return {
                word: wordMatchesNoArticles[wordIdx][0],
                index: wordMatchesNoArticles[wordIdx]['index'],
            }
        }
    }

    const assignBucket = (beerField, beerFieldName, wordIdx, assignedLetters, listToAddTo, beer, ignoreArticles) => {
        const beerWordMatch = getAlphaWord(beerField, wordIdx, ignoreArticles)
        if (beerWordMatch) {
            const letter = beerWordMatch.word.charAt(0)
            if (assignedLetters[beerFieldName].has(letter)) {
                return
            }

            assignedLetters[beerFieldName].add(letter)
            beerSortOrderLists[letter][listToAddTo].push({
                beer,
                matchedFields: [{
                    field: beerFieldName,
                    index: beerWordMatch.index
                }]
            })
        }
    }
    
    // 1. initialize empty sort buckets for each letter
    const beerSortOrderLists = {}
    for (let i = 97; i <= 122; i++) {  // Using for loop for (a-z):
        const letter = String.fromCharCode(i)

        beerSortOrderLists[letter] = {}
        sortProps.forEach(sortProp => {
            beerSortOrderLists[letter][sortProp] = []
        })
    }

    // 2. populate sort buckets for each letter
    beers.forEach(beer => {

        // keep track of which field types we already have this beer in
        // this prevents a beer from being added twice for the same field
        // e.g. Brewdogs Quench Quake was being added as options for beer name for "Quench" and "Quake"
        const assignedLetters = {
            beer_name: new Set(),
            brewer_name: new Set(),
            beer_type: new Set(),
        }

        const beerName = beer.beer_name.toLowerCase()
        const brewerName = beer.brewer_name.toLowerCase()
        const beerType = beer.beer_type.toLowerCase()

        assignBucket(beerName, 'beer_name', 0, assignedLetters, 'beerNameFirstLetterMatches', beer, false)
        assignBucket(brewerName, 'brewer_name', 0, assignedLetters, 'brewerFirstLetterMatches', beer, false)
        assignBucket(beerType, 'beer_type', 0, assignedLetters, 'beerTypeFirstLetterMatches', beer, false)
        assignBucket(brewerName, 'brewer_name', 1, assignedLetters, 'brewerNameSecondWordMatches', beer, true)
        assignBucket(beerName, 'beer_name', 1, assignedLetters, 'beerNameSecondWordMatches', beer, true)
        assignBucket(beerName, 'beer_name', 2, assignedLetters, 'beerNameThirdWordMatches', beer, true)
        assignBucket(beerName, 'beer_name', 3, assignedLetters, 'beerNameFourthWordMatches', beer, true)
    })

    // 3. combine the sort buckets into a single list of beers
    const beerDefaultsPerLetter = {}
    for (let i = 97; i <= 122; i++) {  // Using for loop for (a-z):
        const letter = String.fromCharCode(i)
        beerDefaultsPerLetter[letter] = sortProps.reduce((beerDefaults, sortProp) => {
            if (beerDefaults.length >= NUM_BEER_DEFAULTS_PER_LETTER) {
                return beerDefaults
            }
            return beerDefaults.concat(
                beerSortOrderLists[letter][sortProp].slice(0, NUM_BEER_DEFAULTS_PER_LETTER - beerDefaults.length)
            )
        }, [])
    }

    return beerDefaultsPerLetter
}

/**
 * init a bunch of startup items into memory.
 * The implementation can be optomized to not loop as much, or dynamically generate data instead of creating at startup
 */
const fusesByVenue = {}
const beerDefaultsByVenue = {}

const init = () => {
    const start = performance.now()

    beerLists.forEach(beerList => {
        const beers = beerList.fileNames.reduce((beers, beerfileName) => {
            return beers.concat(formatBeers(require(`./data/${beerfileName}`)))
        }, [])

        fusesByVenue[beerList.urlParam] = {
            'urlParam': beerList.urlParam,
            'venueName': beerList.venueName,
            'fuse': new Fuse(beers, {
                keys: ['beer_name', 'brewer_name', 'beer_type'],
                includeScore: true,
                includeMatches: true,
                ignoreLocation: true,
                useExtendedSearch: true,
                threshold: 0.3,
            })
        }

        beerDefaultsByVenue[beerList.urlParam] = getBeerDefaultsPerLetter(beers)
    })
    const end = performance.now()
    console.log(`init time: ${end - start}ms`)
}
init()

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

        // get the biggest matched index range to use as the match index
        const index = biggestMatch['match']['indices'].reduce((a, b) => {
            if(a[1] >= (b[1] - b[0])) {
                return a 
            } else {
                return [b[0], b[1] - b[0]]
            }
        }, [0, 0])

        // currently only returning one field
        return [{
            field: biggestMatch['match']['key'],
            index: index[0],
        }]
    }

    const fuse = fusesByVenue[venueName]?.fuse || fusesByVenue[beerLists[0].urlParam].fuse
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

const getDefaultBeers = (venueName) => {
    return beerDefaultsByVenue[venueName]
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