// src/components/CategoryItem.tsx

import React from "react";
import { Link } from "react-router-dom";

interface CategoryItemProps {
  /** Prettified title, e.g. "Special Edition" (for display under the image) */
  categoryTitle: string;
  /** Full URL string or relative path to the thumbnail, e.g. "https://.../abc.jpg" */
  image: string;
  /** URL slug for category, e.g. "special-edition" */
  link: string;
}

const CategoryItem: React.FC<CategoryItemProps> = ({
  categoryTitle,
  image,
  link,
}) => {
  return (
    <Link to={`/shop/${link}`} className="block group">
      <div className="w-60 h-72 overflow-hidden rounded-lg shadow-md">
        <img
          src={image}
          alt={categoryTitle}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <h3 className="mt-3 text-center text-xl font-medium text-gray-800">
        {categoryTitle}
      </h3>
    </Link>
  );
};

export default CategoryItem;
