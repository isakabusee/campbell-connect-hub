import { useRef, useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

function VideoThumbnail({ url }: { url: string }) {
  const [image, setImage] = useState<string>();
  const capture = (video: HTMLVideoElement) => {
    if (!video.videoWidth || !video.videoHeight) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 240;
      canvas.height = Math.round(240 * video.videoHeight / video.videoWidth);
      const context = canvas.getContext("2d");
      if (!context) return;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      setImage(canvas.toDataURL("image/jpeg", 0.8));
    } catch {
      // Keep the native video frame when a host disallows canvas access.
    }
  };

  return image ? (
    <img src={image} alt="" className="h-full w-full object-cover" />
  ) : (
    <video
      src={`${url}${url.includes("#") ? "" : "#t=0.1"}`}
      crossOrigin="anonymous"
      muted
      playsInline
      preload="metadata"
      aria-hidden="true"
      tabIndex={-1}
      className="h-full w-full object-cover"
      onLoadedMetadata={(event) => {
        const video = event.currentTarget;
        video.currentTime = Number.isFinite(video.duration) ? Math.min(0.1, video.duration / 2) : 0.1;
      }}
      onSeeked={(event) => capture(event.currentTarget)}
    />
  );
}

export default function AnnouncementVideos({ urls, title }: { urls: string[]; title: string }) {
  const [selected, setSelected] = useState<string>();
  const player = useRef<HTMLVideoElement>(null);

  return (
    <div className="space-y-2">
      {selected && (
        <video
          key={selected}
          ref={player}
          src={selected}
          controls
          autoPlay
          playsInline
          preload="metadata"
          aria-label={`${title} — selected video`}
          className="aspect-video w-full bg-muted object-contain"
        />
      )}
      <div className="space-y-1 px-3 py-2">
        {urls.map((url, index) => (
          <Button
            key={url}
            variant="ghost"
            aria-label={`Play video ${index + 1}: ${title}`}
            aria-pressed={selected === url}
            className={`h-auto w-full justify-start gap-3 whitespace-normal p-2 text-left ${selected === url ? "bg-muted ring-1 ring-border" : ""}`}
            onClick={() => {
              if (selected === url) {
                void player.current?.play().catch(() => undefined);
              } else {
                player.current?.pause();
                setSelected(url);
              }
            }}
          >
            <span className="relative block aspect-video w-24 shrink-0 overflow-hidden rounded bg-muted">
              <VideoThumbnail url={url} />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                  <Play aria-hidden="true" className="h-4 w-4" />
                </span>
              </span>
            </span>
            <span className="min-w-0 font-body text-sm">Video {index + 1}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}