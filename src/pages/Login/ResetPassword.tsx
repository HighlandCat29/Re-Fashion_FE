import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { resetPassword } from "../../api/Users";
import toast from "react-hot-toast";

const ResetPassword: React.FC = () => {
    const [newPassword, setNewPassword] = useState<string>("");
    const [submitting, setSubmitting] = useState<boolean>(false);
    const navigate = useNavigate();
    const { search } = useLocation();
    const token = new URLSearchParams(search).get("token") || "";

    useEffect(() => {
        if (!token) {
            // prevent endless loop
            setTimeout(() => navigate("/login"), 1000);
            toast.error("Invalid or missing token.");
        }
    }, [token, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }
        setSubmitting(true);
        try {
            await resetPassword(token, newPassword);
            toast.success("Password reset! Please log in.");
            navigate("/login");
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
                            Reset Password
                        </h2>

                        <div className="flex flex-col gap-1">
                            <label
                                htmlFor="new-password"
                                className="text-sm font-medium text-gray-700"
                            >
                                New Password
                            </label>
                            <input
                                type="password"
                                id="new-password"
                                name="new-password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                minLength={6}
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
                w-full bg-green-600 text-white text-lg font-medium
                py-3 rounded-full hover:bg-green-700 transition
                disabled:opacity-50
              "
                        >
                            {submitting ? "Resetting…" : "Reset Password"}
                        </button>

                        <p className="text-center text-sm text-gray-600">
                            <Link to="/login" className="hover:underline text-gray-800">
                                Back to login
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
