import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Camera, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

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
  const closeLightbox = () => setLightbox(null);
  const prevPhoto = () => {
    if (!lightbox) return;
    setLightbox({ ...lightbox, index: (lightbox.index - 1 + lightbox.photos.length) % lightbox.photos.length });
  };
  const nextPhoto = () => {
    if (!lightbox) return;
    setLightbox({ ...lightbox, index: (lightbox.index + 1) % lightbox.photos.length });
  };

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
          {isLoading && <p className="font-body text-muted-foreground">Loading gallery…</p>}

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
                    <div
                      key={photo.id}
                      className="mb-4 cursor-pointer overflow-hidden rounded-lg break-inside-avoid group"
                      onClick={() => openLightbox(sortedPhotos, idx)}
                    >
                      <img
                        src={photo.url}
                        alt={photo.caption || "Church photo"}
                        className="w-full rounded-lg transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      {photo.caption && (
                        <p className="mt-1 font-body text-xs text-muted-foreground">{photo.caption}</p>
                      )}
                    </div>
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={closeLightbox}
        >
          <button
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X size={24} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
            className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
            className="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <ChevronRight size={28} />
          </button>
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
