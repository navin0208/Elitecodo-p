// store.js
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import questionSlice from './questionSlice'; // Import the reducer, not the slice
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Combine all reducers
const reducer = combineReducers({
  question: questionSlice.reducer, // Use the reducer directly
  // Add other reducers here if needed
  // images: imageReducer,
  // fileimages: fileImageReducer,
  // ...
});

// Persist configuration
const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  blacklist: [], // Add slice names you don't want to persist
};

// Apply persistence to the combined reducer
const persistedReducer = persistReducer(persistConfig, reducer);

// Create the store with the persisted reducer
const store = configureStore({
  reducer: persistedReducer,
});

export default store;
