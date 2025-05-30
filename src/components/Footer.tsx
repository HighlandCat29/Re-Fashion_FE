import SocialMediaFooter from "./SocialMediaFooter";
import { HiChevronDown } from "react-icons/hi2";
import { useState } from "react";
import { useLocation } from "react-router-dom";

const Footer = () => {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const location = useLocation();

  // Hide footer on /admin route
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  const toggleLanguageDropdown = () => {
    setIsLanguageOpen(!isLanguageOpen);
  };

  return (
    <>
      <SocialMediaFooter />
      <footer className="max-w-screen-2xl mx-auto bg-gray-50 px-6 py-12 border-t-4 border-secondaryBrown max-[400px]:px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center mb-16 max-[800px]:gap-8">
          <div className="flex flex-col gap-3">
            <h3 className="text-2xl font-semibold text-gray-800 max-sm:text-xl">
              Client Service
            </h3>
            <ul className="flex flex-col gap-2 text-lg text-gray-600 max-sm:text-base">
              <li className="hover:text-secondaryBrown transition-colors cursor-pointer">
                After-sale Service
              </li>
              <li className="hover:text-secondaryBrown transition-colors cursor-pointer">
                Free Insurance
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-2xl font-semibold text-gray-800 max-sm:text-xl">
              Our Brand
            </h3>
            <ul className="flex flex-col gap-2 text-lg text-gray-600 max-sm:text-base">
              <li className="hover:text-secondaryBrown transition-colors cursor-pointer">
                The Company
              </li>
              <li className="hover:text-secondaryBrown transition-colors cursor-pointer">
                The Excellence
              </li>
              <li className="hover:text-secondaryBrown transition-colors cursor-pointer">
                International Awards
              </li>
              <li className="hover:text-secondaryBrown transition-colors cursor-pointer">
                Our Story
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-2xl font-semibold text-gray-800 max-sm:text-xl">
              Luxury Clothing
            </h3>
            <ul className="flex flex-col gap-2 text-lg text-gray-600 max-sm:text-base">
              <li className="hover:text-secondaryBrown transition-colors cursor-pointer">
                Special Edition
              </li>
              <li className="hover:text-secondaryBrown transition-colors cursor-pointer">
                Summer Edition
              </li>
              <li className="hover:text-secondaryBrown transition-colors cursor-pointer">
                Unique Collection
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-8 items-center">
          {/* Brand Name */}
          <h2 className="text-5xl font-light text-center max-sm:text-4xl">
            <span className="text-sky-500 font-bold">Re</span>
            <span className="text-orange-400 font-bold">fa</span>
            <span className="text-lime-400 font-bold">shion</span>
            <p className="text-xl font-semibold text-amber-900 mt-2 max-sm:text-lg">
              From student for student
            </p>
          </h2>

          {/* Copyright and Policies */}
          <p className="text-base text-gray-600 max-sm:text-sm">
            All rights reserved ©2024
          </p>
          <ul className="flex justify-center items-center gap-6 text-base text-gray-600 max-sm:text-sm max-[350px]:flex-col max-[350px]:gap-4">
            <li className="hover:text-secondaryBrown transition-colors cursor-pointer">
              Cookie Policy
            </li>
            <li className="hover:text-secondaryBrown transition-colors cursor-pointer">
              Privacy Policy
            </li>
            <li className="hover:text-secondaryBrown transition-colors cursor-pointer">
              Legal Notes
            </li>
          </ul>
        </div>
      </footer>
    </>
  );
};

export default Footer;
