import { useState } from "react";

interface ProductPreviewProps {
  product: {
    title: string;
    description: string;
    brand: string;
    price: number;
    imageUrl: string;
    productCondition: string;
    size: string;
    color: string;
  };
}

const ProductPreview = ({ product }: ProductPreviewProps) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <section className="flex flex-col items-center gap-4 bg-white p-6 rounded-lg shadow-md">
      <img
        src={product.imageUrl}
        alt={product.title}
        className="w-full max-w-sm object-cover rounded-md"
      />
      <div className="flex gap-2">
        <img
          src={product.imageUrl}
          alt={`${product.title} thumbnail 1`}
          className="w-16 h-16 object-cover rounded"
        />
        <img
          src={product.imageUrl}
          alt={`${product.title} thumbnail 2`}
          className="w-16 h-16 object-cover rounded"
        />
      </div>

      {showDetails ? (
        <div className="w-full space-y-2 mt-4">
          <h3 className="text-xl font-semibold">{product.title}</h3>
          <p className="text-gray-600">{product.description}</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p>
              <span className="font-medium">Brand:</span> {product.brand}
            </p>
            <p>
              <span className="font-medium">Price:</span> ${product.price}
            </p>
            <p>
              <span className="font-medium">Condition:</span>{" "}
              {product.productCondition}
            </p>
            <p>
              <span className="font-medium">Size:</span> {product.size}
            </p>
            <p>
              <span className="font-medium">Color:</span> {product.color}
            </p>
          </div>
        </div>
      ) : null}

      <button
        onClick={() => setShowDetails(!showDetails)}
        className="mt-4 bg-secondaryBrown text-white py-2 px-4 rounded hover:bg-brown-700 transition"
      >
        {showDetails ? "Hide Details" : "View Details"}
      </button>
    </section>
  );
};

export default ProductPreview;
