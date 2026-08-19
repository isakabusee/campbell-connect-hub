import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import AnnouncementsList from "@/components/AnnouncementsList";
import BulletinsList from "@/components/BulletinsList";
import { Button } from "@/components/ui/button";
import { Church, BookOpen, Heart, MapPin, Copy, Check } from "lucide-react";
import { toast } from "sonner";

const CHURCH_ADDRESS = "600 W Campbell Ave, Campbell, CA 95008";
const GOOGLE_MAPS_LINK = "https://www.google.com/maps/search/?api=1&query=600+W+Campbell+Ave%2C+Campbell%2C+CA+95008";

const Index = () => {
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
  const trackingId = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID;
  const embedUrl =
    browserKey &&
    `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(browserKey)}&q=${encodeURIComponent(CHURCH_ADDRESS)}${trackingId ? `&channel=${encodeURIComponent(trackingId)}` : ""}`;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />

        {/* Visit preview */}
        <section className="py-16">
          <div className="container">
            <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
              <div className="text-center lg:text-left">
                <h2 className="font-display text-3xl font-bold md:text-4xl">Visit Us</h2>
                <p className="mt-4 font-body text-lg text-muted-foreground leading-relaxed">
                  Campbell Seventh-day Adventist Church is located at the address below, in the heart of Campbell. We are
                  just a short walk from the beautiful John D. Morgan Park, making our church easy to find and close to
                  a welcoming neighborhood green space.
                </p>
                <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row lg:items-start">
                  <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-3 shadow-sm">
                    <MapPin size={18} className="shrink-0 text-accent" aria-hidden="true" />
                    <span className="font-body font-medium">{CHURCH_ADDRESS}</span>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
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
                <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
                  <Button asChild className="font-body">
                    <a href={GOOGLE_MAPS_LINK} target="_blank" rel="noopener noreferrer">
                      <MapPin size={16} className="mr-2" aria-hidden="true" />
                      Get Directions
                    </a>
                  </Button>
                </div>
              </div>
              <div className="overflow-hidden rounded-xl border shadow-sm">
                {embedUrl ? (
                  <iframe
                    title="Campbell Seventh-day Adventist Church location"
                    src={embedUrl}
                    width="100%"
                    height="360"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="block"
                    aria-label="Embedded Google Map showing the church location"
                  />
                ) : (
                  <div className="flex h-[360px] flex-col items-center justify-center gap-4 bg-muted p-6 text-center">
                    <MapPin size={40} className="text-muted-foreground" aria-hidden="true" />
                    <p className="font-body text-muted-foreground">
                      Map loading is unavailable. Please use the Get Directions button to view our location.
                    </p>
                    <Button asChild variant="outline" className="font-body">
                      <a href={GOOGLE_MAPS_LINK} target="_blank" rel="noopener noreferrer">
                        Open in Google Maps
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Service info cards */}
        <section className="bg-secondary py-16">
          <div className="container">
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { icon: Church, title: "Worship", desc: "Join us every Sabbath for uplifting worship and fellowship." },
                { icon: BookOpen, title: "Bible Study", desc: "Deepen your faith through our Sabbath School classes." },
                { icon: Heart, title: "Community", desc: "Connect with others through service and outreach." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex flex-col items-center rounded-lg bg-card p-6 text-center shadow-sm">
                  <Icon size={32} className="mb-3 text-accent" />
                  <h3 className="mb-2 font-display text-lg font-semibold">{title}</h3>
                  <p className="font-body text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Announcements preview */}
        <section className="py-16">
          <div className="container">
            <h2 className="mb-8 font-display text-3xl font-bold">Announcements</h2>
            <AnnouncementsList limit={3} />
          </div>
        </section>

        {/* Bulletins preview */}
        <section className="bg-secondary py-16">
          <div className="container">
            <h2 className="mb-8 font-display text-3xl font-bold">Church Bulletins</h2>
            <BulletinsList limit={2} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
