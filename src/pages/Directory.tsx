import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { User, Mail, Phone, Edit2, Save, X } from "lucide-react";
import { Link } from "react-router-dom";

const Directory = () => {
  const { user, isAdmin, loading } = useAuth();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  const { data: profiles, refetch } = useQuery({
    queryKey: ["directory-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, bio, avatar_url, user_id")
        .eq("visible_in_directory", true)
        .order("display_name");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: myProfile, refetch: refetchMe } = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: myContact, refetch: refetchContact } = useQuery({
    queryKey: ["my-contact"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profile_contacts")
        .select("phone")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const startEditing = () => {
    if (myProfile) {
      setDisplayName(myProfile.display_name);
      setBio(myProfile.bio || "");
    }
    setPhone(myContact?.phone || "");
    setEditing(true);
  };

  const saveProfile = async () => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, bio })
      .eq("user_id", user.id);
    if (error) {
      toast.error("Failed to update profile");
      return;
    }
    const { error: contactError } = await supabase
      .from("profile_contacts")
      .upsert({ user_id: user.id, phone }, { onConflict: "user_id" });
    if (contactError) {
      toast.error("Failed to update phone number");
      return;
    }
    toast.success("Profile updated!");
    setEditing(false);
    refetchMe();
    refetchContact();
    refetch();
  };

  const filtered = profiles?.filter((p) =>
    p.display_name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return null;

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <User size={48} className="mx-auto text-muted-foreground" />
            <h1 className="font-display text-3xl font-bold">Members Directory</h1>
            <p className="text-muted-foreground font-body">
              This page is only accessible to administrators.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="container max-w-4xl">
          <h1 className="mb-2 font-display text-4xl font-bold">Members Directory</h1>
          <p className="mb-8 text-muted-foreground font-body">
            Connect with fellow church members.
          </p>

          {/* My Profile Card */}
          {myProfile && (
            <Card className="mb-8 border-accent/30">
              <CardContent className="pt-6">
                {editing ? (
                  <div className="space-y-3">
                    <p className="font-display font-semibold text-sm text-muted-foreground">Edit Your Profile</p>
                    <div>
                      <Label className="font-body">Display Name</Label>
                      <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                    </div>
                    <div>
                      <Label className="font-body">Phone (visible to members)</Label>
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" />
                    </div>
                    <div>
                      <Label className="font-body">Bio</Label>
                      <Textarea rows={2} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={saveProfile} size="sm" className="font-body">
                        <Save size={14} className="mr-1" /> Save
                      </Button>
                      <Button onClick={() => setEditing(false)} size="sm" variant="outline" className="font-body">
                        <X size={14} className="mr-1" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-display text-lg font-bold">
                        {myProfile.display_name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="font-display font-semibold">{myProfile.display_name}</p>
                        {myProfile.bio && <p className="text-sm text-muted-foreground font-body">{myProfile.bio}</p>}
                        {myContact?.phone && (
                          <p className="text-xs text-muted-foreground font-body flex items-center gap-1 mt-1">
                            <Phone size={12} /> {myContact.phone}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button onClick={startEditing} size="sm" variant="ghost" className="font-body">
                      <Edit2 size={14} className="mr-1" /> Edit
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Search */}
          <Input
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-6"
          />

          {/* Members Grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered?.map((profile) => (
              <Card key={profile.id}>
                <CardContent className="flex items-start gap-3 pt-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-display text-sm font-bold">
                    {profile.display_name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-semibold truncate">{profile.display_name}</p>
                    {profile.bio && (
                      <p className="text-xs text-muted-foreground font-body line-clamp-2">{profile.bio}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filtered?.length === 0 && (
            <p className="text-center text-muted-foreground font-body py-12">No members found.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Directory;
