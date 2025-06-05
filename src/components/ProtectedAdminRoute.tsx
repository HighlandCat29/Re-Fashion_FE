import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../hooks";
import { toast } from "react-hot-toast";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

const ProtectedAdminRoute = ({ children }: ProtectedAdminRouteProps) => {
  const { user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // Check if user is logged in and has admin role
  if (!user) {
    toast.error("Please login to access this page");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role.roleId !== "1") {
    toast.error("You don't have permission to access this page");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
