import { createAsyncThunk } from "@reduxjs/toolkit"
import { pretendServerGetVenues } from "./thunksServer"

export const getVenues = createAsyncThunk(
    'search/getVenues',
    async () => {
        return await pretendServerGetVenues()
    }
)
