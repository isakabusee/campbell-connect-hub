import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Paperclip } from "lucide-react";

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
