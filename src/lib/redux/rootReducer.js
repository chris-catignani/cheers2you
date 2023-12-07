import { beersSlice, challengeModeSlice, searchSlice } from './slices'

export const reducer = {
  beers: beersSlice.reducer,
  challengeMode: challengeModeSlice.reducer,
  search: searchSlice.reducer,
}
