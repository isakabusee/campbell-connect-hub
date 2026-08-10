import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Church, BookOpen, Heart, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />

        {/* About preview */}
        <section className="py-16">
          <div className="container">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="font-display text-3xl font-bold md:text-4xl">About Us</h2>
              <p className="mt-4 font-body text-lg text-muted-foreground leading-relaxed">
                The Campbell Seventh-day Adventist Church is part of a major worldwide Christian denomination whose
                central foundational beliefs are grounded in Jesus Christ. We believe that God's character of love has
                been revealed to the world through Christ, and that we are saved through Christ alone by his death and
                resurrection.
              </p>
              <Button asChild variant="outline" className="mt-6 font-body">
                <Link to="/about">
                  Learn More About Us <ArrowRight size={16} className="ml-1" />
                </Link>
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
      </main>
      <Footer />
    </div>
  );
};

export default Index;
