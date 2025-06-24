import { toast } from "react-hot-toast";

export const ADMIN_USER_ID = "897c3620-37f7-42d9-b7e0-201981c18b56";

export const handleTokenExpiration = () => {
  // Clear auth data
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");

  // Show notification
  toast.error("Your session has expired. Please login again.");

  // Redirect to login page
  window.location.href = "/login";
};

export const isTokenExpired = (token: string): boolean => {
  try {
    // Decode the token
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    const { exp } = JSON.parse(jsonPayload);

    // Check if token is expired
    return exp * 1000 < Date.now();
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true; // If there's an error parsing the token, consider it expired
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("authToken");
  const user = localStorage.getItem("user");

  if (!token || !user) return false;

  // Check if token is expired
  return !isTokenExpired(token);
};

// Get current user data
export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

// Handle unauthorized access
export const handleUnauthorized = (redirectUrl?: string) => {
  // Store the attempted URL for redirecting after login
  if (redirectUrl) {
    localStorage.setItem("redirectUrl", redirectUrl);
  }

  // Show notification
  toast.error("Please login to access this page");

  // Redirect to login
  window.location.href = "/login";
};
