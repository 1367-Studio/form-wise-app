"use client";

import { useEffect, useRef } from "react";
import { Check, Zap } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const tiers = [
  {
    name: "Mensuel",
    id: "tier-mensuel",
    href: "/contact",
    priceMonthly: "129€",
    billingCycle: "mois",
    description: "Une formule simple, mensuelle, sans engagement.",
    features: [
      "Jusqu'à 500 élèves",
      "Tableaux de bord : directeur, parent, professeur",
      "Notifications ciblées et globales",
      "Suivi des paiements mensuels",
      "Support sous 24h",
    ],
    featured: false,
  },
  {
    name: "Annuel",
    id: "tier-annuel",
    href: "/contact",
    priceMonthly: "1290€",
    billingCycle: "an",
    description:
      "2 mois offert + services exclusifs pour les structures engagées.",
    features: [
      "Toutes les fonctionnalités de la formule mensuelle",
      "1 mois offert (soit 129€ d'économie)",
      "Accès prioritaire au support",
      "Formations en ligne offertes",
      "Certificat RGPD annuel",
    ],
    featured: true,
  },
  {
    name: "Essai gratuit",
    id: "tier-freemium",
    href: "/register/school-register",
    priceMonthly: "Gratuit",
    billingCycle: "20 jours",
    description: "Testez gratuitement toutes les fonctionnalités de Formwise.",
    features: [
      "Toutes les fonctionnalités de la formule mensuelle",
      "Sans carte bancaire",
      "Valable pendant 20 jours",
      "Activation immédiate",
      "Support inclus",
    ],
    featured: false,
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function PricingSection() {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const titleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Animate title
    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    // Animate cards
    cardsRef.current.forEach((el, index) => {
      if (el) {
        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: index * 0.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    });
  }, []);

  return (
    <div className="relative isolate bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-4xl text-center" ref={titleRef}>
        <h2 className="text-base/7 font-semibold text-indigo-600">Tarifs</h2>
        <p className="mt-2 text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-6xl">
          Choisissez le plan adapté à votre établissement
        </p>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-center text-lg font-medium text-gray-600 sm:text-xl/8">
          Choose an affordable plan that’s packed with the best features for
          engaging your audience, creating customer loyalty, and driving sales.
        </p>
      </div>
      <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-y-6 gap-x-8 sm:grid-cols-2 lg:grid-cols-3 sm:mt-20">
        {tiers.map((tier, index) => (
          <div
            key={tier.id}
            ref={(el) => {
              cardsRef.current[index] = el;
            }}
            className={classNames(
              tier.featured
                ? "relative bg-gray-900 shadow-2xl"
                : "bg-white/60 sm:mx-8 lg:mx-0",
              "rounded-3xl p-8 ring-1 ring-gray-900/10 sm:p-10"
            )}
          >
            <h3
              id={tier.id}
              className={classNames(
                tier.featured ? "text-indigo-400" : "text-indigo-600",
                "text-base/7 font-semibold"
              )}
            >
              {tier.name}
            </h3>
            <p className="mt-4 flex items-baseline gap-x-2">
              <span
                className={classNames(
                  tier.featured ? "text-white" : "text-gray-900",
                  "text-5xl font-semibold tracking-tight"
                )}
              >
                {tier.priceMonthly}
              </span>
              <span
                className={classNames(
                  tier.featured ? "text-gray-400" : "text-gray-500",
                  "text-base"
                )}
              >
                /{tier.billingCycle}
              </span>
            </p>
            <p
              className={classNames(
                tier.featured ? "text-gray-300" : "text-gray-600",
                "mt-6 text-base/7"
              )}
            >
              {tier.description}
            </p>
            <ul
              role="list"
              className={classNames(
                tier.featured ? "text-gray-300" : "text-gray-600",
                "mt-8 space-y-3 text-sm/6 sm:mt-10"
              )}
            >
              {tier.features.map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  <Check
                    aria-hidden="true"
                    className={classNames(
                      tier.featured ? "text-indigo-400" : "text-indigo-600",
                      "h-6 w-5 flex-none"
                    )}
                  />
                  {feature}
                </li>
              ))}
            </ul>
            <a
              href={tier.href}
              aria-describedby={tier.id}
              className={classNames(
                tier.featured
                  ? "bg-indigo-500 text-white flex gap-1 shadow-sm hover:bg-indigo-400 focus-visible:outline-indigo-500"
                  : "text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:ring-indigo-300 focus-visible:outline-indigo-600",
                "mt-8 flex gap-1 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-10"
              )}
            >
              <Zap /> Profitez de 20 jours gratuitement
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
