import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AuthState = {
  loginStatus: boolean;
};


const getUserFromStorage = (): boolean => {
  try {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return false;

    const parsedUser = JSON.parse(storedUser);

    // Check that 'id' exists and is not undefined/null/empty
    return Boolean(parsedUser && parsedUser.id);
  } catch (error) {
    console.error("Invalid JSON in localStorage 'user':", error);
    return false;
  }
};

const initialState: AuthState = {
  loginStatus: getUserFromStorage(),
};
export const authSlice = createSlice({
  name: "auth",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setLoginStatus: (state, action: PayloadAction<boolean>) => {
      state.loginStatus = action.payload;

    },
  },
});

export const { setLoginStatus } = authSlice.actions;

export default authSlice.reducer;
