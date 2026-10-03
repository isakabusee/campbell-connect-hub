import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LifeBuoy } from "lucide-react";

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/diagnose-signout`;

function renderMarkdown(md: string) {
  return md.split("\n").map((line, i) => {
    const t = line.trim();
    if (!t) return <div key={i} className="h-2" />;
    if (t.startsWith("## ")) return <h3 key={i} className="mt-4 font-display text-lg font-semibold">{t.slice(3)}</h3>;
    const html = t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    if (/^[-*] /.test(t)) return <li key={i} className="ml-5 list-disc" dangerouslySetInnerHTML={{ __html: html.slice(2) }} />;
    if (/^\d+\. /.test(t)) return <li key={i} className="ml-5 list-decimal" dangerouslySetInnerHTML={{ __html: html.replace(/^\d+\. /, "") }} />;
    return <p key={i} dangerouslySetInnerHTML={{ __html: html }} />;
  });
}

export default function SignOutTroubleshooter() {
  const [description, setDescription] = useState("");
  const [browser, setBrowser] = useState(typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 200) : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true); setError(null); setAnalysis(null);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Please sign in again.");
      const res = await fetch(FN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ description, browser }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Something went wrong.");
      setAnalysis(body.analysis);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display"><LifeBuoy className="h-5 w-5 text-primary" />Sign-out Troubleshooter</CardTitle>
        <p className="font-body text-sm text-muted-foreground">Describe what happens when someone tries to sign out. AI will suggest likely causes and steps to try.</p>
      </CardHeader>
      <CardContent className="space-y-4 font-body">
        <div className="space-y-2">
          <Label htmlFor="so-desc">What's happening?</Label>
          <Textarea id="so-desc" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={4000}
            placeholder="e.g. I click Sign Out, the page goes to the homepage, but I'm still signed in after refreshing." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="so-browser">Browser / device (optional)</Label>
          <Input id="so-browser" value={browser} onChange={(e) => setBrowser(e.target.value)} maxLength={200} />
        </div>
        <Button onClick={submit} disabled={loading || description.trim().length < 10}>
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing…</> : "Get suggestions"}
        </Button>
        {error && <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
        {analysis && <div className="rounded-md border bg-muted/40 p-4 text-sm leading-relaxed">{renderMarkdown(analysis)}</div>}
      </CardContent>
    </Card>
  );
}
