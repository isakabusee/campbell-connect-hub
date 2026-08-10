import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, MapPin, Clock, UserPlus, UserMinus } from "lucide-react";

const SmallGroups = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: groups } = useQuery({
    queryKey: ["small-groups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("small_groups")
        .select("*")
        .eq("published", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: memberships } = useQuery({
    queryKey: ["my-group-memberships"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("small_group_members")
        .select("group_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data.map((m) => m.group_id);
    },
    enabled: !!user,
  });

  const { data: memberCounts } = useQuery({
    queryKey: ["group-member-counts"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_group_member_counts");
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data as { group_id: string; member_count: number }[])?.forEach((row) => {
        counts[row.group_id] = row.member_count;
      });
      return counts;
    },
    enabled: !!user,
  });

  const join = useMutation({
    mutationFn: async (groupId: string) => {
      const { error } = await supabase
        .from("small_group_members")
        .insert({ group_id: groupId, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("You've joined the group!");
      qc.invalidateQueries({ queryKey: ["my-group-memberships"] });
      qc.invalidateQueries({ queryKey: ["group-member-counts"] });
    },
    onError: () => toast.error("Failed to join group."),
  });

  const leave = useMutation({
    mutationFn: async (groupId: string) => {
      const { error } = await supabase
        .from("small_group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("You've left the group.");
      qc.invalidateQueries({ queryKey: ["my-group-memberships"] });
      qc.invalidateQueries({ queryKey: ["group-member-counts"] });
    },
    onError: () => toast.error("Failed to leave group."),
  });

  const isMember = (groupId: string) => memberships?.includes(groupId) ?? false;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="container max-w-4xl">
          <h1 className="mb-2 font-display text-4xl font-bold">Small Groups</h1>
          <p className="mb-8 text-muted-foreground font-body">
            Join a small group to grow in faith and fellowship with others.
          </p>

          {!groups?.length && (
            <p className="text-center text-muted-foreground font-body py-12">
              No small groups available yet. Check back soon!
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {groups?.map((group) => {
              const count = memberCounts?.[group.id] || 0;
              const full = group.max_members ? count >= group.max_members : false;

              return (
                <Card key={group.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="font-display text-lg">{group.name}</CardTitle>
                      {full && <Badge variant="secondary" className="font-body text-xs">Full</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col justify-between space-y-3">
                    {group.description && (
                      <p className="text-sm text-muted-foreground font-body">{group.description}</p>
                    )}
                    <div className="space-y-1 text-xs text-muted-foreground font-body">
                      {group.leader_name && (
                        <p className="flex items-center gap-1"><Users size={12} /> Led by {group.leader_name}</p>
                      )}
                      {(group.meeting_day || group.meeting_time) && (
                        <p className="flex items-center gap-1">
                          <Clock size={12} />
                          {[group.meeting_day, group.meeting_time].filter(Boolean).join(" at ")}
                        </p>
                      )}
                      {group.location && (
                        <p className="flex items-center gap-1"><MapPin size={12} /> {group.location}</p>
                      )}
                    </div>

                    {user && (
                      <div className="pt-2">
                        {isMember(group.id) ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full font-body"
                            onClick={() => leave.mutate(group.id)}
                            disabled={leave.isPending}
                          >
                            <UserMinus size={14} className="mr-1" /> Leave Group
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="w-full font-body"
                            onClick={() => join.mutate(group.id)}
                            disabled={join.isPending || full}
                          >
                            <UserPlus size={14} className="mr-1" /> {full ? "Group Full" : "Join Group"}
                          </Button>
                        )}
                      </div>
                    )}
                    {!user && (
                      <p className="text-xs text-muted-foreground font-body pt-2">
                        Sign in to join this group.
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SmallGroups;
