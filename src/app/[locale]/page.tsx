import VideoHeroSection from "../../components/VideoHeroSection";
import ProblemSection from "../../components/ProblemSection";
import FeatureSection from "../../components/FeatureSection";
// import HowItWorksSection from "../../components/HowItWorksSection";
// import StatsSection from "../../components/StatsSection";
import TestimonialsSection from "../../components/TestimonialsSection";
import MidCTASection from "../../components/MidCTASection";
import PricingSection from "../../components/PricingSection";
import FAQSection from "../../components/FAQSection";
import CTASection from "../../components/CTASection";
import { AudienceProvider } from "../../contexts/AudienceContext";
import { getAdheraPricing, ADHERA_TRIAL_DAYS } from "../../lib/adhera-pricing";
import { getTranslations } from "next-intl/server";

// Mirrors FAQ_KEYS in FAQSection. The accordion only mounts the open panel, so
// crawlers never see the other answers — this JSON-LD exposes all of them.
const FAQ_KEYS = [
  "pricing",
  "trial",
  "dataSecurity",
  "multiSchool",
  "mobile",
  "support",
] as const;

export default async function HomePage() {
  // Pricing falls back to null (PricingSection then shows the static translated
  // copy) until ADHERA_STRIPE_PRICE_MONTHLY/YEARLY are configured for this deployment.
  const [pricing, tFaq] = await Promise.all([
    getAdheraPricing().catch(() => null),
    getTranslations("FAQ.associations"),
  ]);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_KEYS.map((key) => ({
      "@type": "Question",
      name: tFaq(`${key}Question`),
      acceptedAnswer: {
        "@type": "Answer",
        text: tFaq(`${key}Answer`, { days: ADHERA_TRIAL_DAYS }),
      },
    })),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <AudienceProvider defaultAudience="associations">
        <div id="hero" className="relative z-20 mb-[-100px]">
          <VideoHeroSection trialDays={ADHERA_TRIAL_DAYS} />
        </div>
        <div className="relative z-10">
          <ProblemSection />
          <FeatureSection />
          {/* <HowItWorksSection /> */}
          {/* <StatsSection /> */}
          <MidCTASection variant="afterFeatures" trialDays={ADHERA_TRIAL_DAYS} />
          <TestimonialsSection />
          <MidCTASection
            variant="beforePricing"
            trialDays={ADHERA_TRIAL_DAYS}
            showDemo
          />
          <PricingSection pricing={pricing} trialDays={ADHERA_TRIAL_DAYS} />
          <FAQSection trialDays={ADHERA_TRIAL_DAYS} />
          <CTASection trialDays={ADHERA_TRIAL_DAYS} />
        </div>
      </AudienceProvider>
    </main>
  );
}
