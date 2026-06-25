import { useEffect, useMemo, useState, type ReactNode } from "react";
import { UserContext, type UserContextValue } from "./sessionContext";
import { readStoredUser, refreshSessionExpiry, sessionRoleLabels, USER_STORAGE_KEY, withSessionToken, type SessionUser } from "./userSession";
import { lookupUserByEmail } from "@/lib/dataService";
import { normalizeRole } from "@/lib/rbac";

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [sessionChecking, setSessionChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function verifyStoredSession() {
      const storedUser = readStoredUser();
      if (!storedUser) {
        if (!cancelled) {
          setSessionChecking(false);
        }
        return;
      }

      try {
        const directoryUser = await lookupUserByEmail(storedUser.email);
        if (!directoryUser || !directoryUser.active) {
          throw new Error("Session is no longer active");
        }

        const verifiedRole = normalizeRole(directoryUser.role);
        if (verifiedRole !== storedUser.role) {
          throw new Error("Session role no longer matches directory access");
        }

        if (!cancelled) {
          setUser(
            withSessionToken({
              ...storedUser,
              id: directoryUser.id,
              name: directoryUser.name || storedUser.name,
              role: verifiedRole,
              region: directoryUser.region || storedUser.region,
              email: directoryUser.email || storedUser.email,
              active: directoryUser.active,
            }),
          );
        }
      } catch {
        if (!cancelled) {
          window.localStorage.removeItem(USER_STORAGE_KEY);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setSessionChecking(false);
        }
      }
    }

    void verifyStoredSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (user) {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    const logoutAt = new Date(user.expiresAt || 0).getTime();
    const timeoutMs = Math.max(0, logoutAt - Date.now());
    const timeout = window.setTimeout(() => setUser(null), timeoutMs);

    const extendSession = () => {
      setUser((current) => current ? refreshSessionExpiry(current) : current);
    };

    const events: Array<keyof WindowEventMap> = ["click", "keydown", "mousemove", "touchstart"];
    events.forEach((eventName) => window.addEventListener(eventName, extendSession));

    return () => {
      window.clearTimeout(timeout);
      events.forEach((eventName) => window.removeEventListener(eventName, extendSession));
    };
  }, [user]);

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      roleLabel: user ? sessionRoleLabels[user.role] : "Guest",
      setUser: (nextUser) => setUser(nextUser ? withSessionToken(nextUser) : null),
      logout: () => setUser(null),
      sessionChecking,
    }),
    [sessionChecking, user],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
