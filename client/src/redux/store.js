import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer'; // Updated path

const store = configureStore({
    reducer: rootReducer,
});

export default store;
