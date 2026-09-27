import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { api, ApiError } from '../lib/api';

export type AuthUser = {
  id: string;
  email: string;
  displayName: string | null;
};

type AuthMeResponse = {
  success: boolean;
  data: {
    user: AuthUser;
  };
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  refreshUser: () => Promise<AuthUser | null>;
  logout: () => Promise<void>;
};

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined,
  );

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  const refreshUser = useCallback(
    async (): Promise<AuthUser | null> => {
      try {
        const response =
          await api<AuthMeResponse>(
            '/api/auth/me',
          );

        const authenticatedUser =
          response.data.user;

        setUser(authenticatedUser);

        return authenticatedUser;
      } catch (error) {
        /*
         * A 401 simply means there is no valid
         * authenticated session.
         */
        if (
          error instanceof ApiError &&
          error.status === 401
        ) {
          setUser(null);
          return null;
        }

        /*
         * Preserve the unauthenticated state for
         * unexpected errors as well. The caller can
         * retry through refreshUser().
         */
        setUser(null);
        return null;
      }
    },
    [],
  );

  const logout = useCallback(
    async () => {
      try {
        await api(
          '/api/auth/logout',
          {
            method: 'POST',
          },
        );
      } finally {
        setUser(null);
      }
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;

    const checkAuthentication =
      async () => {
        try {
          const response =
            await api<AuthMeResponse>(
              '/api/auth/me',
            );

          if (!cancelled) {
            setUser(response.data.user);
          }
        } catch (error) {
          if (!cancelled) {
            /*
             * 401 = normal unauthenticated state.
             *
             * Other failures are also kept as
             * unauthenticated for now; the API
             * layer already exposes the real error
             * when an explicit refresh is requested.
             */
            setUser(null);
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    void checkAuthentication();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      refreshUser,
      logout,
    }),
    [
      user,
      loading,
      refreshUser,
      logout,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider',
    );
  }

  return context;
}