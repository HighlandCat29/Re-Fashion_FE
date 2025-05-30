import React from "react";
import ProductItem from "./ProductItem";

// Define or import Product type
type Product = {
  id: string;
  title: string;
  image: string;
  category: string;
  price: number;
  popularity: number;
  stock: number;
};

type Props = {
  products?: Product[];
};

const ProductGrid = ({ products }: Props) => {
  if (!products || products.length === 0) {
    return (
      <div className="text-center text-gray-500 text-xl w-full py-12">
        No products found in this category.
      </div>
    );
  }

  return (
    <div
      id="gridTop"
      className="max-w-screen-2xl flex flex-wrap justify-between items-center gap-y-8 mx-auto mt-12 max-xl:justify-start max-xl:gap-5 px-5 max-[400px]:px-3"
    >
      {products.map((product) => (
        <ProductItem
          key={product.id}
          id={product.id}
          image={product.image}
          title={product.title}
          category={product.category}
          price={product.price}
          popularity={product.popularity}
          stock={product.stock}
        />
      ))}
    </div>
  );
};

export default React.memo(ProductGrid);
