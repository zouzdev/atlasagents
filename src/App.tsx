import React, { useEffect, useMemo, useState } from 'react';
import {
  Brain,
  MessageSquare,
  Zap,
  ArrowRight,
  ArrowDown,
  Mail,
  MapPin,
  Linkedin,
  Instagram,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useTheme } from './contexts/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';
import { BackToTopButton } from './components/BackToTopButton';
import { ContactButton } from './components/ContactButton';
import { ReviewCarousel } from './components/ReviewCarousel';
import { ClientLogosMarquee } from './components/ClientLogosMarquee';
import { CookieBanner } from './components/CookieBanner';
import { useScrollAnimation } from './hooks/useScrollAnimation';
import { supabase } from './lib/supabase';

/* ===== Icon Cloud (react-icon-cloud) ===== */
import {
  Cloud,
  fetchSimpleIcons,
  ICloud,
  renderSimpleIcon,
  SimpleIcon,
} from 'react-icon-cloud';

/* Props zoals aangeleverd */
export const cloudProps: Omit<ICloud, 'children'> = {
  containerProps: {
    style: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      paddingTop: 40,
    },
  },
  options: {
    reverse: true,
    depth: 1,
    wheelZoom: false,
    imageScale: 2,
    activeCursor: 'default',
    tooltip: 'native',
    initial: [0.1, -0.1],
    clickToFront: 500,
    tooltipDelay: 0,
    outlineColour: '#0000',
    maxSpeed: 0.04,
    minSpeed: 0.02,
    // dragControl: false,
  },
};

export const renderCustomIcon = (icon: SimpleIcon, theme: 'light' | 'dark') => {
  const bgHex = theme === 'light' ? '#f3f2ef' : '#080510';
  const fallbackHex = theme === 'light' ? '#6e6e73' : '#ffffff';
  const minContrastRatio = theme === 'dark' ? 2 : 1.2;

  return renderSimpleIcon({
    icon,
    bgHex,
    fallbackHex,
    minContrastRatio,
    size: 42,
    aProps: {
      href: undefined,
      target: undefined,
      rel: undefined,
      onClick: (e: any) => e.preventDefault(),
    },
  });
};

export type DynamicCloudProps = {
  iconSlugs: string[];
  themeMode: 'light' | 'dark';
};

type IconData = Awaited<ReturnType<typeof fetchSimpleIcons>>;

export function IconCloud({ iconSlugs, themeMode }: DynamicCloudProps) {
  const [data, setData] = useState<IconData | null>(null);

  useEffect(() => {
    fetchSimpleIcons({ slugs: iconSlugs }).then(setData);
  }, [iconSlugs]);

  const renderedIcons = useMemo(() => {
    if (!data) return null;
    return Object.values(data.simpleIcons).map((icon) =>
      renderCustomIcon(icon, themeMode)
    );
  }, [data, themeMode]);

  // @ts-ignore (lib types laten children niet altijd goed door)
  return <Cloud {...cloudProps}>{renderedIcons}</Cloud>;
}
/* ===== Einde Icon Cloud ===== */

function App() {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const serviceSection = useScrollAnimation();
  const agentsSection = useScrollAnimation();
  const toolsSection = useScrollAnimation(); // <— NIEUW: animatie voor Icon Cloud sectie
  const securitySection = useScrollAnimation();
  const reviewsSection = useScrollAnimation();
  const pricingSection = useScrollAnimation();
  const faqSection = useScrollAnimation();
  const contactSection = useScrollAnimation();

  const scrollToAgents = () => {
    const el = document.getElementById('agents-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      if (!formData.name || !formData.email || !formData.message) {
        throw new Error('Vul alle verplichte velden in');
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Ongeldig email adres');
      }

      const { error: dbError } = await supabase
        .from('contact_submissions')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            company: formData.company || null,
            message: formData.message,
            status: 'new',
          },
        ]);

      if (dbError)
        throw new Error(
          `Er is iets misgegaan bij het opslaan: ${dbError.message}`
        );

      try {
        const resendApiUrl =
          import.meta.env.VITE_RESEND_FUNCTION_URL ||
          `https://fdtobnmtufuairpgppeh.supabase.co/functions/v1/resend-email`;
        await fetch(resendApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(formData),
        });
      } catch (err) {
        console.error('Email sending failed:', err);
      }

      setSubmitStatus({
        type: 'success',
        message:
          'Bedankt voor je bericht! We nemen zo snel mogelijk contact met je op.',
      });
      setFormData({ name: '', email: '', company: '', message: '' });
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Er is een fout opgetreden. Probeer het later opnieuw.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ============ DATA ============ */

  // Agents (Mark & Daniel actief)
  const agents = [
    {
      id: 1,
      name: 'Eva',
      role: 'Kennismanager',
      description:
        'Beheert en ontsluit alle interne kennis 24/7. Van HR-beleid tot productinformatie: Eva geeft medewerkers direct antwoord zonder te zoeken in mappen of portals.',
      image: 'agent-image/Eva.png',
      capabilities: [
        'Documenten zoeken & samenvatten',
        'Kennisbankbeheer',
        'Contextueel vraag & antwoord in Teams/Outlook',
      ],
    },
    {
      id: 2,
      name: 'Ingrid',
      role: 'Inbox Assistent',
      description:
        'Organiseert en beheert je mailbox alsof het een persoonlijke assistent is. Ingrid sorteert, prioriteert en beantwoordt e-mails zodat je inbox altijd overzichtelijk en onder controle blijft.',
      image: 'agent-image/Ingrid.png',
      capabilities: [
        'E-mails classificeren & prioriteren',
        'Slimme concepten & automatische antwoorden',
        'Afspraken en taken herkennen & uitzetten',
      ],
    },
    {
      id: 3,
      name: 'Mark',
      role: 'Marketeer',
      description:
        'Creëert creatieve en consistente content in jouw merkstem. Van posts en blogs tot presentaties en campagnes: Mark levert snel professioneel materiaal dat aansluit bij je doelgroep.',
      image: 'agent-image/Mark.png',
      capabilities: [
        'Contentcreatie (blogs, posts, campagnes)',
        'SEO optimalisatie',
        'Consistente merkstem',
      ],
    },
    {
      id: 4,
      name: 'Daniel',
      role: 'Visueel Designer',
      description:
        'Ontwerpt visuele producten op basis van jouw input. Daniel is in staat jouw feedback te gebruiken om aanpassingen te doen in ontwerpen.',
      image: 'agent-image/Daniel.png',
      capabilities: ['Grafisch ontwerp', 'Workflow automatisering', 'API & systeemintegratie'],
    },
  ];

  const reviews = [
    {
      name: 'Sarah Chen',
      company: 'TechStart Inc.',
      rating: 5,
      text: 'De AI-agenten hebben onze klantenservice getransformeerd. Reactietijden daalden met 80%, terwijl de klanttevredenheid drastisch toenam.',
    },
    {
      name: 'Michael Rodriguez',
      company: 'DataFlow Solutions',
      rating: 5,
      text: 'Deze agenten hielpen ons inzichten te ontdekken waarvan we het bestaan niet wisten in onze data. De ROI was al binnen de eerste maand duidelijk.',
    },
    {
      name: 'Emily Johnson',
      company: 'Creative Agency Pro',
      rating: 5,
      text: 'Onze agenten hebben ons contentcreatieproces gerevolutioneerd. We produceren nu 3x meer content met consistente kwaliteit.',
    },
    {
      name: 'David van der Berg',
      company: 'InnovateTech B.V.',
      rating: 5,
      text: 'Eva heeft onze interne kennisbank volledig getransformeerd. Medewerkers vinden nu binnen seconden de informatie die ze nodig hebben, wat onze productiviteit enorm heeft verhoogd.',
    },
    {
      name: 'Lisa Janssen',
      company: 'Marketing Masters',
      rating: 5,
      text: 'Mark heeft ons marketingteam naar een hoger niveau getild. De consistentie in onze merkcommunicatie en de snelheid waarmee we campaigns kunnen lanceren is fenomenaal.',
    },
    {
      name: 'Thomas Bakker',
      company: 'FinanceFlow',
      rating: 5,
      text: 'Ingrid beheert onze mailbox zo efficiënt dat we 70% minder tijd kwijt zijn aan e-mailbeheer. Onze focus ligt nu volledig op strategische taken.',
    },
    {
      name: 'Anna Vermeulen',
      company: 'HealthTech Solutions',
      rating: 5,
      text: 'De implementatie was naadloos en de resultaten overtroffen onze verwachtingen. Onze AI-agent heeft onze workflow volledig geoptimaliseerd.',
    },
    {
      name: 'Robert de Wit',
      company: 'E-commerce Plus',
      rating: 5,
      text: 'Sinds we met ATLAS Agents werken, is onze klantenservice 24/7 beschikbaar zonder extra personeel. De klanttevredenheid is met 45% gestegen.',
    },
    {
      name: 'Sophie Mulder',
      company: 'Design Studio Amsterdam',
      rating: 5,
      text: 'Daniel heeft onze ontwerpprocessen gerevolutioneerd. We kunnen nu complexe visuele projecten in een fractie van de tijd realiseren met perfecte kwaliteit.',
    },
    {
      name: 'Mark Hendriks',
      company: 'Logistics Pro',
      rating: 5,
      text: 'De automatisering die onze agents hebben gebracht, heeft onze operationele kosten met 35% verlaagd terwijl de service kwaliteit is verbeterd.',
    },
    {
      name: 'Jennifer Smit',
      company: 'HR Innovations',
      rating: 5,
      text: 'Eva beantwoordt alle HR-gerelateerde vragen van onze medewerkers direct en accuraat. Dit heeft onze HR-afdeling enorm ontlast en de medewerkertevredenheid verhoogd.',
    },
    {
      name: 'Peter Groot',
      company: 'Tech Consultancy',
      rating: 5,
      text: 'De integratie met onze bestaande systemen verliep vlekkeloos. Onze AI-agents werken perfect samen met alle tools die we al gebruikten.',
    },
  ];

  // Security & Compliance
  const encryptionStandards = [
    { label: 'AES-256 Encryption', ok: true },
    { label: 'TLS 1.3 in Transit', ok: true },
    { label: 'Zero-Knowledge Architecture', ok: true },
  ];
  const activityFeed = [
    { label: 'Sarah accessed Case #2024-001', time: '2 min ago', ok: true },
    { label: 'AI Processed medical records', time: '5 min ago', ok: true },
  ];
  const complianceBadges = [
    { label: 'HIPAA Grade', ok: true },
    { label: 'SOC 2', ok: true },
  ];

  // FAQ
  const faqs: { q: string; a: string }[] = [
    {
      q: 'Wat is het verschil tussen een AI Agent en een chatbot?',
      a: 'Een AI Agent werkt taakgericht en integreert met jouw systemen om werk uit handen te nemen. Een chatbot geeft vooral antwoorden; een agent voert ook acties uit.',
    },
    {
      q: 'Hoe integreren jullie met onze bestaande tools?',
      a: 'Standaard via Microsoft 365, Teams/Outlook en SharePoint. Daarnaast koppelen we met jouw CRM/ERP of API’s; SSO en role-based access worden ondersteund.',
    },
    {
      q: 'Is onze data veilig en privacy-proof?',
      a: 'Ja. Data blijft waar mogelijk binnen jouw tenant. We hanteren dataminimalisatie, logging en versleuteling in transit en at rest, conform AVG.',
    },
    {
      q: 'Welke resultaten zien klanten gemiddeld?',
      a: 'Snellere reactietijden (tot 80%), 30–40% minder tijd op repetitieve taken en hogere tevredenheid. De ROI verschilt per use-case.',
    },
    {
      q: 'Hoe snel kunnen we live?',
      a: 'Een pilot draait vaak binnen 2–4 weken: intake, koppelingen, beleid & prompts afstemmen en testen met een pilotgroep.',
    },
  ];
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Pricing
  type Billing = 'monthly' | 'yearly';
  const [billing, setBilling] = useState<Billing>('monthly');
  const discount = 0.2;

  const plans = [
    {
      key: 'eva',
      name: 'Eva — AI Kennisbank',
      icon: '🟣',
      price: 59.99,
      integration: 'vanaf €2.000 eenmalig',
      tokens: 'Tot 100.000 tokens/maand (€/0,99 per 10k extra)',
      cta: 'Kies Eva',
    },
    {
      key: 'ingrid',
      name: 'Ingrid — AI Assistent',
      icon: '🔵',
      price: 69.99,
      integration: 'vanaf €2.500 eenmalig',
      tokens: 'Tot 100.000 tokens/maand (€/0,99 per 10k extra)',
      cta: 'Kies Ingrid',
    },
    {
      key: 'mark',
      name: 'Mark — AI Marketeer',
      icon: '🟠',
      price: 149.99,
      integration: 'vanaf €5.000 eenmalig',
      tokens: 'Tot 100.000 tokens/maand (€/0,99 per 10k extra)',
      cta: 'Kies Mark',
    },
    {
      key: 'daniel',
      name: 'Daniel — AI Designer',
      icon: '🟢',
      price: 99.99,
      integration: 'vanaf €3.000 eenmalig',
      tokens: 'Tot 100.000 tokens/maand (€/0,99 per 10k extra)',
      cta: 'Kies Daniel',
    },
    {
      key: 'bundle',
      name: 'Bundel — Eva + Ingrid',
      icon: '💡',
      price: 99.99,
      integration: 'vanaf €3.500 eenmalig',
      tokens: 'Tot 100.000 tokens/maand per agent',
      cta: 'Kies Bundel',
      popular: true,
    },
  ];

  const priceLabel = (v: number) => {
    const value = billing === 'monthly' ? v : v * (1 - discount);
    return value.toFixed(2).replace('.', ',');
  };
  const suffix =
    billing === 'monthly' ? '/medewerker/maand' : '/medewerker/maand (jaar)';

  // Icon slugs voor de cloud (Simple Icons slugs)
  const iconSlugs = [
    'react',
    'nextdotjs',
    'vite',
    'typescript',
    'javascript',
    'nodejs',
    'express',
    'python',
    'fastapi',
    'django',
    'graphql',
    'prisma',
    'tailwindcss',
    'html5',
    'css3',
    'docker',
    'kubernetes',
    'nginx',
    'vercel',
    'netlify',
    'amazonaws',
    'googlecloud',
    'microsoftazure',
    'supabase',
    'postgresql',
    'mysql',
    'mongodb',
    'redis',
    'github',
    'gitlab',
    'bitbucket',
    'openai',
    'slack',
    'microsoftteams',
    'notion',
    'figma',
    'jira',
    'trello',
    'zapier',
    'airtable',
    'stripe',
    'salesforce',
    'hubspot',
  ];

  /* ============ RENDER ============ */

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 ${
        isDark ? 'bg-dark' : 'bg-white'
      }`}
    >
      {/* Floating logo on scroll */}
      <div
        className={`fixed left-8 z-50 transition-all duration-500 ${
          isScrolled ? 'top-6 opacity-100' : 'top-8 opacity-0 pointer-events-none'
        }`}
      >
        <img
          src={`/src/assets/images/logos/SOZI Agents_Logo_Typography_${
            isDark ? 'Dark' : 'Light'
          }_cut.png`}
          alt="SOZI Agents Logo"
          className="h-12 object-contain transition-all duration-500"
        />
      </div>

      <ThemeToggle />

      {/* HERO */}
      <section className="relative overflow-hidden min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-glow"></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-blue/10 rounded-full blur-3xl animate-pulse-glow"
            style={{ animationDelay: '1.5s' }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="text-center">
            <div className="mb-6 animate-scale-in stagger-1 flex justify-center">
              <img
                src={`/src/assets/images/logos/SOZI Agents_Logo_Typography_${
                  isDark ? 'Dark' : 'Light'
                }_cut.png`}
                alt="SOZI Agents"
                className="h-32 md:h-40 object-contain"
              />
            </div>

            <p
              className={`text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-in-left stagger-2 opacity-0 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Het nieuwe werken: Mens en AI, werkend als één.
            </p>

            <div className="flex flex-col gap-8 items-center animate-slide-in-right stagger-3 opacity-0">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => {
                    const s = document.querySelector('section[class*="py-32"]');
                    if (s) s.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="group relative px-8 py-4 rounded-full text-lg font-semibold transition-all duration-500 shadow-2xl overflow-hidden bg-dark text-white"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                  <span className="relative flex items-center justify-center gap-2">
                    <span className="transition-transform duration-300 group-hover:-translate-x-2">
                      Ontdek onze Service
                    </span>
                    <ArrowDown className="w-5 h-5 opacity-0 group-hover:opacity-100 -ml-7 group-hover:ml-0 transition-all duration-300" />
                  </span>
                </button>

                <button
                  onClick={scrollToAgents}
                  className="group relative px-8 py-4 rounded-full text-lg font-semibold transition-all duration-500 shadow-2xl overflow-hidden bg-dark text-white"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                  <span className="relative flex items-center justify-center gap-2">
                    <span className="transition-transform duration-300 group-hover:-translate-x-2">
                      Ontmoet onze Agents
                    </span>
                    <ArrowDown className="w-5 h-5 opacity-0 group-hover:opacity-100 -ml-7 group-hover:ml-0 transition-all duration-300" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICE */}
      <section
        ref={serviceSection.ref}
        className={`py-32 transition-all duration-700 ${
          serviceSection.isVisible ? 'opacity-100 fade-in-up' : 'opacity-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-6">
            <div
              className={`lg:col-span-2 p-12 rounded-3xl relative overflow-hidden hover-lift hover:border-accent/30 transition-all duration-500 shimmer-effect ${
                isDark
                  ? 'bg-dark-light border border-gray-border'
                  : 'bg-gray-50 border border-gray-200'
              }`}
              style={{
                boxShadow:
                  'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px',
              }}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <h2
                  className={`text-5xl md:text-6xl font-normal font-black mb-6 leading-tight ${
                    isDark ? 'text-white' : 'text-dark'
                  }`}
                >
                  Intelligente
                  <br />
                  digitale collega's
                </h2>
                <p
                  className={`text-xl leading-relaxed max-w-2xl ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Onze AI Agents zijn niet zomaar chatbots. Het zijn intelligente
                  digitale medewerkers die naadloos integreren in jouw workflow,
                  leren van jouw processen en autonoom complexe taken uitvoeren.
                </p>
              </div>
            </div>

            <div
              className={`p-12 rounded-3xl relative overflow-hidden hover-lift hover:border-accent/30 transition-all duration-500 shimmer-effect ${
                isDark
                  ? 'bg-dark-light border border-gray-border'
                  : 'bg-gray-50 border border-gray-200'
              }`}
              style={{
                boxShadow:
                  'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px',
              }}
            >
              <div className="relative z-10">
                <Sparkles
                  className={`w-12 h-12 mb-4 ${
                    isDark ? 'text-accent' : 'text-accent-blue'
                  }`}
                />
                <h3
                  className={`text-2xl font-bold font-normal mb-3 ${
                    isDark ? 'text-white' : 'text-dark'
                  }`}
                >
                  24/7 Beschikbaar
                </h3>
                <p
                  className={`${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  } text-lg`}
                >
                  Jouw agents werken dag en nacht, zonder pauzes of vakantie
                </p>
              </div>
            </div>

            <div
              className={`p-12 rounded-3xl relative overflow-hidden hover-lift hover:border-accent/30 transition-all duration-500 shimmer-effect ${
                isDark
                  ? 'bg-dark-light border border-gray-border'
                  : 'bg-gray-50 border border-gray-200'
              }`}
              style={{
                boxShadow:
                  'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px',
              }}
            >
              <div className="relative z-10">
                <Brain
                  className={`w-12 h-12 mb-4 ${
                    isDark ? 'text-accent' : 'text-accent-blue'
                  }`}
                />
                <h3
                  className={`text-2xl font-bold font-normal mb-3 ${
                    isDark ? 'text-white' : 'text-dark'
                  }`}
                >
                  Lerende systemen
                </h3>
                <p
                  className={`${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  } text-lg`}
                >
                  Continue verbetering door machine learning
                </p>
              </div>
            </div>

            <div
              className={`lg:col-span-2 p-12 rounded-3xl relative overflow-hidden hover-lift hover:border-accent/30 transition-all duration-500 shimmer-effect ${
                isDark
                  ? 'bg-dark-light border border-gray-border'
                  : 'bg-gray-50 border border-gray-200'
              }`}
              style={{
                boxShadow:
                  'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px',
              }}
            >
              <div className="relative z-10">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3
                      className={`text-3xl font-bold font-normal mb-4 ${
                        isDark ? 'text-white' : 'text-dark'
                      }`}
                    >
                      Naadloze integratie
                    </h3>
                    <p
                      className={`text-lg mb-6 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Plug-and-play met al jouw bestaande tools en workflows
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          className={`w-5 h-5 ${
                            isDark ? 'text-accent' : 'text-accent-blue'
                          }`}
                        />
                        <span
                          className={isDark ? 'text-gray-400' : 'text-gray-600'}
                        >
                          Microsoft 365
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          className={`w-5 h-5 ${
                            isDark ? 'text-accent' : 'text-accent-blue'
                          }`}
                        />
                        <span
                          className={isDark ? 'text-gray-400' : 'text-gray-600'}
                        >
                          Slack & Teams
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          className={`w-5 h-5 ${
                            isDark ? 'text-accent' : 'text-accent-blue'
                          }`}
                        />
                        <span
                          className={isDark ? 'text-gray-400' : 'text-gray-600'}
                        >
                          Custom APIs
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <MessageSquare
                      className={`w-32 h-32 ${
                        isDark ? 'text-accent/30' : 'text-accent-blue/30'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AGENTS */}
      <section
        ref={agentsSection.ref}
        id="agents-section"
        className={`py-32 transition-all duration-700 ${
          agentsSection.isVisible ? 'opacity-100 fade-in-up' : 'opacity-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2
              className={`text-5xl font-light md:text-6xl font-black mb-6 ${
                isDark ? 'text-white' : 'text-dark'
              }`}
            >
              Ontmoet jouw <span className="gradient-text font-normal">AI Team</span>
            </h2>
            <p
              className={`text-xl max-w-2xl mx-auto ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Elke agent is gespecialiseerd, intelligent en klaar om te
              transformeren hoe jouw organisatie werkt
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {agents.map((agent, index) => (
              <div
                key={agent.id}
                className={`group relative rounded-3xl p-8 transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl hover:shadow-accent/20 animate-scale-in opacity-0 ${
                  isDark
                    ? 'bg-dark-light border border-gray-border hover:border-accent/50'
                    : 'bg-white border border-gray-200 hover:border-accent-blue/50 shadow-lg hover:shadow-2xl'
                }`}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="flex items-start mb-6">
                  <div className="relative mr-4 flex-shrink-0">
                    <img
                      src={agent.image}
                      alt={agent.name}
                      className="w-24 h-24 rounded-2xl object-cover group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"
                    />
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`text-3xl tracking-wide font-normal font-black mb-1 ${
                        isDark ? 'text-white' : 'text-dark'
                      }`}
                    >
                      {agent.name}
                    </h3>
                    <p
                      className={`font-semibold text-lg ${
                        isDark ? 'text-accent' : 'text-accent-blue'
                      }`}
                    >
                      {agent.role}
                    </p>
                  </div>
                </div>

                <p
                  className={`mb-6 text-lg leading-relaxed ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {agent.description}
                </p>

                <div className="space-y-3">
                  {agent.capabilities.map((capability, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center text-base ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      <Zap
                        className={`w-4 h-4 mr-3 flex-shrink-0 ${
                          isDark ? 'text-accent' : 'text-accent-blue'
                        }`}
                      />
                      {capability}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ICON CLOUD – Integreer Jouw Tools ===== */}
      <section
        ref={toolsSection.ref}
        id="tools-cloud"
        className={`py-24 transition-all duration-700 ${
          toolsSection.isVisible ? 'opacity-100 fade-in-up' : 'opacity-0'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2
              className={`text-5xl md:text-6xl font-light ${
                isDark ? 'text-white' : 'text-dark'
              }`}
            >
              Integreer <span className="gradient-text font-normal">Jouw Tools</span>
            </h2>
            <p
              className={`mt-3 text-lg ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Werkt naadloos met je bestaande stack—van cloud tot collaboration.
            </p>
          </div>

          <div
            className={`rounded-3xl ${
              isDark ? 'bg-dark-light border-gray-border' : 'bg-white border-gray-200'
            } shadow-sm`}
          >
            <IconCloud
              iconSlugs={iconSlugs}
              themeMode={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </section>

      {/* SECURITY & COMPLIANCE */}
      <section
        ref={securitySection.ref}
        id="security-compliance"
        className={`py-32 transition-all duration-700 ${
          securitySection.isVisible ? 'opacity-100 fade-in-up' : 'opacity-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className={`text-5xl md:text-6xl font-light mb-6 ${
                isDark ? 'text-white' : 'text-dark'
              }`}
            >
              Security <span className="gradient-text font-normal">& Compliance</span>
            </h2>
            <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Compliance by design. Beveiligd, gelogd en controleerbaar.
            </p>
          </div>
          <div className="sc-grid">
            {/* Hero card */}
            <div
              className={`soft-card sc-hero ${
                isDark ? 'bg-dark-light border border-gray-border' : 'bg-white border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-6">
                <span className="badge badge-green">Save Time</span>
              </div>
              <h3
                className={`text-3xl md:text-4xl font-semibold mb-4 ${
                  isDark ? 'text-white' : 'text-dark'
                }`}
              >
                Speed Through Legal Work with Ease
              </h3>
              <p
                className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-8 max-w-xl`}
              >
                Automate reviews, enforce policy, en log elke actie. Compliance by design
                zonder frictie voor je team.
              </p>

              <div className="sc-hero-visual">
                <div className={`orbit ${isDark ? 'ring-dark' : 'ring-light'}`}>
                  <div className="orbit-dot dot-1"></div>
                  <div className="orbit-dot dot-2"></div>
                  <div className="orbit-dot dot-3"></div>
                  <div className="orbit-center"></div>
                </div>
                <div className="pill pill-floating">
                  <span className="mr-2">Today Trial Report is Ready!</span>
                  <span className="dot dot-green"></span>
                </div>
              </div>
            </div>

            {/* Data Protection */}
            <div
              className={`soft-card ${
                isDark ? 'bg-dark-light border border-gray-border' : 'bg-white border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="badge badge-blue">Data Protection</span>
              </div>
              <h4
                className={`text-2xl md:text-3xl font-semibold mb-3 ${
                  isDark ? 'text-white' : 'text-dark'
                }`}
              >
                HIPAA-grade encryption for all your data
              </h4>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                End-to-end beveiliging, van opslag tot transport. Schaalbaar en audit-proof.
              </p>

              <div className="space-y-3">
                <div className="check-row">
                  <span className="check-title">Encryption Standards</span>
                  <span className="toggle on"></span>
                </div>
                {encryptionStandards.map((it, i) => (
                  <div key={i} className="check-item">
                    <span className="check-dot"></span>
                    <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {it.label}
                    </span>
                    {it.ok && <span className="dot dot-green ml-auto"></span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance & Monitoring */}
            <div
              className={`soft-card ${
                isDark ? 'bg-dark-light border border-gray-border' : 'bg-white border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="badge badge-purple">Compliance & Monitoring</span>
              </div>
              <h4
                className={`text-2xl md:text-3xl font-semibold mb-3 ${
                  isDark ? 'text-white' : 'text-dark'
                }`}
              >
                Real-time audit trails and compliance monitoring
              </h4>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                Volledige zichtbaarheid van acties, rechten en datastromen—live.
              </p>

              <div className="space-y-3 mb-6">
                <div className="pill">
                  <span className="dot mr-2"></span>
                  <span className={`${isDark ? 'text-gray-200' : 'text-gray-700'} font-medium`}>
                    Live Activity Monitor
                  </span>
                  <span className="status-live">Live</span>
                </div>

                {activityFeed.map((a, i) => (
                  <div key={i} className="check-item">
                    <span className="check-dot"></span>
                    <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {a.label}
                    </span>
                    <span className={`ml-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      {a.time}
                    </span>
                    {a.ok && <span className="dot dot-green ml-auto"></span>}
                  </div>
                ))}
              </div>

              <div className="pill pill-ghost">
                <span className="mr-3">Compliance Status</span>
                <span className="font-semibold">Excellent</span>
                <div className="ml-auto flex items-center gap-3">
                  {complianceBadges.map((b, i) => (
                    <span key={i} className="badge badge-ghost">
                      {b.label} {b.ok && <span className="dot dot-green ml-2"></span>}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BRAND LOGOS */}
      <ClientLogosMarquee
        isDark={isDark}
        speed={25}
        logos={[
          { name: 'Capri Partners', src: 'brand-images/Capri.png', url: 'https://capri-partners.com/' },
          { name: 'De School van Transities', src: 'brand-images/De School.png', url: 'https://www.deschoolvoortransitie.nl/' },
          { name: 'DNFS', src: 'brand-images/DNFS.png', url: 'https://www.dnfs.nl' },
          { name: 'Firm C', src: 'brand-images/FirmC.png', url: 'https://www.firmc.nl/en/m' },
          { name: 'RiskSphere', src: 'brand-images/RiskSphere.png', url: 'https://risksphere.nl/' },
          { name: 'RocketSources', src: 'brand-images/Rocket Sources.png', url: 'https://rocketsourcers.nl/' },
          { name: 'Solid Professiionals', src: 'brand-images/Solid.png', url: 'https://solidprofessionals.nl/' },
          { name: 'theHup', src: 'brand-images/the Hup.png', url: 'https://www.thehup.nl' },
        ]}
      />

      {/* FAQ (onder brandnamen) */}
      <section
        ref={faqSection.ref}
        id="faq"
        className={`py-32 transition-all duration-700 ${
          faqSection.isVisible ? 'opacity-100 fade-in-up' : 'opacity-0'
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className={`text-5xl md:text-6xl font-light mb-6 ${
                isDark ? 'text-white' : 'text-dark'
              }`}
            >
              Veelgestelde <span className="gradient-text font-normal">Vragen</span>
            </h2>
            <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Alles wat je wil weten over onze AI Agents
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((item, i) => {
              const isOpen = openFaqIndex === i;
              return (
                <div
                  key={i}
                  className={`rounded-2xl border transition-all hover-lift ${
                    isDark ? 'bg-dark-light border-gray-border' : 'bg-white border-gray-200 shadow'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                  >
                    <span
                      className={`text-lg md:text-xl font-medium ${
                        isDark ? 'text-white' : 'text-dark'
                      }`}
                    >
                      {item.q}
                    </span>
                    <ArrowDown
                      className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      } ${isDark ? 'text-accent' : 'text-accent-blue'}`}
                    />
                  </button>
                  <div
                    id={`faq-panel-${i}`}
                    className="overflow-hidden px-6"
                    style={{
                      maxHeight: isOpen ? '300px' : '0px',
                      transition: 'max-height .35s ease',
                    }}
                  >
                    <div
                      className={`pb-6 pt-0 text-base leading-relaxed ${
                        isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      {item.a}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <a
              href="#contact-form"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all hover:scale-[1.02] ${
                isDark ? 'bg-accent text-dark hover:bg-accent/90' : 'bg-dark text-white hover:bg-dark/90'
              }`}
            >
              Staat je vraag er niet tussen?
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section
        ref={reviewsSection.ref}
        className={`py-32 transition-all duration-700 ${
          reviewsSection.isVisible ? 'opacity-100 fade-in-up' : 'opacity-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2
              className={`text-5xl font-normal md:text-5xl font-black mb-6 ${
                isDark ? 'text-white' : 'text-dark'
              }`}
            >
              Klanten aan het woord
            </h2>
            <p
              className={`text-xl max-w-2xl mx-auto ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Ontdek hoe organisaties hun workflow transformeren met onze AI Agents
            </p>
          </div>
          <ReviewCarousel reviews={reviews} isDark={isDark} />
        </div>
      </section>

      {/* PRICING */}
      <section
        ref={pricingSection.ref}
        id="pricing"
        className={`py-32 transition-all duration-700 ${
          pricingSection.isVisible ? 'opacity-100 fade-in-up' : 'opacity-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="badge badge-purple">Pricing</span>
          <h2
            className={`mt-4 text-5xl md:text-6xl font-light ${
              isDark ? 'text-white' : 'text-dark'
            }`}
          >
            Heldere prijzen <span className="gradient-text font-normal">voor elk team</span>
          </h2>
          <p className={`mt-3 text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Kies maandelijks of jaarlijks (20% korting op jaarbasis).
          </p>

          {/* Toggle */}
          <div className="pricing-toggle mt-6 inline-flex items-center gap-3">
            <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Maandelijks</span>
            <button
              type="button"
              className={`toggle ${billing === 'yearly' ? 'on' : ''}`}
              onClick={() => setBilling(billing === 'monthly' ? 'yearly' : 'monthly')}
              aria-label="Wissel tussen maandelijks en jaarlijks"
            />
            <span className="flex items-center gap-2">
              <span className={`${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Jaarlijks</span>
              <span className="badge badge-green">-20%</span>
            </span>
          </div>

          <div className="pricing-grid mt-14">
            {plans.map((p) => (
              <div
                key={p.key}
                className={`pricing-card ${
                  isDark ? 'pricing-card-dark' : 'pricing-card-light'
                } ${p.popular ? 'pricing-card-popular' : ''}`}
              >
                {p.popular && <div className="pricing-ribbon">Populair</div>}

                <div className="pricing-head">
                  <div className="pricing-icon text-3xl">{p.icon}</div>
                  <h3 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-dark'}`}>
                    {p.name}
                  </h3>
                </div>

                <div className="pricing-price">
                  <span className="price-smaller">€{priceLabel(p.price)}</span>
                  <span className="price-suffix">{suffix}</span>
                </div>

                <ul className="pricing-list">
                  <li>
                    <span className="check-dot"></span>
                    <span>{p.tokens}</span>
                  </li>
                  <li>
                    <span className="check-dot"></span>
                    <span>Integratiekosten: {p.integration}</span>
                  </li>
                </ul>

                <a
                  href="#contact-form"
                  className={`pricing-cta ${
                    isDark ? 'pricing-cta-dark' : 'pricing-cta-light'
                  }`}
                >
                  {p.cta} <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>

          <p className={`text-center mt-6 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Prijzen excl. btw. Jaarlijkse betaling geeft 20% korting t.o.v. maandelijkse prijzen.
          </p>
        </div>
      </section>

      {/* CONTACT */}
      <section
        ref={contactSection.ref}
        id="contact-form"
        className={`py-32 transition-all duration-700 ${
          contactSection.isVisible ? 'opacity-100 fade-in-up' : 'opacity-0'
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className={`text-5xl font-light md:text-6xl font-black mb-6 ${
                isDark ? 'text-white' : 'text-dark'
              }`}
            >
              Klaar voor de <span className="gradient-text font-normal">toekomst</span>?
            </h2>
            <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Ontdek hoe onze AI Agents jouw bedrijf kunnen transformeren
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className={`rounded-3xl p-12 hover-lift ${
              isDark ? 'bg-dark-light border border-gray-border' : 'bg-white border border-gray-200 shadow-xl'
            }`}
          >
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className={`block font-semibold mb-3 ${isDark ? 'text-white' : 'text-dark'}`}>
                  Naam
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-6 py-4 border rounded-2xl focus:outline-none focus:scale-[1.02] transition-all ${
                    isDark
                      ? 'border-gray-border bg-dark text-white placeholder-gray-500 focus:border-accent focus:shadow-lg focus:shadow-accent/20'
                      : 'border-gray-300 bg-white text-dark focus:border-accent-blue focus:shadow-lg focus:shadow-accent-blue/20'
                  }`}
                  placeholder="Jouw naam"
                  required
                />
              </div>
              <div>
                <label className={`block font-semibold mb-3 ${isDark ? 'text-white' : 'text-dark'}`}>
                  E-mail
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-6 py-4 border rounded-2xl focus:outline-none focus:scale-[1.02] transition-all ${
                    isDark
                      ? 'border-gray-border bg-dark text-white placeholder-gray-500 focus:border-accent focus:shadow-lg focus:shadow-accent/20'
                      : 'border-gray-300 bg-white text-dark focus:border-accent-blue focus:shadow-lg focus:shadow-accent-blue/20'
                  }`}
                  placeholder="voorbeeld@email.com"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className={`block font-semibold mb-3 ${isDark ? 'text-white' : 'text-dark'}`}>Bedrijf</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className={`w-full px-6 py-4 border rounded-2xl focus:outline-none focus:scale-[1.02] transition-all ${
                  isDark
                    ? 'border-gray-border bg-dark text-white placeholder-gray-500 focus:border-accent focus:shadow-lg focus:shadow-accent/20'
                    : 'border-gray-300 bg-white text-dark focus:border-accent-blue focus:shadow-lg focus:shadow-accent-blue/20'
                }`}
                placeholder="Bedrijfsnaam"
              />
            </div>

            <div className="mb-8">
              <label className={`block font-semibold mb-3 ${isDark ? 'text-white' : 'text-dark'}`}>Bericht</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={6}
                className={`w-full px-6 py-4 border rounded-2xl focus:outline-none focus:scale-[1.02] transition-all resize-none ${
                  isDark
                    ? 'border-gray-border bg-dark text-white placeholder-gray-500 focus:border-accent focus:shadow-lg focus:shadow-accent/20'
                    : 'border-gray-300 bg-white text-dark focus:border-accent-blue focus:shadow-lg focus:shadow-accent-blue/20'
                }`}
                placeholder="Waar kunnen onze agents je mee helpen?"
                required
              />
            </div>

            {submitStatus && (
              <div
                className={`mb-6 p-4 rounded-2xl animate-scale-in ${
                  submitStatus.type === 'success'
                    ? isDark
                      ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                      : 'bg-green-50 border border-green-200 text-green-700'
                    : isDark
                    ? 'bg-red-500/20 border border-red-500/50 text-red-400'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                {submitStatus.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group ${
                isDark
                  ? 'bg-accent text-dark hover:bg-accent/90 hover:shadow-accent/50'
                  : 'bg-dark text-white hover:bg-dark/90 hover:shadow-dark/50'
              }`}
            >
              {isSubmitting ? 'Versturen...' : 'Verstuur bericht'}
              {!isSubmitting && (
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              )}
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className={`py-16 ${
          isDark ? 'bg-dark-light border-t border-gray-border' : 'bg-gray-50 border-t border-gray-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="md:col-span-2">
              <div className="mb-6">
                <img
                  src={`/src/assets/images/logos/SOZI Agents_Logo_Typography_${
                    isDark ? 'Dark' : 'Light'
                  }_cut.png`}
                  alt="SOZI Agents Logo"
                  className="h-12 w-auto object-contain"
                />
              </div>
              <p
                className={`text-lg leading-relaxed max-w-md ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                De toekomst van werk. Intelligente AI Agents die transformeren hoe jouw
                organisatie werkt.
              </p>
            </div>

            <div>
              <h3 className={`font-bold text-lg mb-4 ${isDark ? 'text-white' : 'text-dark'}`}>
                Contact
              </h3>
              <ul className={`space-y-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <li className="flex items-center gap-2">
                  <Mail className={`w-5 h-5 ${isDark ? 'text-accent' : 'text-accent-blue'}`} />
                  contact@atlasagents.nl
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className={`w-5 h-5 ${isDark ? 'text-accent' : 'text-accent-blue'}`} />
                  Amsterdam, NL
                </li>
              </ul>
              <div className="flex gap-4 mt-6">
                <Linkedin
                  className={`w-6 h-6 cursor-pointer transition-all duration-300 hover:scale-125 hover:-translate-y-1 ${
                    isDark ? 'text-gray-400 hover:text-accent' : 'text-gray-600 hover:text-accent-blue'
                  }`}
                />
                <Instagram
                  className={`w-6 h-6 cursor-pointer transition-all duration-300 hover:scale-125 hover:-translate-y-1 ${
                    isDark ? 'text-gray-400 hover:text-accent' : 'text-gray-600 hover:text-accent-blue'
                  }`}
                />
              </div>
            </div>
          </div>

          <div
            className={`border-t mt-12 pt-8 text-center ${
              isDark ? 'border-gray-border text-gray-500' : 'border-gray-200 text-gray-600'
            }`}
          >
            <p>&copy; 2025 SOZI Agents. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </footer>

      <BackToTopButton />
      <ContactButton />
      <CookieBanner />
    </div>
  );
}

export default App;
