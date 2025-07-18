import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  authAPI, // userAuthAPI yerine authAPI kullanıldı
  type PasswordResetRequestDto,
  type ApiResponse,
} from "../services/api";
import { useToast } from "../hooks/useToast";
import Input from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import AuthLayout from "../components/layout/AuthLayout"; // AuthLayout import edildi

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const toast = useToast();

  const forgotPasswordMutation = useMutation<
    ApiResponse<object>,
    Error,
    PasswordResetRequestDto
  >({
    mutationFn: authAPI.requestPasswordReset, // userAuthAPI.requestPasswordReset yerine authAPI.requestPasswordReset kullanıldı
    onSuccess: (response) => {
      if (response.success) {
        toast.showSuccess(
          response.message ||
            "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi."
        );
      } else {
        toast.showError(
          response.message ||
            "Şifre sıfırlama isteği başarısız oldu. Lütfen tekrar deneyin."
        );
      }
    },
    onError: (error) => {
      toast.showError(
        error.message || "Şifre sıfırlama isteği gönderilirken bir hata oluştu."
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.showError("Lütfen e-posta adresinizi girin.");
      return;
    }
    forgotPasswordMutation.mutate({ email });
  };

  const isLoading = forgotPasswordMutation.isPending;

  return (
    <AuthLayout
      title="Şifremi Unuttum"
      description="Hesabınızla ilişkili e-posta adresinizi girin. Size şifrenizi sıfırlamanız için bir bağlantı göndereceğiz."
    >
      <form className="mt-10 space-y-8" onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            label="E-posta Adresi"
            placeholder="E-posta adresinizi girin"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div>
          <Button
            type="submit"
            variant="default"
            className="w-full py-4 text-lg font-medium"
            isLoading={isLoading}
          >
            Şifre Sıfırlama Bağlantısı Gönder
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

export default ForgotPassword;
