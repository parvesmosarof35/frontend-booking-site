import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  cartDrawerOpen: boolean;
  mobileMenuOpen: boolean;
}

const initialState: UiState = {
  cartDrawerOpen: false,
  mobileMenuOpen: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCartDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.cartDrawerOpen = action.payload;
    },
    toggleCartDrawer: (state) => {
      state.cartDrawerOpen = !state.cartDrawerOpen;
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
  },
});

export const {
  setCartDrawerOpen,
  toggleCartDrawer,
  setMobileMenuOpen,
  toggleMobileMenu,
} = uiSlice.actions;

export default uiSlice.reducer;
