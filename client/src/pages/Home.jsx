import { useLandingProgress } from "../hooks/useLandingProgress";
import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Companies from "../components/landing/Companies";
import Features from "../components/landing/Features";
import RoadmapPreview from "../components/landing/RoadmapPreview";
import CTA from "../components/landing/CTA";
import Footer from "../components/landing/Footer";

function Home() {
  const roadmap = useLandingProgress();
  return (
    <div id="top" className="site-background min-h-screen text-white">
      <Navbar />

      <Hero roadmap={roadmap} />

      <Companies />

      <Features />

      <RoadmapPreview roadmap={roadmap} />


      <CTA />

      <Footer />
    </div>
  );
}

export default Home;
