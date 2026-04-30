
import HeroSection from "../../components/HeroSection";
import LogoCloudSection from "../../components/LogoCloudSection";
import FeatureSection from "../../components/FeatureSection";
import HowItWorksSection from "../../components/HowItWorksSection";
import StatsSection from "../../components/StatsSection";
import TestimonialsSection from "../../components/TestimonialsSection";
import PricingSection from "../../components/PricingSection";
import FAQSection from "../../components/FAQSection";
import CTASection from "../../components/CTASection";


export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <LogoCloudSection />
      <FeatureSection />
      <HowItWorksSection />
      <StatsSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
    </main>
  );
}
