import { createSlice, current } from "@reduxjs/toolkit";

const gameSlice = createSlice({
  name: "gameRoom",
  initialState: {
    currentGame: "",
    currentWord: "",
    currentClue: "",
    targetNumber: "",
    roundWinner: "",
    roundStatus: "",
    playerCount: 0,
    messages: [],
  },
  reducers: {
    setCurrentGame(state, action) {
      state.currentGame = action.payload;
    },
    setCurrentWord(state, action) {
      state.currentWord = action.payload;
    },
    setCurrentClue(state, action) {
      state.currentClue = action.payload;
    },
    setTargetNumber(state, action) {
      state.targetNumber = action.payload;
    },
    setRoundWinner(state, action) {
      state.roundWinner = action.payload;
    },
    setRoundStatus(state, action) {
      state.roundStatus = action.payload;
    },
    setPlayerCount(state, action) {
      state.playerCount = action.payload;
    },
    setMessages(state, action) {
      state.messages = [
        ...state.messages,
        { message: action.payload.message, user: action.payload.user },
      ];
    },
  },
});

export const {
  setCurrentGame,
  setCurrentWord,
  setCurrentClue,
  setTargetNumber,
  setRoundWinner,
  setRoundStatus,
  setPlayerCount,
  setMessages,
} = gameSlice.actions;

// Thunk action for checking answers
export const checkAnswer =
  (answer, client, username) => (dispatch, getState) => {
    const currentWord = getState().gameRoom.currentWord;

    // const isCorrect = answer.toLowerCase() === currentWord.toLowerCase();

    // dispatch(updateAnswerCorrectness({ isCorrect }));

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
