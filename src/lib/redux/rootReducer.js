import { beersSlice, searchSlice } from './slices'

export const reducer = {
  beers: beersSlice.reducer,
  search: searchSlice.reducer,
}
