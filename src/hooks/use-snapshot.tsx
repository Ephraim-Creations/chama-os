import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getChamaSnapshot } from "@/lib/chama-data.functions";
import { useChama } from "@/context/chama-context";

type Snapshot = Awaited<ReturnType<typeof getChamaSnapshot>>;

export function useSnapshot() {
  const { active } = useChama();
  const fetchSnapshot = useServerFn(getChamaSnapshot);
  const [data, setData] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!active) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetchSnapshot({ data: { chamaId: active.id } });
      setData(res as Snapshot);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [active?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { snapshot: data, loading, refresh };
}
