import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  const links = [
    { to: "/", label: "Home" },
    { to: "/announcements", label: "Announcements" },
    { to: "/bulletins", label: "Bulletins" },
    { to: "/sermons", label: "Sermons" },
    { to: "/events", label: "Events" },
    { to: "/gallery", label: "Gallery" },
    { to: "/directory", label: "Directory" },
    { to: "/small-groups", label: "Groups" },
    { to: "/contact", label: "Contact" },
  ];

  if (isAdmin) {
    links.push({ to: "/admin", label: "Admin" });
  }


  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-xl font-bold text-primary">
            Campbell SDA
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`font-body text-sm font-medium transition-colors hover:text-accent ${
                location.pathname === link.to
                  ? "text-accent"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <Button asChild variant="outline" size="sm">
              <Link to="/logout">Sign Out</Link>
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link to="/login">Sign In</Link>
            </Button>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-border bg-card p-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`font-body text-sm font-medium transition-colors hover:text-accent ${
                  location.pathname === link.to
                    ? "text-accent"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <Button asChild variant="outline" size="sm" onClick={() => setMobileOpen(false)}>
                <Link to="/logout">Sign Out</Link>
              </Button>
            ) : (
              <Button asChild size="sm">
                <Link to="/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
