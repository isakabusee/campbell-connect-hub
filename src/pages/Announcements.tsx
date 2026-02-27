import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnnouncementsList from "@/components/AnnouncementsList";

const AnnouncementsPage = () => (
  <div className="flex min-h-screen flex-col">
    <Navbar />
    <main className="flex-1 py-16">
      <div className="container">
        <h1 className="mb-8 font-display text-4xl font-bold">Announcements</h1>
        <AnnouncementsList />
      </div>
    </main>
    <Footer />
  </div>
);

export default AnnouncementsPage;
