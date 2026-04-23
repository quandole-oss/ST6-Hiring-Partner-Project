import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { commitsApi } from "./commitsApi";

/**
 * Redux Toolkit store for the weekly-commit-module frontend.
 *
 * Currently hosts a single RTK Query slice (commitsApi). It runs alongside
 * the TanStack Query data layer in src/api/*.ts; no duplication of state.
 * See DECISIONS.md for the migration strategy.
 */
export const store = configureStore({
  reducer: {
    [commitsApi.reducerPath]: commitsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(commitsApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
