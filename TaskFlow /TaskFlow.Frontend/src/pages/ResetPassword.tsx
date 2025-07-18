import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  authAPI, // userAuthAPI yerine authAPI kullanıldı
  type PasswordResetDto,
  type ApiResponse,
} from "../services/api";
import { useToast } from "../hooks/useToast";
import Input from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import AuthLayout from "../components/layout/AuthLayout"; // AuthLayout import edildi

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
    mutationFn: authAPI.resetPassword, // userAuthAPI.resetPassword yerine authAPI.resetPassword kullanıldı
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-blue-50/30 to-indigo-50/20 py-12 px-4 sm:px-6 lg:px-8">
        <p className="text-neutral-600 font-light">Yükleniyor veya yönlendiriliyor...</p>
      </div>
    );
  }

  return (
    <AuthLayout
      title="Şifreni Sıfırla"
      description="Yeni şifrenizi belirleyin."
    >
      <form className="mt-10 space-y-8" onSubmit={handleSubmit}>
        <div className="space-y-6">
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
          />
        </div>

        <div>
          <Button
            type="submit"
            variant="default"
            isLoading={isLoading}
            className="w-full py-4 text-lg font-medium"
          >
            Şifreyi Sıfırla
          </Button>
        </div>
      </form>
      <div className="mt-10 text-center">
        <p className="text-base text-neutral-500 font-light">
          <Link
            to="/login"
            className="font-medium text-primary-500 hover:text-primary-600 transition-all duration-200 hover:underline"
          >
            Giriş sayfasına geri dön
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;
