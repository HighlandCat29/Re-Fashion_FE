import { FaFacebookF } from "react-icons/fa6";

const SocialMediaFooter = () => {
  return (
    <div className="mx-auto max-w-screen-2xl">
      <div className="bg-secondaryBrown flex justify-center items-center flex-col py-9 gap-3 mt-24 mx-5 max-[400px]:mx-3">
        <p className="text-base text-white font-light">Follow us on:</p>
        <div className="flex gap-2 text-white">
          <a
            href="https://www.facebook.com/profile.php?id=61575015430096"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <FaFacebookF className="w-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
export default SocialMediaFooter;
