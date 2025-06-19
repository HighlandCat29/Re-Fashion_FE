import React from "react";
import { Link } from "react-router-dom";
// import { HiOutlineMail } from "react-icons/hi";
import toast from "react-hot-toast";

const CheckEmail = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 text-center">
        <div className="mb-6 flex justify-center">
          <img
            src="src\assets\mail-animation.gif"
            alt="Mail Animation"
            className="w-24 h-24 object-contain"
          />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-3">
          Check Your Email
        </h2>
        <p className="text-gray-600 mb-6 text-lg">
          We have sent a verification link to your email address. Please check
          your inbox (and spam folder) to activate your account.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          If you don't receive an email within a few minutes, please:
        </p>
        <div className="flex flex-col space-y-4">
          <button
            onClick={() =>
              toast.success("Resend email functionality to be implemented.")
            }
            className="bg-black hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md"
          >
            Resend Verification Email
          </button>
          <Link
            to="/login"
            className="text-gray-600 hover:text-gray-800 font-medium text-base"
          >
            Back to Login
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            Still having trouble?{" "}
            <Link to="/contact" className="text-black hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckEmail;
