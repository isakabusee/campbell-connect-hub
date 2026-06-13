import { Link } from "react-router-dom";
import { Church, Clock, MapPin, Phone } from "lucide-react";

const Footer = () => (
  <footer className="bg-primary text-primary-foreground">
    <div className="container py-12">
      <div className="grid gap-8 md:grid-cols-3">
        <div>
          <h3 className="mb-3 font-display text-lg font-semibold">Campbell SDA Church</h3>
          <p className="font-body text-sm opacity-80">A welcoming community of believers sharing the love of Christ.</p>
        </div>
        <div>
          <h4 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider opacity-70">Service Times</h4>
          <ul className="space-y-2 font-body text-sm opacity-80">
            <li className="flex items-center gap-2">
              <Clock size={14} /> Sabbath School: 9:30 AM
            </li>
            <li className="flex items-center gap-2">
              <Church size={14} /> Divine Worship: 11:00 AM
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider opacity-70">Contact</h4>
          <ul className="space-y-2 font-body text-sm opacity-80">
            <li className="flex items-center gap-2">
              <MapPin size={14} /> 600 W Campbell Ave, Campbell, CA 95008
            </li>
            <li className="flex items-center gap-2">
              <Phone size={14} /> (408) 866-4625
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-8 border-t border-primary-foreground/20 pt-6 text-center font-body text-xs opacity-60">
        © {new Date().getFullYear()} Campbell Seventh-day Adventist Church. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
