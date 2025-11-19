import LandingHero from "../components/organisms/LandingHero";
import FeaturesSection from "../components/organisms/FeaturesSection";
import FvFooter from "../components/layout/FvFooter";

export default function Landing() {
  return (
    <div className="fv-hero h-[165vh] flex flex-col relative">
      <LandingHero />
      <FeaturesSection />
      <FvFooter />
    </div>
  );
}
