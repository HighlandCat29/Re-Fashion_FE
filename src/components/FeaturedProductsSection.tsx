import React, { useEffect, useState } from "react";
import { getProducts } from "../api/Products";
import { Product } from "../api/Products";
import ProductItem from "./ProductItem";

const FeaturedProductsSection: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await getProducts();
        if (products) {
          const featured = products.filter((p) => p.isFeatured && p.isActive);
          setFeaturedProducts(featured);
        }
      } catch (error) {
        console.error("Failed to fetch featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  if (featuredProducts.length === 0) {
    return null; // Don't render the section if there are no featured products
  }

  return (
    <section className="py-12 bg-yellow-50 border-t border-b border-yellow-200">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Featured Products
          </h2>
          <p className="text-gray-600 mt-2">
            Handpicked and promoted by our sellers
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {featuredProducts.slice(0, 4).map((product) => (
            <ProductItem
              key={product.id}
              id={product.id!}
              image={product.imageUrls[0]}
              title={product.title}
              category={product.categoryName}
              price={product.price}
              brand={product.brand}
              condition={product.productCondition}
            />
          ))}
        </div>
        {featuredProducts.length > 4 && (
          <div className="text-center mt-8">
            <a
              href="/shop?featured=true"
              className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition"
            >
              View All Featured Products
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProductsSection;
