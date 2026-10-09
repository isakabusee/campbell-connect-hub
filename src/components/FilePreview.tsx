import { useState, type MouseEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Loader2 } from "lucide-react";

export type PreviewKind = "image" | "pdf" | "other";

export type PreviewTarget = {
  url: string;
  name: string;
  kind: PreviewKind;
} | null;

/** Which file kinds can be shown inline in the preview dialog. */
export function previewKindFromName(name: string): PreviewKind {
  if (/\.(png|jpe?g|webp|gif|svg|bmp|heic|tiff?)$/i.test(name)) return "image";
  if (/\.pdf$/i.test(name)) return "pdf";
  return "other";
}

/** Downloads a file as a blob so cross-origin `download` attributes still work. */
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
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}

export function DownloadFileButton({ url, name }: { url: string; name: string }) {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");

  const handle = async (e: MouseEvent) => {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    try {
      await triggerBlobDownload(url, name);
      setState("idle");
    } catch {
      // Fall back to a direct link so the visitor still gets the file.
      window.open(url, "_blank", "noopener,noreferrer");
      setState("idle");
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handle}
      disabled={state === "loading"}
      aria-busy={state === "loading"}
      aria-label={`Download ${name}`}
      className="font-body"
    >
      {state === "loading" ? (
        <Loader2 size={14} className="mr-2 animate-spin" aria-hidden="true" />
      ) : (
        <Download size={14} className="mr-2" aria-hidden="true" />
      )}
      Download
    </Button>
  );
}

/**
 * Full preview dialog for bulletin attachments. Images show inline, PDFs render
 * in an embedded viewer, and other file types offer download / open-in-tab.
 */
export function FilePreviewDialog({
  target,
  onClose,
}: {
  target: PreviewTarget;
  onClose: () => void;
}) {
  if (!target) return null;
  const { url, name, kind } = target;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl font-body">
        <DialogHeader>
          <DialogTitle className="pr-6 text-base break-all">{name}</DialogTitle>
          <DialogDescription className="sr-only">
            {kind === "image"
              ? "Image preview"
              : kind === "pdf"
                ? "Document preview"
                : "File preview is not available for this file type"}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          {kind === "image" && (
            <div className="flex max-h-[70vh] items-center justify-center overflow-hidden rounded-md bg-secondary/40">
              <img
                src={url}
                alt={`Preview of ${name}`}
                className="max-h-[70vh] w-auto max-w-full object-contain"
              />
            </div>
          )}

          {kind === "pdf" && (
            <iframe
              src={`${url}#view=FitH`}
              title={`Preview of ${name}`}
              className="h-[70vh] w-full rounded-md border bg-secondary/40"
            />
          )}

          {kind === "other" && (
            <div className="rounded-md border border-border bg-secondary/40 p-6 text-center">
              <p className="text-sm text-muted-foreground">
                This file type can't be previewed in the browser.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Download it or open it in a new tab to view the contents.
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${name} in a new tab`}
            className="inline-flex h-9 items-center rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <ExternalLink size={14} className="mr-2" aria-hidden="true" />
            Open in new tab
          </a>
          <DownloadFileButton url={url} name={name} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
