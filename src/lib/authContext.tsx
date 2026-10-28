import React, { createContext, useContext, useState, useEffect } from 'react';
import { Seller } from '../types/index.ts';
import { api, getAuthToken, setAuthToken, clearAuthToken } from './api.ts';

interface AuthContextType {
  seller: Seller | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, storeName: string) => Promise<void>;
  logout: () => void;
  switchSeller: (sellerId: string) => Promise<void>;
  refreshSeller: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentSeller = async () => {
    try {
      const res = await api.getMe();
      setSeller(res.seller);
    } catch {
      // If no valid session, try logging into default demo seller
      try {
        const demoRes = await api.login('aura@demandiq.com', 'demopassword123');
        setAuthToken(demoRes.token);
        setSeller(demoRes.seller);
      } catch (e) {
        console.error('Demo auth initialization failed:', e);
        setSeller(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentSeller();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      setAuthToken(res.token);
      setSeller(res.seller);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, storeName: string) => {
    setLoading(true);
    try {
      const res = await api.register(email, password, name, storeName);
      setAuthToken(res.token);
      setSeller(res.seller);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuthToken();
    setSeller(null);
  };

  const switchSeller = async (targetSellerId: string) => {
    setLoading(true);
    try {
      const res = await api.switchDemoSeller(targetSellerId);
      setAuthToken(res.token);
      setSeller(res.seller);
    } finally {
      setLoading(false);
    }
  };

  const refreshSeller = async () => {
    await fetchCurrentSeller();
  };

  return (
    <AuthContext.Provider value={{ seller, loading, login, register, logout, switchSeller, refreshSeller }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
