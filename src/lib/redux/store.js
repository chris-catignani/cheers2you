/* Core */
import { configureStore } from '@reduxjs/toolkit'

/* Instruments */
import { reducer } from './rootReducer'

export const reduxStore = configureStore({
  reducer,
})
