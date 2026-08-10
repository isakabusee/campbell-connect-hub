import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Camera, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

/** Image that fades in once decoded, showing a skeleton placeholder until then. */
const LazyImage = ({
  src,
  alt,
  className = "",
  wrapperClassName = "",
  eager = false,
}: {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  eager?: boolean;
}) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-muted ${wrapperClassName}`}>
      {!loaded && !failed && <Skeleton className="absolute inset-0 h-full w-full rounded-none" />}
      {failed ? (
        <div className="flex h-full min-h-[8rem] w-full items-center justify-center">
          <Camera size={28} className="text-muted-foreground/40" aria-hidden="true" />
          <span className="sr-only">Image unavailable</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={eager ? "high" : "low"}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`${className} transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
};

const GalleryPage = () => {
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ photos: any[]; index: number } | null>(null);

  const { data: albums, isLoading } = useQuery({
    queryKey: ["albums"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("albums")
        .select("*, photos(id, url, caption, sort_order)")
        .eq("published", true)
        .order("event_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const activeAlbum = albums?.find((a) => a.id === selectedAlbum);
  const sortedPhotos = activeAlbum?.photos?.sort((a: any, b: any) => a.sort_order - b.sort_order) ?? [];

  const openLightbox = (photos: any[], index: number) => setLightbox({ photos, index });
  const closeLightbox = useCallback(() => setLightbox(null), []);
  const prevPhoto = useCallback(() => {
    setLightbox((lb) => (lb ? { ...lb, index: (lb.index - 1 + lb.photos.length) % lb.photos.length } : lb));
  }, []);
  const nextPhoto = useCallback(() => {
    setLightbox((lb) => (lb ? { ...lb, index: (lb.index + 1) % lb.photos.length } : lb));
  }, []);

  // Keyboard navigation + scroll lock while the lightbox is open
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") prevPhoto();
      else if (e.key === "ArrowRight") nextPhoto();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightbox, closeLightbox, prevPhoto, nextPhoto]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-secondary">
        {/* Hero */}
        <div className="bg-primary py-16 text-primary-foreground">
          <div className="container">
            <h1 className="mb-2 font-display text-5xl font-bold tracking-tight">Photo Gallery</h1>
            <p className="max-w-xl font-body text-lg text-primary-foreground/80">
              Relive our favorite moments — worship, fellowship, and community.
            </p>
          </div>
        </div>

        <div className="container py-12">
          {isLoading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading gallery">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-[4/3] w-full rounded-none" />
                  <CardContent className="space-y-2 pt-4">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Album detail view */}
          {selectedAlbum && activeAlbum ? (
            <div>
              <button
                onClick={() => setSelectedAlbum(null)}
                className="mb-6 flex items-center gap-1 font-body text-sm text-accent hover:underline"
              >
                <ChevronLeft size={16} /> Back to Albums
              </button>
              <h2 className="mb-1 font-display text-3xl font-bold">{activeAlbum.title}</h2>
              {activeAlbum.event_date && (
                <p className="mb-2 font-body text-sm text-muted-foreground">
                  {format(new Date(activeAlbum.event_date), "MMMM d, yyyy")}
                </p>
              )}
              {activeAlbum.description && (
                <p className="mb-8 max-w-2xl font-body text-muted-foreground">{activeAlbum.description}</p>
              )}

              {sortedPhotos.length === 0 ? (
                <p className="font-body text-muted-foreground">No photos in this album yet.</p>
              ) : (
                <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
                  {sortedPhotos.map((photo: any, idx: number) => (
                    <button
                      type="button"
                      key={photo.id}
                      aria-label={`View photo ${idx + 1} of ${sortedPhotos.length}`}
                      className="group mb-4 block w-full cursor-pointer break-inside-avoid overflow-hidden rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      onClick={() => openLightbox(sortedPhotos, idx)}
                    >
                      <LazyImage
                        src={photo.url}
                        alt={photo.caption || "Church photo"}
                        eager={idx < 4}
                        wrapperClassName="min-h-[8rem] rounded-lg"
                        className="w-full rounded-lg transition-transform duration-300 group-hover:scale-105"
                      />
                      {photo.caption && (
                        <p className="mt-1 font-body text-xs text-muted-foreground">{photo.caption}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Albums grid */
            <>
              {!isLoading && !albums?.length && (
                <div className="py-16 text-center">
                  <Camera size={48} className="mx-auto mb-4 text-muted-foreground/40" />
                  <p className="font-display text-xl font-semibold text-muted-foreground">No albums yet</p>
                  <p className="font-body text-sm text-muted-foreground/70">Check back soon for photos!</p>
                </div>
              )}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {albums?.map((album) => {
                  const photoCount = album.photos?.length ?? 0;
                  const cover = album.cover_url || (album.photos as any)?.[0]?.url;
                  return (
                    <Card
                      key={album.id}
                      className="group cursor-pointer overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1"
                      onClick={() => setSelectedAlbum(album.id)}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-primary/5">
                        {cover ? (
                          <img
                            src={cover}
                            alt={album.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Camera size={40} className="text-primary/20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                          <h3 className="font-display text-lg font-bold text-white">{album.title}</h3>
                          <div className="flex items-center gap-3 text-xs text-white/80 font-body">
                            {album.event_date && <span>{format(new Date(album.event_date), "MMM d, yyyy")}</span>}
                            <span>{photoCount} photo{photoCount !== 1 ? "s" : ""}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Lightbox */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={closeLightbox}
        >
          <button
            type="button"
            aria-label="Close photo viewer"
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X size={24} />
          </button>
          {lightbox.photos.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
                className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              >
                <ChevronLeft size={28} />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
                className="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}
          <div className="max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightbox.photos[lightbox.index].url}
              alt={lightbox.photos[lightbox.index].caption || "Photo"}
              className="max-h-[85vh] max-w-full rounded-lg object-contain"
            />
            {lightbox.photos[lightbox.index].caption && (
              <p className="mt-3 text-center font-body text-sm text-white/80">
                {lightbox.photos[lightbox.index].caption}
              </p>
            )}
            <p className="mt-1 text-center font-body text-xs text-white/50">
              {lightbox.index + 1} / {lightbox.photos.length}
            </p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default GalleryPage;
