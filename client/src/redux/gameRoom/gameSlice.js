import { createSlice } from "@reduxjs/toolkit";

const gameSlice = createSlice({
  name: "gameRoom",
  initialState: {
    currentWord: "",
    lastAnswerCorrect: null,
  },
  reducers: {
    setCurrentWord(state, action) {
      state.currentWord = action.payload;
    },
    updateAnswerCorrectness(state, action) {
      state.lastAnswerCorrect = action.payload.isCorrect;
    },
  },
});

export const { setCurrentWord, updateAnswerCorrectness } = gameSlice.actions;

// Thunk action for checking answers
export const checkAnswer =
  (answer, client, username) => (dispatch, getState) => {
    const currentWord = getState().gameRoom.currentWord;
    const isCorrect = answer.toLowerCase() === currentWord.toLowerCase();

    dispatch(updateAnswerCorrectness({ isCorrect }));

    if (
      client &&
      client.readyState === WebSocket.OPEN &&
      answer.toLowerCase().length === currentWord.length
    ) {
      client.send(
        JSON.stringify({
          type: "checkAnswer",
          message: answer.toLowerCase(),
          user: username,
        })
      );
    }
  };

export default gameSlice.reducer;
