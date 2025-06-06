import React, { useEffect, useState } from "react";
import ProductItem from "./ProductItem";
import { Product } from "../api/Products/adminIndex";
import { Category, getCategories } from "../api/Categories";

type Props = {
  products?: Product[];
};

const ProductGrid = ({ products }: Props) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        if (data) {
          setCategories(data);
          console.log("Fetched categories:", data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const getCategoryName = (
    categoryId: string | undefined,
    product?: Product
  ) => {
    // If we have a categoryId, look it up in the categories list
    if (categoryId) {
      const category = categories.find((cat) => cat.id === categoryId);
      if (category) return category.name;
    }

    // If no categoryId or not found, try to use the product's categoryName
    if (product?.categoryName) {
      return product.categoryName;
    }

    return "Unknown Category";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondaryBrown"></div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 rounded-lg p-8">
        <svg
          className="w-16 h-16 text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No Products Found
        </h3>
        <p className="text-gray-500 text-center max-w-md">
          We couldn't find any products in this category. Please check back
          later or try a different category.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
        {products.map((product) => {
          console.log(
            `Product ID: ${product.id}, Category ID: ${product.categoryId
            }, Category Name: ${getCategoryName(product.categoryId, product)}`
          );
          return (
            <div
              key={product.id}
              className="transform transition-all duration-300 hover:scale-105"
            >
              <ProductItem
                id={product.id!}
                image={product.imageUrls[0]}
                title={product.title}
                category={getCategoryName(product.categoryId, product)}
                price={product.price}
                brand={product.brand}
                condition={product.productCondition}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(ProductGrid);
