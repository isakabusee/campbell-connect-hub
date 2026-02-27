import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Play, Pause, User, Calendar, Video } from "lucide-react";
import { useState, useRef } from "react";

const SermonsPage = () => {
  const { data: sermons, isLoading } = useQuery({
    queryKey: ["sermons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sermons")
        .select("*")
        .eq("published", true)
        .order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-secondary py-16">
        <div className="container">
          <h1 className="mb-2 font-display text-4xl font-bold">Sermon Archive</h1>
          <p className="mb-10 font-body text-muted-foreground">
            Listen to past sermons and be inspired by God's Word.
          </p>

          {isLoading && <p className="font-body text-muted-foreground">Loading sermons…</p>}

          {!isLoading && !sermons?.length && (
            <p className="font-body text-muted-foreground">No sermons available yet. Check back soon!</p>
          )}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sermons?.map((sermon) => (
              <SermonCard key={sermon.id} sermon={sermon} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

function SermonCard({ sermon }: { sermon: any }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current || !sermon.audio_url) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      {sermon.video_url && (
        <video
          controls
          preload="metadata"
          className="w-full aspect-video bg-black"
          src={sermon.video_url}
        />
      )}
      <CardContent className="p-6">
        <h3 className="mb-2 font-display text-lg font-bold leading-tight">{sermon.title}</h3>
        <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground font-body">
          <User size={14} />
          <span>{sermon.speaker}</span>
        </div>
        <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground font-body">
          <Calendar size={14} />
          <span>{format(new Date(sermon.date), "MMMM d, yyyy")}</span>
        </div>
        {sermon.description && (
          <p className="mb-4 text-sm text-muted-foreground font-body line-clamp-3">{sermon.description}</p>
        )}
        <div className="flex items-center gap-3">
          {sermon.audio_url && (
            <>
              <audio
                ref={audioRef}
                src={sermon.audio_url}
                onEnded={() => setPlaying(false)}
                preload="none"
              />
              <button
                onClick={togglePlay}
                className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-body font-medium text-accent-foreground transition-colors hover:bg-accent/90"
              >
                {playing ? <Pause size={16} /> : <Play size={16} />}
                {playing ? "Pause" : "Listen"}
              </button>
            </>
          )}
          {!sermon.audio_url && !sermon.video_url && (
            <span className="text-xs text-muted-foreground font-body italic">Media not available</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default SermonsPage;
