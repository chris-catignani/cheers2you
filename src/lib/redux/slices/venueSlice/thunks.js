import { setVenueName } from "./venueSlice"

export const setVenue = (venueName) => (dispatch, getState) => {
    const { venue: { knownVenueNames }} = getState()
    if (!knownVenueNames.includes(venueName)) {
        console.error(`unknown venue ${venueName}`)
        // TODO dispatch error
    }

    dispatch(setVenueName(venueName))
}
