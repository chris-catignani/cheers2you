import { getFromSessionStorage, setInSessionStorage } from '@/lib/utils/sessionStorage';
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isChallengeMode: getFromSessionStorage('challengeMode.isChallangeMode', false),
    challengeModeSpinCount: getFromSessionStorage('challengeMode.challengeModeSpinCount', 0),
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
        setChallengeModeSpinCount: (state, action) => {
            state.challengeModeSpinCount = action.payload
            setInSessionStorage('challengeMode.challengeModeSpinCount', action.payload)
        },
        setIsChallengeModeExplainerDisplayed: (state, action) => {
            state.isChallengeModeExplainerDisplayed = action.payload
        },

    }
});

export const { setIsChallengeMode, incrementChallengeModeSpinCount, setChallengeModeSpinCount, setIsChallengeModeExplainerDisplayed } = challengeModeSlice.actions;

export default challengeModeSlice.reducer;
