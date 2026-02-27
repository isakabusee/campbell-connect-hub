import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Paperclip } from "lucide-react";

const BulletinsList = ({ limit }: { limit?: number }) => {
  const { data: bulletins, isLoading } = useQuery({
    queryKey: ["bulletins", limit],
    queryFn: async () => {
      let query = supabase
        .from("bulletins")
        .select("*")
        .eq("published", true)
        .order("date", { ascending: false });
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader><div className="h-5 w-3/4 rounded bg-muted" /></CardHeader>
            <CardContent><div className="h-20 rounded bg-muted" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!bulletins?.length) {
    return <p className="text-center text-muted-foreground font-body">No bulletins at this time.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {bulletins.map((b) => (
        <Card key={b.id} className="transition-shadow hover:shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-accent" />
              <CardTitle className="font-display text-lg">{b.title}</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground font-body">
              {format(new Date(b.date), "MMMM d, yyyy")}
            </p>
          </CardHeader>
          <CardContent>
            <p className="font-body text-sm text-muted-foreground whitespace-pre-line">{b.content}</p>
            {b.file_urls && b.file_urls.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {b.file_urls.map((url: string, i: number) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-md bg-accent/10 px-3 py-1.5 text-xs font-body text-accent hover:bg-accent/20 transition-colors">
                    <Paperclip size={14} />
                    {b.file_urls!.length > 1 ? `Attachment ${i + 1}` : "View Attachment"}
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BulletinsList;
