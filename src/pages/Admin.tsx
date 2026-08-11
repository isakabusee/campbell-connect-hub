import { useState } from "react";
import { compressIfImage } from "@/lib/compressImage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Trash2, Upload, CalendarDays, ImagePlus, Plus, Users, ArrowLeft, ArrowRight, Star } from "lucide-react";
import { format } from "date-fns";
import { supabase as sb } from "@/integrations/supabase/client";

const AdminPage = () => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return null;
  if (!user || !isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="container">
          <h1 className="mb-8 font-display text-4xl font-bold">Admin Dashboard</h1>
          <Tabs defaultValue="announcements">
            <TabsList className="mb-6 flex-wrap">
              <TabsTrigger value="announcements" className="font-body">Announcements</TabsTrigger>
              <TabsTrigger value="bulletins" className="font-body">Bulletins</TabsTrigger>
              <TabsTrigger value="sermons" className="font-body">Sermons</TabsTrigger>
              <TabsTrigger value="events" className="font-body">Events</TabsTrigger>
              <TabsTrigger value="gallery" className="font-body">Gallery</TabsTrigger>
              <TabsTrigger value="groups" className="font-body">Groups</TabsTrigger>
              <TabsTrigger value="messages" className="font-body">Messages</TabsTrigger>
            </TabsList>
            <TabsContent value="announcements"><AnnouncementsAdmin userId={user.id} /></TabsContent>
            <TabsContent value="bulletins"><BulletinsAdmin userId={user.id} /></TabsContent>
            <TabsContent value="sermons"><SermonsAdmin userId={user.id} /></TabsContent>
            <TabsContent value="events"><EventsAdmin userId={user.id} /></TabsContent>
            <TabsContent value="gallery"><GalleryAdmin userId={user.id} /></TabsContent>
            <TabsContent value="groups"><SmallGroupsAdmin /></TabsContent>
            <TabsContent value="messages"><MessagesAdmin /></TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

function AnnouncementsAdmin({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: items } = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      setUploading(true);
      setUploadProgress(0);
      let file_url: string | null = null;

      if (file) {
        setUploadProgress(10);
        const compressed = await compressIfImage(file);
        setUploadProgress(40);
        const ext = file.name.split(".").pop();
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("bulletins").upload(path, compressed);
        if (uploadError) throw uploadError;
        setUploadProgress(90);
        const { data: urlData } = supabase.storage.from("bulletins").getPublicUrl(path);
        file_url = urlData.publicUrl;
        setUploadProgress(100);
      }

      const { error } = await supabase.from("announcements").insert({ title, content, author_id: userId, file_url });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Announcement created!");
      setTitle(""); setContent(""); setFile(null);
      setUploading(false); setUploadProgress(0);
      qc.invalidateQueries({ queryKey: ["admin-announcements"] });
      qc.invalidateQueries({ queryKey: ["announcements"] });
    },
    onError: (err: any) => { toast.error(err?.message || "Failed to create announcement."); setUploading(false); },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted.");
      qc.invalidateQueries({ queryKey: ["admin-announcements"] });
      qc.invalidateQueries({ queryKey: ["announcements"] });
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="font-display">New Announcement</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label className="font-body">Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><Label className="font-body">Content</Label><Textarea rows={4} value={content} onChange={(e) => setContent(e.target.value)} /></div>
          <div className="rounded-lg border border-border p-4 space-y-2">
            <p className="font-body text-sm font-semibold text-foreground">Attachment (optional)</p>
            <Label className="font-body text-sm text-muted-foreground">Upload a PDF, image, or document</Label>
            <Input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            {file && <p className="text-xs text-muted-foreground font-body">Selected: {file.name}</p>}
          </div>
          {uploading && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-body text-muted-foreground">
                <span>Uploading file…</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
          <Button onClick={() => create.mutate()} disabled={!title || !content || uploading || create.isPending} className="font-body">
            <Upload size={16} className="mr-2" />
            {uploading ? "Uploading…" : "Create Announcement"}
          </Button>
        </CardContent>
      </Card>
      <div className="space-y-3">
        {items?.map((a) => (
          <Card key={a.id}>
            <CardContent className="flex items-start justify-between pt-4">
              <div>
                <p className="font-display font-semibold">{a.title}</p>
                <p className="text-xs text-muted-foreground font-body">{format(new Date(a.created_at), "MMM d, yyyy")}</p>
                <p className="mt-1 text-sm text-muted-foreground font-body">{a.content}</p>
                {a.file_url && (
                  <a href={a.file_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-accent font-body">
                    📎 Attachment
                  </a>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={() => del.mutate(a.id)}><Trash2 size={16} className="text-destructive" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function BulletinsAdmin({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: items } = useQuery({
    queryKey: ["admin-bulletins"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bulletins").select("*").order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const create = useMutation({
    mutationFn: async () => {
      setUploading(true);
      setUploadProgress(0);
      let completed = 0;
      const total = files.length || 1;
      const file_urls = await Promise.all(
        files.map(async (file) => {
          const compressed = await compressIfImage(file);
          const ext = file.name.split(".").pop();
          const path = `${crypto.randomUUID()}.${ext}`;
          const { error: uploadError } = await supabase.storage.from("bulletins").upload(path, compressed);
          if (uploadError) throw uploadError;
          completed++;
          setUploadProgress(Math.round((completed / total) * 100));
          const { data: urlData } = supabase.storage.from("bulletins").getPublicUrl(path);
          return urlData.publicUrl;
        })
      );

      const { error } = await supabase.from("bulletins").insert({ title, content, date, author_id: userId, file_urls });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Bulletin created!");
      setTitle(""); setContent(""); setFiles([]);
      setUploading(false); setUploadProgress(0);
      qc.invalidateQueries({ queryKey: ["admin-bulletins"] });
      qc.invalidateQueries({ queryKey: ["bulletins"] });
    },
    onError: (err: any) => { toast.error(err?.message || "Failed to create bulletin."); setUploading(false); },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bulletins").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-bulletins"] });
      qc.invalidateQueries({ queryKey: ["bulletins"] });
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="font-display">New Bulletin</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label className="font-body">Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><Label className="font-body">Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div><Label className="font-body">Content</Label><Textarea rows={6} value={content} onChange={(e) => setContent(e.target.value)} /></div>
          <div className="rounded-lg border border-border p-4 space-y-2">
            <p className="font-body text-sm font-semibold text-foreground">Attachments (optional)</p>
            <Label className="font-body text-sm text-muted-foreground">Upload PDFs, images, or documents</Label>
            <Input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp" multiple onChange={handleFileChange} />
            {files.length > 0 && (
              <ul className="space-y-1">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center justify-between rounded bg-muted px-2 py-1 text-xs font-body">
                    <span className="truncate">{f.name}</span>
                    <button type="button" onClick={() => removeFile(i)} className="ml-2 text-destructive hover:underline">Remove</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {uploading && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-body text-muted-foreground">
                <span>Uploading files…</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
          <Button onClick={() => create.mutate()} disabled={!title || !content || uploading || create.isPending} className="font-body">
            <Upload size={16} className="mr-2" />
            {uploading ? "Uploading…" : "Create Bulletin"}
          </Button>
        </CardContent>
      </Card>
      <div className="space-y-3">
        {items?.map((b) => (
          <Card key={b.id}>
            <CardContent className="flex items-start justify-between pt-4">
              <div>
                <p className="font-display font-semibold">{b.title}</p>
                <p className="text-xs text-muted-foreground font-body">{format(new Date(b.date), "MMMM d, yyyy")}</p>
                <p className="mt-1 text-sm text-muted-foreground font-body whitespace-pre-line">{b.content}</p>
                {b.file_urls && b.file_urls.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {b.file_urls.map((url: string, i: number) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-accent font-body">
                        📎 Attachment {b.file_urls!.length > 1 ? i + 1 : ""}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={() => del.mutate(b.id)}><Trash2 size={16} className="text-destructive" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MessagesAdmin() {
  const { data: messages } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-3">
      {!messages?.length && <p className="text-muted-foreground font-body">No messages yet.</p>}
      {messages?.map((m) => (
        <Card key={m.id}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <p className="font-display font-semibold">{m.subject}</p>
              <span className="text-xs text-muted-foreground font-body">{format(new Date(m.created_at), "MMM d, yyyy")}</span>
            </div>
            <p className="text-xs text-muted-foreground font-body">{m.name} — {m.email}</p>
            <p className="mt-2 text-sm font-body">{m.message}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SermonsAdmin({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoLink, setVideoLink] = useState("");
  const [uploading, setUploading] = useState(false);

  const { data: items } = useQuery({
    queryKey: ["admin-sermons"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sermons").select("*").order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      setUploading(true);
      let audio_url: string | null = null;
      let video_url: string | null = null;

      if (audioFile) {
        const ext = audioFile.name.split(".").pop();
        const path = `audio/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("sermons").upload(path, audioFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("sermons").getPublicUrl(path);
        audio_url = urlData.publicUrl;
      }

      if (videoFile) {
        const ext = videoFile.name.split(".").pop();
        const path = `video/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("sermons").upload(path, videoFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("sermons").getPublicUrl(path);
        video_url = urlData.publicUrl;
      }

      const { error } = await supabase.from("sermons").insert({
        title, speaker, date,
        description: description || null,
        audio_url,
        video_url,
        video_link: videoLink || null,
        author_id: userId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Sermon added!");
      setTitle(""); setSpeaker(""); setDescription(""); setAudioFile(null); setVideoFile(null); setVideoLink("");
      setUploading(false);
      qc.invalidateQueries({ queryKey: ["admin-sermons"] });
      qc.invalidateQueries({ queryKey: ["sermons"] });
    },
    onError: (err: any) => { toast.error(err?.message || "Failed to add sermon."); setUploading(false); },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sermons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-sermons"] });
      qc.invalidateQueries({ queryKey: ["sermons"] });
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="font-display">New Sermon</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="font-body">Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div><Label className="font-body">Speaker</Label><Input value={speaker} onChange={(e) => setSpeaker(e.target.value)} /></div>
          </div>
          <div><Label className="font-body">Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div><Label className="font-body">Description (optional)</Label><Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="rounded-lg border border-border p-4 space-y-3">
            <p className="font-body text-sm font-semibold text-foreground">Media</p>
            <div>
              <Label className="font-body">Audio File (MP3)</Label>
              <Input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)} />
            </div>
            <div>
              <Label className="font-body">Video File (MP4) — or use a link below</Label>
              <Input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)} />
            </div>
            <div>
              <Label className="font-body">YouTube / Vimeo Link</Label>
              <Input value={videoLink} onChange={(e) => setVideoLink(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
            </div>
          </div>
          <Button onClick={() => create.mutate()} disabled={!title || !speaker || uploading || create.isPending} className="font-body">
            <Upload size={16} className="mr-2" />
            {uploading ? "Uploading…" : "Add Sermon"}
          </Button>
        </CardContent>
      </Card>
      <div className="space-y-3">
        {items?.map((s) => (
          <Card key={s.id}>
            <CardContent className="flex items-start justify-between pt-4">
              <div>
                <p className="font-display font-semibold">{s.title}</p>
                <p className="text-xs text-muted-foreground font-body">{s.speaker} — {format(new Date(s.date), "MMMM d, yyyy")}</p>
                {s.description && <p className="mt-1 text-sm text-muted-foreground font-body">{s.description}</p>}
                <div className="mt-1 flex gap-3">
                  {s.audio_url && <span className="text-xs text-accent font-body">🎵 Audio</span>}
                  {s.video_url && <span className="text-xs text-accent font-body">🎬 Video</span>}
                  {s.video_link && <span className="text-xs text-accent font-body">🔗 Link</span>}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => del.mutate(s.id)}><Trash2 size={16} className="text-destructive" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function EventsAdmin({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const { data: items } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").order("start_time", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("events").insert({
        title,
        description: description || null,
        location: location || null,
        start_time: new Date(startTime).toISOString(),
        end_time: endTime ? new Date(endTime).toISOString() : null,
        author_id: userId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Event created!");
      setTitle(""); setDescription(""); setLocation(""); setStartTime(""); setEndTime("");
      qc.invalidateQueries({ queryKey: ["admin-events"] });
      qc.invalidateQueries({ queryKey: ["events"] });
    },
    onError: () => toast.error("Failed to create event."),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-events"] });
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="font-display">New Event</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label className="font-body">Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><Label className="font-body">Location (optional)</Label><Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Main Sanctuary" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="font-body">Start</Label><Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></div>
            <div><Label className="font-body">End (optional)</Label><Input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></div>
          </div>
          <div><Label className="font-body">Description (optional)</Label><Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <Button onClick={() => create.mutate()} disabled={!title || !startTime || create.isPending} className="font-body">
            <CalendarDays size={16} className="mr-2" />
            {create.isPending ? "Creating…" : "Add Event"}
          </Button>
        </CardContent>
      </Card>
      <div className="space-y-3">
        {items?.map((ev) => (
          <Card key={ev.id}>
            <CardContent className="flex items-start justify-between pt-4">
              <div>
                <p className="font-display font-semibold">{ev.title}</p>
                <p className="text-xs text-muted-foreground font-body">
                  {format(new Date(ev.start_time), "MMM d, yyyy h:mm a")}
                  {ev.end_time && ` – ${format(new Date(ev.end_time), "h:mm a")}`}
                </p>
                {ev.location && <p className="text-xs text-muted-foreground font-body">📍 {ev.location}</p>}
                {ev.description && <p className="mt-1 text-sm text-muted-foreground font-body">{ev.description}</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => del.mutate(ev.id)}><Trash2 size={16} className="text-destructive" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function GalleryAdmin({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumDesc, setAlbumDesc] = useState("");
  const [albumDate, setAlbumDate] = useState("");
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [photoFiles, setPhotoFiles] = useState<FileList | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [newAlbumFiles, setNewAlbumFiles] = useState<File[]>([]);

  const { data: albums } = useQuery({
    queryKey: ["admin-albums"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("albums")
        .select("*, photos(id, url, caption, sort_order)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createAlbum = useMutation({
    mutationFn: async () => {
      const { data: album, error } = await supabase.from("albums").insert({
        title: albumTitle,
        description: albumDesc || null,
        event_date: albumDate || null,
        author_id: userId,
      }).select("id").single();
      if (error) throw error;

      if (newAlbumFiles.length > 0 && album) {
        setUploading(true);
        setUploadProgress(0);
        const uploaded = await runPool(
          newAlbumFiles,
          4,
          async (file, i) => {
            const compressed = await compressIfImage(file);
            const ext = compressed.name.split(".").pop() || "webp";
            const path = `${album.id}/${crypto.randomUUID()}.${ext}`;
            const { error: uploadError } = await supabase.storage
              .from("gallery")
              .upload(path, compressed, { cacheControl: "31536000", contentType: compressed.type });
            if (uploadError) throw uploadError;
            const { data: urlData } = supabase.storage.from("gallery").getPublicUrl(path);
            return { album_id: album.id, url: urlData.publicUrl, caption: null, sort_order: i };
          },
          (done, total) => setUploadProgress(Math.round((done / total) * 100)),
        );
        const { error: insertError } = await supabase.from("photos").insert(uploaded);
        if (insertError) throw insertError;
        await supabase.from("albums").update({ cover_url: uploaded[0].url }).eq("id", album.id);
      }
    },
    onSuccess: () => {
      toast.success("Album created!");
      setAlbumTitle(""); setAlbumDesc(""); setAlbumDate(""); setNewAlbumFiles([]);
      setUploading(false); setUploadProgress(0);
      qc.invalidateQueries({ queryKey: ["admin-albums"] });
      qc.invalidateQueries({ queryKey: ["albums"] });
    },
    onError: (err: any) => { toast.error(err?.message || "Failed to create album."); setUploading(false); setUploadProgress(0); },
  });

  const deleteAlbum = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("albums").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-albums"] });
      qc.invalidateQueries({ queryKey: ["albums"] });
      setSelectedAlbumId(null);
    },
  });

  const uploadPhotos = useMutation({
    mutationFn: async () => {
      if (!photoFiles || !selectedAlbumId) return;
      setUploading(true);
      setUploadProgress(0);
      const albumId = selectedAlbumId;
      const offset = ((albums?.find((a) => a.id === albumId)?.photos as any[]) ?? []).length;
      const files = Array.from(photoFiles);
      const rows = await runPool(
        files,
        4,
        async (file, i) => {
          const compressed = await compressIfImage(file);
          const ext = compressed.name.split(".").pop() || "webp";
          const path = `${albumId}/${crypto.randomUUID()}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from("gallery")
            .upload(path, compressed, { cacheControl: "31536000", contentType: compressed.type });
          if (uploadError) throw uploadError;
          const { data: urlData } = supabase.storage.from("gallery").getPublicUrl(path);
          return {
            album_id: albumId,
            url: urlData.publicUrl,
            caption: caption || null,
            sort_order: offset + i,
          };
        },
        (done, total) => setUploadProgress(Math.round((done / total) * 100)),
      );
      const { error: insertError } = await supabase.from("photos").insert(rows);
      if (insertError) throw insertError;
    },
    onSuccess: () => {
      toast.success("Photos uploaded!");
      setPhotoFiles(null); setCaption("");
      setUploading(false); setUploadProgress(0);
      qc.invalidateQueries({ queryKey: ["admin-albums"] });
      qc.invalidateQueries({ queryKey: ["albums"] });
    },
    onError: (err: any) => { toast.error(err?.message || "Failed to upload photos."); setUploading(false); setUploadProgress(0); },
  });

  const deletePhoto = useMutation({
    mutationFn: async (photo: { id: string; url: string; album_id?: string }) => {
      const { error } = await supabase.from("photos").delete().eq("id", photo.id);
      if (error) throw error;
      // If this photo was the album cover, promote the next remaining photo.
      const album = albums?.find((a) => a.id === selectedAlbumId);
      if (album && album.cover_url === photo.url) {
        const next = (album.photos as any[])
          .filter((p) => p.id !== photo.id)
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];
        await supabase.from("albums").update({ cover_url: next?.url ?? null }).eq("id", album.id);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-albums"] });
      qc.invalidateQueries({ queryKey: ["albums"] });
    },
    onError: (err: any) => toast.error(err?.message || "Failed to delete photo."),
  });

  const setCover = useMutation({
    mutationFn: async ({ albumId, url }: { albumId: string; url: string }) => {
      const { error } = await supabase.from("albums").update({ cover_url: url }).eq("id", albumId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Cover image updated.");
      qc.invalidateQueries({ queryKey: ["admin-albums"] });
      qc.invalidateQueries({ queryKey: ["albums"] });
    },
    onError: (err: any) => toast.error(err?.message || "Failed to set cover."),
  });

  const reorderPhotos = useMutation({
    mutationFn: async ({ ordered }: { ordered: any[] }) => {
      await Promise.all(
        ordered.map((p, i) =>
          supabase.from("photos").update({ sort_order: i }).eq("id", p.id).then(({ error }) => {
            if (error) throw error;
          }),
        ),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-albums"] });
      qc.invalidateQueries({ queryKey: ["albums"] });
    },
    onError: (err: any) => toast.error(err?.message || "Failed to reorder photos."),
  });

  const activeAlbum = albums?.find((a) => a.id === selectedAlbumId);
  const activePhotos = ((activeAlbum?.photos as any[]) ?? [])
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const movePhoto = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= activePhotos.length) return;
    const ordered = activePhotos.slice();
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    reorderPhotos.mutate({ ordered });
  };

  return (
    <div className="space-y-6">
      {/* Create Album */}
      <Card>
        <CardHeader><CardTitle className="font-display">New Album</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="font-body">Title</Label><Input value={albumTitle} onChange={(e) => setAlbumTitle(e.target.value)} /></div>
            <div><Label className="font-body">Event Date (optional)</Label><Input type="date" value={albumDate} onChange={(e) => setAlbumDate(e.target.value)} /></div>
          </div>
          <div><Label className="font-body">Description (optional)</Label><Textarea rows={2} value={albumDesc} onChange={(e) => setAlbumDesc(e.target.value)} /></div>
          <div>
            <Label className="font-body">Photos (optional)</Label>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setNewAlbumFiles(Array.from(e.target.files ?? []))}
            />
            {newAlbumFiles.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {newAlbumFiles.map((file, i) => (
                  <div key={`${file.name}-${i}`} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="h-20 w-20 rounded-md object-cover ring-1 ring-border"
                    />
                    <button
                      type="button"
                      aria-label={`Remove ${file.name}`}
                      onClick={() => setNewAlbumFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                <p className="w-full font-body text-xs text-muted-foreground">
                  First photo will be used as the album cover.
                </p>
              </div>
            )}
          </div>
          <Button onClick={() => createAlbum.mutate()} disabled={!albumTitle || createAlbum.isPending} className="font-body">
            <Plus size={16} className="mr-2" />
            {createAlbum.isPending ? "Creating…" : newAlbumFiles.length > 0 ? `Create Album (${newAlbumFiles.length} photos)` : "Create Album"}
          </Button>
        </CardContent>
      </Card>

      {/* Album List */}
      <div className="space-y-3">
        {albums?.map((album) => (
          <Card key={album.id} className={`cursor-pointer transition-colors ${selectedAlbumId === album.id ? "ring-2 ring-accent" : ""}`}>
            <CardContent className="flex items-start justify-between pt-4" onClick={() => setSelectedAlbumId(selectedAlbumId === album.id ? null : album.id)}>
              <div>
                <p className="font-display font-semibold">{album.title}</p>
                <p className="text-xs text-muted-foreground font-body">
                  {album.event_date && format(new Date(album.event_date), "MMM d, yyyy") + " · "}
                  {(album.photos as any[])?.length ?? 0} photos
                </p>
                {album.description && <p className="mt-1 text-sm text-muted-foreground font-body">{album.description}</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); deleteAlbum.mutate(album.id); }}>
                <Trash2 size={16} className="text-destructive" />
              </Button>
            </CardContent>

            {/* Expanded: upload photos & view existing */}
            {selectedAlbumId === album.id && (
              <CardContent className="border-t border-border pt-4 space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label className="font-body">Upload Photos</Label>
                    <Input type="file" accept="image/*" multiple onChange={(e) => setPhotoFiles(e.target.files)} />
                  </div>
                  <div>
                    <Label className="font-body">Caption (applied to all)</Label>
                    <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Optional caption" />
                  </div>
                  <Button onClick={() => uploadPhotos.mutate()} disabled={!photoFiles?.length || uploading} className="font-body">
                    <ImagePlus size={16} className="mr-2" />
                    {uploading ? "Uploading…" : "Upload Photos"}
                  </Button>
                </div>

                {/* Existing photos grid */}
                {activePhotos.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-body text-xs text-muted-foreground">
                      Use the arrows to reorder, the star to set the album cover, and the trash icon to remove a photo.
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {activePhotos.map((photo: any, index: number) => {
                        const isCover = album.cover_url === photo.url;
                        return (
                          <div
                            key={photo.id}
                            className={`group relative overflow-hidden rounded-lg ${isCover ? "ring-2 ring-accent" : "ring-1 ring-border"}`}
                          >
                            <img src={photo.url} alt={photo.caption || ""} className="aspect-square w-full object-cover" />
                            {isCover && (
                              <span className="absolute left-1 top-1 rounded bg-accent px-1.5 py-0.5 font-body text-[10px] text-accent-foreground">
                                Cover
                              </span>
                            )}
                            <button
                              type="button"
                              aria-label="Delete photo"
                              onClick={() => deletePhoto.mutate(photo)}
                              className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
                            >
                              <Trash2 size={12} />
                            </button>
                            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-background/80 p-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                              <button
                                type="button"
                                aria-label="Move photo left"
                                disabled={index === 0 || reorderPhotos.isPending}
                                onClick={() => movePhoto(index, -1)}
                                className="rounded p-1 disabled:opacity-30"
                              >
                                <ArrowLeft size={12} />
                              </button>
                              <button
                                type="button"
                                aria-label="Set as album cover"
                                disabled={isCover || setCover.isPending}
                                onClick={() => setCover.mutate({ albumId: album.id, url: photo.url })}
                                className="rounded p-1 disabled:opacity-30"
                              >
                                <Star size={12} className={isCover ? "fill-current text-accent" : ""} />
                              </button>
                              <button
                                type="button"
                                aria-label="Move photo right"
                                disabled={index === activePhotos.length - 1 || reorderPhotos.isPending}
                                onClick={() => movePhoto(index, 1)}
                                className="rounded p-1 disabled:opacity-30"
                              >
                                <ArrowRight size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function SmallGroupsAdmin() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [meetingDay, setMeetingDay] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [location, setLocation] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [maxMembers, setMaxMembers] = useState("");

  const { data: groups } = useQuery({
    queryKey: ["admin-small-groups"],
    queryFn: async () => {
      const { data, error } = await supabase.from("small_groups").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("small_groups").insert({
        name,
        description: description || null,
        meeting_day: meetingDay || null,
        meeting_time: meetingTime || null,
        location: location || null,
        leader_name: leaderName || null,
        max_members: maxMembers ? parseInt(maxMembers) : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Small group created!");
      setName(""); setDescription(""); setMeetingDay(""); setMeetingTime(""); setLocation(""); setLeaderName(""); setMaxMembers("");
      qc.invalidateQueries({ queryKey: ["admin-small-groups"] });
      qc.invalidateQueries({ queryKey: ["small-groups"] });
    },
    onError: () => toast.error("Failed to create group."),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("small_groups").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-small-groups"] });
      qc.invalidateQueries({ queryKey: ["small-groups"] });
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="font-display">New Small Group</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="font-body">Group Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><Label className="font-body">Leader Name</Label><Input value={leaderName} onChange={(e) => setLeaderName(e.target.value)} placeholder="e.g. Pastor John" /></div>
          </div>
          <div><Label className="font-body">Description</Label><Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="font-body">Meeting Day</Label><Input value={meetingDay} onChange={(e) => setMeetingDay(e.target.value)} placeholder="e.g. Wednesday" /></div>
            <div><Label className="font-body">Meeting Time</Label><Input value={meetingTime} onChange={(e) => setMeetingTime(e.target.value)} placeholder="e.g. 7:00 PM" /></div>
            <div><Label className="font-body">Max Members</Label><Input type="number" value={maxMembers} onChange={(e) => setMaxMembers(e.target.value)} placeholder="Optional" /></div>
          </div>
          <div><Label className="font-body">Location</Label><Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Room 204" /></div>
          <Button onClick={() => create.mutate()} disabled={!name || create.isPending} className="font-body">
            <Users size={16} className="mr-2" />
            {create.isPending ? "Creating…" : "Create Group"}
          </Button>
        </CardContent>
      </Card>
      <div className="space-y-3">
        {groups?.map((g) => (
          <Card key={g.id}>
            <CardContent className="flex items-start justify-between pt-4">
              <div>
                <p className="font-display font-semibold">{g.name}</p>
                <p className="text-xs text-muted-foreground font-body">
                  {[g.leader_name && `Led by ${g.leader_name}`, g.meeting_day, g.meeting_time, g.location].filter(Boolean).join(" · ")}
                </p>
                {g.description && <p className="mt-1 text-sm text-muted-foreground font-body">{g.description}</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => del.mutate(g.id)}><Trash2 size={16} className="text-destructive" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default AdminPage;
