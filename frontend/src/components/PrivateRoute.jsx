import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = () => {
  const { user, loading } = useContext(AuthContext);

  // 1. Agar user load ho raha hai, toh wait karo
  if (loading) return <div>Loading...</div>;

  // 2. Agar user login hai (user exists) -> Page dikhao (Outlet)
  // 3. Agar user login nahi hai -> Login page par bhejo
  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;