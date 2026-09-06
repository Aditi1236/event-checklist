import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import apiClient, { setToken } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [members, setMembers] = useState([]);

  const refreshMembers = useCallback(async () => {
    try {
      setMembers(await apiClient.listUsers());
    } catch {
      /* admin-only endpoint; ignore */
    }
  }, []);

  // Restore session from stored token.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await apiClient.me();
        if (!cancelled) setUser(me);
      } catch {
        setToken("");
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function login(email, password) {
    // Basic email validation
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email format');
    }
    
    // Normalize email to lowercase and trim whitespace
    const normalizedEmail = email.trim().toLowerCase();
    
    try {
      const data = await apiClient.login(normalizedEmail, password);
      if (!data || !data.user) {
        throw new Error('Login failed: Invalid credentials');
      }
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      // Re-throw with more context
      throw new Error(`Authentication failed: ${err.message || 'Unknown error'}`);
    }
  }

  async function signup(name, email, password, role) {
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email format');
    }
    const normalizedEmail = email.trim().toLowerCase();
    
    try {
      const data = await apiClient.signup(name, normalizedEmail, password, role);
      if (!data || !data.user) {
        throw new Error('Signup failed');
      }
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      throw new Error(`Signup failed: ${err.message || 'Unknown error'}`);
    }
  }

  async function logout() {
    try {
      await apiClient.logout();
    } catch {
      /* ignore */
    }
    setToken("");
    setUser(null);
    setMembers([]);
  }

  const value = useMemo(
    () => ({
      user,
      loaded,
      isAdmin: user?.role === "admin",
      login,
      signup,
      logout,
      members,
      refreshMembers,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, loaded, members, refreshMembers]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default AuthContext;