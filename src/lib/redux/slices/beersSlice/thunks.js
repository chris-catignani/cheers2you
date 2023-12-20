import { debounce } from 'lodash-es';
import { UploadManager } from '@bytescale/sdk';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { convertImageToBase64, isAtoZ } from '@/lib/utils/utils';
import { pretendServerBeerSearch, pretendServerGetDefaultBeers } from './thunksServer';
import { domToBlob } from 'modern-screenshot'

// this doesn't have to be async with the current implementation...
export const generateBeerBanner = createAsyncThunk(
    'beers/generateBeerBanner',
    async ({personsName}) => {

    return Array.from(personsName).map(letter => {
        return {
            letter: letter.toUpperCase(),
            isSpecialCharacter: !isAtoZ(letter),
            userGeneratedBeer: {},
            beer: {},
        }
    })
});

export const uploadSocialMedia = createAsyncThunk(
    'beers/uploadSocialMedia',
    async ({ node, personsName, eventName, imageHeight, imageWidth}) => {

        const uploadManager = new UploadManager({
            apiKey: "free", // Get API key: https://www.bytescale.com/get-started
        });

        const data = await domToBlob(node, {
            backgroundColor: 'white',
            width: node.scrollWidth,
            height: node.scrollHeight,
            quality: 0.95,
            type: 'image/jpeg',

            // Not sure why, but CORS is having issues with modern-screenshot.
            // https://github.com/qq15725/modern-screenshot/issues/67
            // So using our image proxy endpoint until the above issue is addressed
            fetchFn: async (imageUrl) => {
                return convertImageToBase64(`/beers/api/imageProxy?url=${imageUrl}`)
            },
            filter: (node) => {
                // optimization to filter out slot reel images which are hidden
                if (node.tagName === 'IMG' && node.classList.contains('slot-reel')) {
                    return node.classList.contains('slot-reel-image-0')
                }

                return true
            },
        })

        const { fileUrl } = await uploadManager.upload({
            data,
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
