import customFetch from "../../axios/custom";
import { toast } from "react-hot-toast";
import { store } from "../../store";
import { setLoginStatus } from "../../features/auth/authSlice";

export const logout = async (navigate: (path: string) => void) => {
  try {
    // Gửi yêu cầu logout (token sẽ được gửi thông qua interceptor nếu bạn cấu hình)
    await customFetch.post("/auth/logout");

    // Xoá localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");

    // Cập nhật Redux state
    store.dispatch(setLoginStatus(false));

    // Chuyển hướng về trang đăng nhập
    toast.success("Logged out successfully");
    navigate("/login");
  } catch (error: any) {
    toast.error(
      "Logout failed: " + (error.response?.data?.message || error.message)
    );
  }
};
