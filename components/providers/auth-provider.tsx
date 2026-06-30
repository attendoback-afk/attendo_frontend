"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  ApiError,
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from "@/lib/api/client";
import { authApi } from "@/lib/api/services";
import type { AuthRole, CurrentUser, LoginPayload } from "@/lib/api/types";
import { hasAnyRole, isAssistant, isManager, isProfessor } from "@/lib/auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";

type LoginOptions = {
  remember?: boolean;
};

type AuthContextValue = {
  user: CurrentUser | null;
  token: string | null;
  status: AuthStatus;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (
    payload: LoginPayload,
    options?: LoginOptions,
  ) => Promise<CurrentUser>;
  logout: () => void;
  refreshCurrentUser: () => Promise<CurrentUser | null>;
  hasRole: (role: AuthRole) => boolean;
  hasAnyRole: (roles: readonly AuthRole[]) => boolean;
  canAccess: (roles?: readonly AuthRole[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Unable to load your profile.";
}

function isUnauthorizedError(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [token, setTokenState] = useState<string | null>(() => getAuthToken());
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  const resetAuth = useCallback(() => {
    clearAuthToken();
    setTokenState(null);
    setUser(null);
    setError(null);
    setStatus("unauthenticated");
    setBootstrapping(false);
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    const storedToken = getAuthToken();

    if (!storedToken) {
      resetAuth();
      return null;
    }

    setTokenState(storedToken);
    setStatus("loading");
    setError(null);
    setBootstrapping(true);

    try {
      const currentUser = await authApi.me();
      setUser(currentUser);
      setStatus("authenticated");
      return currentUser;
    } catch (refreshError) {
      setError(getErrorMessage(refreshError));

      if (isUnauthorizedError(refreshError)) {
        resetAuth();
      } else {
        setUser(null);
        setStatus("error");
        setBootstrapping(false);
      }

      return null;
    } finally {
      setBootstrapping(false);
    }
  }, [resetAuth]);

  useEffect(() => {
    let mounted = true;

    async function bootstrapSession() {
      const storedToken = getAuthToken();

      if (!storedToken) {
        if (mounted) {
          resetAuth();
        }
        return;
      }

      try {
        setTokenState(storedToken);
        setStatus("loading");
        setError(null);
        setBootstrapping(true);

        const currentUser = await authApi.me();

        if (!mounted) {
          return;
        }

        setUser(currentUser);
        setStatus("authenticated");
      } catch (bootstrapError) {
        if (!mounted) {
          return;
        }

        setError(getErrorMessage(bootstrapError));

        if (isUnauthorizedError(bootstrapError)) {
          resetAuth();
        } else {
          setUser(null);
          setStatus("error");
        }
      } finally {
        if (mounted) {
          setBootstrapping(false);
        }
      }
    }

    void bootstrapSession();

    return () => {
      mounted = false;
    };
  }, [resetAuth]);

  useEffect(() => {
    const handleUnauthorized = () => {
      resetAuth();
    };

    window.addEventListener("attendo:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("attendo:unauthorized", handleUnauthorized);
  }, [resetAuth]);

  const login = useCallback(
    async (payload: LoginPayload, options: LoginOptions = {}) => {
      setError(null);

      try {
        const response = await authApi.login(payload, {
          remember: options.remember ?? true,
        });
        const nextToken = response.token ?? response.accessToken;

        if (!nextToken) {
          throw new Error("Login succeeded but no access token was returned.");
        }

        setAuthToken(nextToken, options.remember ?? true);
        setTokenState(nextToken);

        const currentUser = await authApi.me();
        setUser(currentUser);
        setStatus("authenticated");
        setBootstrapping(false);
        return currentUser;
      } catch (loginError) {
        setError(getErrorMessage(loginError));

        if (isUnauthorizedError(loginError)) {
          resetAuth();
        } else {
          setUser(null);
          setStatus("error");
          setBootstrapping(false);
        }

        throw loginError;
      }
    },
    [resetAuth],
  );

  const logout = useCallback(() => {
    resetAuth();
    router.replace("/login");
  }, [resetAuth, router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      status,
      loading: bootstrapping,
      error,
      isAuthenticated: status === "authenticated" && Boolean(user),
      login,
      logout,
      refreshCurrentUser,
      hasRole: (role) => user?.user?.role === role,
      hasAnyRole: (roles) => (user ? hasAnyRole(user, roles) : false),
      canAccess: (roles) => {
        if (!user) {
          return false;
        }

        if (user.user.role === "MANAGER") {
          return true;
        }

        if (!roles || roles.length === 0) {
          return true;
        }

        return hasAnyRole(user, roles);
      },
    }),
    [
      bootstrapping,
      error,
      login,
      logout,
      refreshCurrentUser,
      status,
      token,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}

export function useCurrentUser() {
  return useAuth().user;
}

export function useAuthStatus() {
  return useAuth().status;
}

export { isAssistant, isManager, isProfessor };
