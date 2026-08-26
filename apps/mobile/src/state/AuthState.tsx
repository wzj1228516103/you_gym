import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { AppUser, clearSession, fetchMe, loadStoredSession, logoutApp, saveSession, updateMe } from '../services/api';
import { setAnalyticsUser } from '../services/analytics';
import { migrateGuestFavoriteExercises } from '../services/favorites';

type AuthStateValue = {
  loading: boolean; token: string | null; user: AppUser | null; guest: boolean;
  authenticate: (accessToken: string, user: AppUser) => Promise<void>;
  continueAsGuest: () => void; updateProfile: (input: Partial<AppUser>) => Promise<AppUser>; logout: () => Promise<void>;
};
const AuthStateContext = createContext<AuthStateValue | null>(null);

export function AuthStateProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(true); const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AppUser | null>(null); const [guest, setGuest] = useState(false);
  useEffect(() => { void (async () => { const stored = await loadStoredSession(); if (stored) { try { const current = await fetchMe(stored.accessToken); setToken(stored.accessToken); setUser(current); setAnalyticsUser(current.id); try { await migrateGuestFavoriteExercises(stored.accessToken, current.id); } catch { /* Keep local guest data for a later retry if sync is unavailable. */ } } catch { await clearSession(); } } setLoading(false); })(); }, []);
  const value = useMemo<AuthStateValue>(() => ({ loading, token, user, guest,
    authenticate: async (accessToken, current) => { setToken(accessToken); setUser(current); setGuest(false); setAnalyticsUser(current.id); await saveSession({ accessToken, user: current }); try { await migrateGuestFavoriteExercises(accessToken, current.id); } catch { /* A failed sync must not block login. */ } },
    continueAsGuest: () => { setGuest(true); setToken(null); setUser(null); setAnalyticsUser(null); },
    updateProfile: async (input) => { if (!token) throw new Error('请先登录'); const current = await updateMe(token, input); setUser(current); await saveSession({ accessToken: token, user: current }); return current; },
    logout: async () => { const currentToken = token; setToken(null); setUser(null); setGuest(false); setAnalyticsUser(null); try { if (currentToken) await logoutApp(currentToken); } finally { await clearSession(); } },
  }), [guest, loading, token, user]);
  return <AuthStateContext.Provider value={value}>{children}</AuthStateContext.Provider>;
}
export function useAuthState() { const value=useContext(AuthStateContext); if(!value) throw new Error('useAuthState must be used inside AuthStateProvider'); return value; }
