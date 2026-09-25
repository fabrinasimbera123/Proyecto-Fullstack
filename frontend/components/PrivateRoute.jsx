import { Navigate } from "react-router-dom";
import { isAuthenticated, hasRole } from "../config/keycloak";

const PrivateRoute = ({ children, adminOnly = false }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" />;
  }

  if (adminOnly && !hasRole('admin')) {
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;
