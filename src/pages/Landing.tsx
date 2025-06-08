// src/pages/Landing.tsx

import React from "react";
import { Banner, HomeCollectionSection, BlogSection, CategoriesSection } from "../components";

const Landing: React.FC = () => {
  return (
    <>
      <Banner />
      <HomeCollectionSection />
      <BlogSection />        {/* <-- new blog section inserted here */}
      <CategoriesSection />
    </>
  );
};

export default Landing;
