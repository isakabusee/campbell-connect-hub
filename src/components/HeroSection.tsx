import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-church.jpg";

const HeroSection = () => (
  <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">
    <img
      src={heroImage}
      alt="Campbell Seventh-day Adventist Church"
      className="absolute inset-0 h-full w-full object-cover"
    />
    <div className="absolute inset-0" style={{ background: "var(--hero-overlay)" }} />
    <div className="container relative z-10 py-20 text-center">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mx-auto max-w-3xl font-display text-4xl font-bold text-primary-foreground md:text-6xl"
      >
        Campbell Seventh-day Adventist Church
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="mx-auto mt-4 max-w-xl font-body text-lg text-primary-foreground/80"
      >
        Welcome home. Join us in worship, fellowship, and service.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="mt-8 flex flex-wrap justify-center gap-4"
      >
        <Button
          asChild
          size="lg"
          className="bg-accent text-accent-foreground hover:bg-accent/90 font-body font-semibold"
        >
          <a
            href="https://www.youtube.com/@campbellseventh-dayadventi6649/streams"
            target="_blank"
            rel="noopener noreferrer"
          >
            Online Worship
          </a>
        </Button>
      </motion.div>
    </div>
  </section>
);

export default HeroSection;
