import { createSlice } from '@reduxjs/toolkit';

const gameSlice = createSlice({
    name: 'gameRoom',
    initialState: {
        currentWord: '',
        lastAnswerCorrect: null,
    },
    reducers: {
        setCurrentWord(state, action) {
            state.currentWord = action.payload;
        },
        checkAnswer(state, action) {
            const isCorrect = action.payload.answer.toLowerCase() === state.currentWord.toLowerCase();
            state.lastAnswerCorrect = isCorrect;
        },
        // Add other reducers here as needed
    }
});

export const { setCurrentWord, checkAnswer } = gameSlice.actions;
export default gameSlice.reducer;
