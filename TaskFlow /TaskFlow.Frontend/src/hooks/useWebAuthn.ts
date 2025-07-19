/**
 * WebAuthn Hook - Biyometrik Giriş
 * 
 * Bu hook, WebAuthn (Web Authentication API) ile biyometrik giriş
 * işlemlerini yönetir. Fingerprint, Face ID, Touch ID gibi
 * biyometrik yöntemleri destekler.
 */

import { useState, useCallback } from 'react';
import { webAuthnAPI } from '../services/api';
import type {
  WebAuthnStatus,
  WebAuthnRegistrationRequest,
  WebAuthnRegistrationComplete,
  WebAuthnAuthenticationRequest,
  WebAuthnAuthenticationComplete,
  WebAuthnCredential
} from '../types/auth.types';

/**
 * WebAuthn Hook Return Type
 */
interface UseWebAuthnReturn {
  // State
  isSupported: boolean;
  isEnabled: boolean;
  isLoading: boolean;
  error: string | null;
  credentials: WebAuthnCredential[];
  
  // Actions
  checkSupport: () => Promise<boolean>;
  getStatus: () => Promise<void>;
  register: (username: string, displayName?: string) => Promise<boolean>;
  authenticate: (username: string) => Promise<boolean>;
  deleteCredential: (credentialId: string) => Promise<boolean>;
  clearError: () => void;
}

/**
 * WebAuthn Hook
 * 
 * Biyometrik giriş işlemlerini yönetir.
 * 
 * @returns WebAuthn hook return object
 */
export const useWebAuthn = (): UseWebAuthnReturn => {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<WebAuthnCredential[]>([]);

  /**
   * WebAuthn desteğini kontrol et
   */
  const checkSupport = useCallback(async (): Promise<boolean> => {
    try {
      // Browser desteğini kontrol et
      const isWebAuthnSupported = window.PublicKeyCredential !== undefined;
      setIsSupported(isWebAuthnSupported);
      
      if (!isWebAuthnSupported) {
        setError('Tarayıcınız WebAuthn desteklemiyor');
        return false;
      }

      // Platform authenticator desteğini kontrol et
      const isPlatformAuthenticatorSupported = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      
      if (!isPlatformAuthenticatorSupported) {
        setError('Cihazınız biyometrik giriş desteklemiyor');
        return false;
      }

      return true;
    } catch (err) {
      setError('Biyometrik giriş desteği kontrol edilemedi');
      return false;
    }
  }, []);

  /**
   * WebAuthn durumunu getir
   */
  const getStatus = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await webAuthnAPI.getStatus();
      
      if (response.success && response.data) {
        setIsEnabled(response.data.isEnabled);
        setCredentials(response.data.credentials || []);
      } else {
        setError(response.message || 'Durum alınamadı');
      }
    } catch (err: any) {
      setError(err.message || 'Durum alınırken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * WebAuthn kayıt işlemi
   */
  const register = useCallback(async (username: string, displayName?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Kayıt başlat
      const startResponse = await webAuthnAPI.startRegistration({
        username,
        displayName
      });

      if (!startResponse.success || !startResponse.data) {
        setError(startResponse.message || 'Kayıt başlatılamadı');
        return false;
      }

      const { challenge, publicKeyCredentialCreationOptions, sessionId } = startResponse.data;

      // 2. PublicKeyCredentialCreationOptions'ı dönüştür
      const options = {
        ...publicKeyCredentialCreationOptions,
        challenge: Uint8Array.from(atob(challenge), c => c.charCodeAt(0)),
        user: {
          ...publicKeyCredentialCreationOptions.user,
          id: Uint8Array.from(atob(publicKeyCredentialCreationOptions.user.id), c => c.charCodeAt(0))
        }
      };

      // 3. Credential oluştur
      const credential = await navigator.credentials.create({
        publicKey: options
      }) as PublicKeyCredential;

      if (!credential) {
        setError('Biyometrik kimlik oluşturulamadı');
        return false;
      }

      // 4. Kayıt tamamla
      const attestationResponse = credential.response as AuthenticatorAttestationResponse;
      const completeResponse = await webAuthnAPI.completeRegistration({
        sessionId,
        attestationResponse: {
          id: credential.id,
          type: credential.type,
          response: {
            attestationObject: Array.from(new Uint8Array(attestationResponse.attestationObject)),
            clientDataJSON: Array.from(new Uint8Array(attestationResponse.clientDataJSON))
          }
        }
      });

      if (completeResponse.success) {
        // Durumu güncelle
        await getStatus();
        return true;
      } else {
        setError(completeResponse.message || 'Kayıt tamamlanamadı');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Kayıt işlemi başarısız');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getStatus]);

  /**
   * WebAuthn giriş işlemi
   */
  const authenticate = useCallback(async (username: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Giriş başlat
      const startResponse = await webAuthnAPI.startAuthentication({
        username
      });

      if (!startResponse.success || !startResponse.data) {
        setError(startResponse.message || 'Giriş başlatılamadı');
        return false;
      }

      const { challenge, publicKeyCredentialRequestOptions, sessionId } = startResponse.data;

      // 2. PublicKeyCredentialRequestOptions'ı dönüştür
      const options = {
        ...publicKeyCredentialRequestOptions,
        challenge: Uint8Array.from(atob(challenge), c => c.charCodeAt(0)),
        allowCredentials: publicKeyCredentialRequestOptions.allowCredentials.map((cred: any) => ({
          ...cred,
          id: Uint8Array.from(atob(cred.id), c => c.charCodeAt(0))
        }))
      };

      // 3. Credential getir
      const assertion = await navigator.credentials.get({
        publicKey: options
      }) as PublicKeyCredential;

      if (!assertion) {
        setError('Biyometrik doğrulama başarısız');
        return false;
      }

      // 4. Giriş tamamla
      const assertionResponse = assertion.response as AuthenticatorAssertionResponse;
      const completeResponse = await webAuthnAPI.completeAuthentication({
        sessionId,
        assertionResponse: {
          id: assertion.id,
          type: assertion.type,
          response: {
            authenticatorData: Array.from(new Uint8Array(assertionResponse.authenticatorData)),
            clientDataJSON: Array.from(new Uint8Array(assertionResponse.clientDataJSON)),
            signature: Array.from(new Uint8Array(assertionResponse.signature))
          }
        }
      });

      if (completeResponse.success) {
        return true;
      } else {
        setError(completeResponse.message || 'Giriş tamamlanamadı');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Giriş işlemi başarısız');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * WebAuthn credential sil
   */
  const deleteCredential = useCallback(async (credentialId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await webAuthnAPI.deleteCredential(credentialId);
      
      if (response.success) {
        // Durumu güncelle
        await getStatus();
        return true;
      } else {
        setError(response.message || 'Kimlik silinemedi');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Silme işlemi başarısız');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getStatus]);

  /**
   * Hata mesajını temizle
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isSupported,
    isEnabled,
    isLoading,
    error,
    credentials,
    
    // Actions
    checkSupport,
    getStatus,
    register,
    authenticate,
    deleteCredential,
    clearError
  };
}; 