import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { FileText, Image as ImageIcon, Download, FileType2, File } from "lucide-react";

const IMAGE_RE = /\.(png|jpe?g|webp|gif|svg)$/i;
const PDF_RE = /\.pdf$/i;

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

type DocKind = "pdf" | "doc" | "sheet" | "slides" | "archive" | "file";

function docKindFromName(name: string): DocKind {
  const lower = name.toLowerCase();
  if (PDF_RE.test(lower)) return "pdf";
  if (/\.(docx?|rtf|odt|pages)$/i.test(lower)) return "doc";
  if (/\.(xlsx?|csv|ods)$/i.test(lower)) return "sheet";
  if (/\.(pptx?|odp|key)$/i.test(lower)) return "slides";
  if (/\.(zip|rar|7z|tar|gz)$/i.test(lower)) return "archive";
  return "file";
}

function labelForKind(kind: DocKind): string {
  switch (kind) {
    case "pdf": return "PDF";
    case "doc": return "Document";
    case "sheet": return "Spreadsheet";
    case "slides": return "Slides";
    case "archive": return "Archive";
    default: return "File";
  }
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
                          <a
                            key={`img-${i}`}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={fileNameFromUrl(url)}
                            title="Click to download"
                          >
                            <img
                              src={url}
                              alt={`${b.title} attachment ${i + 1}`}
                              className="h-32 w-auto rounded-md object-cover shadow-sm ring-1 ring-border transition hover:ring-accent"
                              loading="lazy"
                            />
                          </a>
                        ))}
                      </div>
                    )}
                    {docUrls.length > 0 && (
                      <ul className="flex flex-wrap gap-2">
                        {docUrls.map((url, i) => {
                          const name = fileNameFromUrl(url);
                          const kind = docKindFromName(name);
                          return (
                            <li key={`doc-${i}`}>
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={kind === "file" ? undefined : name}
                                className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 py-1.5 text-xs font-body text-foreground transition hover:border-accent hover:text-accent"
                              >
                                {kind === "pdf" ? (
                                  <FileText size={14} className="shrink-0" />
                                ) : kind === "archive" ? (
                                  <Download size={14} className="shrink-0" />
                                ) : kind === "sheet" || kind === "slides" ? (
                                  <FileType2 size={14} className="shrink-0" />
                                ) : (
                                  <File size={14} className="shrink-0" />
                                )}
                                <span className="font-semibold uppercase tracking-wide">{labelForKind(kind)}</span>
                                <span className="hidden sm:inline text-muted-foreground">·</span>
                                <span className="hidden sm:inline max-w-[12rem] truncate text-muted-foreground">{name}</span>
                              </a>
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
