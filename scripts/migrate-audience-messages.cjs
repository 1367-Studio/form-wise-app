/* One-shot migration: nest landing namespaces into { associations, schools }. */
const fs = require("fs");
const path = require("path");

const LOCALES = ["fr", "en", "pt", "es"];
const NS = ["Hero", "Features", "HowItWorks", "Testimonials", "FAQ", "CTA"];

const toggles = {
  fr: { toggleAssociations: "Associations", toggleSchools: "Écoles", toggleAriaLabel: "Choisir votre profil" },
  en: { toggleAssociations: "Associations", toggleSchools: "Schools", toggleAriaLabel: "Choose your profile" },
  pt: { toggleAssociations: "Associações", toggleSchools: "Escolas", toggleAriaLabel: "Escolha o seu perfil" },
  es: { toggleAssociations: "Asociaciones", toggleSchools: "Colegios", toggleAriaLabel: "Elige tu perfil" },
};

/* Per-locale, per-namespace overrides applied on top of the existing (school) copy
   to produce the associations variant. Unlisted keys are inherited unchanged. */
const overrides = {
  fr: {
    Hero: {
      titlePrefix: "Réduisez jusqu'à 70 % le temps consacré à la gestion des adhésions et aux",
      subtitle: "Automatisez les réponses aux questions avec l'IA, communiquez avec vos membres et bénévoles via WhatsApp et gérez toute votre association sur une seule plateforme.",
      leftFeature1Title: "Adhésions en ligne intelligentes",
      leftFeature1Desc: "Vos membres adhèrent en ligne, les données se synchronisent.",
      leftFeature2Title: "Encaissement des cotisations",
      leftFeature2Desc: "Cotisations, paiements et reçus en un seul endroit.",
      leftFeature3Desc: "Attestations et fichiers collectés automatiquement.",
      rightFeature1Title: "Assistant IA pour vos membres",
      rightFeature3Desc: "Statut des adhésions et des cotisations en un coup d'œil.",
      questionPrefix: "Vous gérez encore les adhésions",
    },
    Features: {
      title: "Gérez votre association plus simplement, dès aujourd'hui.",
      registrationsName: "Adhésions centralisées",
      registrationsDescription: "Gagnez du temps avec un système d'adhésion moderne, simple et sécurisé. Vos membres s'inscrivent en ligne, le bureau valide en un seul endroit.",
      paymentsName: "Cotisations simplifiées",
      paymentsDescription: "Chaque membre reçoit une notification automatique pour régler sa cotisation. Paiement par virement, chèque ou prélèvement à venir.",
      communicationDescription: "Envoyez un message à tous vos membres, ou à un seul groupe (« Rendez-vous samedi pour l'événement ») tout est possible depuis le tableau de bord.",
      aiDescription: "Un chatbot intégré guide chacun pas à pas : membres, bureau ou bénévoles trouvent rapidement les réponses à leurs questions.",
    },
    HowItWorks: {
      subtitle: "Trois étapes simples pour digitaliser la gestion de votre association.",
      step1Description: "Inscrivez votre association en quelques clics. Configurez vos activités, vos sections et invitez votre équipe.",
      step2Title: "Invitez membres et bénévoles",
      step2Description: "Envoyez des invitations par e-mail ou lien. Chaque utilisateur accède à son espace personnalisé en toute sécurité.",
      step3Description: "Adhésions, cotisations, notifications, documents : pilotez votre association depuis une interface unique et intuitive.",
    },
    Testimonials: {
      title: "La confiance des associations à travers le pays",
      subtitle: "Découvrez comment Formwise aide présidents, membres et bénévoles au quotidien.",
      directorQuote: "Depuis que nous utilisons Formwise, les adhésions prennent deux fois moins de temps. Le tableau de bord me donne une vue claire de toute la vie de l'association.",
      directorRole: "Présidente, Association Lumière",
      parentQuote: "J'apprécie la facilité avec laquelle je peux suivre mes documents et le paiement de ma cotisation. Les notifications me tiennent informé sans être envahissantes.",
      parentRole: "Membre, Association Lumière",
      teacherQuote: "Présences aux activités, communication avec les membres — tout est au même endroit. Ça a vraiment simplifié mon quotidien de bénévole.",
      teacherRole: "Bénévole, Club Saint-Exupéry",
    },
    FAQ: {
      multiSchoolQuestion: "Peut-on gérer plusieurs associations ?",
      multiSchoolAnswer: "Oui. Formwise est multi-structures par défaut. Chaque association dispose de son propre espace isolé, avec des rôles et permissions dédiés.",
    },
    CTA: {
      title: "Prêt à simplifier la gestion de votre association ?",
      subtitle: "Rejoignez les associations qui font confiance à Formwise pour gérer adhésions, cotisations, communications et présences — le tout depuis une seule plateforme.",
    },
  },
  en: {
    Hero: {
      titlePrefix: "Reduce up to 70% of the time spent on membership and",
      subtitle: "Automate queries with AI, reach your members and volunteers on WhatsApp, and manage your entire association on a single platform.",
      leftFeature1Title: "Smart membership forms",
      leftFeature1Desc: "Members join online, data syncs instantly.",
      leftFeature2Title: "Integrated dues collection",
      leftFeature2Desc: "Dues, payments and receipts in one place.",
      leftFeature3Desc: "Certificates and files collected automatically.",
      rightFeature1Title: "AI member assistant",
      rightFeature3Desc: "Membership status and dues at a glance.",
      questionPrefix: "Still managing memberships",
    },
    Features: {
      title: "Run your association more easily, starting today.",
      registrationsName: "Centralised memberships",
      registrationsDescription: "Save time with a modern, simple and secure membership system. Members sign up online, your board approves in one place.",
      paymentsName: "Simplified dues",
      paymentsDescription: "Each member receives an automatic notification to pay their dues. Bank transfer, cheque or direct debit (coming soon).",
      communicationDescription: "Send a message to all members, or to a single group (\"See you Saturday for the event\") — everything from one dashboard.",
      aiDescription: "An integrated chatbot guides everyone step by step: members, board and volunteers all find quick answers.",
    },
    HowItWorks: {
      subtitle: "Three simple steps to digitize your association management.",
      step1Description: "Register your association in a few clicks. Set up your activities, sections, and invite your team.",
      step2Title: "Invite members and volunteers",
      step2Description: "Send invitations by email or link. Each user gets secure access to their personalized dashboard.",
      step3Description: "Memberships, dues, notifications, documents: run your association from a single, intuitive interface.",
    },
    Testimonials: {
      title: "Trusted by associations across the country",
      subtitle: "Discover how Formwise helps presidents, members and volunteers every day.",
      directorQuote: "Since adopting Formwise, memberships take half the time. The dashboard gives me a clear view of everything happening in the association.",
      directorRole: "President, Association Lumière",
      parentQuote: "I love how easy it is to track my documents and pay my dues. The notifications keep me informed without being overwhelming.",
      parentRole: "Member, Association Lumière",
      teacherQuote: "Attendance at activities, communication with members — everything is in one place. It has genuinely simplified my volunteering.",
      teacherRole: "Volunteer, Club Saint-Exupéry",
    },
    FAQ: {
      multiSchoolQuestion: "Can I manage multiple associations?",
      multiSchoolAnswer: "Yes. Formwise supports multi-organisation setups by default. Each association has its own isolated workspace with dedicated roles and permissions.",
    },
    CTA: {
      title: "Ready to simplify your association management?",
      subtitle: "Join the associations that trust Formwise to manage memberships, dues, communications and attendance — all from one platform.",
    },
  },
  pt: {
    Hero: {
      titlePrefix: "Reduza em até 70% o tempo gasto com gestão de sócios e",
      subtitle: "Automatize dúvidas com IA, comunique com os seus sócios e voluntários pelo WhatsApp e faça a gestão de toda a sua associação numa única plataforma.",
      leftFeature1Title: "Formulários de adesão inteligentes",
      leftFeature1Desc: "Os sócios aderem online, os dados sincronizam na hora.",
      leftFeature2Title: "Cobrança de quotas integrada",
      leftFeature2Desc: "Quotas, pagamentos e recibos num só lugar.",
      leftFeature3Desc: "Certificados e ficheiros recolhidos automaticamente.",
      rightFeature1Title: "Assistente IA para sócios",
      rightFeature3Desc: "Estado das adesões e quotas de um só olhar.",
      questionPrefix: "Ainda a gerir sócios",
    },
    Features: {
      title: "Faça a gestão da sua associação de forma mais simples, a partir de hoje.",
      registrationsName: "Adesões centralizadas",
      registrationsDescription: "Ganhe tempo com um sistema de adesão moderno, simples e seguro. Os sócios inscrevem-se online e a direção aprova num só lugar.",
      paymentsName: "Quotas simplificadas",
      paymentsDescription: "Cada sócio recebe uma notificação automática para pagar a sua quota. Pagamento por transferência, cheque ou débito direto em breve.",
      communicationDescription: "Envie uma mensagem para todos os sócios ou para um único grupo (\"Até sábado no evento\") — tudo a partir do painel.",
      aiDescription: "Um chatbot integrado guia cada um passo a passo: sócios, direção e voluntários encontram respostas rapidamente.",
    },
    HowItWorks: {
      subtitle: "Três passos simples para digitalizar a gestão da sua associação.",
      step1Description: "Registe a sua associação em poucos cliques. Configure as suas atividades, secções e convide a sua equipa.",
      step2Title: "Convide sócios e voluntários",
      step2Description: "Envie convites por e-mail ou link. Cada utilizador acede ao seu espaço personalizado com segurança.",
      step3Description: "Adesões, quotas, notificações, documentos: administre a sua associação a partir de uma interface única e intuitiva.",
    },
    Testimonials: {
      title: "A confiança de associações por todo o país",
      subtitle: "Descubra como o Formwise ajuda presidentes, sócios e voluntários todos os dias.",
      directorQuote: "Desde que adotámos o Formwise, as adesões demoram metade do tempo. O painel dá-me uma visão clara de toda a vida da associação.",
      directorRole: "Presidente, Associação Lumière",
      parentQuote: "Adoro a facilidade com que acompanho os meus documentos e pago a minha quota. As notificações mantêm-me informado sem serem excessivas.",
      parentRole: "Sócio, Associação Lumière",
      teacherQuote: "Presenças nas atividades, comunicação com os sócios — tudo num só lugar. Simplificou genuinamente o meu voluntariado.",
      teacherRole: "Voluntária, Clube Saint-Exupéry",
    },
    FAQ: {
      multiSchoolQuestion: "Posso gerir várias associações?",
      multiSchoolAnswer: "Sim. O Formwise suporta configurações multi-organização por padrão. Cada associação tem o seu próprio espaço isolado com funções e permissões dedicadas.",
    },
    CTA: {
      title: "Pronto para simplificar a gestão da sua associação?",
      subtitle: "Junte-se às associações que confiam no Formwise para gerir adesões, quotas, comunicações e presenças — tudo numa só plataforma.",
    },
  },
  es: {
    Hero: {
      titlePrefix: "Reduce hasta un 70% el tiempo dedicado a la gestión de socios y",
      subtitle: "Automatiza consultas con IA, comunícate con tus socios y voluntarios por WhatsApp y gestiona toda tu asociación en una sola plataforma.",
      leftFeature1Title: "Formularios de alta de socios inteligentes",
      leftFeature1Desc: "Tus socios se dan de alta en línea, los datos se sincronizan al instante.",
      leftFeature2Title: "Cobro de cuotas integrado",
      leftFeature2Desc: "Cuotas, pagos y recibos en un solo lugar.",
      leftFeature3Desc: "Certificados y archivos recopilados automáticamente.",
      rightFeature1Title: "Asistente IA para socios",
      rightFeature3Desc: "Estado de altas y cuotas de un solo vistazo.",
      questionPrefix: "¿Todavía gestionando socios",
    },
    Features: {
      title: "Gestiona tu asociación de manera más sencilla, desde hoy.",
      registrationsName: "Altas de socios centralizadas",
      registrationsDescription: "Ahorra tiempo con un sistema de altas moderno, simple y seguro. Los socios se dan de alta en línea y la junta valida en un único lugar.",
      paymentsName: "Cuotas simplificadas",
      paymentsDescription: "Cada socio recibe una notificación automática para abonar su cuota. Pago por transferencia, cheque o domiciliación próximamente.",
      communicationDescription: "Envía un mensaje a todos los socios o a un solo grupo (\"Nos vemos el sábado en el evento\") — todo desde el panel.",
      aiDescription: "Un chatbot integrado guía a cada uno paso a paso: socios, junta y voluntarios encuentran respuestas rápidamente.",
    },
    HowItWorks: {
      subtitle: "Tres pasos sencillos para digitalizar la gestión de tu asociación.",
      step1Description: "Registra tu asociación en pocos clics. Configura tus actividades, secciones e invita a tu equipo.",
      step2Title: "Invita a socios y voluntarios",
      step2Description: "Envía invitaciones por correo o enlace. Cada usuario accede a su espacio personalizado de forma segura.",
      step3Description: "Altas, cuotas, notificaciones, documentos: dirige tu asociación desde una interfaz única e intuitiva.",
    },
    Testimonials: {
      title: "La confianza de asociaciones en todo el país",
      subtitle: "Descubre cómo Formwise ayuda a presidentes, socios y voluntarios cada día.",
      directorQuote: "Desde que adoptamos Formwise, las altas tardan la mitad. El panel me da una vista clara de todo lo que ocurre en la asociación.",
      directorRole: "Presidenta, Asociación Lumière",
      parentQuote: "Me encanta lo fácil que es seguir mis documentos y pagar mi cuota. Las notificaciones me mantienen informado sin agobiar.",
      parentRole: "Socio, Asociación Lumière",
      teacherQuote: "Asistencia a las actividades, comunicación con los socios — todo en un solo lugar. Ha simplificado de verdad mi voluntariado.",
      teacherRole: "Voluntaria, Club Saint-Exupéry",
    },
    FAQ: {
      multiSchoolQuestion: "¿Se pueden gestionar varias asociaciones?",
      multiSchoolAnswer: "Sí. Formwise soporta configuraciones multi-organización por defecto. Cada asociación tiene su propio espacio aislado con roles y permisos dedicados.",
    },
    CTA: {
      title: "¿Listo para simplificar la gestión de tu asociación?",
      subtitle: "Únete a las asociaciones que confían en Formwise para gestionar altas, cuotas, comunicaciones y presencia — todo desde una sola plataforma.",
    },
  },
};

for (const loc of LOCALES) {
  const file = path.join("src/messages", `${loc}.json`);
  const m = JSON.parse(fs.readFileSync(file, "utf8"));

  for (const ns of NS) {
    const schools = m[ns];
    if (schools && schools.associations && schools.schools) continue; // idempotent
    const ov = (overrides[loc] && overrides[loc][ns]) || {};
    const unknown = Object.keys(ov).filter((k) => !(k in schools));
    if (unknown.length) {
      throw new Error(`${loc}/${ns}: override keys not in source: ${unknown.join(", ")}`);
    }
    const associations = { ...schools, ...ov };
    const rebuilt = {};
    if (ns === "Hero") Object.assign(rebuilt, toggles[loc]);
    rebuilt.associations = associations;
    rebuilt.schools = schools;
    m[ns] = rebuilt;
  }

  fs.writeFileSync(file, JSON.stringify(m, null, 2));
  console.log(`migrated ${loc}.json`);
}
