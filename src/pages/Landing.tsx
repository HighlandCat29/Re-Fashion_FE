// src/pages/Landing.tsx

import React from "react";
import {
  Banner,
  HomeCollectionSection,
  CategoriesSection,
  FeaturedProductsSection,
} from "../components";

const Landing: React.FC = () => {
  return (
    <>
      <Banner />
      <FeaturedProductsSection />
      <HomeCollectionSection />
      <CategoriesSection />
    </>
  );
};

export default Landing;
