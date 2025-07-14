import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import type { AuthContextType } from "../../types/auth.types";
import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute
 *
 * Bu bileşen, kullanıcı giriş yapmamışsa otomatik olarak login sayfasına yönlendirir.
 * Giriş yapılmışsa, çocuk bileşenleri render eder.
 */
export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, isLoading } = useContext(AuthContext) as AuthContextType;

  if (isLoading) return null; // veya bir loading spinner döndürülebilir

  return user ? children : <Navigate to="/login" replace />;
} 