import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AuthState = {
  loginStatus: boolean;
};

<<<<<<< HEAD

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
=======
const initialState: AuthState = {
  loginStatus: (() => {
    try {
      const user = localStorage.getItem("user");
      if (!user) return false;
      const parsedUser = JSON.parse(user);
      return !!parsedUser?.id;
    } catch {
      return false;
    }
  })(),
>>>>>>> c7c3f1f18b9c9f81a610d74556076dd9515259c8
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
