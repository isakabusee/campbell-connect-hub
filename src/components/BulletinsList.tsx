import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { FileText } from "lucide-react";

const BulletinsList = ({ limit }: { limit?: number }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["bulletins"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bulletins")
        .select("*")
        .eq("published", true)
        .order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <p className="font-body text-sm text-muted-foreground">Loading bulletins…</p>;
  }

  const items = limit ? (data ?? []).slice(0, limit) : (data ?? []);

  if (items.length === 0) {
    return <p className="font-body text-sm text-muted-foreground">No bulletins yet.</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {items.map((b) => (
        <div key={b.id} className="rounded-lg bg-card p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <FileText size={20} className="mt-0.5 shrink-0 text-accent" />
            <div>
              <h3 className="font-display text-lg font-semibold">{b.title}</h3>
              <p className="text-xs text-muted-foreground font-body">{format(new Date(b.date), "MMM d, yyyy")}</p>
              {b.content && (
                <p className="mt-2 font-body text-sm text-muted-foreground leading-relaxed line-clamp-3">{b.content}</p>
              )}
              {b.file_urls && b.file_urls.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {b.file_urls.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent font-body hover:underline"
                    >
                      View PDF {b.file_urls!.length > 1 ? i + 1 : ""}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BulletinsList;
