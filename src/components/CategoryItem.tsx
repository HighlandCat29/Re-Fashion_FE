import { Link } from "react-router-dom";

const CategoryItem = ({
  categoryTitle,
  image,
  link,
}: {
  categoryTitle: string;
  image: string;
  link: string;
}) => {
  return (
    <div className="w-[600px] relative max-[1250px]:w-[400px] max-[1250px]:h-[400px] max-sm:w-[300px] max-sm:h-[300px]">
      <Link to={`/shop/${link}`}>
        <img
          src={`/assets/${image}`}
          className="h-full w-full"
          loading="lazy"
          alt={categoryTitle}
        />
        <div className="bg-secondaryBrown text-white absolute bottom-0 w-full h-16 flex justify-center items-center max-sm:h-12">
          <h3 className="text-2xl max-sm:text-xl">{categoryTitle}</h3>
        </div>
      </Link>
    </div>
  );
};
export default CategoryItem;
