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
      <CategoriesSection />
      <FeaturedProductsSection />
      <HomeCollectionSection />

    </>
  );
};

export default Landing;
