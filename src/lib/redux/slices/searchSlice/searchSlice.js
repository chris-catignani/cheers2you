import { getFromSessionStorage, setInSessionStorage } from "@/lib/utils/sessionStorage"
import { createSlice } from "@reduxjs/toolkit"


const initialState = {
    eventName: getFromSessionStorage('search.eventName', ''),
    personsName: getFromSessionStorage('search.personsName', ''),
    venueName: getFromSessionStorage('search.venueName', ''),
}

export const searchSlice = createSlice({
    name: 'search',
    initialState,
    reducers: {
        setEventName: (state, action) => {
            state.eventName = action.payload
            setInSessionStorage('search.eventName', action.payload)
        },
        setPersonsName: (state, action) => {
            state.personsName = action.payload
            setInSessionStorage('search.personsName', action.payload)
        },
        setVenueName: (state, action) => {
            if(action.payload) {
                state.venueName = action.payload
                setInSessionStorage('search.venueName', action.payload)
            }
        },
    }
})

export const { setEventName, setPersonsName, setVenueName } = searchSlice.actions

export default searchSlice.reducer
