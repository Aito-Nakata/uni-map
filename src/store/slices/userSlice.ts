import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types';

interface UserState {
  user: User | null;
  favorites: string[];
  isAuthenticated: boolean;
}

const initialState: UserState = {
  user: null,
  favorites: [],
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.favorites = action.payload.favorites;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.user = null;
      state.favorites = [];
      state.isAuthenticated = false;
    },
    addFavorite: (state, action: PayloadAction<string>) => {
      const storeId = action.payload;
      if (!state.favorites.includes(storeId)) {
        state.favorites.push(storeId);
        if (state.user) {
          state.user.favorites.push(storeId);
        }
      }
    },
    removeFavorite: (state, action: PayloadAction<string>) => {
      const storeId = action.payload;
      state.favorites = state.favorites.filter(id => id !== storeId);
      if (state.user) {
        state.user.favorites = state.user.favorites.filter(id => id !== storeId);
      }
    },
    incrementContributions: (state) => {
      if (state.user) {
        state.user.contributions += 1;
      }
    },
  },
});

export const {
  setUser,
  clearUser,
  addFavorite,
  removeFavorite,
  incrementContributions,
} = userSlice.actions;

export default userSlice.reducer;