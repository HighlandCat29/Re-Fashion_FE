import { HiBars3 } from "react-icons/hi2";
import { HiOutlineUser } from "react-icons/hi2";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { Link } from "react-router-dom";
import SidebarMenu from "./SidebarMenu";
import { useState } from "react";
import RefashionIcon from '../assets/Refashion_icon.png';





const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <>
      <header className="max-w-screen-2xl flex text-center justify-between items-center py-4 px-5 text-black mx-auto max-sm:px-5 max-[400px]:px-3">
        <HiBars3 className="text-2xl max-sm:text-xl mr-20 max-lg:mr-0 cursor-pointer" onClick={() => setIsSidebarOpen(true)} />
        <Link
          to="/"
          className="flex items-center gap-2 text-6xl font-light tracking-[1.08px] max-sm:text-3xl max-[400px]:text-2xl"
        >
          <img
            src={RefashionIcon}
            alt="Refashion Logo"
            className="w-32 h-32 object-contain max-sm:w-16 max-sm:h-16"
          />
          <div>
            <span className="text-sky-500 font-bold">Re</span>
            <span className="text-orange-400 font-bold">fa</span>
            <span className="text-lime-400 font-bold">shion</span>
            <p className="flex items-start text-xl font-bold text-amber-900 max-sm:text-lr pl-[4px]">
              From student for student
            </p>
          </div>
        </Link>


        <div className="flex gap-4 items-center max-sm:gap-2">
          <Link to="/search">
            <HiOutlineMagnifyingGlass className="text-4xl max-sm:text-2xl" />
          </Link>
          <Link to="/login">
            <HiOutlineUser className="text-4xl max-sm:text-2xl" />
          </Link>
          <Link to="/cart">
            <HiOutlineShoppingBag className="text-4xl max-sm:text-2xl" />
          </Link>
        </div>

      </header>
      <SidebarMenu isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
    </>
  );
};
export default Header;
