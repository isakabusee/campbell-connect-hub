import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { format, parseISO } from "date-fns";
import { Play, Pause, User, Calendar, Search, Video, Music } from "lucide-react";
import { useState, useRef, useMemo } from "react";

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}

const SermonsPage = () => {
  const [search, setSearch] = useState("");
  const [speakerFilter, setSpeakerFilter] = useState("all");

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

  const speakers = useMemo(() => {
    if (!sermons) return [];
    const set = new Set(sermons.map((s) => s.speaker));
    return Array.from(set).sort();
  }, [sermons]);

  const filtered = useMemo(() => {
    if (!sermons) return [];
    return sermons.filter((s) => {
      const matchesSearch =
        !search ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.speaker.toLowerCase().includes(search.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(search.toLowerCase()));
      const matchesSpeaker = speakerFilter === "all" || s.speaker === speakerFilter;
      return matchesSearch && matchesSpeaker;
    });
  }, [sermons, search, speakerFilter]);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-secondary">
        {/* Hero header */}
        <div className="bg-primary py-16 text-primary-foreground">
          <div className="container">
            <h1 className="mb-2 font-display text-5xl font-bold tracking-tight">Sermon Archive</h1>
            <p className="mb-8 max-w-xl font-body text-lg text-primary-foreground/80">
              Revisit powerful messages and be inspired by God's Word. Listen, watch, and grow in faith.
            </p>

            {/* Search & Filter */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search sermons…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-card text-foreground border-none"
                />
              </div>
              <select
                value={speakerFilter}
                onChange={(e) => setSpeakerFilter(e.target.value)}
                className="rounded-md border-none bg-card px-4 py-2 font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="all">All Speakers</option>
                {speakers.map((sp) => (
                  <option key={sp} value={sp}>{sp}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="container py-12">
          {isLoading && <p className="font-body text-muted-foreground">Loading sermons…</p>}

          {!isLoading && !filtered.length && (
            <div className="py-16 text-center">
              <Video size={48} className="mx-auto mb-4 text-muted-foreground/40" />
              <p className="font-display text-xl font-semibold text-muted-foreground">No sermons found</p>
              <p className="font-body text-sm text-muted-foreground/70">Try adjusting your search or filter.</p>
            </div>
          )}

          {/* Featured sermon */}
          {featured && (
            <div className="mb-12">
              <h2 className="mb-4 font-body text-xs font-bold uppercase tracking-widest text-accent">Latest Sermon</h2>
              <FeaturedSermonCard sermon={featured} />
            </div>
          )}

          {/* Grid of remaining */}
          {rest.length > 0 && (
            <>
              <h2 className="mb-6 font-body text-xs font-bold uppercase tracking-widest text-muted-foreground">
                More Sermons ({rest.length})
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((sermon) => (
                  <SermonCard key={sermon.id} sermon={sermon} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

function VideoEmbed({ sermon }: { sermon: any }) {
  const videoLink = sermon.video_link;
  const videoUrl = sermon.video_url;

  if (videoLink) {
    const ytId = extractYouTubeId(videoLink);
    if (ytId) {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${ytId}`}
          className="aspect-video w-full rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={sermon.title}
        />
      );
    }
    const vimeoId = extractVimeoId(videoLink);
    if (vimeoId) {
      return (
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}`}
          className="aspect-video w-full rounded-lg"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title={sermon.title}
        />
      );
    }
  }

  if (videoUrl) {
    return (
      <video controls preload="metadata" className="aspect-video w-full rounded-lg bg-black" src={videoUrl} />
    );
  }

  return null;
}

function FeaturedSermonCard({ sermon }: { sermon: any }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasVideo = sermon.video_link || sermon.video_url;

  const togglePlay = () => {
    if (!audioRef.current || !sermon.audio_url) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
    setPlaying(!playing);
  };

  return (
    <Card className="overflow-hidden shadow-xl border-none">
      <div className={`grid ${hasVideo ? "lg:grid-cols-5" : ""}`}>
        {hasVideo && (
          <div className="lg:col-span-3 bg-black flex items-center">
            <VideoEmbed sermon={sermon} />
          </div>
        )}
        <CardContent className={`flex flex-col justify-center p-8 ${hasVideo ? "lg:col-span-2" : ""}`}>
          <h3 className="mb-3 font-display text-2xl font-bold leading-tight">{sermon.title}</h3>
          <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground font-body">
            <User size={16} className="text-accent" />
            <span>{sermon.speaker}</span>
          </div>
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground font-body">
            <Calendar size={16} className="text-accent" />
            <span>{format(parseISO(sermon.date), "MMMM d, yyyy")}</span>
          </div>
          {sermon.description && (
            <p className="mb-6 text-sm text-muted-foreground font-body leading-relaxed">{sermon.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            {sermon.audio_url && (
              <>
                <audio ref={audioRef} src={sermon.audio_url} onEnded={() => setPlaying(false)} preload="none" />
                <button
                  onClick={togglePlay}
                  className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-body font-semibold text-accent-foreground shadow-md transition-all hover:bg-accent/90 hover:shadow-lg"
                >
                  {playing ? <Pause size={16} /> : <Play size={16} />}
                  {playing ? "Pause" : "Listen Now"}
                </button>
              </>
            )}
            {sermon.video_link && (
              <a
                href={sermon.video_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-body font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Video size={16} />
                Watch on {sermon.video_link.includes("youtube") || sermon.video_link.includes("youtu.be") ? "YouTube" : "Vimeo"}
              </a>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

function SermonCard({ sermon }: { sermon: any }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasVideo = sermon.video_link || sermon.video_url;

  const togglePlay = () => {
    if (!audioRef.current || !sermon.audio_url) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
    setPlaying(!playing);
  };

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
      {hasVideo && (
        <div className="bg-black">
          <VideoEmbed sermon={sermon} />
        </div>
      )}
      {!hasVideo && (
        <div className="flex h-32 items-center justify-center bg-primary/5">
          <Music size={32} className="text-primary/30" />
        </div>
      )}
      <CardContent className="p-5">
        <h3 className="mb-2 font-display text-base font-bold leading-tight group-hover:text-accent transition-colors">{sermon.title}</h3>
        <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground font-body">
          <User size={12} />
          <span>{sermon.speaker}</span>
        </div>
        <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground font-body">
          <Calendar size={12} />
          <span>{format(parseISO(sermon.date), "MMM d, yyyy")}</span>
        </div>
        {sermon.description && (
          <p className="mb-4 text-xs text-muted-foreground font-body line-clamp-2">{sermon.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {sermon.audio_url && (
            <>
              <audio ref={audioRef} src={sermon.audio_url} onEnded={() => setPlaying(false)} preload="none" />
              <button
                onClick={togglePlay}
                className="flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-xs font-body font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
              >
                {playing ? <Pause size={14} /> : <Play size={14} />}
                {playing ? "Pause" : "Listen"}
              </button>
            </>
          )}
          {sermon.video_link && (
            <a
              href={sermon.video_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-body font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Video size={14} />
              Watch
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default SermonsPage;
