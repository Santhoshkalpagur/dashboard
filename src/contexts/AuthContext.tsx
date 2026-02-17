import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { User, UserRole } from "@/types/atm";
import { authApi, getToken, setToken } from "@/services/api";

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

/* -----------------------------------------------------
   Decode JWT (client-side only, no verification)
----------------------------------------------------- */
function decodeJWT(token: string): Record<string, any> | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

/* -----------------------------------------------------
   Convert token → User object
----------------------------------------------------- */
function userFromToken(token: string): User {
  const payload = decodeJWT(token);

  const role: UserRole =
    payload?.role === "admin" ? "admin" : "user";

  return {
    id: payload?.sub || payload?.user_id || "unknown",
    username: payload?.username || payload?.email || "user",
    email: payload?.email || "",
    role,
    assignedATMs:
      payload?.assigned_devices ||
      payload?.assignedATMs ||
      [],
    name: payload?.name || payload?.email || "User",
  };
}

/* -----------------------------------------------------
   Auth Provider
----------------------------------------------------- */
export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* Restore session on page refresh */
  useEffect(() => {
    const token = getToken();

    if (token) {
      const payload = decodeJWT(token);

      if (payload) {
        setUser(userFromToken(token));
      } else {
        setToken(null);
      }
    }

    setIsLoading(false);
  }, []);

  /* ------------------ LOGIN ------------------ */
  const login = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      try {
        const data = await authApi.login(username, password);

        if (!data?.access_token) {
          return false;
        }

        // Save JWT
        setToken(data.access_token);

        // Create user from token
        const newUser = userFromToken(data.access_token);
        setUser(newUser);

        return true;
      } catch (error) {
        console.error("Login failed:", error);
        return false;
      }
    },
    []
  );

  /* ------------------ LOGOUT ------------------ */
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAdmin: user?.role === "admin",
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* -----------------------------------------------------
   Hook
----------------------------------------------------- */
export const useAuth = () => {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return ctx;
};
