import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BulletinsList from "@/components/BulletinsList";

const BulletinsPage = () => (
  <div className="flex min-h-screen flex-col">
    <Navbar />
    <main className="flex-1 py-16">
      <div className="container">
        <h1 className="mb-8 font-display text-4xl font-bold">Church Bulletins</h1>
        <BulletinsList />
      </div>
    </main>
    <Footer />
  </div>
);

export default BulletinsPage;
