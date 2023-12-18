import { getFromSessionStorage, setInSessionStorage } from '@/lib/utils/sessionStorage';
import { createSlice } from '@reduxjs/toolkit';
import { generateBeerBanner } from '../beersSlice';

const initialState = {
    isChallengeMode: getFromSessionStorage('challengeMode.isChallangeMode', "false") === "true",
    challengeModeSpinCount: parseInt(getFromSessionStorage('challengeMode.challengeModeSpinCount', "0")),
    isChallengeModeExplainerDisplayed: false,
};

export const challengeModeSlice = createSlice({
    name: 'challengeMode',
    initialState,
    reducers: {
        setIsChallengeMode: (state, action) => {
            state.isChallengeMode = action.payload
            setInSessionStorage('challengeMode.isChallangeMode', action.payload)
        },
        incrementChallengeModeSpinCount: (state, action) => {
            state.challengeModeSpinCount = state.challengeModeSpinCount + 1
            setInSessionStorage('challengeMode.challengeModeSpinCount', state.challengeModeSpinCount)
        },
        setIsChallengeModeExplainerDisplayed: (state, action) => {
            state.isChallengeModeExplainerDisplayed = action.payload
        },
    },
    extraReducers: (builder) => {
        builder.addCase(generateBeerBanner.fulfilled, (state) => {
            state.isChallengeMode = false
            setInSessionStorage('challengeMode.isChallangeMode', false)
            
            state.challengeModeSpinCount = 0
            setInSessionStorage('challengeMode.challengeModeSpinCount', 0)
        })
    }
});

export const { setIsChallengeMode, incrementChallengeModeSpinCount, setIsChallengeModeExplainerDisplayed } = challengeModeSlice.actions;

export default challengeModeSlice.reducer;
