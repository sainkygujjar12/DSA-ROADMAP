import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Companies from "../components/landing/Companies";
import Features from "../components/landing/Features";
import RoadmapPreview from "../components/landing/RoadmapPreview";
import Stats from "../components/landing/Stats";
import CTA from "../components/landing/CTA";
import Footer from "../components/landing/Footer";

function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <Hero />

      <Companies />

      <Features />

      <RoadmapPreview />

      <Stats />

      <CTA />

      <Footer />
    </div>
  );
}

export default Home;