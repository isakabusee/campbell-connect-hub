import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Paperclip } from "lucide-react";

const getEmbedUrl = (url: string): string | null => {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.slice(1).split("/")[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (u.pathname === "/watch") {
        const id = u.searchParams.get("v");
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      const m = u.pathname.match(/^\/(shorts|embed|live)\/([^/?]+)/);
      if (m) return `https://www.youtube.com/embed/${m[2]}`;
    }
    if (host === "vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
};

const VideoLink = ({ url, title }: { url: string; title: string }) => {
  const embed = getEmbedUrl(url);
  if (embed) {
    return (
      <iframe
        src={embed}
        title={title}
        className="aspect-video w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    );
  }
  if (/\.(mp4|mov|webm|m4v|ogg)(\?|#|$)/i.test(url)) {
    return <video src={url} controls playsInline preload="metadata" className="aspect-video w-full bg-muted object-contain" />;
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-accent font-body underline">
      ▶ Watch video
    </a>
  );
};

const AnnouncementsList = ({ limit }: { limit?: number }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <p className="font-body text-sm text-muted-foreground">Loading announcements…</p>;
  }

  const items = limit ? (data ?? []).slice(0, limit) : (data ?? []);

  if (items.length === 0) {
    return <p className="font-body text-sm text-muted-foreground">No announcements yet.</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {items.map((a) => (
        <div key={a.id} className="rounded-lg bg-card p-6 shadow-sm">
          {a.media_urls?.length > 0 && (
            <div className="-mx-6 -mt-6 mb-4 space-y-2 overflow-hidden rounded-t-lg">
              {a.media_urls.map((u) =>
                /\.(mp4|mov|webm|m4v|ogg)$/i.test(u) ? (
                  <video key={u} src={u} controls playsInline preload="metadata" className="aspect-video w-full bg-muted object-contain" />
                ) : (
                  <img key={u} src={u} alt={a.title} loading="lazy" className="aspect-video w-full object-cover" />
                )
              )}
            </div>
          )}
          <p className="text-xs text-muted-foreground font-body">{format(new Date(a.created_at), "MMM d, yyyy")}</p>
          <h3 className="mt-1 font-display text-lg font-semibold">{a.title}</h3>
          <p className="mt-2 font-body text-sm text-muted-foreground leading-relaxed line-clamp-3">{a.content}</p>
          {a.file_url && (
            <a
              href={a.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs text-accent font-body"
            >
              <Paperclip size={12} /> Attachment
            </a>
          )}
        </div>
      ))}
    </div>
  );
};

export default AnnouncementsList;
