import { getFromSessionStorage, setInSessionStorage } from '@/lib/utils/sessionStorage';
import { createSlice } from '@reduxjs/toolkit';
import { generateBeerBanner, generateBeerDefaults, searchForBeerThunk, uploadSocialMedia } from './thunks';

const initialState = {
    beerLetters: JSON.parse(getFromSessionStorage('beers.beerLetters', '[]')),
    areBeersSpinning: false,
    lockedBeerLetterIdxs: JSON.parse(getFromSessionStorage('beers.lockedBeerLetterIdxs', '[]')),
    beerDefaultsPerLetter: {},
    openedBeerIdx: -1,
    beerSearchResults: [],
    uploadedSocialMediaData: {},
    
    uploadSocialMediaStatus: '',
};

export const beersSlice = createSlice({
    name: 'beers',
    initialState,
    reducers: {
        setBeerLetterAtIndex: (state, action) => {
            state.beerLetters[action.payload.idx] = {
                ...state.beerLetters[action.payload.idx],
                beer: action.payload.beer,
                userGeneratedBeer: action.payload.userGeneratedBeer,
            }
            setInSessionStorage('beers.beerLetters', JSON.stringify(state.beerLetters))
        },
        setBeerLetters: (state, action) => {
            state.beerLetters = action.payload
            setInSessionStorage('beers.beerLetters', JSON.stringify(action.payload))
        },
        setBeersSpinning: (state, action) => {
            state.areBeersSpinning = action.payload
        },
        toggleLockedBeerLetterIdx: (state, action) => {
            const tempLockedBeerLetterIdxs = [...state.lockedBeerLetterIdxs]
            tempLockedBeerLetterIdxs[action.payload] = !tempLockedBeerLetterIdxs[action.payload]
            state.lockedBeerLetterIdxs = tempLockedBeerLetterIdxs
            setInSessionStorage('beers.lockedBeerLetterIdxs', JSON.stringify(state.lockedBeerLetterIdxs))
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
    },
    extraReducers: (builder) => {
        builder.addCase(generateBeerBanner.fulfilled, (state, action) => {
            state.beerLetters = action.payload
            setInSessionStorage('beers.beerLetters', JSON.stringify(action.payload))

            state.lockedBeerLetterIdxs = new Array(action.payload.length).fill(false)
            setInSessionStorage('beers.lockedBeerLetterIdxs', JSON.stringify(state.lockedBeerLetterIdxs))
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
        .addCase(generateBeerDefaults.fulfilled, (state, action) => {
            state.beerDefaultsPerLetter = action.payload
        })
        .addCase(searchForBeerThunk.fulfilled, (state, action) => {
            state.beerSearchResults = action.payload
        })
    }
});

export const { setBeerLetterAtIndex, setBeerLetters, setBeersSpinning, toggleLockedBeerLetterIdx, setBeerDefaultsPerLetter, setOpenBeerIdx, setBeerSearchResults, setUploadedSocialMediaData } = beersSlice.actions;

export default beersSlice.reducer;
