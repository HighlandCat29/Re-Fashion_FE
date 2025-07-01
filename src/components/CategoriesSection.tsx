
// src/components/CategoriesSection.tsx

import React from "react";
import CategoryItem from "./CategoryItem";

// Static imports matching your actual JPG filenames (with spaces & capitalization)
import homeGoodsPoster from "../assets/categories/Home Goods.jpg";
import vintageDecorPoster from "../assets/categories/Vintage Decor.jpg";
import footwearPoster from "../assets/categories/Footwear.jpg";
import mensClothingPoster from "../assets/categories/Men's Clothing.jpg";
import fashionAccessoriesPoster from "../assets/categories/Fashion Accessories.jpg";
import womensClothingPoster from "../assets/categories/Women's Clothing.jpg";
import kidsBabyItemsPoster from "../assets/categories/Kids & Baby Items.jpg";
import usedElectronicsPoster from "../assets/categories/Used Electronics.jpg";
import booksMediaPoster from "../assets/categories/Books & Media.jpg";
import sportsOutdoorGearPoster from "../assets/categories/Sports & Outdoor Gear.jpg";

interface CategoryCard {
  title: string;
  link: string;
  image: string;
}

const allCategories: CategoryCard[] = [
  { title: "Home Goods", link: "home-goods", image: homeGoodsPoster },
  { title: "Vintage Decor", link: "vintage-decor", image: vintageDecorPoster },
  { title: "Footwear", link: "footwear", image: footwearPoster },
  { title: "Men's Clothing", link: "mens-clothing", image: mensClothingPoster },
  { title: "Fashion Accessories", link: "fashion-accessories", image: fashionAccessoriesPoster },
  { title: "Women's Clothing", link: "womens-clothing", image: womensClothingPoster },
  { title: "Kids & Baby Items", link: "kids-and-baby-items", image: kidsBabyItemsPoster },
  { title: "Used Electronics", link: "used-electronics", image: usedElectronicsPoster },
  { title: "Books & Media", link: "books-and-media", image: booksMediaPoster },
  { title: "Sports & Outdoor Gear", link: "sports-and-outdoor-gear", image: sportsOutdoorGearPoster },
];

const CategoriesSection: React.FC = () => (
  <div className="max-w-screen-2xl mx-auto px-5 mt-24">
    <h2 className="text-black text-5xl font-normal tracking-[1.56px] max-sm:text-4xl mb-12 text-center">
      Our Categories
    </h2>
    <div className="flex flex-wrap justify-center gap-6">
      {allCategories.map((cat) => (
        <CategoryItem
          key={cat.link}
          categoryTitle={cat.title}
          image={cat.image}
          link={cat.link}
        />
      ))}
    </div>
  </div>
);


export default CategoriesSection;

