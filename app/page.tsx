'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import LeadCaptureModal from '@/components/LeadCaptureModal';
import { submitLead } from '@/app/actions/submitLead';

const MODAL_SHOWN_KEY = 'lead_modal_shown';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalShownThisSession, setModalShownThisSession] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '', email: '', phone: '', company: '', industry: '', urgency: '', goal: '', currentTools: '', wantsDemo: false,
  });
  const [contactStatus, setContactStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus('submitting');
    const result = await submitLead({
      name: contactForm.name,
      email: contactForm.email,
      phone: contactForm.phone,
      company: contactForm.company,
      industry: contactForm.industry,
      goal: contactForm.goal,
      urgency: contactForm.urgency,
      currentTools: contactForm.currentTools,
      wantsDemo: contactForm.wantsDemo,
    });
    setContactStatus(result.success ? 'success' : 'error');
  };

  useEffect(() => {
    const shown = sessionStorage.getItem(MODAL_SHOWN_KEY);
    if (shown === 'true') {
      setModalShownThisSession(true);
    }
  }, []);

  const openModal = useCallback(() => {
    if (!modalShownThisSession) {
      setIsModalOpen(true);
      setModalShownThisSession(true);
      sessionStorage.setItem(MODAL_SHOWN_KEY, 'true');
    }
  }, [modalShownThisSession]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleIntentClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    openModal();
  }, [openModal]);

  useEffect(() => {
    if (modalShownThisSession) return;
    const handleScroll = () => {
      const scrollThreshold = window.innerHeight * 0.5;
      if (window.scrollY >= scrollThreshold) {
        openModal();
        window.removeEventListener('scroll', handleScroll);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [modalShownThisSession, openModal]);

  useEffect(() => {
    if (modalShownThisSession) return;
    const timer = setTimeout(() => {
      openModal();
    }, 30000);
    return () => clearTimeout(timer);
  }, [modalShownThisSession, openModal]);

  const navLinks = [
    { name: 'Technology', href: '#technology' },
    { name: 'Solutions', href: '#solutions' },
    { name: 'Industries', href: '#industries' },
    { name: 'Proof', href: '#proof' },
  ];

  const industries = [
    {
      title: 'Real Estate',
      description: 'AI agents that qualify buyers, schedule showings, and never miss a lead.',
      link: 'https://realestatedemo.chatmaninc.com',
    },
    {
      title: 'Insurance',
      description: 'Intelligent intake, claims routing, and policy support without hold times.',
      link: 'https://insurancedemo.chatmaninc.com',
    },
    {
      title: 'Home Services',
      description: 'Contractors and service pros: capture every job request, dispatch smarter.',
      link: 'https://houstontexaspro.com',
    },
    {
      title: 'Healthcare',
      description: 'Patient scheduling, triage routing, and HIPAA-aware communication.',
      link: '#contact',
    },
    {
      title: 'Legal',
      description: 'Client intake, consultation booking, and case qualification on autopilot.',
      link: '#contact',
    },
    {
      title: 'Childcare',
      description: 'Parent inquiries, enrollment tracking, and waitlist management simplified.',
      link: '#contact',
    },
  ];

  const caseStudies = [
    {
      title: 'AIVA Connect',
      tag: 'Decision Platform',
      description: 'Voice AI with autonomous decision authority. Qualifies leads, blocks spam, routes only high-value calls to humans.',
      link: 'https://connectaiva.com',
    },
    {
      title: 'Real Estate Platform',
      tag: 'Lead Operations',
      description: 'End-to-end property platform with AI-powered routing, automated scheduling, and live data validation.',
      link: 'https://realestatedemo.chatmaninc.com',
    },
    {
      title: 'Insurance Operations',
      tag: 'Claims & Policy',
      description: 'Intelligent policy management with AI decision support and automated claims routing.',
      link: 'https://insurancedemo.chatmaninc.com',
    },
    {
      title: 'Houston Texas Pro',
      tag: 'Contractor Marketplace',
      description: 'Scalable directory with intelligent matching and automated lead distribution.',
      link: 'https://houstontexaspro.com',
    },
    {
      title: 'Security Operations',
      tag: 'Enterprise Systems',
      description: 'Operational systems for safety, compliance, and service delivery across enterprise clients.',
      link: 'https://securitydemo.chatmaninc.com',
    },
    {
      title: '30 Day Faith',
      tag: 'Digital Fulfillment',
      description: 'Go-to-market strategy with automated fulfillment and conversion-optimized funnels.',
      link: 'https://30dayfaith.chatmaninc.com',
    },
  ];

  const processSteps = [
    {
      number: '01',
      title: 'Audit',
      description: 'Map your decision points, bottlenecks, and missed revenue opportunities',
    },
    {
      number: '02',
      title: 'Architect',
      description: 'Design AI systems with decision authority, validation layers, and compliance',
    },
    {
      number: '03',
      title: 'Deploy',
      description: 'Build and launch production-grade systems with monitoring and audit trails',
    },
    {
      number: '04',
      title: 'Optimize',
      description: 'Continuous refinement based on real operational data and outcomes',
    },
  ];

  return (
    <div className="min-h-screen bg-dark tessellation-bg">
      <LeadCaptureModal isOpen={isModalOpen} onClose={closeModal} />

      {/* Header — Frosted Glass */}
      <header className="fixed top-0 left-0 right-0 z-50 glass bg-dark/70 border-b border-border">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-4">
          <div className="flex items-center justify-between">
            <a href="#" className="flex items-center gap-3">
              <TessaraLogo />
              <span className="text-text-primary text-lg tracking-tight">
                <span className="font-bold">Tessara</span>{' '}
                <span className="font-normal text-text-secondary">Systems</span>
              </span>
            </a>

            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm text-text-secondary hover:text-accent transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <a
                href="#industries"
                className="px-4 py-2 text-sm border border-accent/30 text-accent hover:bg-accent/10 transition-colors rounded-lg"
              >
                View Industry Demos
              </a>
              <button
                onClick={handleIntentClick}
                className="px-4 py-2 text-sm bg-accent text-dark font-medium hover:bg-accent-bright transition-colors rounded-lg"
              >
                Request Audit
              </button>
            </div>

            <button
              className="md:hidden text-text-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 border-t border-border pt-4">
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-text-secondary hover:text-accent transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                ))}
                <button
                  onClick={handleIntentClick}
                  className="px-4 py-2 bg-accent text-dark font-medium rounded-lg text-center"
                >
                  Request Audit
                </button>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* ========== HERO ========== */}
      <section className="pt-36 pb-28 px-6 md:px-12 relative hero-glow">
        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full border border-accent/20 mb-8 reveal">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
              <span className="text-xs text-accent uppercase tracking-widest">Patent-Pending Architecture</span>
            </div>

            <h1 className="text-[clamp(2.5rem,6.5vw,5rem)] font-serif leading-[1.1] mb-6 text-text-primary tracking-tight reveal">
              AI that decides who<br />deserves your <span className="text-accent italic">attention</span>.
            </h1>

            <p className="text-lg text-text-secondary mb-4 max-w-2xl leading-relaxed reveal">
              We architect decision-grade AI systems for calls, workflows, and operations. Not chatbots. Not demos. Production systems that decide, act, and orchestrate.
            </p>

            <p className="text-sm text-accent/80 italic mb-8 max-w-xl reveal">
              Missed calls recovered. Qualified leads routed. Compliance maintained. Every interaction captured with confidence-verified data.
            </p>

            <div className="flex flex-wrap gap-4 mb-12 reveal">
              <button
                onClick={handleIntentClick}
                className="px-6 py-3 bg-accent text-dark font-medium hover:bg-accent-bright transition-colors rounded-lg"
              >
                Request Systems Audit &rarr;
              </button>
              <a
                href="#industries"
                className="px-6 py-3 border border-border-accent text-text-primary hover:border-accent/50 transition-colors rounded-lg"
              >
                View Industry Demos
              </a>
            </div>

            {/* Metrics row */}
            <div className="flex flex-wrap gap-8 pt-8 border-t border-border reveal">
              {[
                { value: '24/7', label: 'Autonomous Coverage' },
                { value: '100%', label: 'Audit Trail' },
                { value: 'Live', label: 'Validation Layer' },
                { value: '3', label: 'Patents Pending' },
              ].map((m, i) => (
                <div key={i}>
                  <p className="text-xl font-semibold text-text-primary">{m.value}</p>
                  <p className="text-xs text-text-muted uppercase tracking-wide">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="section-line" />

      {/* ========== FOUR PILLARS ========== */}
      <section className="py-28 px-6 md:px-12 bg-dark-light">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16 reveal">
            <span className="text-xs text-accent uppercase tracking-[0.12em] mb-4 block">The Four Pillars</span>
            <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-serif text-text-primary mb-4">
              Built on four foundational systems
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
              Tessara means four. Every solution we build stands on these pillars.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ),
                title: 'SaaS',
                description: 'Cloud-native platforms that scale. CRM, dashboards, portals, and operational tools delivered as managed software.',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
                title: 'AI',
                description: 'Decision-grade intelligence. Voice agents, workflow automation, and autonomous systems with patent-pending architecture.',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" />
                  </svg>
                ),
                title: 'IoT / Edge',
                description: 'Real-time signals from the physical world. Sensors, edge computing, and device orchestration bridging digital to physical.',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: 'Security & Compliance',
                description: 'Trust built in, not bolted on. Audit trails, access control, regulatory compliance, and enterprise-grade data protection.',
              },
            ].map((pillar, i) => (
              <div
                key={i}
                className="card-hover bg-dark-card p-8 rounded-xl border border-border hover:border-accent/30 transition-all group reveal"
              >
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-6 text-accent group-hover:bg-accent/20 transition-colors">
                  {pillar.icon}
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-3 group-hover:text-accent transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="section-line" />

      {/* ========== CORE IP / TECHNOLOGY ========== */}
      <section id="technology" className="py-28 px-6 md:px-12 bg-dark relative">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16 reveal">
            <span className="text-xs text-accent uppercase tracking-[0.12em] mb-4 block">Core IP</span>
            <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-serif mb-4 text-text-primary">
              Patent-pending intelligence architecture
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
              Three foundational innovations that power decision-grade AI systems.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Decision Authority Layer',
                description: 'AI is granted autonomous authority to determine whether a human is engaged. Not "AI answers calls" — AI decides who deserves human attention.',
                footnote: 'Including authority to permanently withhold escalation.',
              },
              {
                title: 'Conversational Validation Layer',
                description: 'Real-time extraction with conversational confirmation and field-level confidence scoring before data persistence.',
                footnote: 'Confirm before saving. Confidence-gated persistence.',
              },
              {
                title: 'Vertical Agent Framework',
                description: 'Modular agent framework that dynamically loads industry-specific compliance, vocabulary, workflows, and decision thresholds at runtime.',
                footnote: 'One core architecture. Many industries. Runtime switching.',
              },
            ].map((card, i) => (
              <div
                key={i}
                className="card-hover bg-dark-card p-8 rounded-xl border border-border group reveal"
              >
                <div className="flex items-center gap-2 mb-6">
                  <span className="px-3 py-1 text-xs bg-accent/10 text-accent border border-accent/20 rounded-full">
                    Patent Pending
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-3 group-hover:text-accent transition-colors">
                  {card.title}
                </h3>
                <p className="text-text-secondary text-sm mb-4 leading-relaxed">
                  {card.description}
                </p>
                <p className="text-xs text-accent/70 italic">
                  {card.footnote}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center reveal">
            <p className="text-sm text-text-muted">
              Three U.S. Utility Provisional Patents filed. Foundation for a continuation patent family.
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="section-line" />

      {/* ========== CAPABILITIES / SOLUTIONS ========== */}
      <section id="solutions" className="py-28 px-6 md:px-12 bg-dark-light">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16 reveal">
            <span className="text-xs text-accent uppercase tracking-[0.12em] mb-4 block">Capabilities</span>
            <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-serif mb-4 text-text-primary">
              What We Build
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
              Architecture + Implementation. Systems that decide, act, and orchestrate.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                ),
                title: 'AI Voice Agents',
                description: 'Conversational AI with decision authority. Inbound reception, lead qualification, appointment booking, and autonomous call handling.',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                title: 'Automation & Orchestration',
                description: 'Workflow automation, ticketing systems, CRM integration, and multi-channel orchestration.',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                ),
                title: 'Data Systems',
                description: 'Database architecture, real-time dashboards, lead capture, and analytics with full audit trails.',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                ),
                title: 'Custom Software',
                description: 'Full-stack applications, internal tools, client portals, and production-grade systems.',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ),
                title: 'AI Operations Design',
                description: 'Decision authority mapping, escalation policies, monitoring dashboards, and human-AI handoff protocols.',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                ),
                title: 'Enterprise Integration',
                description: 'CRM, calendar, phone, payment, and custom API integrations for seamless operational connectivity.',
              },
            ].map((s, i) => (
              <div
                key={i}
                className="card-hover bg-dark-card p-8 rounded-xl border border-border group reveal"
              >
                <div className="text-accent mb-4 group-hover:text-accent-bright transition-colors">
                  {s.icon}
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-3 group-hover:text-accent transition-colors">
                  {s.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="section-line" />

      {/* ========== INDUSTRIES / VERTICALS ========== */}
      <section id="industries" className="py-28 px-6 md:px-12 bg-dark">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16 reveal">
            <span className="text-xs text-accent uppercase tracking-[0.12em] mb-4 block">Verticals</span>
            <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-serif mb-4 text-text-primary">
              Industries We Serve
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
              Vertical-specific AI agents with industry compliance, vocabulary, and workflows built in.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((industry, index) => (
              <a
                key={index}
                href={industry.link}
                target={industry.link.startsWith('http') ? '_blank' : undefined}
                rel={industry.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="card-hover bg-dark-card p-6 rounded-xl border border-border group block reveal"
              >
                <h3 className="text-xl font-semibold text-text-primary mb-3 group-hover:text-accent transition-colors">
                  {industry.title}
                </h3>
                <p className="text-text-secondary text-sm mb-4 leading-relaxed">{industry.description}</p>
                <span className="inline-flex items-center gap-2 text-sm text-accent">
                  {industry.link.startsWith('http') ? 'View Live Demo' : 'Contact Us'}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="section-line" />

      {/* ========== PROOF / PORTFOLIO ========== */}
      <section id="proof" className="py-28 px-6 md:px-12 bg-dark-light">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16 reveal">
            <span className="text-xs text-accent uppercase tracking-[0.12em] mb-4 block">Portfolio</span>
            <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-serif mb-4 text-text-primary">
              Proof of Execution
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
              Real systems. Real results. Production-grade architecture.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {caseStudies.map((study, index) => (
              <div
                key={index}
                className="card-hover bg-dark-card p-6 rounded-xl border border-border group reveal"
              >
                <span className="inline-block px-3 py-1 text-xs bg-accent/10 text-accent border border-accent/20 rounded-full mb-4">
                  {study.tag}
                </span>
                <h3 className="text-xl font-semibold text-text-primary mb-3 group-hover:text-accent transition-colors">
                  {study.title}
                </h3>
                <p className="text-text-secondary text-sm mb-4 leading-relaxed">{study.description}</p>
                <a
                  href={study.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent-bright transition-colors"
                >
                  Explore System
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="section-line" />

      {/* ========== LEADERSHIP ========== */}
      <section className="py-28 px-6 md:px-12 bg-dark">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16 reveal">
            <span className="text-xs text-accent uppercase tracking-[0.12em] mb-4 block">Leadership</span>
            <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-serif text-text-primary">
              The Team Behind Tessara
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Howard */}
            <div className="bg-dark-card p-8 md:p-10 rounded-xl border border-border reveal">
              <div className="flex flex-col gap-6">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl flex-shrink-0 overflow-hidden">
                  <img src="/howard_photo.png" alt="Howard Leon Chatman III" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-2xl font-serif text-text-primary mb-1">Howard Leon Chatman III</h3>
                  <p className="text-accent text-sm mb-4">Founder & Chief Architect</p>
                  <p className="text-text-secondary text-sm mb-6 leading-relaxed">
                    Builder of operational systems — production AI that runs businesses, not prototypes.
                  </p>
                  <div className="space-y-3 text-sm text-text-secondary">
                    <div className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></span>
                      <span>Built and operated Chatman Security & Fire since 2009 — a million-dollar fire and security company</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></span>
                      <span>Enterprise experience: Walmart, H-E-B, Dillard&apos;s, ADT, Protection One, Stanley Security</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></span>
                      <span>Three U.S. utility patents pending for AIVA Connect architecture</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ecko */}
            <div className="bg-dark-card p-8 md:p-10 rounded-xl border border-border reveal">
              <div className="flex flex-col gap-6">
                <div className="w-24 h-24 bg-accent/10 rounded-xl flex-shrink-0 flex items-center justify-center">
                  <span className="text-3xl font-serif text-accent">ES</span>
                </div>
                <div>
                  <h3 className="text-2xl font-serif text-text-primary mb-1">Ecko Steadman</h3>
                  <p className="text-accent text-sm mb-4">Co-Founder & Head of Product Growth & Human Experience</p>
                  <p className="text-text-secondary text-sm mb-6 leading-relaxed">
                    Co-architect of the AI product suite — shaping agent behavior, conversation design, and client-facing automation.
                  </p>
                  <div className="space-y-3 text-sm text-text-secondary">
                    <div className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></span>
                      <span>Leads GTM strategy, sales narrative, and pricing frameworks across real estate, insurance, and service industries</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></span>
                      <span>Background in behavioral strategy and systems design — applied to product adoption and retention engineering</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="section-line" />

      {/* ========== PROCESS ========== */}
      <section className="py-28 px-6 md:px-12 bg-dark-light relative">
        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="text-center mb-16 reveal">
            <span className="text-xs text-accent uppercase tracking-[0.12em] mb-4 block">Process</span>
            <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-serif mb-4 text-text-primary">
              How We Work
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
              Architecture first. Implementation second. Results always.
            </p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-accent/10 via-accent/30 to-accent/10"></div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {processSteps.map((step, index) => (
                <div
                  key={index}
                  className="bg-dark-card p-6 rounded-xl border border-border text-center relative card-hover reveal"
                >
                  <div className="hidden lg:block absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-dark-card border-2 border-accent/50 rounded-full"></div>
                  <div className="text-4xl font-serif text-accent mb-4">{step.number}</div>
                  <h3 className="text-xl font-semibold text-text-primary mb-3">{step.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="section-line" />

      {/* ========== CONTACT — Two-column ========== */}
      <section id="contact" className="py-28 px-6 md:px-12 bg-dark relative dot-grid">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16 reveal">
            <span className="text-xs text-accent uppercase tracking-[0.12em] mb-4 block">Get Started</span>
            <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-serif mb-4 text-text-primary">
              Start Your Systems Audit
            </h2>
            <p className="text-text-secondary text-lg">
              Let&apos;s map your decision points and identify where AI creates leverage.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8 reveal">
            {/* Form — 3 cols */}
            <div className="lg:col-span-3 bg-dark-card p-8 md:p-10 rounded-xl border border-border">
              {contactStatus === 'success' ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-serif text-text-primary mb-3">Request Received</h3>
                  <p className="text-text-secondary">
                    We&apos;ll review your submission and reach out within 24-48 hours to discuss your systems audit.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="contact-name" className="block text-sm text-text-muted mb-2">Name *</label>
                      <input type="text" id="contact-name" required value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))} disabled={contactStatus === 'submitting'} className="w-full px-4 py-3 bg-dark border border-border rounded-lg text-text-primary focus:border-accent focus:outline-none transition-colors disabled:opacity-50" placeholder="Your name" />
                    </div>
                    <div>
                      <label htmlFor="contact-company" className="block text-sm text-text-muted mb-2">Company *</label>
                      <input type="text" id="contact-company" required value={contactForm.company} onChange={e => setContactForm(f => ({ ...f, company: e.target.value }))} disabled={contactStatus === 'submitting'} className="w-full px-4 py-3 bg-dark border border-border rounded-lg text-text-primary focus:border-accent focus:outline-none transition-colors disabled:opacity-50" placeholder="Your company" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="contact-email" className="block text-sm text-text-muted mb-2">Email *</label>
                      <input type="email" id="contact-email" required value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} disabled={contactStatus === 'submitting'} className="w-full px-4 py-3 bg-dark border border-border rounded-lg text-text-primary focus:border-accent focus:outline-none transition-colors disabled:opacity-50" placeholder="you@company.com" />
                    </div>
                    <div>
                      <label htmlFor="contact-phone" className="block text-sm text-text-muted mb-2">Phone *</label>
                      <input type="tel" id="contact-phone" required value={contactForm.phone} onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))} disabled={contactStatus === 'submitting'} className="w-full px-4 py-3 bg-dark border border-border rounded-lg text-text-primary focus:border-accent focus:outline-none transition-colors disabled:opacity-50" placeholder="(555) 123-4567" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="contact-industry" className="block text-sm text-text-muted mb-2">Industry *</label>
                      <select id="contact-industry" required value={contactForm.industry} onChange={e => setContactForm(f => ({ ...f, industry: e.target.value }))} disabled={contactStatus === 'submitting'} className="w-full px-4 py-3 bg-dark border border-border rounded-lg text-text-primary focus:border-accent focus:outline-none transition-colors disabled:opacity-50">
                        <option value="">Select industry</option>
                        <option value="Real Estate">Real Estate</option>
                        <option value="Insurance">Insurance</option>
                        <option value="Home Services">Home Services / Contractors</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Legal">Legal</option>
                        <option value="Childcare">Childcare / Education</option>
                        <option value="Financial Services">Financial Services</option>
                        <option value="Technology">Technology</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="contact-urgency" className="block text-sm text-text-muted mb-2">Timeline</label>
                      <select id="contact-urgency" value={contactForm.urgency} onChange={e => setContactForm(f => ({ ...f, urgency: e.target.value }))} disabled={contactStatus === 'submitting'} className="w-full px-4 py-3 bg-dark border border-border rounded-lg text-text-primary focus:border-accent focus:outline-none transition-colors disabled:opacity-50">
                        <option value="">Select timeline</option>
                        <option value="immediate">Immediate (this month)</option>
                        <option value="quarter">This quarter</option>
                        <option value="planning">Planning phase</option>
                        <option value="exploring">Just exploring</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-goal" className="block text-sm text-text-muted mb-2">Primary Goal *</label>
                    <select id="contact-goal" required value={contactForm.goal} onChange={e => setContactForm(f => ({ ...f, goal: e.target.value }))} disabled={contactStatus === 'submitting'} className="w-full px-4 py-3 bg-dark border border-border rounded-lg text-text-primary focus:border-accent focus:outline-none transition-colors disabled:opacity-50">
                      <option value="">What&apos;s your primary goal?</option>
                      <option value="qualify_leads">Qualify leads automatically</option>
                      <option value="reduce_missed_calls">Reduce missed calls</option>
                      <option value="automate_scheduling">Automate scheduling</option>
                      <option value="automate_intake">Automate intake / onboarding</option>
                      <option value="workflow_automation">Workflow automation</option>
                      <option value="custom_system">Custom AI system</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contact-tools" className="block text-sm text-text-muted mb-2">Current Tools (optional)</label>
                    <input type="text" id="contact-tools" value={contactForm.currentTools} onChange={e => setContactForm(f => ({ ...f, currentTools: e.target.value }))} disabled={contactStatus === 'submitting'} className="w-full px-4 py-3 bg-dark border border-border rounded-lg text-text-primary focus:border-accent focus:outline-none transition-colors disabled:opacity-50" placeholder="CRM, phone system, scheduling software..." />
                  </div>

                  <div className="flex items-start gap-3">
                    <input type="checkbox" id="contact-demo" checked={contactForm.wantsDemo} onChange={e => setContactForm(f => ({ ...f, wantsDemo: e.target.checked }))} disabled={contactStatus === 'submitting'} className="w-5 h-5 mt-0.5 bg-dark border border-border rounded text-accent focus:ring-accent disabled:opacity-50" />
                    <label htmlFor="contact-demo" className="text-sm text-text-secondary">
                      I want a demo of AIVA Connect or an industry-specific agent
                    </label>
                  </div>

                  {contactStatus === 'error' && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-red-400 text-sm">Something went wrong. Please try again.</p>
                    </div>
                  )}

                  <button type="submit" disabled={contactStatus === 'submitting'} className="w-full px-8 py-4 bg-accent text-dark font-medium rounded-lg hover:bg-accent-bright transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {contactStatus === 'submitting' ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      'Request Systems Audit \u2192'
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Right side info — 2 cols */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-dark-card p-8 rounded-xl border border-border">
                <h3 className="text-xl font-serif text-text-primary mb-4">Why Tessara?</h3>
                <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
                  <p>
                    Most AI companies sell demos. We deploy decision-grade systems that run your operations — with patent-pending architecture and full audit trails.
                  </p>
                  <p>
                    Our four pillars — <span className="text-accent">SaaS, AI, IoT/Edge, and Security</span> — mean we build the complete stack, not just a piece.
                  </p>
                  <p>
                    From discovery call to production deployment in weeks, not months.
                  </p>
                </div>
              </div>

              <div className="bg-dark-card p-8 rounded-xl border border-border">
                <h3 className="text-xl font-serif text-text-primary mb-4">Contact</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a href="mailto:howard@tessarasystems.com" className="text-accent hover:text-accent-bright transition-colors">
                      howard@tessarasystems.com
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-text-secondary">Houston, Texas</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <a href="https://connectaiva.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-bright transition-colors">
                      connectaiva.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="py-12 px-6 md:px-12 bg-dark border-t border-border">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <a href="#" className="flex items-center gap-3">
              <TessaraLogo />
              <span className="text-text-primary text-lg tracking-tight">
                <span className="font-bold">Tessara</span>{' '}
                <span className="font-normal text-text-secondary">Systems</span>
              </span>
            </a>
            <div className="text-sm text-text-muted text-center md:text-right">
              <p>&copy; 2026 Tessara Systems. All rights reserved.</p>
              <p className="mt-1">
                <a href="mailto:support@tessarasystems.com" className="hover:text-accent transition-colors">
                  support@tessarasystems.com
                </a>
                <span className="mx-2">|</span>
                <Link href="/admin" className="hover:text-accent transition-colors">
                  Admin Portal
                </Link>
              </p>
              <p className="mt-2 text-xs text-text-muted/70">
                Patent-pending AI systems architecture
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Hexagonal Tessara logo SVG
function TessaraLogo() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer hexagon */}
      <path d="M18 2L32 10V26L18 34L4 26V10L18 2Z" stroke="#4fd1c5" strokeWidth="1.5" fill="none" />
      {/* Inner tessellation lines */}
      <path d="M18 2L18 34" stroke="#4fd1c5" strokeWidth="0.75" opacity="0.5" />
      <path d="M4 10L32 26" stroke="#4fd1c5" strokeWidth="0.75" opacity="0.5" />
      <path d="M32 10L4 26" stroke="#4fd1c5" strokeWidth="0.75" opacity="0.5" />
      {/* Center diamond */}
      <path d="M18 12L24 18L18 24L12 18Z" fill="#4fd1c5" opacity="0.15" />
      <path d="M18 12L24 18L18 24L12 18Z" stroke="#4fd1c5" strokeWidth="0.75" />
    </svg>
  );
}
