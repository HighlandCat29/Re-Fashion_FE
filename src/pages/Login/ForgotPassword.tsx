import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword } from "../../api/Users";
import toast from "react-hot-toast";

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState<string>("");
    const [submitting, setSubmitting] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter your email address.");
            return;
        }
        setSubmitting(true);
        try {
            await forgotPassword(email);
            toast.success("If that email exists, you’ll receive reset instructions.");
            navigate("/check-email");
        } catch {
            // error toast shown in API
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center
                 bg-[url('/textures/subtle-paper-256.png')] bg-repeat"
        >
            <div className="max-w-md w-full px-4">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <form
                        onSubmit={handleSubmit}
                        className="px-8 py-10 flex flex-col gap-6"
                    >
                        <h2 className="text-2xl font-semibold text-center text-gray-800">
                            Forgot Password
                        </h2>

                        <div className="flex flex-col gap-1">
                            <label
                                htmlFor="email"
                                className="text-sm font-medium text-gray-700"
                            >
                                Your email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Enter email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="
                  w-full rounded-xl border border-gray-300 
                  px-4 py-3 text-base text-gray-800
                  focus:outline-none focus:ring-2 focus:ring-gray-200 transition
                "
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="
                w-full bg-blue-600 text-white text-lg font-medium
                py-3 rounded-full hover:bg-blue-700 transition
                disabled:opacity-50
              "
                        >
                            {submitting ? "Sending…" : "Send Reset Link"}
                        </button>

                        <p className="text-center text-sm text-gray-600">
                            <Link to="/login" className="hover:underline text-gray-800">
                                Return to login
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
