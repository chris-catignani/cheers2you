import { getFromSessionStorage, setInSessionStorage } from "@/lib/utils/sessionStorage"
import { createSlice } from "@reduxjs/toolkit"


const initialState = {
    eventName: getFromSessionStorage('beers.eventName', ''),
    personsName: getFromSessionStorage('beers.personsName', ''),
}

export const searchSlice = createSlice({
    name: 'search',
    initialState,
    reducers: {
        setEventName: (state, action) => {
            state.eventName = action.payload
            setInSessionStorage('beers.eventName', action.payload)
        },
        setPersonsName: (state, action) => {
            state.personsName = action.payload
            setInSessionStorage('beers.personsName', action.payload)
        },
    }
})

export const { setEventName, setPersonsName } = searchSlice.actions

export default searchSlice.reducer
