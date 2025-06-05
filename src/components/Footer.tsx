import SocialMediaFooter from "./SocialMediaFooter";
import { useLocation } from "react-router-dom";

const Footer = () => {
  const location = useLocation();

  // Hide footer on /admin route
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <SocialMediaFooter />
      <footer className="max-w-screen-2xl mx-auto bg-gray-50 px-6 py-12 border-t-4 border-secondaryBrown max-[400px]:px-4">
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
