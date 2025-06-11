import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaExchangeAlt,
  FaLock,
  FaUsers,
  FaExclamationTriangle,
  FaBalanceScale,
  FaGavel,
  FaArrowLeft,
} from "react-icons/fa";

const TermOfUse = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 overflow-hidden relative">
      {/* Subtle animated background element */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black opacity-75 animate-pulse-slow"></div> */}

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
          Terms of Use
        </h1>

        <p className="text-gray-700 text-lg mb-4">
          Last Updated: July 24, 2024
        </p>

        <p className="text-gray-700 leading-relaxed text-base mb-8">
          Welcome to our Service. Please read these{" "}
          <strong className="font-semibold">Terms of Use</strong> carefully
          before using our website or services. By accessing or using any part
          of the site, you agree to be bound by these Terms of Use.
        </p>

        <section className="mb-10 p-6 rounded-lg bg-gray-100 animate-fade-in-up animation-delay-200 transition-all duration-300">
          <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
            <FaCheckCircle className="text-green-500 mr-3" /> 1. Acceptance of
            Terms
          </h2>
          <h3 className="text-xl font-semibold text-black mb-3">
            1.1. Agreement to Terms
          </h3>
          <p className="text-gray-700 leading-relaxed text-base mb-4">
            By accessing and using this website (the "Service"), you are
            formally accepting and agreeing to be bound by the terms and
            provisions of this agreement.
          </p>
          <h3 className="text-xl font-semibold text-black mb-3">
            1.2. Non-Acceptance
          </h3>
          <p className="text-gray-700 leading-relaxed text-base">
            If you do not agree to abide by these{" "}
            <strong className="font-semibold">Terms</strong>, please do not use
            this Service. Your continued use of this Service indicates your
            complete acceptance of these terms and any future revisions.
          </p>
        </section>
        <hr className="border-t border-gray-300 my-8" />

        <section className="mb-10 p-6 rounded-lg animate-fade-in-up animation-delay-400 transition-all duration-300">
          <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
            <FaExchangeAlt className="text-blue-500 mr-3" /> 2. Changes to Terms
          </h2>
          <h3 className="text-xl font-semibold text-black mb-3">
            2.1. Right to Modify
          </h3>
          <p className="text-gray-700 leading-relaxed text-base mb-4">
            We reserve the right to{" "}
            <strong className="font-semibold">modify these Terms</strong> at any
            time without prior notice. It is your responsibility to review these
            Terms periodically for changes, as they are binding on you.
          </p>
          <h3 className="text-xl font-semibold text-black mb-3">
            2.2. Acceptance of Changes
          </h3>
          <p className="text-gray-700 leading-relaxed text-base">
            Your{" "}
            <strong className="font-semibold">
              continued use of the Service
            </strong>{" "}
            after any such changes constitutes your acceptance of the new Terms
            of Use.
          </p>
        </section>
        <hr className="border-t border-gray-300 my-8" />

        <section className="mb-10 p-6 rounded-lg bg-gray-100 animate-fade-in-up animation-delay-600 transition-all duration-300">
          <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
            <FaLock className="text-purple-500 mr-3" /> 3. Privacy Policy
          </h2>
          <h3 className="text-xl font-semibold text-black mb-3">
            3.1. Integration with Terms
          </h3>
          <p className="text-gray-700 leading-relaxed text-base">
            Your use of the Service is also governed by our{" "}
            <strong className="font-semibold">Privacy Policy</strong>, which is
            incorporated into these Terms by this reference. Please review our{" "}
            <strong className="font-semibold">Privacy Policy</strong> to
            understand our practices regarding your personal data and how we
            protect your privacy.
          </p>
        </section>
        <hr className="border-t border-gray-300 my-8" />

        <section className="mb-10 p-6 rounded-lg animate-fade-in-up animation-delay-800 transition-all duration-300">
          <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
            <FaUsers className="text-orange-500 mr-3" /> 4. User Conduct
          </h2>
          <h3 className="text-xl font-semibold text-black mb-3">
            4.1. Lawful Use
          </h3>
          <p className="text-gray-700 leading-relaxed text-base mb-4">
            You agree to use the Service only for{" "}
            <strong className="font-semibold">lawful purposes</strong> and in a
            way that does not infringe the rights of, restrict, or inhibit
            anyone else's use and enjoyment of the Service.
          </p>
          <h3 className="text-xl font-semibold text-black mb-3">
            4.2. Prohibited Actions
          </h3>
          <p className="text-gray-700 leading-relaxed text-base">
            <strong className="font-semibold">Prohibited conduct</strong>{" "}
            includes harassing or causing distress or inconvenience to any other
            user, transmitting obscene or offensive content, or disrupting the
            normal flow of dialogue within the Service. Any unauthorized use may
            result in termination of your access.
          </p>
        </section>
        <hr className="border-t border-gray-300 my-8" />

        <section className="mb-10 p-6 rounded-lg bg-gray-100 animate-fade-in-up animation-delay-1000 transition-all duration-300">
          <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
            <FaExclamationTriangle className="text-red-500 mr-3" /> 5.
            Disclaimers
          </h2>
          <h3 className="text-xl font-semibold text-black mb-3">
            5.1. Service Provided "As Is"
          </h3>
          <p className="text-gray-700 leading-relaxed text-base mb-4">
            The Service and its content are provided{" "}
            <strong className="font-semibold">"as is"</strong> without any
            warranties of any kind, either express or implied. We do not
            guarantee the accuracy, completeness, or usefulness of this
            information.
          </p>
          <h3 className="text-xl font-semibold text-black mb-3">
            5.2. No Warranties
          </h3>
          <p className="text-gray-700 leading-relaxed text-base">
            This includes, but is not limited to, the implied warranties of{" "}
            <strong className="font-semibold">
              merchantability, fitness for a particular purpose, or
              non-infringement
            </strong>
            . Your reliance on any information provided by the Service is solely
            at your own risk.
          </p>
        </section>
        <hr className="border-t border-gray-300 my-8" />

        <section className="mb-10 p-6 rounded-lg animate-fade-in-up animation-delay-1200 transition-all duration-300">
          <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
            <FaBalanceScale className="text-teal-500 mr-3" /> 6. Limitation of
            Liability
          </h2>
          <h3 className="text-xl font-semibold text-black mb-3">
            6.1. General Limitations
          </h3>
          <p className="text-gray-700 leading-relaxed text-base mb-4">
            In no event shall we be liable for any{" "}
            <strong className="font-semibold">
              direct, indirect, incidental, special, consequential, or exemplary
              damages
            </strong>
            , including but not limited to, damages for loss of profits,
            goodwill, use, data, or other intangible losses (even if we have
            been advised of the possibility of such damages), resulting from:
          </p>
          <ul className="list-disc list-inside ml-4 mt-2 text-gray-700 leading-relaxed text-base">
            <li className="mb-2">
              The use or the inability to use the service;
            </li>
            <li className="mb-2">
              The cost of procurement of substitute goods and services resulting
              from any goods, data, information, or services purchased or
              obtained or messages received or transactions entered into through
              or from the service;
            </li>
            <li className="mb-2">
              Unauthorized access to or alteration of your transmissions or
              data;
            </li>
            <li className="mb-2">
              Statements or conduct of any third party on the service; or
            </li>
            <li className="mb-2">Any other matter relating to the service.</li>
          </ul>
        </section>
        <hr className="border-t border-gray-300 my-8" />

        <section className="animate-fade-in-up p-6 rounded-lg bg-gray-100 animation-delay-1400 transition-all duration-300">
          <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
            <FaGavel className="text-gray-700 mr-3" /> 7. Governing Law
          </h2>
          <h3 className="text-xl font-semibold text-black mb-3">
            7.1. Applicable Law
          </h3>
          <p className="text-gray-700 leading-relaxed text-base mb-4">
            These Terms shall be governed by and construed in accordance with
            the laws of{" "}
            <strong className="font-semibold">[Your Country/State]</strong>,
            without regard to its conflict of law provisions. This ensures that
            disputes are resolved under a consistent legal framework.
          </p>
          <h3 className="text-xl font-semibold text-black mb-3">
            7.2. Jurisdiction
          </h3>
          <p className="text-gray-700 leading-relaxed text-base mt-2">
            Any disputes arising under or in connection with these Terms shall
            be subject to the{" "}
            <strong className="font-semibold">exclusive jurisdiction</strong> of
            the courts located in [Your City, Your Country/State].
          </p>
        </section>

        <p className="text-gray-700 text-lg mt-12 text-center font-semibold">
          Thank you for reviewing our Terms of Use. We appreciate your
          understanding and cooperation.
        </p>
      </div>
    </div>
  );
};

export default TermOfUse;
