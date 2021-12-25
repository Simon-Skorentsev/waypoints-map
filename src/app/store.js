import { configureStore } from '@reduxjs/toolkit';
import mapSlice from '../features/map/mapSlice';

export const store = configureStore({
  reducer: {
    mapSlice
  }
});
