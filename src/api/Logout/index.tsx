import customFetch from "../../axios/custom";
import { toast } from "react-hot-toast";
import { store } from "../../store";
import { setUser } from "../../features/auth/authSlice";

export const logout = async (navigate: (path: string) => void) => {
  try {
    // Send logout request (token will be sent via interceptor if configured)
    await customFetch.post("/auth/logout");

    // Clear localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");

    // Update Redux state
    store.dispatch(setUser(null));

    // Redirect to login page
    toast.success("Logged out successfully");
    navigate("/login");
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";
    toast.error("Logout failed: " + errorMessage);
  }
};
