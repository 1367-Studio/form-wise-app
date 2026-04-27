"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type Child = {
  id: string;
  firstName: string;
  lastName: string;
  class?: { name: string } | null;
};

type Ctx = {
  /** All the parent's children. */
  children: Child[];
  /** Are we still loading the children list? */
  loading: boolean;
  /** null = "all children" (no filter). */
  selectedChildId: string | null;
  setSelectedChildId: (id: string | null) => void;
  /** Resolved selected child object, or null when filter = "all". */
  selectedChild: Child | null;
};

const SelectedChildContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "fw:selectedChildId";

export function SelectedChildProvider({
  children: kids,
}: {
  children: React.ReactNode;
}) {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChildId, setSelectedChildIdState] = useState<string | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;
    fetch("/api/students")
      .then((r) => (r.ok ? r.json() : { students: [] }))
      .then((data) => {
        if (cancelled) return;
        const list = (data.students ?? []) as Child[];
        setChildren(list);

        // Hydrate from localStorage; auto-pick the only child if there's one.
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored && list.some((c) => c.id === stored)) {
            setSelectedChildIdState(stored);
          } else if (list.length === 1) {
            setSelectedChildIdState(list[0].id);
            localStorage.setItem(STORAGE_KEY, list[0].id);
          }
        } catch {
          // localStorage may be unavailable (private mode, etc.) — fine
        }
      })
      .catch(() => {
        if (!cancelled) setChildren([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setSelectedChildId = useCallback((id: string | null) => {
    setSelectedChildIdState(id);
    try {
      if (id) localStorage.setItem(STORAGE_KEY, id);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const selectedChild =
    children.find((c) => c.id === selectedChildId) ?? null;

  return (
    <SelectedChildContext.Provider
      value={{
        children,
        loading,
        selectedChildId,
        setSelectedChildId,
        selectedChild,
      }}
    >
      {kids}
    </SelectedChildContext.Provider>
  );
}

export function useSelectedChild(): Ctx {
  const ctx = useContext(SelectedChildContext);
  if (!ctx) {
    throw new Error(
      "useSelectedChild must be used within <SelectedChildProvider>"
    );
  }
  return ctx;
}

/**
 * Same as useSelectedChild but returns null instead of throwing when used
 * outside the provider — handy for shared components rendered in roles
 * other than PARENT.
 */
export function useOptionalSelectedChild(): Ctx | null {
  return useContext(SelectedChildContext);
}
