import VideoHeroSection from "../../components/VideoHeroSection";
import FeatureSection from "../../components/FeatureSection";
// import HowItWorksSection from "../../components/HowItWorksSection";
// import StatsSection from "../../components/StatsSection";
import TestimonialsSection from "../../components/TestimonialsSection";
import PricingSection from "../../components/PricingSection";
import FAQSection from "../../components/FAQSection";
import CTASection from "../../components/CTASection";
import { AudienceProvider } from "../../contexts/AudienceContext";
import { getAdheraPricing, ADHERA_TRIAL_DAYS } from "../../lib/adhera-pricing";

export default async function HomePage() {
  // Falls back to null (PricingSection then shows the static translated copy)
  // until ADHERA_STRIPE_PRICE_MONTHLY/YEARLY are configured for this deployment.
  const pricing = await getAdheraPricing().catch(() => null);

  return (
    <main>
      <AudienceProvider defaultAudience="associations">
        <div id="hero" data-header-dark className="relative z-20 mb-[-100px]">
          <VideoHeroSection trialDays={ADHERA_TRIAL_DAYS} />
        </div>
        <div className="relative z-10">
          <FeatureSection />
          {/* <HowItWorksSection /> */}
          {/* <StatsSection /> */}
          <TestimonialsSection />
          <PricingSection pricing={pricing} trialDays={ADHERA_TRIAL_DAYS} />
          <FAQSection trialDays={ADHERA_TRIAL_DAYS} />
          <CTASection trialDays={ADHERA_TRIAL_DAYS} />
        </div>
      </AudienceProvider>
    </main>
  );
}
