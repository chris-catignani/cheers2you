import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    venueName: '',
    knownVenueNames: ['beers', 'beers2'],
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
