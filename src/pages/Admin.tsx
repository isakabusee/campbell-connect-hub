import { useState } from "react";
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
import { Trash2, Upload, CalendarDays } from "lucide-react";
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
            <TabsList className="mb-6">
              <TabsTrigger value="announcements" className="font-body">Announcements</TabsTrigger>
              <TabsTrigger value="bulletins" className="font-body">Bulletins</TabsTrigger>
              <TabsTrigger value="sermons" className="font-body">Sermons</TabsTrigger>
              <TabsTrigger value="events" className="font-body">Events</TabsTrigger>
              <TabsTrigger value="messages" className="font-body">Messages</TabsTrigger>
            </TabsList>
            <TabsContent value="announcements"><AnnouncementsAdmin userId={user.id} /></TabsContent>
            <TabsContent value="bulletins"><BulletinsAdmin userId={user.id} /></TabsContent>
            <TabsContent value="sermons"><SermonsAdmin userId={user.id} /></TabsContent>
            <TabsContent value="events"><EventsAdmin userId={user.id} /></TabsContent>
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
      const { error } = await supabase.from("announcements").insert({ title, content, author_id: userId });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Announcement created!");
      setTitle(""); setContent("");
      qc.invalidateQueries({ queryKey: ["admin-announcements"] });
      qc.invalidateQueries({ queryKey: ["announcements"] });
    },
    onError: () => toast.error("Failed to create announcement."),
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
          <Button onClick={() => create.mutate()} disabled={!title || !content || create.isPending} className="font-body">
            {create.isPending ? "Creating..." : "Create Announcement"}
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

  const { data: items } = useQuery({
    queryKey: ["admin-bulletins"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bulletins").select("*").order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("bulletins").insert({ title, content, date, author_id: userId });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Bulletin created!");
      setTitle(""); setContent("");
      qc.invalidateQueries({ queryKey: ["admin-bulletins"] });
      qc.invalidateQueries({ queryKey: ["bulletins"] });
    },
    onError: () => toast.error("Failed to create bulletin."),
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
          <Button onClick={() => create.mutate()} disabled={!title || !content || create.isPending} className="font-body">
            {create.isPending ? "Creating..." : "Create Bulletin"}
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
        title, speaker, date, description: description || null, audio_url, video_url, author_id: userId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Sermon added!");
      setTitle(""); setSpeaker(""); setDescription(""); setAudioFile(null); setVideoFile(null);
      setUploading(false);
      qc.invalidateQueries({ queryKey: ["admin-sermons"] });
      qc.invalidateQueries({ queryKey: ["sermons"] });
    },
    onError: () => { toast.error("Failed to add sermon."); setUploading(false); },
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
          <div><Label className="font-body">Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><Label className="font-body">Speaker</Label><Input value={speaker} onChange={(e) => setSpeaker(e.target.value)} /></div>
          <div><Label className="font-body">Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div><Label className="font-body">Description (optional)</Label><Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div>
            <Label className="font-body">Audio File (MP3)</Label>
            <Input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)} />
          </div>
          <div>
            <Label className="font-body">Video File (MP4)</Label>
            <Input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)} />
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
                {s.audio_url && <p className="text-xs text-accent font-body mt-1">🎵 Audio attached</p>}
                {s.video_url && <p className="text-xs text-accent font-body mt-1">🎬 Video attached</p>}
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

export default AdminPage;
