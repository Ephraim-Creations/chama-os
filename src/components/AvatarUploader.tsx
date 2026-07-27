import { useEffect, useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { initialsOf } from "@/lib/mock-data";

/** Resolves a private storage path into a temporary viewable URL. */
export function useAvatarPreview(path: string | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    if (!path) {
      setUrl(null);
      return;
    }
    void supabase.storage
      .from("avatars")
      .createSignedUrl(path, 3600)
      .then(({ data }) => {
        if (!cancelled) setUrl(data?.signedUrl ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [path]);
  return url;
}

export function AvatarUploader({
  userId,
  name,
  path,
  onUploaded,
}: {
  userId: string;
  name: string;
  path: string | null;
  onUploaded: (path: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const preview = useAvatarPreview(path);

  const pick = async (file: File) => {
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Please choose an image under 4MB");
      return;
    }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const key = `${userId}/avatar-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("avatars").upload(key, file, { upsert: true });
      if (error) throw error;
      onUploaded(key);
      toast.success("Photo uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-20 w-20 border border-border">
        {preview && <AvatarImage src={preview} alt={name} />}
        <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
          {initialsOf(name || "?")}
        </AvatarFallback>
      </Avatar>
      <div>
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-xl"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
          {path ? "Change photo" : "Upload photo"}
        </Button>
        <p className="mt-1 text-xs text-muted-foreground">JPG or PNG, up to 4MB.</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void pick(f);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
