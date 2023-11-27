import { getFromSessionStorage, setInSessionStorage } from '@/lib/utils/sessionStorage';
import { createSlice } from '@reduxjs/toolkit';
import { downloadImage, uploadImage } from './thunks';

const initialState = {
    eventName: getFromSessionStorage('beerBanner.eventName', ''),
    personsName: getFromSessionStorage('beerBanner.personsName', ''),
    beerLetters: JSON.parse(getFromSessionStorage('beerBanner.beerLetters', '[]')),
    lockedBeerLetterIdxs: JSON.parse(getFromSessionStorage('beerBanner.lockedBeerLetterIdxs', '[]')),
    beerOptionsAtIdx: [],
    openedBeerIdx: -1,
    beerSearchResults: [],
    uploadedImageData: {},
    
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
        setBeerOptionsAtIdx: (state, action) => {
            state.beerOptionsAtIdx = action.payload
        },
        setOpenBeerIdx: (state, action) => {
            state.openedBeerIdx = action.payload
        },
        setBeerSearchResults: (state, action) => {
            state.beerSearchResults = action.payload;
        },
        setsUploadedImageData: (state, action) => {
            state.uploadedImageData = action.payload
        },
        setDownloadGeneratedImageStatus: (state, action) => {
            state.downloadGeneratedImageStatus = action.payload
        },
    },
    extraReducers: {
        [downloadImage.pending]: (state) => {
            state.downloadGeneratedImageStatus = 'downloading';
        },
        [downloadImage.fulfilled]: (state, action) => {
            state.downloadGeneratedImageStatus = ''
        },
        [downloadImage.rejected]: (state) => {
            state.downloadGeneratedImageStatus = ''
        },
        [uploadImage.pending]: (state) => {
            state.uploadGeneratedImageStatus = 'uploading';
            state.uploadedImageData = {}
        },
        [uploadImage.fulfilled]: (state, action) => {
            state.uploadGeneratedImageStatus = ''
            state.uploadedImageData = action.payload
        },
        [uploadImage.rejected]: (state) => {
            state.uploadGeneratedImageStatus = ''
            state.uploadedImageData = {}
        },
    }
});

export const { setEventName, setPersonsName, setBeerLetterAtIndex, setBeerLetters, setLockedBeerLetterIdxs, toggleLockedBeerLetterIdx, setBeerOptionsAtIdx, setOpenBeerIdx, setBeerSearchResults, setsUploadedImageData } = beerBannerSlice.actions;

export default beerBannerSlice.reducer;
