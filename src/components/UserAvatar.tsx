import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { initialsOf } from "@/lib/mock-data";

/** Cache signed URLs so a list of members only signs each photo once. */
const cache = new Map<string, Promise<string | null>>();

function signedUrl(path: string) {
  const hit = cache.get(path);
  if (hit) return hit;
  const p = supabase.storage
    .from("avatars")
    .createSignedUrl(path, 3600)
    .then(({ data }) => data?.signedUrl ?? null)
    .catch(() => null);
  cache.set(path, p);
  return p;
}

/** Resolves a private storage path into a temporary viewable URL. */
export function useAvatarUrl(path: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    if (!path) {
      setUrl(null);
      return;
    }
    if (/^https?:\/\//i.test(path)) {
      setUrl(path);
      return;
    }
    void signedUrl(path).then((u) => {
      if (!cancelled) setUrl(u);
    });
    return () => {
      cancelled = true;
    };
  }, [path]);
  return url;
}

export function UserAvatar({
  name,
  path,
  className,
  fallbackClassName,
}: {
  name: string;
  path: string | null | undefined;
  className?: string;
  fallbackClassName?: string;
}) {
  const url = useAvatarUrl(path);
  return (
    <Avatar className={cn("border border-border", className)}>
      {url && <AvatarImage src={url} alt={name} className="object-cover" />}
      <AvatarFallback
        className={cn("bg-primary/10 text-sm font-semibold text-primary", fallbackClassName)}
      >
        {initialsOf(name || "?")}
      </AvatarFallback>
    </Avatar>
  );
}
