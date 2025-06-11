// src/pages/Register.tsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import customFetch from "../../axios/custom";
import { AxiosError } from "axios";
import { CLOUDINARY_UPLOAD_URL, UPLOAD_PRESET } from "../../config/cloudinary";

const checkRegisterFormData = (data: Record<string, string>) => {
  const {
    username,
    email,
    password,
    confirmPassword,
    fullName,
    phoneNumber,
    address,
  } = data;

  if (
    !username ||
    !email ||
    !password ||
    !confirmPassword ||
    !fullName ||
    !phoneNumber ||
    !address
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const uploadImageToCloudinary = async (
    file: File
  ): Promise<string | null> => {
    setUploadingImage(true);
    try {
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append("file", file);
      cloudinaryFormData.append("upload_preset", UPLOAD_PRESET);
      cloudinaryFormData.append("cloud_name", "dnrxylpid"); // Replace with your Cloudinary cloud name

      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: cloudinaryFormData,
      });

      const data = await response.json();

      if (data.secure_url) {
        toast.success("Image uploaded successfully!");
        return data.secure_url;
      } else {
        throw new Error(data.error?.message || "Failed to upload image");
      }
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      toast.error("Failed to upload image to Cloudinary.");
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData) as Record<string, string>;

    if (!checkRegisterFormData(data)) return;

    setLoading(true);

    let profilePictureUrl = "";
    if (selectedFile) {
      const uploadedUrl = await uploadImageToCloudinary(selectedFile);
      if (uploadedUrl) {
        profilePictureUrl = uploadedUrl;
      } else {
        toast.error("Failed to upload profile picture. Please try again.");
        setLoading(false);
        return; // Stop registration if image upload fails
      }
    }

    try {
      const response = await customFetch.post("/users", {
        username: data.username,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        address: data.address,
        profilePicture: profilePictureUrl, // Add profile picture URL
        roleId: "2", // Automatically set role to User (ID 2)
      });

      if (response.status === 200 || response.status === 1000) {
        toast.success(
          "Registration successful! Please check your email to verify your account."
        );
        navigate("/check-email");
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 409) {
          toast.error("User with this email already exists");
        } else {
          toast.error(
            "Server error: " + (error.response?.data?.message || error.message)
          );
        }
      } else {
        toast.error("An unexpected error occurred.");
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

            {/* Profile Picture */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="profilePicture"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Profile Picture
              </label>
              <div className="flex items-center space-x-4">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border border-gray-300 bg-gray-100 flex items-center justify-center">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src="/default-avatar.png" // Default avatar placeholder
                      alt="Default Avatar"
                      className="w-full h-full object-cover text-gray-400"
                    />
                  )}
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  id="profilePicture"
                  name="profilePicture"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden" // Hide default input
                  disabled={uploadingImage}
                />
                <label
                  htmlFor="profilePicture"
                  className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Choose Image
                </label>
                {selectedFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="text-red-600 hover:text-red-800 font-medium ml-2"
                  >
                    Remove
                  </button>
                )}
              </div>
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

            {/* Register Button (black pill‐shaped) */}
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="
                w-full bg-black text-white text-lg font-medium
                py-3 rounded-full hover:bg-gray-900 transition
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {loading ? "Registering..." : "Register"}
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

            {/* "Already have an account" link */}
            <div className="flex justify-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="hover:underline text-gray-800 ml-1">
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
