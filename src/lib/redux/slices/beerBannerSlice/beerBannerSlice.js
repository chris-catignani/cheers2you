import { getFromSessionStorage, setInSessionStorage } from '@/lib/utils/sessionStorage';
import { createSlice } from '@reduxjs/toolkit';
import { downloadImage, uploadSocialMedia } from './thunks';

const initialState = {
    eventName: getFromSessionStorage('beerBanner.eventName', ''),
    personsName: getFromSessionStorage('beerBanner.personsName', ''),
    beerLetters: JSON.parse(getFromSessionStorage('beerBanner.beerLetters', '[]')),
    lockedBeerLetterIdxs: JSON.parse(getFromSessionStorage('beerBanner.lockedBeerLetterIdxs', '[]')),
    beerDefaultsPerLetter: {},
    beerOptionsAtIdx: [],
    openedBeerIdx: -1,
    beerSearchResults: [],
    uploadedSocialMediaData: {},
    
    downloadGeneratedImageStatus: '',
    uploadGeneratedImageStatus: '',
};

export const beerBannerSlice = createSlice({
    name: 'beerBanner',
    initialState,
    reducers: {
        setEventName: (state, action) => {
            state.eventName = action.payload
            setInSessionStorage('beerBanner.eventName', action.payload)
        },
        setPersonsName: (state, action) => {
            state.personsName = action.payload
            setInSessionStorage('beerBanner.personsName', action.payload)
        },
        setBeerLetterAtIndex: (state, action) => {
            state.beerLetters[action.payload.idx] = {
                ...state.beerLetters[action.payload.idx],
                beer: action.payload.beer,
                userGeneratedBeer: action.payload.userGeneratedBeer,
            }
            setInSessionStorage('beerBanner.beerLetters', JSON.stringify(state.beerLetters))
        },
        setBeerLetters: (state, action) => {
            state.beerLetters = action.payload
            setInSessionStorage('beerBanner.beerLetters', JSON.stringify(action.payload))
        },
        setLockedBeerLetterIdxs: (state, action) => {
            state.lockedBeerLetterIdxs = action.payload
            setInSessionStorage('beerBanner.lockedBeerLetterIdxs', JSON.stringify(action.payload))
        },
        toggleLockedBeerLetterIdx: (state, action) => {
            const tempLockedBeerLetterIdxs = [...state.lockedBeerLetterIdxs]
            tempLockedBeerLetterIdxs[action.payload] = !tempLockedBeerLetterIdxs[action.payload]
            state.lockedBeerLetterIdxs = tempLockedBeerLetterIdxs
            setInSessionStorage('beerBanner.lockedBeerLetterIdxs', JSON.stringify(state.lockedBeerLetterIdxs))
        },
        setBeerDefaultsPerLetter: (state, action) => {
            state.beerDefaultsPerLetter = action.payload
        },
        setBeerOptionsAtIdx: (state, action) => {
            state.beerOptionsAtIdx = action.payload
        },
        setOpenBeerIdx: (state, action) => {
            state.openedBeerIdx = action.payload
        },
        setBeerSearchResults: (state, action) => {
            state.beerSearchResults = action.payload;
        },
        setUploadedSocialMediaData: (state, action) => {
            state.uploadedSocialMediaData = action.payload
        },
        setDownloadGeneratedImageStatus: (state, action) => {
            state.downloadGeneratedImageStatus = action.payload
        },
    },
    extraReducers: (builder) => {
        builder.addCase(downloadImage.pending, (state) => {
            state.downloadGeneratedImageStatus = 'downloading';
        })
        .addCase(downloadImage.fulfilled, (state) => {
            state.downloadGeneratedImageStatus = ''
        })
        .addCase(downloadImage.rejected, (state) => {
            state.downloadGeneratedImageStatus = ''
        })
        .addCase(uploadSocialMedia.pending, (state) => {
            state.uploadSocialMediaStatus = 'uploading';
            state.uploadedSocialMediaData = {}
        })
        .addCase(uploadSocialMedia.fulfilled, (state, action) => {
            state.uploadSocialMediaStatus = ''
            state.uploadedSocialMediaData = action.payload
        })
        .addCase(uploadSocialMedia.rejected, (state) => {
            state.uploadSocialMediaStatus = ''
            state.uploadedSocialMediaData = {}
        })
    }
});

export const { setEventName, setPersonsName, setBeerLetterAtIndex, setBeerLetters, setLockedBeerLetterIdxs, toggleLockedBeerLetterIdx, setBeerDefaultsPerLetter, setBeerOptionsAtIdx, setOpenBeerIdx, setBeerSearchResults, setUploadedSocialMediaData } = beerBannerSlice.actions;

export default beerBannerSlice.reducer;
