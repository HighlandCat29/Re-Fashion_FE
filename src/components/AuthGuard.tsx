import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { isAuthenticated, handleUnauthorized } from "../utils/auth";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated()) {
      handleUnauthorized(location.pathname);
    }
  }, [navigate, location]);

  return <>{children}</>;
};

export default AuthGuard;
