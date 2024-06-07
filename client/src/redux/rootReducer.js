import { combineReducers } from '@reduxjs/toolkit';
// import authReducer from './slices/authSlice';
// import profileReducer from './slices/profileSlice';
import gameReducer from './gameRoom/gameSlice';
// Import other reducers as needed

const rootReducer = combineReducers({
    // auth: authReducer,
    // profile: profileReducer,
    game: gameReducer
    // Add other reducers here
});

export default rootReducer;
