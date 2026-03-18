import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import AnnouncementsList from "@/components/AnnouncementsList";
import BulletinsList from "@/components/BulletinsList";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Church, BookOpen, Heart, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />

        {/* About Section */}
        <section className="py-16">
          <div className="container">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="font-display text-3xl font-bold md:text-4xl">About Our Church</h2>
              <p className="mt-4 font-body text-lg text-muted-foreground leading-relaxed">
                Campbell Seventh-day Adventist Church is a vibrant, faith-driven community nestled in the heart of Campbell, California. We are part of the worldwide Seventh-day Adventist Church, a Protestant Christian denomination distinguished by its observance of Saturday, the seventh day of the week, as the Sabbath.
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-2">
              <div className="rounded-lg bg-secondary p-8">
                <h3 className="mb-4 font-display text-xl font-semibold">Our Faith &amp; Beliefs</h3>
                <ul className="space-y-3 font-body text-sm text-muted-foreground leading-relaxed">
                  <li className="flex items-start gap-3">
                    <BookOpen size={18} className="mt-0.5 shrink-0 text-accent" />
                    <span><strong className="text-foreground">Scripture</strong> — We believe the Bible is the inspired Word of God, the sole authority for faith and practice.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Church size={18} className="mt-0.5 shrink-0 text-accent" />
                    <span><strong className="text-foreground">The Sabbath</strong> — We observe Saturday as God's holy day of rest, worship, and fellowship, as established at Creation.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Heart size={18} className="mt-0.5 shrink-0 text-accent" />
                    <span><strong className="text-foreground">Second Coming</strong> — We look forward to the soon return of Jesus Christ, the blessed hope of all believers.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Heart size={18} className="mt-0.5 shrink-0 text-accent" />
                    <span><strong className="text-foreground">Wholistic Living</strong> — We embrace healthful living, community service, and the care of mind, body, and spirit.</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg bg-secondary p-8">
                <h3 className="mb-4 font-display text-xl font-semibold">Our Mission</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  Our mission is to share the everlasting gospel of Jesus Christ with our neighbors and the world. Through worship, discipleship, and compassionate outreach, we seek to make a positive difference in our community.
                </p>
                <p className="mt-4 font-body text-sm text-muted-foreground leading-relaxed">
                  Whether you're a lifelong Adventist or exploring faith for the first time, you'll find a warm welcome here. We invite you to join us for Sabbath worship, Bible study, and fellowship as we grow together in Christ.
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
            <div className="mb-8 flex items-end justify-between">
              <h2 className="font-display text-3xl font-bold">Announcements</h2>
              <Button asChild variant="ghost" className="font-body text-accent">
                <Link to="/announcements">
                  View All <ArrowRight size={16} className="ml-1" />
                </Link>
              </Button>
            </div>
            <AnnouncementsList limit={3} />
          </div>
        </section>

        {/* Bulletins preview */}
        <section className="bg-secondary py-16">
          <div className="container">
            <div className="mb-8 flex items-end justify-between">
              <h2 className="font-display text-3xl font-bold">Church Bulletins</h2>
              <Button asChild variant="ghost" className="font-body text-accent">
                <Link to="/bulletins">
                  View All <ArrowRight size={16} className="ml-1" />
                </Link>
              </Button>
            </div>
            <BulletinsList limit={2} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
