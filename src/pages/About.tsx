import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Church, BookOpen, Heart, Cross, Users, Globe } from "lucide-react";

const AboutPage = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-primary py-16 text-primary-foreground">
          <div className="container text-center">
            <h1 className="font-display text-4xl font-bold md:text-5xl">About Us</h1>
            <p className="mx-auto mt-4 max-w-2xl font-body text-lg opacity-90">
              Learn more about Campbell Seventh-day Adventist Church, our mission, and what we believe.
            </p>
          </div>
        </section>

        {/* Who We Are */}
        <section className="py-16">
          <div className="container">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-6 font-display text-3xl font-bold">Who We Are</h2>
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                Campbell Seventh-day Adventist Church is a vibrant, faith-driven community nestled in the heart of Campbell, California. We are part of the worldwide Seventh-day Adventist Church, a Protestant Christian denomination distinguished by its observance of Saturday, the seventh day of the week, as the Sabbath, and its commitment to sharing the hope of Christ's soon return.
              </p>
              <p className="mt-4 font-body text-lg text-muted-foreground leading-relaxed">
                Since our founding, we have been a place where individuals and families come together to worship, grow in faith, and serve our neighbors. Our congregation is diverse, welcoming people from all walks of life who are seeking a deeper relationship with God and a supportive church family.
              </p>
            </div>
          </div>
        </section>

        {/* Beliefs Grid */}
        <section className="bg-secondary py-16">
          <div className="container">
            <h2 className="mb-10 text-center font-display text-3xl font-bold">Our Faith & Beliefs</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: BookOpen,
                  title: "The Bible",
                  desc: "We believe the Bible is the inspired Word of God, the only infallible rule of faith and practice for Christians.",
                },
                {
                  icon: Church,
                  title: "The Sabbath",
                  desc: "We observe Saturday, the seventh day, as God's holy day of rest, worship, and fellowship, established at Creation.",
                },
                {
                  icon: Heart,
                  title: "Second Coming",
                  desc: "We look forward with joyful hope to the soon, literal, personal return of Jesus Christ in glory.",
                },
                {
                  icon: Cross,
                  title: "Salvation",
                  desc: "We believe salvation is by grace through faith in Jesus Christ alone, who died for our sins and rose again.",
                },
                {
                  icon: Users,
                  title: "Community",
                  desc: "We value genuine fellowship, mutual care, and growing together as disciples of Jesus in everyday life.",
                },
                {
                  icon: Globe,
                  title: "Mission",
                  desc: "We are called to share the everlasting gospel with all the world through word, service, and compassion.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-lg bg-card p-8 shadow-sm">
                  <Icon size={28} className="mb-4 text-accent" />
                  <h3 className="mb-2 font-display text-xl font-semibold">{title}</h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                <h2 className="mb-6 font-display text-3xl font-bold">Our Mission</h2>
                <p className="font-body text-lg text-muted-foreground leading-relaxed">
                  Our mission is to share the everlasting gospel of Jesus Christ with our neighbors and the world. Through inspiring worship, intentional discipleship, and compassionate outreach, we seek to make a positive, lasting difference in our community.
                </p>
                <p className="mt-4 font-body text-lg text-muted-foreground leading-relaxed">
                  We are committed to helping people know God, find freedom, discover purpose, and make a difference.
                </p>
              </div>
              <div>
                <h2 className="mb-6 font-display text-3xl font-bold">Our Vision</h2>
                <p className="font-body text-lg text-muted-foreground leading-relaxed">
                  We envision a church family that reflects the love of Christ in every interaction — a welcoming home for seekers, a nurturing environment for believers, and a launching point for community transformation.
                </p>
                <p className="mt-4 font-body text-lg text-muted-foreground leading-relaxed">
                  By God's grace, we aim to be a light in Campbell and beyond, inviting all to experience the hope, healing, and wholeness found in Jesus.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Welcome CTA */}
        <section className="bg-primary py-16 text-primary-foreground">
          <div className="container text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">You're Always Welcome</h2>
            <p className="mx-auto mt-4 max-w-2xl font-body text-lg opacity-90">
              Whether you're a lifelong Adventist, new to the faith, or simply exploring what church is all about, there's a place for you here. Come worship with us, ask questions, and get to know our family.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
