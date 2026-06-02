import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { listMyChamas } from "@/lib/chama.functions";
import { useAuth } from "@/hooks/use-auth";

export type ChamaSummary = {
  id: string;
  name: string;
  type: string;
  location: string | null;
  role: "chairperson" | "treasurer" | "secretary" | "member";
};

type Ctx = {
  loading: boolean;
  chamas: ChamaSummary[];
  active: ChamaSummary | null;
  setActiveId: (id: string) => void;
  refresh: () => Promise<void>;
};

const ChamaContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "chamaos.activeChamaId";

export function ChamaProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [chamas, setChamas] = useState<ChamaSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveIdState] = useState<string | null>(
    typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null,
  );

  const load = useCallback(async () => {
    if (!user) {
      setChamas([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = (await listMyChamas()) as ChamaSummary[];
      setChamas(data);
      if (data.length && (!activeId || !data.find((c) => c.id === activeId))) {
        const next = data[0].id;
        setActiveIdState(next);
        window.localStorage.setItem(STORAGE_KEY, next);
      }
    } finally {
      setLoading(false);
    }
  }, [user, activeId]);

  useEffect(() => { void load(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const setActiveId = (id: string) => {
    setActiveIdState(id);
    window.localStorage.setItem(STORAGE_KEY, id);
  };

  const active = chamas.find((c) => c.id === activeId) ?? null;

  return (
    <ChamaContext.Provider value={{ chamas, active, loading, setActiveId, refresh: load }}>
      {children}
    </ChamaContext.Provider>
  );
}

export function useChama() {
  const ctx = useContext(ChamaContext);
  if (!ctx) throw new Error("useChama must be used inside ChamaProvider");
  return ctx;
}

export function useRole() {
  return useChama().active?.role ?? null;
}
