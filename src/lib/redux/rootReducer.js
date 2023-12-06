import { beersSlice, challengeModeSlice, searchSlice, venueSlice } from './slices'

export const reducer = {
  beers: beersSlice.reducer,
  challengeMode: challengeModeSlice.reducer,
  search: searchSlice.reducer,
  venue: venueSlice.reducer,
}
