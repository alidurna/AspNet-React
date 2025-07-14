import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * ErrorBoundary Component
 * 
 * Bu bir React Error Boundary bileşenidir. Alt component ağacındaki JavaScript hatalarını yakalar,
 * bu hataları loglar ve normalde uygulamanın çökmesine neden olacak hatalı bir duruma karşı bir yedek UI görüntüler.
 * Production ortamında beklenmedik hataların kullanıcı deneyimini bozmasını engellemek için kullanılır.
 * 
 * Nasıl kullanılır:
 * <ErrorBoundary>
 *   <YourComponents />
 * </ErrorBoundary>
 * 
 * Hatalar `componentDidCatch` metodu ile yakalanır ve console.error'a loglanır.
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    // Bir hata oluştuğunda sonraki render için state'i güncelleyin
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uygulama Hata Yakaladı:", error, errorInfo);
    // İsteğe bağlı: Hataları bir hata loglama servisine gönderebilirsiniz
    // logErrorToMyService(error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // Hata oluştuğunda özel bir yedek UI gösterebilirsiniz
      return (
        <div className="flex items-center justify-center min-h-screen bg-red-100 text-red-800 p-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Bir şeyler ters gitti.</h1>
            <p className="text-lg">Uygulama beklenmedik bir hatayla karşılaştı. Lütfen daha sonra tekrar deneyin veya yöneticinizle iletişime geçin.</p>
            <button
              className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              onClick={() => window.location.reload()} // Sayfayı yenileme butonu
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 