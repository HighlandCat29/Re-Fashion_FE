import React, { ReactElement } from "react";
import { useAppSelector } from "../hooks";
import { Product } from "../api/Products";

const ProductGridWrapper = ({
  children,
}: {
  children:
    | ReactElement<{ products: Product[] }>
    | ReactElement<{ products: Product[] }>[];
}) => {
  const { products = [] } = useAppSelector((state) => state.shop);

  // Clone the children and pass the products as props to the children
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { products });
    }
    return null;
  });

  return childrenWithProps;
};

export default ProductGridWrapper;
