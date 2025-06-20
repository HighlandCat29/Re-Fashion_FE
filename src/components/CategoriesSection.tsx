// src/components/CategoriesSection.tsx

import React, { useEffect, useState } from "react";
import CategoryItem from "./CategoryItem";
import { getProducts, Product } from "../api/Products/adminIndex";
import toast from "react-hot-toast";

interface CategoryCard {
  title: string; // e.g. "Suits & Blazers"
  image: string; // e.g. first element of product.imageUrls[] (full URL)
  link: string; // e.g. "suits-and-blazers"
}

// A helper to turn "Suits & Blazers" into "suits-and-blazers"
const slugify = (str: string) =>
  str
    .toLowerCase()
    // replace ampersands with "and", then anything that's not alphanumeric → hyphen
    .replace(/\s*&\s*/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens

const CategoriesSection: React.FC = () => {
  const [categories, setCategories] = useState<CategoryCard[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const allProducts: Product[] | null = await getProducts();
        if (!allProducts) {
          throw new Error("No products returned from getProducts()");
        }

        // 1) Keep only active products and those that have a categoryName
        const activeProducts = allProducts.filter(
          (p) => p.isActive && p.categoryName && p.categoryName.trim() !== ""
        );

        // 2) Build a Map<slugifiedCategoryName, thumbnailURL>
        const mapSlugToImage = new Map<string, string>();

        activeProducts.forEach((p) => {
          const rawName = p.categoryName!.trim(); // we know it's a non‐empty string
          const catSlug = slugify(rawName); // e.g. "suits-and-blazers"

          if (catSlug === "") {
            // in case slugify produced an empty string, skip
            return;
          }

          // If this product has no images, skip
          const urls = p.imageUrls || [];
          if (urls.length === 0) {
            return;
          }
          const thumbnail = urls[0]; // first image as a representative

          // Only set the map once for each slug
          if (!mapSlugToImage.has(catSlug)) {
            mapSlugToImage.set(catSlug, thumbnail);
          }
        });

        // 3) Convert the map into CategoryCard[]
        const cats: CategoryCard[] = Array.from(mapSlugToImage.entries()).map(
          ([slug, thumbnailUrl]) => {
            // We want the “title” to show the original categoryName (not the slug).
            // To do that, find ANY product whose slugified name === slug.
            // (Since map keys came from activeProducts in order, the first time they appeared is fine.)
            const originalName = activeProducts.find(
              (p) => slugify(p.categoryName!) === slug
            )!.categoryName!;

            return {
              title: originalName, // e.g. "Suits & Blazers"
              image: thumbnailUrl, // from the first matching product’s imageUrls[0]
              link: slug, // e.g. "suits-and-blazers"
            };
          }
        );

        setCategories(cats);
      } catch (err) {
        console.error("Failed to load categories:", err);
        toast.error("Could not load categories");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-screen-2xl mx-auto px-5 mt-24">
        <h2
          className="text-black text-5xl font-normal tracking-[1.56px] 
                     max-sm:text-4xl mb-12"
        >
          Our Categories
        </h2>
        <div className="py-12 text-center text-gray-600">
          Loading categories…
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl px-5 mx-auto mt-24">
      <h2
        className="text-black text-5xl font-normal tracking-[1.56px] 
                   max-sm:text-4xl mb-12"
      >
        Our Categories
      </h2>

      {categories.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          No categories found.
        </div>
      ) : (
        <div className="flex flex-wrap justify-start gap-6">
          {categories.map((cat) => (
            <CategoryItem
              key={cat.link}
              categoryTitle={cat.title}
              image={cat.image}
              link={cat.link}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesSection;
