import React from "react";
import { useWishlist } from "../components/WishlistContext";
import ProductItem from "../components/ProductItem";
import { Product } from "../appTypes/Product";

const WishlistPage = () => {
    const { wishlist } = useWishlist();

    if (wishlist.length === 0)
        return <p className="text-center mt-10 text-xl">Your wishlist is empty.</p>;

    return (
        <div className="max-w-screen-2xl mx-auto mt-12 px-5">
            <h1 className="text-4xl font-bold mb-8">My Wishlist</h1>
            <div className="flex flex-wrap justify-start gap-8">
                {wishlist.map((product: Product) => (
                    <ProductItem
                        key={product.id}
                        id={product.id}
                        image={product.image}
                        title={product.title}
                        category={product.category}
                        price={product.price}
                        popularity={product.popularity ?? 0}  // fallback here
                        stock={product.stock ?? 0}
                    />
                ))}
            </div>
        </div>
    );
};

export default WishlistPage;
