import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiFetch, getStoredToken, setStoredToken } from '../lib/api';
import type { Company, SeekerProfile, User } from '../types';

interface AuthContextValue {
  user: User | null;
  company: Company | null;
  seekerProfile: SeekerProfile | null;
  savedJobIds: Set<string>;
  loading: boolean;
  refreshAuth: () => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  logout: () => void;
  toggleSaveJob: (jobId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [seekerProfile, setSeekerProfile] = useState<SeekerProfile | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);

  const refreshAuth = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setCompany(null);
      setSeekerProfile(null);
      setSavedJobIds(new Set());
      setLoading(false);
      return;
    }

    try {
      const data = await apiFetch<{
        user: User;
        company: Company | null;
        seekerProfile: SeekerProfile | null;
      }>('/api/auth/me');
      setUser(data.user);
      setCompany(data.company);
      setSeekerProfile(data.seekerProfile);

      try {
        const saved = await apiFetch<{ jobs: Array<{ id: string }> }>('/api/seeker/saved-jobs');
        setSavedJobIds(new Set(saved.jobs.map((j) => j.id)));
      } catch {
        setSavedJobIds(new Set());
      }
    } catch {
      setStoredToken(null);
      setUser(null);
      setCompany(null);
      setSeekerProfile(null);
      setSavedJobIds(new Set());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const loginWithToken = async (token: string) => {
    setStoredToken(token);
    await refreshAuth();
  };

  const logout = () => {
    setStoredToken(null);
    setUser(null);
    setCompany(null);
    setSeekerProfile(null);
    setSavedJobIds(new Set());
  };

  const toggleSaveJob = async (jobId: string): Promise<boolean> => {
    const res = await apiFetch<{ saved: boolean }>(`/api/seeker/saved-jobs/${jobId}`, {
      method: 'POST',
    });
    setSavedJobIds((prev) => {
      const next = new Set(prev);
      if (res.saved) next.add(jobId);
      else next.delete(jobId);
      return next;
    });
    return res.saved;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        company,
        seekerProfile,
        savedJobIds,
        loading,
        refreshAuth,
        loginWithToken,
        logout,
        toggleSaveJob,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
