// import beerLists from '../../data/beer_lists.json';
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    venueName: '',
    defaultVenueName: '', // beerLists[0].urlParam,
    knownVenueNames: [], // beerLists.map(beerList => beerList.urlParam),
};

export const venueSlice = createSlice({
    name: 'venue',
    initialState,
    reducers: {
        setVenueName: (state, action) => {
            state.venueName = action.payload
        },
    }
});

export const { setVenueName } = venueSlice.actions;

export default venueSlice.reducer;
