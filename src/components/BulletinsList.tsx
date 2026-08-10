import { useState, type MouseEvent } from "react";
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
async function triggerBlobDownload(url: string, name: string) {
  const res = await fetch(url);
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
 */
function AttachmentDownload({ url, kind }: { url: string; kind: DocKind }) {
  const [state, setState] = useState<DownloadState>("idle");
  const name = fileNameFromUrl(url);
  const Icon = iconForKind(kind);
  const kindLabel = labelForKind(kind);

  const handleDownload = async (e: MouseEvent) => {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    try {
      await triggerBlobDownload(url, name);
      setState("idle");
      toast.success("Download started", { description: name });
    } catch (err) {
      console.error("Bulletin download failed:", err);
      setState("error");
      toast.error("Couldn't download file", {
        description: "Please check your connection and try again.",
      });
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
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
          onClick={handleDownload}
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

  if (status === "error") {
    return (
      <div className="flex h-32 w-44 flex-col items-center justify-center gap-1 rounded-md border border-destructive/30 bg-secondary/50 p-3 text-center">
        <AlertTriangle size={18} className="shrink-0 text-destructive" />
        <span className="font-body text-xs text-destructive font-semibold">Image unavailable</span>
        <span className="font-body text-[11px] text-muted-foreground line-clamp-1">{name}</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          download={name}
          className="mt-1 inline-flex items-center gap-1 text-[11px] text-accent hover:underline"
        >
          <ExternalLink size={11} /> Try opening directly
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
      title="Click to download"
      className="relative block h-32 w-auto shrink-0"
    >
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center rounded-md bg-secondary/60">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
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
                      <div className="flex flex-wrap gap-2">
                        {imageUrls.map((url, i) => (
                          <ImageAttachment key={`img-${i}`} url={url} alt={`${b.title} attachment ${i + 1}`} />
                        ))}
                      </div>
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
