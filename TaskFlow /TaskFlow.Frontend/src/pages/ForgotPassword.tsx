import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  userAuthAPI,
  type PasswordResetRequestDto,
  type ApiResponse,
} from "../services/api";
import { useToast } from "../hooks/useToast";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const toast = useToast();

  const forgotPasswordMutation = useMutation<
    ApiResponse<object>,
    Error,
    PasswordResetRequestDto
  >({
    mutationFn: userAuthAPI.requestPasswordReset,
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8 p-8 border border-gray-200 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Şifremi Unuttum
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hesabınızla ilişkili e-posta adresinizi girin. Size şifrenizi
            sıfırlamanız için bir bağlantı göndereceğiz.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="-space-y-px rounded-md shadow-sm">
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
              variant="primary"
              className="w-full"
              isLoading={isLoading}
            >
              Şifre Sıfırlama Bağlantısı Gönder
            </Button>
          </div>
        </form>
        <div className="text-sm text-center">
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Giriş sayfasına geri dön
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPassword;
