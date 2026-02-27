import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

const AnnouncementsList = ({ limit }: { limit?: number }) => {
  const { data: announcements, isLoading } = useQuery({
    queryKey: ["announcements", limit],
    queryFn: async () => {
      let query = supabase
        .from("announcements")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader><div className="h-5 w-3/4 rounded bg-muted" /></CardHeader>
            <CardContent><div className="h-16 rounded bg-muted" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!announcements?.length) {
    return <p className="text-center text-muted-foreground font-body">No announcements at this time.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {announcements.map((a) => (
        <Card key={a.id} className="transition-shadow hover:shadow-lg">
          <CardHeader>
            <CardTitle className="font-display text-lg">{a.title}</CardTitle>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-body">
              <CalendarDays size={12} />
              {format(new Date(a.created_at), "MMM d, yyyy")}
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-body text-sm text-muted-foreground whitespace-pre-line">{a.content}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AnnouncementsList;
