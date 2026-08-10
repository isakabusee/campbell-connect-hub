import { useState, useEffect, useRef, type MouseEvent, type KeyboardEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import type { LucideIcon } from "lucide-react";
import {
  FileText,
  FileArchive,
  FileSpreadsheet,
  FileImage,
  Presentation,
  FileType2,
  File,
  Loader2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

const IMAGE_RE = /\.(png|jpe?g|webp|gif|svg|bmp|heic|tiff?)$/i;
const PDF_RE = /\.pdf$/i;

type DocKind = "pdf" | "doc" | "sheet" | "slides" | "archive" | "image" | "code" | "file";
type DownloadState = "idle" | "loading" | "error";

/** Extract a readable filename from a storage URL. */
function fileNameFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    return decodeURIComponent(parts[parts.length - 1] || "attachment");
  } catch {
    return url.split("/").pop() || "attachment";
  }
}

function docKindFromName(name: string): DocKind {
  const lower = name.toLowerCase();
  if (PDF_RE.test(lower)) return "pdf";
  if (/\.(docx?|rtf|odt|pages|txt)$/i.test(lower)) return "doc";
  if (/\.(xlsx?|csv|ods|numbers)$/i.test(lower)) return "sheet";
  if (/\.(pptx?|odp|key)$/i.test(lower)) return "slides";
  if (/\.(zip|rar|7z|tar|gz|tgz|bz2|xz)$/i.test(lower)) return "archive";
  if (IMAGE_RE.test(lower)) return "image";
  if (/\.(js|jsx?|tsx?|json|html?|css|py|sh|xml|ya?ml|md)$/i.test(lower)) return "code";
  return "file";
}

function labelForKind(kind: DocKind): string {
  switch (kind) {
    case "pdf": return "PDF";
    case "doc": return "Document";
    case "sheet": return "Spreadsheet";
    case "slides": return "Slides";
    case "archive": return "Archive";
    case "image": return "Image";
    case "code": return "Code";
    default: return "File";
  }
}

function iconForKind(kind: DocKind): LucideIcon {
  switch (kind) {
    case "pdf": return FileText;
    case "doc": return FileType2;
    case "sheet": return FileSpreadsheet;
    case "slides": return Presentation;
    case "archive": return FileArchive;
    case "image": return FileImage;
    case "code": return FileText;
    default: return File;
  }
}

/** Downloads a file as a blob to verify it loads and to force a download. */
async function triggerBlobDownload(url: string, name: string, signal?: AbortSignal) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = name;
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke shortly after to ensure the download has started.
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}

/**
 * Document attachment chip with loading, retry, and error states.
 * On error, retries the fetch; offers a fallback to open in a new tab.
 * Guards against repeated clicks while a download is in flight and cancels
 * any previous in-flight request when a new one is started (e.g. on retry).
 */
function AttachmentDownload({ url, kind }: { url: string; kind: DocKind }) {
  const [state, setState] = useState<DownloadState>("idle");
  const name = fileNameFromUrl(url);
  const Icon = iconForKind(kind);
  const kindLabel = labelForKind(kind);

  // Ref holding the AbortController for the currently in-flight request, if any.
  // Using a ref (not state) avoids re-renders and survives rapid click events.
  const controllerRef = useRef<AbortController | null>(null);
  // Ref flag to synchronously guard against double-clicks before the state
  // update (disabled) has a chance to apply.
  const inFlightRef = useRef(false);

  const startDownload = async () => {
    // Cancel any previous in-flight request so its stale response can't land.
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    const controller = new AbortController();
    controllerRef.current = controller;

    setState("loading");
    try {
      await triggerBlobDownload(url, name, controller.signal);
      setState("idle");
      toast.success("Download started", { description: name });
    } catch (err) {
      // Ignore aborts triggered by our own retry / unmount guard.
      if (controller.signal.aborted) return;
      console.error("Bulletin download failed:", err);
      setState("error");
      toast.error("Couldn't download file", {
        description: "Please check your connection and try again.",
      });
    } finally {
      // Only clear our controller if it is still the active one (a newer
      // request may already have replaced it).
      if (controllerRef.current === controller) {
        controllerRef.current = null;
      }
      inFlightRef.current = false;
    }
  };

  const handleDownload = async (e: MouseEvent) => {
    e.preventDefault();
    // Guard against repeated clicks while a download is already running.
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    startDownload();
  };

  const handleRetry = async (e: MouseEvent) => {
    e.preventDefault();
    // Retry always cancels the previous request (if any) and starts fresh.
    startDownload();
    inFlightRef.current = true;
  };

  // Abort any in-flight request when the component unmounts.
  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
        controllerRef.current = null;
      }
    };
  }, []);

  const handleKey = (e: KeyboardEvent) => {
    // Allow Space and Enter to trigger the download (button handles this natively,
    // but ensure preventDefault on Space avoids page scroll on custom handlers).
    if (e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      (e.currentTarget as HTMLElement).click();
    }
  };

  const baseClass =
    "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-body transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  if (state === "error") {
    return (
      <span className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleRetry}
          aria-label={`Retry download of ${kindLabel.toLowerCase()} ${name}`}
          className={`${baseClass} border-destructive/40 bg-destructive/10 text-destructive hover:border-destructive`}
          title="Tap to retry the download"
        >
          <AlertTriangle size={14} className="shrink-0" aria-hidden="true" />
          <span className="font-semibold">Download failed</span>
          <span className="text-muted-foreground">· Retry</span>
        </button>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${kindLabel.toLowerCase()} ${name} in a new tab`}
          className="text-xs text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
        >
          Open in new tab instead
        </a>
      </span>
    );
  }

  const loading = state === "loading";
  const accessibleLabel = loading
    ? `Downloading ${kindLabel.toLowerCase()} ${name}, please wait`
    : `Download ${kindLabel.toLowerCase()} ${name}`;
  return (
    <button
      type="button"
      onClick={handleDownload}
      onKeyDown={handleKey}
      disabled={loading}
      aria-busy={loading}
      aria-label={accessibleLabel}
      title={loading ? "Downloading…" : "Click to download"}
      className={`${baseClass} ${
        loading
          ? "border-accent/40 bg-secondary text-accent cursor-progress"
          : "border-border bg-secondary/50 text-foreground hover:border-accent hover:text-accent"
      }`}
    >
      {loading ? (
        <Loader2 size={14} className="shrink-0 animate-spin" aria-hidden="true" />
      ) : (
        <Icon size={14} className="shrink-0" aria-hidden="true" />
      )}
      <span className="font-semibold uppercase tracking-wide" aria-hidden="true">
        {kindLabel}
      </span>
      <span className="hidden sm:inline text-muted-foreground" aria-hidden="true">·</span>
      <span
        className="hidden sm:inline max-w-[12rem] truncate text-muted-foreground"
        aria-hidden="true"
      >
        {loading ? "Downloading…" : name}
      </span>
    </button>
  );
}

/**
 * Image attachment with a lazy-load spinner and an error fallback that still
 * offers a direct link / download retry.
 */
function ImageAttachment({ url, alt }: { url: string; alt: string }) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const name = fileNameFromUrl(url);
  const downloadLabel = `Download image ${name}`;

  if (status === "error") {
    return (
      <div
        className="flex h-32 w-44 flex-col items-center justify-center gap-1 rounded-md border border-destructive/30 bg-secondary/50 p-3 text-center"
        role="alert"
      >
        <AlertTriangle size={18} className="shrink-0 text-destructive" aria-hidden="true" />
        <span className="font-body text-xs text-destructive font-semibold">Image unavailable</span>
        <span className="font-body text-[11px] text-muted-foreground line-clamp-1">{name}</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          download={name}
          aria-label={`Try opening image ${name} directly in a new tab`}
          className="mt-1 inline-flex items-center gap-1 text-[11px] text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
        >
          <ExternalLink size={11} aria-hidden="true" /> Try opening directly
        </a>
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      download={name}
      aria-label={downloadLabel}
      title="Click to download"
      className="relative block h-32 w-auto shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md"
    >
      {status === "loading" && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded-md bg-secondary/60"
          aria-hidden="true"
        >
          <Loader2 size={20} className="animate-spin text-muted-foreground" aria-hidden="true" />
        </div>
      )}
      <img
        src={url}
        alt={alt}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
        className={`h-32 w-auto rounded-md object-cover shadow-sm ring-1 ring-border transition ${
          status === "loaded" ? "opacity-100 hover:ring-accent" : "opacity-0"
        }`}
        loading="lazy"
      />
    </a>
  );
}

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
      {items.map((b) => {
        const imageUrls = (b.file_urls ?? []).filter((url) => IMAGE_RE.test(url));
        const docUrls = (b.file_urls ?? []).filter((url) => !IMAGE_RE.test(url));

        return (
          <div key={b.id} className="rounded-lg bg-card p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <FileText size={20} className="mt-0.5 shrink-0 text-accent" />
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-lg font-semibold">{b.title}</h3>
                <p className="text-xs text-muted-foreground font-body">{format(new Date(b.date), "MMM d, yyyy")}</p>
                {b.content && (
                  <p className="mt-2 font-body text-sm text-muted-foreground leading-relaxed line-clamp-3">{b.content}</p>
                )}
                {b.file_urls && b.file_urls.length > 0 && (
                  <div className="mt-3 space-y-3">
                    {imageUrls.length > 0 && (
                      <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
                        {imageUrls.map((url, i) => (
                          <li key={`img-${i}`}>
                            <ImageAttachment
                              url={url}
                              alt={`${b.title} attachment image ${i + 1}`}
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                    {docUrls.length > 0 && (
                      <ul className="flex flex-wrap gap-2">
                        {docUrls.map((url, i) => {
                          const kind = docKindFromName(fileNameFromUrl(url));
                          return (
                            <li key={`doc-${i}`}>
                              <AttachmentDownload url={url} kind={kind} />
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BulletinsList;
