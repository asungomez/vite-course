import { FC } from "react";
import { useAuth } from "../context/auth/AuthContext";
import { Outlet, useNavigate } from "react-router";

/**
 * Route that can only be accessed by authenticated users.
 * If the user is not authenticated, they will be redirected to the login page.
 */
export const AuthenticatedRoute: FC = () => {
  const { status } = useAuth();
  const navigate = useNavigate();
  if (status !== "authenticated") {
    navigate("/");
    return null;
  }
  return <Outlet />;
};
