import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  imageUrl?: string;
  qty: number;
  category?: string;
}

interface CartState {
  items: CartItem[];
  appliedPromo: {
    code: string;
    discountType: 'percentage' | 'flat';
    value: number;
  } | null;
  deliveryCharge: number;
}

const initialState: CartState = {
  items: [],
  appliedPromo: null,
  deliveryCharge: 60,
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Omit<CartItem, 'qty'>>) => {
      const existing = state.items.find(
        (i) => i.menuItemId === action.payload.menuItemId,
      );
      if (existing) {
        existing.qty += 1;
      } else {
        state.items.push({ ...action.payload, qty: 1 });
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.menuItemId !== action.payload);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ menuItemId: string; qty: number }>,
    ) => {
      const item = state.items.find(
        (i) => i.menuItemId === action.payload.menuItemId,
      );
      if (item) {
        if (action.payload.qty <= 0) {
          state.items = state.items.filter(
            (i) => i.menuItemId !== action.payload.menuItemId,
          );
        } else {
          item.qty = action.payload.qty;
        }
      }
    },
    applyPromo: (
      state,
      action: PayloadAction<{
        code: string;
        discountType: 'percentage' | 'flat';
        value: number;
      }>,
    ) => {
      state.appliedPromo = action.payload;
    },
    removePromo: (state) => {
      state.appliedPromo = null;
    },
    setDeliveryCharge: (state, action: PayloadAction<number>) => {
      state.deliveryCharge = action.payload;
    },
    clearCart: (state) => {
      state.items = [];
      state.appliedPromo = null;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  applyPromo,
  removePromo,
  setDeliveryCharge,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
