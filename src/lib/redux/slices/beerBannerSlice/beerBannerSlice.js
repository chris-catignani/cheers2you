import { getFromSessionStorage, setInSessionStorage } from '@/lib/utils/sessionStorage';
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    eventName: getFromSessionStorage('beerBanner.eventName', ''),
    personsName: getFromSessionStorage('beerBanner.personsName', ''),
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
    },
});

export const { setEventName, setPersonsName } = beerBannerSlice.actions;

export default beerBannerSlice.reducer;
