import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { format, isPast, isToday, isSameDay } from "date-fns";
import { CalendarDays, MapPin, Clock } from "lucide-react";
import { useState } from "react";

const EventsPage = () => {
  const [filter, setFilter] = useState<"upcoming" | "past">("upcoming");

  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("published", true)
        .order("start_time", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const now = new Date();
  const filtered = events?.filter((e) =>
    filter === "upcoming"
      ? new Date(e.start_time) >= now || isToday(new Date(e.start_time))
      : new Date(e.start_time) < now && !isToday(new Date(e.start_time))
  );

  // Group events by month
  const grouped = filtered?.reduce<Record<string, typeof filtered>>((acc, event) => {
    const key = format(new Date(event.start_time), "MMMM yyyy");
    if (!acc[key]) acc[key] = [];
    acc[key].push(event);
    return acc;
  }, {});

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-secondary py-16">
        <div className="container">
          <h1 className="mb-2 font-display text-4xl font-bold">Events Calendar</h1>
          <p className="mb-8 font-body text-muted-foreground">
            Stay connected with what's happening at Campbell SDA Church.
          </p>

          <div className="mb-8 flex gap-2">
            <button
              onClick={() => setFilter("upcoming")}
              className={`rounded-full px-5 py-2 text-sm font-body font-medium transition-colors ${
                filter === "upcoming"
                  ? "bg-accent text-accent-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter("past")}
              className={`rounded-full px-5 py-2 text-sm font-body font-medium transition-colors ${
                filter === "past"
                  ? "bg-accent text-accent-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              Past Events
            </button>
          </div>

          {isLoading && <p className="font-body text-muted-foreground">Loading events…</p>}

          {!isLoading && !filtered?.length && (
            <p className="font-body text-muted-foreground">
              {filter === "upcoming" ? "No upcoming events. Check back soon!" : "No past events to show."}
            </p>
          )}

          {grouped &&
            Object.entries(grouped).map(([month, monthEvents]) => (
              <div key={month} className="mb-10">
                <h2 className="mb-4 font-display text-xl font-bold text-primary">{month}</h2>
                <div className="space-y-4">
                  {monthEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

function EventCard({ event }: { event: any }) {
  const startDate = new Date(event.start_time);
  const endDate = event.end_time ? new Date(event.end_time) : null;
  const sameDay = endDate ? isSameDay(startDate, endDate) : true;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <CardContent className="flex gap-5 p-0">
        {/* Date badge */}
        <div className="flex w-20 shrink-0 flex-col items-center justify-center bg-primary py-5 text-primary-foreground">
          <span className="text-sm font-body uppercase">{format(startDate, "MMM")}</span>
          <span className="text-3xl font-display font-bold">{format(startDate, "d")}</span>
          <span className="text-xs font-body">{format(startDate, "EEE")}</span>
        </div>

        <div className="flex-1 py-4 pr-6">
          <h3 className="mb-1 font-display text-lg font-bold">{event.title}</h3>

          <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground font-body">
            <Clock size={14} />
            <span>
              {format(startDate, "h:mm a")}
              {endDate && (sameDay ? ` – ${format(endDate, "h:mm a")}` : ` – ${format(endDate, "MMM d, h:mm a")}`)}
            </span>
          </div>

          {event.location && (
            <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground font-body">
              <MapPin size={14} />
              <span>{event.location}</span>
            </div>
          )}

          {event.description && (
            <p className="text-sm text-muted-foreground font-body">{event.description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default EventsPage;
