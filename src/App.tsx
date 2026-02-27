import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Announcements from "./pages/Announcements";
import Events from "./pages/Events";
import Bulletins from "./pages/Bulletins";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Sermons from "./pages/Sermons";
import Gallery from "./pages/Gallery";
import Directory from "./pages/Directory";
import SmallGroups from "./pages/SmallGroups";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/bulletins" element={<Bulletins />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/sermons" element={<Sermons />} />
            <Route path="/events" element={<Events />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/directory" element={<Directory />} />
            <Route path="/small-groups" element={<SmallGroups />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
