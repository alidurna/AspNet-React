import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  userAuthAPI,
  type PasswordResetDto,
  type ApiResponse,
} from "../services/api";
import { useToast } from "../hooks/useToast";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const ResetPassword: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isTokenValid, setIsTokenValid] = useState(false); // Token geçerliliğini tutar

  useEffect(() => {
    // URL sorgu parametrelerinden email ve token'ı al
    const queryParams = new URLSearchParams(location.search);
    const emailParam = queryParams.get("email");
    const tokenParam = queryParams.get("token");

    if (emailParam && tokenParam) {
      setEmail(emailParam);
      setToken(tokenParam);
      setIsTokenValid(true); // Basit geçerlilik kontrolü, backend tarafında daha detaylı yapılacak
    } else {
      // Email veya token eksikse hata göster ve giriş sayfasına yönlendir
      toast.showError(
        "Şifre sıfırlama bağlantısı geçersiz veya eksik. Lütfen tekrar deneyin."
      );
      navigate("/login");
    }
  }, [location.search, navigate, toast]);

  const resetPasswordMutation = useMutation<
    ApiResponse<object>,
    Error,
    PasswordResetDto
  >({
    mutationFn: userAuthAPI.resetPassword,
    onSuccess: (response) => {
      if (response.success) {
        toast.showSuccess(
          response.message ||
            "Şifreniz başarıyla sıfırlandı. Lütfen giriş yapın."
        );
        navigate("/login"); // Başarılı olursa giriş sayfasına yönlendir
      } else {
        toast.showError(
          response.message ||
            "Şifre sıfırlama başarısız oldu. Lütfen tekrar deneyin."
        );
      }
    },
    onError: (error) => {
      toast.showError(error.message || "Şifre sıfırlanırken bir hata oluştu.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.showError("Yeni şifreler eşleşmiyor.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast.showError("Yeni şifre en az 6 karakter olmalıdır.");
      return;
    }

    if (!email || !token) {
      toast.showError("Geçersiz şifre sıfırlama isteği.");
      return;
    }

    resetPasswordMutation.mutate({
      email,
      token,
      newPassword,
      confirmPassword,
    });
  };

  const isLoading = resetPasswordMutation.isPending;

  if (!isTokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <p className="text-gray-600">Yükleniyor veya yönlendiriliyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8 p-8 border border-gray-200 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Şifreni Sıfırla
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Yeni şifrenizi belirleyin.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              required
              label="Yeni Şifre"
              placeholder="Yeni şifrenizi girin"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              showPasswordToggle
              disabled={isLoading}
              className="rounded-t-md"
            />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              label="Yeni Şifre Tekrar"
              placeholder="Yeni şifrenizi tekrar girin"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              showPasswordToggle
              disabled={isLoading}
              className="rounded-b-md"
            />
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
            >
              Şifreyi Sıfırla
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ResetPassword;
