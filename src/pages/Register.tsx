import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components";
import toast from "react-hot-toast";
import customFetch from "../axios/custom";
import { useState } from "react";

const checkRegisterFormData = (data: Record<string, string>) => {
  const { username, email, password, confirmPassword, fullName, phoneNumber, address, roleId } = data;
  if (!username || !email || !password || !confirmPassword || !fullName || !phoneNumber || !address || !roleId) {
    toast.error("Please fill in all fields");
    return false;
  }
  if (password !== confirmPassword) {
    toast.error("Passwords do not match");
    return false;
  }
  // You can add more validation here (email format, password strength, etc.)
  return true;
};

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData) as Record<string, string>;

    if (!checkRegisterFormData(data)) return;

    setLoading(true);

    try {
      const response = await customFetch.post("/users", {
        username: data.username,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        address: data.address,
        roleId: String(data.roleId),
      });

      if (response.status === 201) {
        toast.success("User registered successfully");
        navigate("/login");
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error("User with this email already exists");
      } else {
        toast.error("Server error: " + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto pt-24 flex items-center justify-center">
      <form
        onSubmit={handleRegister}
        className="max-w-5xl mx-auto flex flex-col gap-5 max-sm:gap-3 items-center justify-center max-sm:px-5"
      >
        <h2 className="text-5xl text-center mb-5 font-thin max-md:text-4xl max-sm:text-3xl max-[450px]:text-xl max-[450px]:font-normal">
          Welcome! Register here:
        </h2>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-1">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              className="bg-white border border-black text-xl py-2 px-3 w-full outline-none max-[450px]:text-base"
              placeholder="Enter username"
              id="username"
              name="username"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              className="bg-white border border-black text-xl py-2 px-3 w-full outline-none max-[450px]:text-base"
              placeholder="Enter full name"
              id="fullName"
              name="fullName"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="phoneNumber">Phone</label>
            <input
              type="tel"
              className="bg-white border border-black text-xl py-2 px-3 w-full outline-none max-[450px]:text-base"
              placeholder="Enter phone number"
              id="phoneNumber"
              name="phoneNumber"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              className="bg-white border border-black text-xl py-2 px-3 w-full outline-none max-[450px]:text-base"
              placeholder="Enter address"
              id="address"
              name="address"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="roleId">Role</label>
            <select
              id="roleId"
              name="roleId"
              className="bg-white border border-black text-xl py-2 px-3 w-full outline-none max-[450px]:text-base"
              defaultValue="2" // default to Buyer
            >
              <option value="2">Buyer</option>
              <option value="3">Seller</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="email">Your email</label>
            <input
              type="email"
              className="bg-white border border-black text-xl py-2 px-3 w-full outline-none max-[450px]:text-base"
              placeholder="Enter email address"
              id="email"
              name="email"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password">Your password</label>
            <input
              type="password"
              className="bg-white border border-black text-xl py-2 px-3 w-full outline-none max-[450px]:text-base"
              placeholder="Enter password"
              id="password"
              name="password"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              type="password"
              className="bg-white border border-black text-xl py-2 px-3 w-full outline-none max-[450px]:text-base"
              placeholder="Confirm password"
              id="confirmPassword"
              name="confirmPassword"
            />
          </div>
        </div>
        <Button
          type="submit"
          text={loading ? "Registering..." : "Register"}
          mode="brown"
          disabled={loading}
        />
        <Link to="/login" className="text-xl max-md:text-lg max-[450px]:text-sm">
          Already have an account? <span className="text-secondaryBrown">Login now</span>.
        </Link>
      </form>
    </div>
  );
};

export default Register;
