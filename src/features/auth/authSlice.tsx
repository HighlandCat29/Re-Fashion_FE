import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  role: {
    roleId: string;
    roleName: string;
  };
}

type AuthState = {
  loginStatus: boolean;
  user: User | null;
};

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
  user: (() => {
    try {
      const user = localStorage.getItem("user");
      if (!user) return null;
      return JSON.parse(user);
    } catch {
      return null;
    }
  })(),
};

export const authSlice = createSlice({
  name: "auth",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setLoginStatus: (state, action: PayloadAction<boolean>) => {
      state.loginStatus = action.payload;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.loginStatus = !!action.payload;
    },
  },
});

export const { setLoginStatus, setUser } = authSlice.actions;

export default authSlice.reducer;
