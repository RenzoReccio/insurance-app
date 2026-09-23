import { useState, useEffect, useCallback } from 'react';
import { endorseApi } from '../api/endorse.api';

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('jwt_token'));
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  const fetchToken = useCallback(async () => {
    setIsAuthenticating(true);
    try {
      // 1. Healthcheck
      const health = await endorseApi.checkHealth();
      setApiOnline(health.statusCode === 200);

      // 2. Fetch JWT
      const res = await endorseApi.getToken();
      if (res.data?.accessToken) {
        setToken(res.data.accessToken);
        setUser(res.data.user);
        localStorage.setItem('jwt_token', res.data.accessToken);
      }
    } catch {
      setApiOnline(false);
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  return {
    token,
    user,
    isAuthenticating,
    apiOnline,
    refreshToken: fetchToken,
  };
}
