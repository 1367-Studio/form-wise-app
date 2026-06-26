import VideoHeroSection from "../../components/VideoHeroSection";
import FeatureSection from "../../components/FeatureSection";
import HowItWorksSection from "../../components/HowItWorksSection";
// import StatsSection from "../../components/StatsSection";
import TestimonialsSection from "../../components/TestimonialsSection";
import PricingSection from "../../components/PricingSection";
import FAQSection from "../../components/FAQSection";
import CTASection from "../../components/CTASection";
import { AudienceProvider } from "../../contexts/AudienceContext";

export default function HomePage() {
  return (
    <main>
      <AudienceProvider defaultAudience="associations">
        <div className="relative z-20 mb-[-100px]">
          <VideoHeroSection />
        </div>
        <div className="relative z-10">
          <FeatureSection />
          <HowItWorksSection />
          {/* <StatsSection /> */}
          <TestimonialsSection />
          <PricingSection />
          <FAQSection />
          <CTASection />
        </div>
      </AudienceProvider>
    </main>
  );
}
