// src/pages/Login.tsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { checkLoginFormData } from "../../utils/checkLoginFormData";
import customFetch from "../../axios/custom";
import toast from "react-hot-toast";
import { setUser } from "../../features/auth/authSlice";
import { store } from "../../store";

const Login = () => {
  const navigate = useNavigate();

  // Local state to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    if (!checkLoginFormData(data)) return;

    try {
      const response = await customFetch.post("/auth/token", {
        email: data.email,
        password: data.password,
      });

      const { token, userId, role } = response.data.result;

      // Get complete user data
      const userResponse = await customFetch.get(`/users/${userId}`);
      const completeUserData = userResponse.data.result;

      // Save token + complete user data to localStorage
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(completeUserData));

      // Update Redux state
      store.dispatch(setUser(completeUserData));
      toast.success("You logged in successfully");

      // Redirect based on role
      if (role.roleId === "1") {
        navigate("/admin");
      } else {
        navigate("/user-profile");
      }
    } catch (error: unknown) {
      // Try to get a specific error message from the backend
      type ErrorWithResponse = { response?: { data?: { message?: string } } };
      const backendMessage = (error as ErrorWithResponse)?.response?.data
        ?.message;
      if (backendMessage === "User is not exist") {
        toast.error("Invalid email or password");
      } else if (backendMessage) {
        toast.error(backendMessage);
      } else if (error instanceof Error) {
        toast.error("Login failed: " + error.message);
      } else {
        toast.error("Login failed: An error occurred");
      }
    }
  };

  // If already logged in, redirect to home
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      toast.success("You are already logged in");
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/textures/subtle-paper-256.png')] bg-repeat">
      <div className="max-w-md w-full px-4">
        {/* Sign‐in card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <form
            onSubmit={handleLogin}
            className="px-8 py-10 flex flex-col gap-6"
          >
            {/* “Sign in” heading */}
            <h2 className="text-2xl font-semibold text-center text-gray-800">
              Sign in
            </h2>

            {/* Email input */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Your email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter email address"
                className="
                  w-full rounded-xl border border-gray-300 
                  px-4 py-3 text-base text-gray-800
                  focus:outline-none focus:ring-2 focus:ring-gray-200 transition
                "
                required
              />
            </div>

            {/* Password input with toggle */}
            <div className="flex flex-col gap-1 relative">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Your password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Enter password"
                className="
                  w-full rounded-xl border border-gray-300 
                  px-4 py-3 text-base text-gray-800
                  focus:outline-none focus:ring-2 focus:ring-gray-200 transition
                "
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-10 flex items-center gap-1 text-gray-600 hover:text-gray-800"
              >
                {showPassword ? (
                  <>
                    <HiOutlineEyeOff className="h-5 w-5" />
                    <span className="text-sm">Hide</span>
                  </>
                ) : (
                  <>
                    <HiOutlineEye className="h-5 w-5" />
                    <span className="text-sm">Show</span>
                  </>
                )}
              </button>
            </div>

            {/* “Log in” button */}
            <button
              type="submit"
              className="
                w-full bg-black text-white text-lg font-medium
                py-3 rounded-full hover:bg-gray-900 transition
              "
            >
              Log in
            </button>

            {/* Disclaimer with Terms / Privacy */}
            <p className="text-center text-xs text-gray-600">
              By continuing, you agree to the{" "}
              <Link to="/terms-of-use" className="underline text-gray-800">
                Terms of use
              </Link>{" "}
              and{" "}
              <Link to="/privacy-policy" className="underline text-gray-800">
                Privacy Policy
              </Link>
              .
            </p>

            {/* Two side‐by‐side links */}
            <div className="flex justify-between text-sm text-gray-600">
              <Link to="#" className="hover:underline">
                Other issue with sign in
              </Link>
              <Link to="#" className="hover:underline">
                Forget your password
              </Link>
            </div>
          </form>
        </div>

        {/* Divider with “New to our community” */}
        <div className="flex items-center my-8">
          <div className="flex-grow border-t border-gray-300" />
          <span className="px-4 text-sm text-gray-600">
            New to our community
          </span>
          <div className="flex-grow border-t border-gray-300" />
        </div>

        {/* “Create an account” outlined button */}
        <Link to="/register">
          <button
            type="button"
            className="
              w-full border-2 border-gray-800 text-gray-800 text-lg font-medium
              py-3 rounded-full hover:bg-gray-100 transition
            "
          >
            Create an account
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Login;
