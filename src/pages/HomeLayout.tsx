import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ScrollToTop } from "../components";

const HomeLayout = () => {
  return (
    <>
      <ScrollToTop />
      <Header />
      <div className="pt-24"></div>
      <Outlet />
      <Footer />
    </>
  );
};
export default HomeLayout;
