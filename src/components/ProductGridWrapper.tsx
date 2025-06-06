// src/components/ProductGridWrapper.tsx

import React, { ReactElement } from "react";
import { useAppSelector } from "../hooks";
import { Product } from "../api/Products";

interface ProductGridWrapperProps {
  /** Other props may be passed, e.g. sortCriteria/category/page, but 
      we really only care about injecting `products` into children below. */
  children:
  | ReactElement<{ products: Product[] }>
  | ReactElement<{ products: Product[] }>[];
}

const ProductGridWrapper: React.FC<ProductGridWrapperProps> = ({ children }) => {
  // 1) Pull from Redux as a fallback
  const reduxProducts = useAppSelector((state) => state.shop.products);

  // 2) Clone children but only override `products` if they did NOT pass it themselves
  const childrenWithProps = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return null;

    // If the child already has a `products` prop (as we will do in ShopPageContent),
    // we use that. Otherwise, we default to reduxProducts.
    const childProps = child.props as { products?: Product[] };
    const finalProducts = childProps.products || reduxProducts;

    return React.cloneElement(child, { products: finalProducts });
  });

  return <>{childrenWithProps}</>;
};

export default ProductGridWrapper;
