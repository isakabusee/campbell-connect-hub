import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import AnnouncementsList from "@/components/AnnouncementsList";
import BulletinsList from "@/components/BulletinsList";
import { Button } from "@/components/ui/button";
import { Church, BookOpen, Heart, MapPin, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import pastorThomImage from "@/assets/pastor-thom-garner.jpg";

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
  const isLocalDev = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname.endsWith(".local"));
  const embedUrl =
    browserKey &&
    !isLocalDev &&
    `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(browserKey)}&q=${encodeURIComponent(CHURCH_ADDRESS)}`;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />


        {/* Pastor's welcome */}
        <section className="bg-secondary py-16">
          <div className="container">
            <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
              <div className="order-2 lg:order-1">
                <img
                  src={pastorThomImage}
                  alt="Pastor Thom Garner"
                  width={896}
                  height={1195}
                  loading="lazy"
                  className="mx-auto aspect-[3/4] w-full max-w-sm rounded-xl object-cover shadow-md lg:mx-0"
                />
              </div>
              <div className="order-1 text-center lg:order-2 lg:text-left">
                <h2 className="font-display text-3xl font-bold md:text-4xl">A Word from Our Pastor</h2>
                <p className="mt-4 font-body text-lg text-muted-foreground leading-relaxed">
                  Welcome Home! Whether you stumbled across our page by accident, are searching for a new church home, or are simply curious about what a Seventh-day Adventist community looks like, we are so glad you are here.
                </p>
                <p className="mt-4 font-body text-lg text-muted-foreground leading-relaxed">
                  At the Campbell Seventh-day Adventist Church, we believe that church isn't a building—it's a family. Our community is a vibrant tapestry of people from all walks of life, cultures, and nations, all united by the transformative love of Jesus Christ. Life can be overwhelming and noisy, but we are dedicated to creating a safe space where you can pause, find rest, and experience true spiritual community.
                </p>
                <p className="mt-4 font-body text-lg text-muted-foreground leading-relaxed">
                  Our doors are wide open to everyone, exactly as you are. No matter where you are on your spiritual journey, you will find open hearts, encouraging fellowship, and deep, Bible-centered teaching here.
                </p>
                <p className="mt-4 font-body text-lg text-muted-foreground leading-relaxed">
                  Come join us this Sabbath as we rest from our weekly routines, worship together, and grow in faith. We cannot wait to meet you, hear your story, and walk alongside you.
                </p>
                <p className="mt-4 font-body text-lg text-muted-foreground leading-relaxed">
                  With blessings and warmth,
                  <br />
                  The Pastoral Team & Church Family
                  <br />
                  Campbell Seventh-day Adventist Church
                </p>
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

        {/* Online giving */}
        <section className="py-16">
          <div className="container">
            <div className="mx-auto max-w-3xl rounded-xl border bg-card p-8 text-center shadow-sm md:p-12">
              <h2 className="font-display text-3xl font-bold md:text-4xl">Support Our Ministry</h2>
              <p className="mt-4 font-body text-lg text-muted-foreground leading-relaxed">
                Your faithful giving helps us share God's love, support our community outreach, and sustain the mission of Campbell Seventh-day Adventist Church.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button asChild size="lg" className="font-body">
                  <a href="https://adventistgiving.org/donate/ANP8CQ" target="_blank" rel="noopener noreferrer">
                    Give Online
                  </a>
                </Button>
              </div>
              <p className="mt-6 font-body text-sm text-muted-foreground">
                Secure giving through Adventist Giving. Thank you for your generosity.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
