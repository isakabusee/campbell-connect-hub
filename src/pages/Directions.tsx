import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { MapPin, Copy, Check, Clock, Navigation, Phone } from "lucide-react";
import { toast } from "sonner";

const CHURCH_ADDRESS = "600 W Campbell Ave, Campbell, CA 95008";
const GOOGLE_MAPS_DIRECTIONS_LINK = "https://www.google.com/maps/dir/?api=1&destination=600+W+Campbell+Ave%2C+Campbell%2C+CA+95008";
const GOOGLE_MAPS_PLACE_LINK = "https://www.google.com/maps/search/?api=1&query=600+W+Campbell+Ave%2C+Campbell%2C+CA+95008";

const Directions = () => {
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(CHURCH_ADDRESS);
      setCopied(true);
      toast.success("Address copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy address. Please copy it manually.");
    }
  };

  const browserKey = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;
  const isLocalDev = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname.endsWith(".local"));
  const embedUrl =
    browserKey &&
    !isLocalDev &&
    `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(browserKey)}&q=${encodeURIComponent(CHURCH_ADDRESS)}`;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="font-display text-3xl font-bold md:text-4xl">Directions</h1>
            <p className="mt-4 font-body text-lg text-muted-foreground leading-relaxed">
              Find your way to Campbell Seventh-day Adventist Church. We are located in the heart of Campbell, just a short walk from John D. Morgan Park.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-start">
            {/* Address & hours */}
            <div className="space-y-8">
              <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <h2 className="font-display text-xl font-semibold">Location</h2>
                <div className="mt-4 flex items-start gap-3">
                  <MapPin size={20} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                  <div>
                    <p className="font-body font-medium">{CHURCH_ADDRESS}</p>
                    <p className="font-body text-sm text-muted-foreground">Campbell, California 95008</p>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild className="font-body">
                    <a href={GOOGLE_MAPS_DIRECTIONS_LINK} target="_blank" rel="noopener noreferrer">
                      <Navigation size={16} className="mr-2" aria-hidden="true" />
                      Get Directions
                    </a>
                  </Button>
                  <Button
                    variant="secondary"
                    size="default"
                    onClick={copyAddress}
                    aria-label={copied ? "Address copied" : "Copy church address to clipboard"}
                    className="font-body"
                  >
                    {copied ? (
                      <>
                        <Check size={16} className="mr-2" aria-hidden="true" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={16} className="mr-2" aria-hidden="true" />
                        Copy Address
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <h2 className="font-display text-xl font-semibold">Contact Hours</h2>
                <div className="mt-4 space-y-4 font-body text-sm">
                  <div className="flex items-start gap-3">
                    <Clock size={20} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                    <div>
                      <p className="font-semibold">Sabbath Service Times</p>
                      <p className="text-muted-foreground">Sabbath School: 9:30 AM</p>
                      <p className="text-muted-foreground">Divine Worship: 11:00 AM</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone size={20} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                    <div>
                      <p className="font-semibold">Phone</p>
                      <p className="text-muted-foreground">(408) 866-4625</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={20} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                    <div>
                      <p className="font-semibold">Parking</p>
                      <p className="text-muted-foreground">Free parking is available on-site and along the street near the church entrance.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="overflow-hidden rounded-xl border shadow-sm">
              {embedUrl ? (
                <iframe
                  title="Campbell Seventh-day Adventist Church location"
                  src={embedUrl}
                  width="100%"
                  height="420"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="block"
                  aria-label="Embedded Google Map showing the church location"
                />
              ) : (
                <div className="flex h-[420px] flex-col items-center justify-center gap-4 bg-muted p-6 text-center">
                  <MapPin size={40} className="text-muted-foreground" aria-hidden="true" />
                  <p className="font-body text-muted-foreground">
                    Map loading is unavailable. Please use the Get Directions button to view our location.
                  </p>
                  <Button asChild variant="outline" className="font-body">
                    <a href={GOOGLE_MAPS_PLACE_LINK} target="_blank" rel="noopener noreferrer">
                      Open in Google Maps
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Directions;
