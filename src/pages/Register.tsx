// src/pages/Register.tsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import customFetch from "../axios/custom";

const checkRegisterFormData = (data: Record<string, string>) => {
  const {
    username,
    email,
    password,
    confirmPassword,
    fullName,
    phoneNumber,
    address,
    roleId,
  } = data;

  if (
    !username ||
    !email ||
    !password ||
    !confirmPassword ||
    !fullName ||
    !phoneNumber ||
    !address ||
    !roleId
  ) {
    toast.error("Please fill in all fields");
    return false;
  }

  if (password !== confirmPassword) {
    toast.error("Passwords do not match");
    return false;
  }

  return true;
};

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData) as Record<string, string>;

    if (!checkRegisterFormData(data)) return;

    setLoading(true);

    try {
      const response = await customFetch.post("/users", {
        username: data.username,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        address: data.address,
        roleId: String(data.roleId),
      });

      if (response.status === 201) {
        toast.success("User registered successfully");
        navigate("/login");
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error("User with this email already exists");
      } else {
        toast.error(
          "Server error: " + (error.response?.data?.message || error.message)
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        min-h-screen flex items-center justify-center
        bg-[url('/textures/subtle-paper-256.png')] bg-repeat
      "
    >
      <div className="max-w-md w-full px-4">
        {/* Card container */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <form
            onSubmit={handleRegister}
            className="px-8 py-10 flex flex-col gap-6"
          >
            {/* Heading */}
            <h2 className="text-2xl font-semibold text-center text-gray-800">
              Create an Account
            </h2>

            {/* Username */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="username"
                className="text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Enter username"
                className="
                  w-full rounded-xl border border-gray-300
                  px-4 py-3 text-base text-gray-800
                  focus:outline-none focus:ring-2 focus:ring-gray-200 transition
                "
                required
              />
            </div>

            {/* Full Name */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="fullName"
                className="text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Enter full name"
                className="
                  w-full rounded-xl border border-gray-300
                  px-4 py-3 text-base text-gray-800
                  focus:outline-none focus:ring-2 focus:ring-gray-200 transition
                "
                required
              />
            </div>

            {/* Phone Number */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="phoneNumber"
                className="text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                placeholder="Enter phone number"
                className="
                  w-full rounded-xl border border-gray-300
                  px-4 py-3 text-base text-gray-800
                  focus:outline-none focus:ring-2 focus:ring-gray-200 transition
                "
                required
              />
            </div>

            {/* Address */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="address"
                className="text-sm font-medium text-gray-700"
              >
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                placeholder="Enter address"
                className="
                  w-full rounded-xl border border-gray-300
                  px-4 py-3 text-base text-gray-800
                  focus:outline-none focus:ring-2 focus:ring-gray-200 transition
                "
                required
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email
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

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
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
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm password"
                className="
                  w-full rounded-xl border border-gray-300
                  px-4 py-3 text-base text-gray-800
                  focus:outline-none focus:ring-2 focus:ring-gray-200 transition
                "
                required
              />
            </div>

            {/* Role Select */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="roleId"
                className="text-sm font-medium text-gray-700"
              >
                Role
              </label>
              <select
                id="roleId"
                name="roleId"
                defaultValue="2"
                className="
                  w-full rounded-xl border border-gray-300
                  px-4 py-3 text-base text-gray-800
                  focus:outline-none focus:ring-2 focus:ring-gray-200 transition
                "
                required
              >
                <option value="2">Buyer</option>
                <option value="3">Seller</option>
              </select>
            </div>

            {/* Register Button (black pill‐shaped) */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full bg-black text-white text-lg font-medium
                py-3 rounded-full hover:bg-gray-900 transition
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {loading ? "Registering..." : "Register"}
            </button>

            {/* Already have an account? */}
            <p className="text-center text-gray-600 text-base">
              Already have an account?{" "}
              <Link
                to="/login"
                className="underline text-gray-800 hover:text-gray-900 transition"
              >
                Login now
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
