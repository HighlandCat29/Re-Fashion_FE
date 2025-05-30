const ProductPreview = () => {
  return (
    <section className="flex flex-col items-center gap-4 bg-white p-6 rounded-lg shadow-md">
      <img
        src="/products/product image 1.jpg"
        alt="Product"
        className="w-full max-w-sm object-cover rounded-md"
      />
      <div className="flex gap-2">
        <img
          src="/products/product image 2.jpg"
          className="w-16 h-16 object-cover rounded"
        />
        <img
          src="/products/product image 3.jpg"
          className="w-16 h-16 object-cover rounded"
        />
      </div>
      <button className="mt-4 bg-secondaryBrown text-white py-2 px-4 rounded hover:bg-brown-700 transition">
        Click to see product details
      </button>
    </section>
  );
};

export default ProductPreview;
