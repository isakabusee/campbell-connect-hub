import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import AnnouncementsList from "@/components/AnnouncementsList";
import BulletinsList from "@/components/BulletinsList";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Church, BookOpen, Heart, MapPin } from "lucide-react";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />

        {/* Visit preview */}
        <section className="py-16">
          <div className="container">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="font-display text-3xl font-bold md:text-4xl">Visit Us</h2>
              <p className="mt-4 font-body text-lg text-muted-foreground leading-relaxed">
                Campbell Seventh-day Adventist Church is located at{" "}
                <strong className="text-foreground">600 W Campbell Ave, Campbell, CA 95008</strong>, in the heart of
                Campbell. We are just a short walk from the beautiful John D. Morgan Park, making our church easy to find
                and close to a welcoming neighborhood green space.
              </p>
              <Button asChild variant="outline" className="mt-6 font-body">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=600+W+Campbell+Ave%2C+Campbell%2C+CA+95008"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin size={16} className="mr-2" aria-hidden="true" />
                  Get Directions
                </a>
              </Button>
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
