import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components";
import toast from "react-hot-toast";
import customFetch from "../axios/custom";
import { useState } from "react";

const checkRegisterFormData = (data: Record<string, string>) => {
  const {
    username,
    email,
    password,
    confirmPassword,
    fullName,
    phoneNumber,
    address,
    roleId,
  } = data;

  if (
    !username ||
    !email ||
    !password ||
    !confirmPassword ||
    !fullName ||
    !phoneNumber ||
    !address ||
    !roleId
  ) {
    toast.error("Please fill in all fields");
    return false;
  }

  if (password !== confirmPassword) {
    toast.error("Passwords do not match");
    return false;
  }

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
        toast.error(
          "Server error: " + (error.response?.data?.message || error.message)
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-2xl p-8 bg-white shadow-lg rounded-lg flex flex-col gap-6 transition-all duration-300"
      >
        <h2 className="text-4xl font-semibold text-center text-gray-800 mb-4">
          Welcome! Register here
        </h2>

        {/* INPUT FIELDS */}
        {[
          {
            label: "Username",
            id: "username",
            type: "text",
            placeholder: "Enter username",
          },
          {
            label: "Full Name",
            id: "fullName",
            type: "text",
            placeholder: "Enter full name",
          },
          {
            label: "Phone Number",
            id: "phoneNumber",
            type: "tel",
            placeholder: "Enter phone number",
          },
          {
            label: "Address",
            id: "address",
            type: "text",
            placeholder: "Enter address",
          },
          {
            label: "Email",
            id: "email",
            type: "email",
            placeholder: "Enter email address",
          },
          {
            label: "Password",
            id: "password",
            type: "password",
            placeholder: "Enter password",
          },
          {
            label: "Confirm Password",
            id: "confirmPassword",
            type: "password",
            placeholder: "Confirm password",
          },
        ].map(({ label, id, type, placeholder }) => (
          <div key={id} className="flex flex-col gap-1">
            <label htmlFor={id} className="text-lg font-medium text-gray-700">
              {label}
            </label>
            <input
              type={type}
              id={id}
              name={id}
              placeholder={placeholder}
              className="border border-gray-300 rounded-md px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-secondaryBrown transition"
            />
          </div>
        ))}

        {/* ROLE SELECT */}
        <div className="flex flex-col gap-1">
          <label htmlFor="roleId" className="text-lg font-medium text-gray-700">
            Role
          </label>
          <select
            id="roleId"
            name="roleId"
            defaultValue="2"
            className="border border-gray-300 rounded-md px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-secondaryBrown transition"
          >
            <option value="2">Buyer</option>
            <option value="3">Seller</option>
          </select>
        </div>

        {/* SUBMIT BUTTON */}
        <Button
          type="submit"
          text={loading ? "Registering..." : "Register"}
          mode="brown"
          disabled={loading}
        />

        <p className="text-center text-gray-600 text-base">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-secondaryBrown font-medium hover:underline transition"
          >
            Login now
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
