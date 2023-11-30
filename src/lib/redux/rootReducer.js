import { beersSlice, searchSlice, venueSlice } from './slices'

export const reducer = {
  beers: beersSlice.reducer,
  search: searchSlice.reducer,
  venue: venueSlice.reducer,
}
