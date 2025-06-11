import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaShieldAlt,
  FaDatabase,
  FaUserShield,
  FaCookie,
  FaLock,
  FaEye,
  FaTrash,
  FaArrowLeft,
} from "react-icons/fa";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 overflow-hidden relative">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-xl p-8 md:p-12 mt-8 mb-8 relative z-10 animate-fade-in-up">
        {/* Return Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <FaArrowLeft />
          <span>Return to previous page</span>
        </button>

        <h1 className="text-4xl font-extrabold text-black mb-6 border-b-2 border-gray-700 pb-3">
          Privacy Policy
        </h1>

        <p className="text-gray-700 text-lg mb-4">
          Last Updated: July 24, 2024
        </p>

        <p className="text-gray-700 leading-relaxed text-base mb-8">
          Welcome to our Privacy Policy. This document explains how we collect,
          use, and protect your personal information when you use our website
          and services. Your privacy is important to us, and we are committed to
          protecting your personal data.
        </p>

        <section className="mb-10 p-6 rounded-lg bg-gray-100 animate-fade-in-up animation-delay-200 transition-all duration-300">
          <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
            <FaShieldAlt className="text-blue-500 mr-3" /> 1. Information We
            Collect
          </h2>
          <h3 className="text-xl font-semibold text-black mb-3">
            1.1. Personal Information
          </h3>
          <p className="text-gray-700 leading-relaxed text-base mb-4">
            We collect information that you provide directly to us, including
            but not limited to:
          </p>
          <ul className="list-disc list-inside ml-4 mt-2 text-gray-700 leading-relaxed text-base">
            <li className="mb-2">Name and contact information</li>
            <li className="mb-2">Email address</li>
            <li className="mb-2">Shipping and billing addresses</li>
            <li className="mb-2">Payment information</li>
            <li className="mb-2">Account credentials</li>
          </ul>
        </section>
        <hr className="border-t border-gray-300 my-8" />

        <section className="mb-10 p-6 rounded-lg animate-fade-in-up animation-delay-400 transition-all duration-300">
          <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
            <FaDatabase className="text-green-500 mr-3" /> 2. How We Use Your
            Information
          </h2>
          <h3 className="text-xl font-semibold text-black mb-3">
            2.1. Purpose of Data Collection
          </h3>
          <p className="text-gray-700 leading-relaxed text-base mb-4">
            We use the collected information for various purposes:
          </p>
          <ul className="list-disc list-inside ml-4 mt-2 text-gray-700 leading-relaxed text-base">
            <li className="mb-2">To provide and maintain our services</li>
            <li className="mb-2">To process your transactions</li>
            <li className="mb-2">To communicate with you about your account</li>
            <li className="mb-2">
              To send you marketing communications (with your consent)
            </li>
            <li className="mb-2">To improve our services</li>
          </ul>
        </section>
        <hr className="border-t border-gray-300 my-8" />

        <section className="mb-10 p-6 rounded-lg bg-gray-100 animate-fade-in-up animation-delay-600 transition-all duration-300">
          <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
            <FaUserShield className="text-purple-500 mr-3" /> 3. Data Protection
          </h2>
          <h3 className="text-xl font-semibold text-black mb-3">
            3.1. Security Measures
          </h3>
          <p className="text-gray-700 leading-relaxed text-base">
            We implement appropriate technical and organizational measures to
            protect your personal data against unauthorized access, alteration,
            disclosure, or destruction. This includes:
          </p>
          <ul className="list-disc list-inside ml-4 mt-2 text-gray-700 leading-relaxed text-base">
            <li className="mb-2">Encryption of sensitive data</li>
            <li className="mb-2">Regular security assessments</li>
            <li className="mb-2">Access controls and authentication</li>
            <li className="mb-2">Secure data storage systems</li>
          </ul>
        </section>
        <hr className="border-t border-gray-300 my-8" />

        <section className="mb-10 p-6 rounded-lg animate-fade-in-up animation-delay-800 transition-all duration-300">
          <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
            <FaCookie className="text-orange-500 mr-3" /> 4. Cookies and
            Tracking
          </h2>
          <h3 className="text-xl font-semibold text-black mb-3">
            4.1. Cookie Usage
          </h3>
          <p className="text-gray-700 leading-relaxed text-base">
            We use cookies and similar tracking technologies to track activity
            on our website and hold certain information. Cookies are files with
            a small amount of data that may include an anonymous unique
            identifier. You can instruct your browser to refuse all cookies or
            to indicate when a cookie is being sent.
          </p>
        </section>
        <hr className="border-t border-gray-300 my-8" />

        <section className="mb-10 p-6 rounded-lg bg-gray-100 animate-fade-in-up animation-delay-1000 transition-all duration-300">
          <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
            <FaLock className="text-red-500 mr-3" /> 5. Data Sharing
          </h2>
          <h3 className="text-xl font-semibold text-black mb-3">
            5.1. Third-Party Sharing
          </h3>
          <p className="text-gray-700 leading-relaxed text-base">
            We may share your information with third parties in the following
            circumstances:
          </p>
          <ul className="list-disc list-inside ml-4 mt-2 text-gray-700 leading-relaxed text-base">
            <li className="mb-2">
              With service providers who assist in our operations
            </li>
            <li className="mb-2">To comply with legal obligations</li>
            <li className="mb-2">To protect our rights and property</li>
            <li className="mb-2">With your explicit consent</li>
          </ul>
        </section>
        <hr className="border-t border-gray-300 my-8" />

        <section className="mb-10 p-6 rounded-lg animate-fade-in-up animation-delay-1200 transition-all duration-300">
          <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
            <FaEye className="text-teal-500 mr-3" /> 6. Your Rights
          </h2>
          <h3 className="text-xl font-semibold text-black mb-3">
            6.1. Data Subject Rights
          </h3>
          <p className="text-gray-700 leading-relaxed text-base">
            You have the right to:
          </p>
          <ul className="list-disc list-inside ml-4 mt-2 text-gray-700 leading-relaxed text-base">
            <li className="mb-2">Access your personal data</li>
            <li className="mb-2">Correct inaccurate data</li>
            <li className="mb-2">Request deletion of your data</li>
            <li className="mb-2">Object to data processing</li>
            <li className="mb-2">Data portability</li>
          </ul>
        </section>
        <hr className="border-t border-gray-300 my-8" />

        <section className="animate-fade-in-up p-6 rounded-lg bg-gray-100 animation-delay-1400 transition-all duration-300">
          <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
            <FaTrash className="text-gray-700 mr-3" /> 7. Data Retention
          </h2>
          <h3 className="text-xl font-semibold text-black mb-3">
            7.1. Retention Period
          </h3>
          <p className="text-gray-700 leading-relaxed text-base">
            We retain your personal data only for as long as necessary to
            fulfill the purposes for which it was collected, including legal,
            accounting, or reporting requirements. When we no longer need your
            personal data, we will securely delete or anonymize it.
          </p>
        </section>

        <p className="text-gray-700 text-lg mt-12 text-center font-semibold">
          Thank you for reviewing our Privacy Policy. If you have any questions
          about how we handle your data, please contact us.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
