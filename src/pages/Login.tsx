import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components";
import { checkLoginFormData } from "../utils/checkLoginFormData";
import customFetch from "../axios/custom";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { setLoginStatus } from "../features/auth/authSlice";
import { store } from "../store";

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    if (!checkLoginFormData(data)) return;

    try {
      const response = await customFetch.post("/auth/token", {
        email: data.email,
        password: data.password,
      });

      const { token, userId, role } = response.data.result;
      console.log(role);
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(userId));

      store.dispatch(setLoginStatus(true));
      toast.success("You logged in successfully");
      console.log(data.email, data.password, data.token);
      if (role.roleId == "1") {
        console.log(role.roleId);

        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error: any) {
      toast.error(
        "Login failed: " + (error.response?.data?.message || error.message)
      );
    }
  };

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      toast.success("You are already logged in");
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-xl p-8 bg-white shadow-xl rounded-lg flex flex-col gap-6 transition-all duration-300"
      >
        <h2 className="text-4xl font-semibold text-center text-gray-800 mb-2">
          Welcome Back! Login here
        </h2>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label
              htmlFor="email"
              className="text-lg font-medium text-gray-700"
            >
              Your email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter email address"
              className="border border-gray-300 rounded-md px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-secondaryBrown transition"
            />
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="password"
              className="text-lg font-medium text-gray-700"
            >
              Your password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter password"
              className="border border-gray-300 rounded-md px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-secondaryBrown transition"
            />
          </div>
        </div>

        <Button type="submit" text="Login" mode="brown" />

        <p className="text-center text-gray-600 text-base">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-secondaryBrown font-medium hover:underline transition"
          >
            Register now
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
