import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Church, BookOpen, Heart } from "lucide-react";

const About = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* About Section */}
        <section className="py-16">
          <div className="container">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="font-display text-3xl font-bold md:text-4xl">About Us</h1>
              <p className="mt-4 font-body text-lg text-muted-foreground leading-relaxed">
                The Campbell Seventh-day Adventist Church is part of a major worldwide Christian denomination whose
                central foundational beliefs are grounded in Jesus Christ. We believe that God's character of love has
                been revealed to the world through Christ, that we are saved through Christ alone by his death and
                resurrection, and that our relationship with God is restored by faith in Christ alone. The Seventh-day
                Adventist Church strives to base every belief on a holistic view of the Bible in its entirety, not
                single verses on their own. Every doctrine is based on the love of God and His desire to help us
                experience our lives to the fullest. Building on these foundational truths, Seventh-day Adventists
                believe: All ten commandments are still binding and given for our health, safety, and happiness.
                Honoring the fourth commandment by keeping the seventh day (Saturday) holy is key to restoring and
                sustaining our relationship with God. It is a weekly reminder that He is our Creator and we are stewards
                of His creations. Living healthy, holistic lifestyles enables God to bless our lives of abundance
                spiritually, mentally, physically, and emotionally. A deep and broad study of Bible prophecy reveals
                that Jesus Christ will return to this earth soon, and that we are called to prepare for eternal life in
                heaven by being God's hands and feet while we are here. God's character of love is demonstrated not only
                through His gift of eternal life for those who choose Him, but also eternal death, not torment, for
                those who do not choose Him. "For God so loved the world that He gave His only Son, that whoever
                believes in Him shall not perish, but have eternal life. For God did not send His Son into the world to
                condemn the world, but that the world through Him might be saved." John 3:16,17
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-2">
              <div className="rounded-lg bg-secondary p-8">
                <h3 className="mb-4 font-display text-xl font-semibold">Our Faith & Beliefs</h3>
                <ul className="space-y-3 font-body text-sm text-muted-foreground leading-relaxed">
                  <li className="flex items-start gap-3">
                    <BookOpen size={18} className="mt-0.5 shrink-0 text-accent" />
                    <span>
                      <strong className="text-foreground">Scripture</strong> — We believe the Bible is the inspired Word
                      of God, the sole authority for faith and practice.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Church size={18} className="mt-0.5 shrink-0 text-accent" />
                    <span>
                      <strong className="text-foreground">The Sabbath</strong> — We observe Saturday as God's holy day
                      of rest, worship, and fellowship, as established at Creation.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Heart size={18} className="mt-0.5 shrink-0 text-accent" />
                    <span>
                      <strong className="text-foreground">Second Coming</strong> — We look forward to the soon return of
                      Jesus Christ, the blessed hope of all believers.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Heart size={18} className="mt-0.5 shrink-0 text-accent" />
                    <span>
                      <strong className="text-foreground">Wholistic Living</strong> — We embrace healthful living,
                      community service, and the care of mind, body, and spirit.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg bg-secondary p-8">
                <h3 className="mb-4 font-display text-xl font-semibold">Our Mission</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  Our mission is to share the everlasting gospel of Jesus Christ with our neighbors and the world.
                  Through worship, discipleship, and compassionate outreach, we seek to make a positive difference in
                  our community.
                </p>
                <p className="mt-4 font-body text-sm text-muted-foreground leading-relaxed">
                  Whether you're a lifelong Adventist or exploring faith for the first time, you'll find a warm welcome
                  here. We invite you to join us for Sabbath worship, Bible study, and fellowship as we grow together in
                  Christ.
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
      </main>
      <Footer />
    </div>
  );
};

export default About;
