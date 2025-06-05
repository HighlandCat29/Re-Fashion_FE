import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "../../api/Products";

type ShopState = {
  totalProducts: number;
  showingProducts: number;
  products: Product[];
};

const initialState: ShopState = {
  totalProducts: 0,
  showingProducts: 0,
  products: [],
};

export const shopSlice = createSlice({
  name: "shop",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setTotalProducts: (state, action: PayloadAction<number>) => {
      state.totalProducts = action.payload;
    },
    setShowingProducts: (state, action: PayloadAction<number>) => {
      state.showingProducts = action.payload;
    },
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
  },
});

export const { setTotalProducts, setShowingProducts, setProducts } =
  shopSlice.actions;

export default shopSlice.reducer;
