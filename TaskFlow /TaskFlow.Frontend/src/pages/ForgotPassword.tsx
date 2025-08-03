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
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="E-posta adresinizi girin"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="w-full"
          />
        </div>

                 <Button
           type="submit"
           variant="default"
           className="w-full"
           disabled={isLoading}
         >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Gönderiliyor...</span>
            </div>
          ) : (
            'Şifre Sıfırlama Bağlantısı Gönder'
          )}
        </Button>
      </form>
      
      <div className="mt-6 text-center">
                 <Link
           to="/login"
           className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
         >
          Giriş sayfasına geri dön
        </Link>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
