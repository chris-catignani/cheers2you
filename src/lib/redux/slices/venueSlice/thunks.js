import { setVenueName } from "./venueSlice"

export const setVenue = (venueName) => (dispatch, getState) => {
    const { venue: { knownVenueNames }} = getState()
    if (!knownVenueNames.includes(venueName)) {
        console.error(`unknown venue ${venueName}. Known venues are ${knownVenueNames}`)
        // TODO dispatch error
    }

    dispatch(setVenueName(venueName))
}
