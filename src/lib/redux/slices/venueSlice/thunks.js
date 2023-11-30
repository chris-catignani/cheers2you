import { setVenueName } from "./venueSlice"

export const setVenue = (venueName) => (dispatch, getState) => {
    const { venue: { knownVenueNames }} = getState()
    if (!(venueName in knownVenueNames)) {
        console.error(`unknown venue ${venueName}`)
        // TODO dispatch error
    }

    dispatch(setVenueName(venueName))
}
