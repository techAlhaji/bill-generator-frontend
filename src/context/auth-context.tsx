'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Merchant } from '../types';
import { api, getStoredToken, setStoredToken, removeStoredToken } from '../lib/api';
import { connectFreighter, signTransactionWithFreighter } from '../lib/wallet';

export interface AuthContextType {
  merchant: Merchant | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (
    email: string,
    password: string,
    businessName: string,
    stellarAddress: string
  ) => Promise<void>;
  loginWithStellarWallet: () => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await api.merchant.getProfile();
      setMerchant(res.data);
    } catch {
      // If profile fetch fails with 401, token is removed by api interceptor
      setMerchant(null);
      setToken(null);
    }
  }, []);

  useEffect(() => {
    const storedToken = getStoredToken();
    if (storedToken) {
      setToken(storedToken);
      refreshProfile().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [refreshProfile]);

  const loginWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login({ email, password });
      setStoredToken(res.data.token);
      setToken(res.data.token);
      setMerchant(res.data.merchant);
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (
    email: string,
    password: string,
    businessName: string,
    stellarAddress: string
  ) => {
    setIsLoading(true);
    try {
      const res = await api.auth.register({
        email,
        password,
        businessName,
        stellarAddress,
      });
      setStoredToken(res.data.token);
      setToken(res.data.token);
      setMerchant(res.data.merchant);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithStellarWallet = async () => {
    setIsLoading(true);
    try {
      // 1. Connect Freighter
      const connection = await connectFreighter();

      // 2. Request SEP-10 challenge XDR from backend
      const challenge = await api.auth.getStellarChallenge(connection.address);

      // 3. User signs challenge in Freighter
      const signedXdr = await signTransactionWithFreighter(
        challenge.transaction,
        challenge.networkPassphrase
      );

      // 4. Verify signature on backend & obtain JWT session
      const res = await api.auth.verifyStellarChallenge(signedXdr);

      setStoredToken(res.data.token);
      setToken(res.data.token);
      setMerchant(res.data.merchant);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    removeStoredToken();
    setToken(null);
    setMerchant(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        merchant,
        token,
        isLoading,
        isAuthenticated: !!merchant && !!token,
        loginWithEmail,
        registerWithEmail,
        loginWithStellarWallet,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
