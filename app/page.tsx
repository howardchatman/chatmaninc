'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import LeadCaptureModal from '@/components/LeadCaptureModal';

const MODAL_SHOWN_KEY = 'lead_modal_shown';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalShownThisSession, setModalShownThisSession] = useState(false);

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
    { name: 'Contact', href: '#contact' },
  ];

  const aiStackFeatures = [
    { name: 'Decision Authority', status: 'AI Decides', color: 'bg-gold' },
    { name: 'Escalation Control', status: 'Filter', color: 'bg-gold' },
    { name: 'Live Validation', status: 'Confirm', color: 'bg-gold' },
    { name: 'Data Persistence', status: 'Verified', color: 'bg-gold' },
    { name: 'Audit Trail', status: 'Complete', color: 'bg-gold' },
  ];

  const tags = ['Decision Systems', 'Voice AI', 'Workflow Automation', 'Enterprise Integration'];

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
    <div className="min-h-screen bg-dark">
      <LeadCaptureModal isOpen={isModalOpen} onClose={closeModal} />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-md border-b border-gray-dark/30">
        <div className="max-w-7xl mx-auto px-6 py-2">
          <div className="flex items-center justify-between">
            <a href="#" className="flex items-center gap-3">
              <img src="/logo.png" alt="Chatman Inc" className="h-28 w-auto" />
            </a>

            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm text-gray-muted hover:text-white transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <a
                href="#industries"
                className="px-4 py-2 text-sm border border-gold text-gold hover:bg-gold hover:text-dark transition-colors rounded-sm"
              >
                See Industry Demos
              </a>
              <button
                onClick={handleIntentClick}
                className="px-4 py-2 text-sm bg-gold text-dark font-medium hover:bg-gold-light transition-colors rounded-sm"
              >
                Request a Demo
              </button>
            </div>

            <button
              className="md:hidden text-white"
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
            <nav className="md:hidden mt-4 pb-4 border-t border-gray-dark/30 pt-4">
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-gray-muted hover:text-white transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                ))}
                <button
                  onClick={handleIntentClick}
                  className="px-4 py-2 bg-gold text-dark font-medium rounded-sm text-center"
                >
                  Request a Demo
                </button>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* HERO SECTION - Decision Authority Narrative */}
      <section className="pt-40 pb-20 px-6 relative hero-grid">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/10 to-transparent"></div>
          <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/10 to-transparent"></div>
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-gold/10 to-transparent"></div>
          <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-gold/10 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-dark-light rounded-full border border-gold/30 mb-8">
                <span className="w-2 h-2 bg-gold rounded-full animate-pulse"></span>
                <span className="text-sm text-gold">Patent-Pending AI Architecture</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-tight mb-6">
                AI that decides who<br />deserves your <span className="text-gold italic">attention</span>.
              </h1>

              <p className="text-lg text-gray-muted mb-4 max-w-xl">
                We architect decision-grade AI systems for calls, workflows, and operations. Not chatbots. Not demos. Production systems that decide, act, and orchestrate.
              </p>

              <p className="text-sm text-gold italic mb-8 max-w-xl">
                Missed calls recovered. Qualified leads routed. Compliance maintained. Every interaction captured with confidence-verified data.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <button
                  onClick={handleIntentClick}
                  className="px-6 py-3 bg-gold text-dark font-medium hover:bg-gold-light transition-colors rounded-sm"
                >
                  Request a Demo
                </button>
                <a
                  href="#industries"
                  className="px-6 py-3 border border-gray-dark/50 text-white hover:border-gold transition-colors rounded-sm"
                >
                  See Industry Demos
                </a>
              </div>

              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-sm bg-dark-light border border-gray-dark/30 text-gray-muted rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-dark-card border border-gray-dark/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-gray-muted uppercase tracking-wider">Live Preview</p>
                  <p className="text-lg font-semibold text-white">Autonomous Decision Stack</p>
                </div>
                <span className="px-3 py-1 text-xs bg-gold/20 text-gold border border-gold/30 rounded-full">
                  Patent Pending
                </span>
              </div>

              <div className="space-y-3 mb-6">
                {aiStackFeatures.map((feature) => (
                  <div
                    key={feature.name}
                    className="flex items-center justify-between p-3 bg-dark-light border border-gray-dark/20 rounded-sm"
                  >
                    <span className="text-gray">{feature.name}</span>
                    <span className={`px-3 py-1 text-xs ${feature.color} text-dark rounded-sm font-medium`}>
                      {feature.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-dark-light p-4 rounded-sm mb-6 border border-gold/20">
                <p className="text-xs text-gold uppercase tracking-wider mb-2">Core Principle</p>
                <p className="text-sm text-white italic">
                  &quot;AI doesn&apos;t just answer calls — it has authority to decide who reaches you.&quot;
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={handleIntentClick}
                  className="px-4 py-3 bg-gold text-dark font-medium text-center rounded-sm hover:bg-gold-light transition-colors"
                >
                  Book Systems Audit
                </button>
                <a
                  href="https://connectaiva.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 border border-gray-dark/30 text-white text-center rounded-sm hover:border-gold transition-colors"
                >
                  View AIVA
                </a>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-dark/20">
                <div className="text-center">
                  <p className="text-xl font-semibold text-white">24/7</p>
                  <p className="text-xs text-gray-muted">Coverage</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-semibold text-white">100%</p>
                  <p className="text-xs text-gray-muted">Audit Trail</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-semibold text-white">Live</p>
                  <p className="text-xs text-gray-muted">Validation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="relative h-16 bg-dark">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-px h-full bg-gradient-to-b from-gold/30 to-transparent"></div>
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-2 h-2 bg-gold/50 rounded-full"></div>
      </div>

      {/* OUR CORE IP APPROACH */}
      <section id="technology" className="py-20 px-6 bg-dark-light relative dot-grid">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-xs bg-gold/20 text-gold border border-gold/30 rounded-full mb-4">
              Patent-Pending Technology
            </span>
            <h2 className="text-3xl md:text-5xl font-serif mb-4 text-white">
              Our Core IP Approach
            </h2>
            <p className="text-gray-muted text-lg max-w-2xl mx-auto">
              Three foundational innovations that power decision-grade AI systems.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-dark p-8 rounded-lg border border-gray-dark/30 hover:border-gold/50 transition-all group">
              <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-gold transition-colors">
                Decision Authority Layer
              </h3>
              <p className="text-gray-muted text-sm mb-4">
                AI is granted autonomous authority to determine whether a human is engaged. Not &quot;AI answers calls&quot; — AI decides who deserves human attention.
              </p>
              <p className="text-xs text-gold italic">
                Including authority to permanently withhold escalation.
              </p>
            </div>

            <div className="bg-dark p-8 rounded-lg border border-gray-dark/30 hover:border-gold/50 transition-all group">
              <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-gold transition-colors">
                Conversational Validation Layer
              </h3>
              <p className="text-gray-muted text-sm mb-4">
                Real-time extraction with conversational confirmation and field-level confidence scoring before data persistence.
              </p>
              <p className="text-xs text-gold italic">
                Confirm before saving. Confidence-gated persistence.
              </p>
            </div>

            <div className="bg-dark p-8 rounded-lg border border-gray-dark/30 hover:border-gold/50 transition-all group">
              <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-gold transition-colors">
                Vertical Agent Framework
              </h3>
              <p className="text-gray-muted text-sm mb-4">
                Modular agent framework that dynamically loads industry-specific compliance, vocabulary, workflows, and decision thresholds at runtime.
              </p>
              <p className="text-xs text-gold italic">
                One core architecture. Many industries. Runtime switching.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-gray-muted">
              Three U.S. Utility Provisional Patents filed. Foundation for a continuation patent family.
            </p>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="relative h-16 bg-dark-light">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-px h-full bg-gradient-to-b from-gold/30 to-transparent"></div>
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-2 h-2 bg-gold/50 rounded-full"></div>
      </div>

      {/* WHAT WE BUILD */}
      <section id="solutions" className="py-20 px-6 bg-dark">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif mb-4 text-white">
              What We Build
            </h2>
            <p className="text-gray-muted text-lg max-w-2xl mx-auto">
              Architecture + Implementation. Systems that decide, act, and orchestrate.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-dark-card p-6 rounded-lg border border-gray-dark/30 hover:border-gold/50 transition-all group">
              <div className="text-gold mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-gold transition-colors">
                AI Voice Agents
              </h3>
              <p className="text-gray-muted text-sm">
                Conversational AI with decision authority. Inbound reception, lead qualification, appointment booking.
              </p>
            </div>

            <div className="bg-dark-card p-6 rounded-lg border border-gray-dark/30 hover:border-gold/50 transition-all group">
              <div className="text-gold mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-gold transition-colors">
                Automation + Orchestration
              </h3>
              <p className="text-gray-muted text-sm">
                Workflow automation, ticketing systems, CRM integration, and multi-channel orchestration.
              </p>
            </div>

            <div className="bg-dark-card p-6 rounded-lg border border-gray-dark/30 hover:border-gold/50 transition-all group">
              <div className="text-gold mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-gold transition-colors">
                Data Systems
              </h3>
              <p className="text-gray-muted text-sm">
                Database architecture, real-time dashboards, lead capture, and analytics with audit trails.
              </p>
            </div>

            <div className="bg-dark-card p-6 rounded-lg border border-gray-dark/30 hover:border-gold/50 transition-all group">
              <div className="text-gold mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-gold transition-colors">
                Custom Software
              </h3>
              <p className="text-gray-muted text-sm">
                Full-stack applications, internal tools, client portals, and production-grade systems.
              </p>
            </div>
          </div>

          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <div className="bg-dark-card p-8 rounded-lg border border-gold/30">
              <h4 className="text-lg font-semibold text-gold mb-4">AI Operations Design</h4>
              <ul className="space-y-3 text-gray-muted text-sm">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-gold rounded-full mt-2"></span>
                  <span>Decision authority mapping and escalation policies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-gold rounded-full mt-2"></span>
                  <span>Monitoring dashboards and real-time alerting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-gold rounded-full mt-2"></span>
                  <span>Audit logs and compliance documentation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-gold rounded-full mt-2"></span>
                  <span>Human-AI handoff protocols</span>
                </li>
              </ul>
            </div>

            <div className="bg-dark-card p-8 rounded-lg border border-gray-dark/30">
              <h4 className="text-lg font-semibold text-white mb-4">Enterprise Integration</h4>
              <ul className="space-y-3 text-gray-muted text-sm">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-muted rounded-full mt-2"></span>
                  <span>CRM systems (Salesforce, HubSpot, custom)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-muted rounded-full mt-2"></span>
                  <span>Calendar and scheduling platforms</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-muted rounded-full mt-2"></span>
                  <span>Phone systems and VoIP providers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-muted rounded-full mt-2"></span>
                  <span>Payment processors and billing systems</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="relative h-16 bg-dark">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-px h-full bg-gradient-to-b from-gold/30 to-transparent"></div>
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-2 h-2 bg-gold/50 rounded-full"></div>
      </div>

      {/* INDUSTRIES */}
      <section id="industries" className="py-20 px-6 bg-dark-light">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif mb-4 text-white">
              Industries We Serve
            </h2>
            <p className="text-gray-muted text-lg max-w-2xl mx-auto">
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
                className="bg-dark p-6 rounded-lg border border-gray-dark/30 hover:border-gold/50 transition-all group block"
              >
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-gold transition-colors">
                  {industry.title}
                </h3>
                <p className="text-gray-muted text-sm mb-4">{industry.description}</p>
                <span className="inline-flex items-center gap-2 text-sm text-gold">
                  {industry.link.startsWith('http') ? 'View Demo' : 'Contact Us'}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="relative h-16 bg-dark-light">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-px h-full bg-gradient-to-b from-gold/30 to-transparent"></div>
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-2 h-2 bg-gold/50 rounded-full"></div>
      </div>

      {/* PROOF / CASE STUDIES */}
      <section id="proof" className="py-20 px-6 bg-dark">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif mb-4 text-white">
              Proof of Execution
            </h2>
            <p className="text-gray-muted text-lg max-w-2xl mx-auto">
              Real systems. Real results. Production-grade architecture.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {caseStudies.map((study, index) => (
              <div
                key={index}
                className="bg-dark-card p-6 rounded-lg border border-gray-dark/30 hover:border-gold/50 transition-all group"
              >
                <span className="inline-block px-2 py-1 text-xs bg-gold/20 text-gold rounded mb-4">
                  {study.tag}
                </span>
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-gold transition-colors">
                  {study.title}
                </h3>
                <p className="text-gray-muted text-sm mb-4">{study.description}</p>
                <a
                  href={study.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold-light transition-colors"
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

      {/* Section Divider */}
      <div className="relative h-16 bg-dark">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-px h-full bg-gradient-to-b from-gold/30 to-transparent"></div>
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-2 h-2 bg-gold/50 rounded-full"></div>
      </div>

      {/* FOUNDER CREDIBILITY */}
      <section className="py-20 px-6 bg-dark-light">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Howard */}
          <div className="bg-dark p-8 md:p-12 rounded-lg border border-gray-dark/30">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-24 h-24 bg-gold/20 rounded-lg flex-shrink-0 flex items-center justify-center">
                <span className="text-3xl font-serif text-gold">HC</span>
              </div>
              <div>
                <h3 className="text-2xl font-serif text-white mb-2">Howard Leon Chatman III</h3>
                <p className="text-gold text-sm mb-4">Founder & Chief Architect</p>
                <p className="text-gray-muted mb-6">
                  Builder of operational systems. Not theoretical AI — production systems that run businesses.
                </p>
                <div className="space-y-3 text-sm text-gray">
                  <div className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full mt-2 flex-shrink-0"></span>
                    <span>Built and operated Chatman Security & Fire since 2009 — a million-dollar fire and security company</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full mt-2 flex-shrink-0"></span>
                    <span>Enterprise experience: Walmart, HEB, Dillard&apos;s, ADT, Protection One, Stanley Security</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full mt-2 flex-shrink-0"></span>
                    <span>Now building AI systems, demos, and productized solutions for operational scale</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ecko */}
          <div className="bg-dark p-8 md:p-12 rounded-lg border border-gray-dark/30">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-24 h-24 bg-gold/20 rounded-lg flex-shrink-0 flex items-center justify-center">
                <span className="text-3xl font-serif text-gold">ES</span>
              </div>
              <div>
                <h3 className="text-2xl font-serif text-white mb-2">Ecko Steadman</h3>
                <p className="text-gold text-sm mb-4">Co-Founder & Head of Product Growth & Human Experience</p>
                <p className="text-gray-muted mb-6">
                  Responsible for product positioning, sales narrative, pricing psychology, demo experience, and go-to-market strategy for an AI-powered follow-up and client experience platform serving estate and industry professionals.
                </p>
                <div className="space-y-3 text-sm text-gray">
                  <div className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full mt-2 flex-shrink-0"></span>
                    <span>Designed identity-based wellness programs integrating education, embodiment, and habit design — coaching 100+ women toward sustainable behavior change</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full mt-2 flex-shrink-0"></span>
                    <span>Led curriculum development, instructional design, and documentation across public education, federal agencies, and community-based programs</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full mt-2 flex-shrink-0"></span>
                    <span>Applied coaching, facilitation, and communication strategy through academic instruction, youth leadership, and athletic coaching — building trust and team cohesion in high-accountability settings</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="relative h-16 bg-dark-light">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-px h-full bg-gradient-to-b from-gold/30 to-transparent"></div>
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-2 h-2 bg-gold/50 rounded-full"></div>
      </div>

      {/* PROCESS */}
      <section className="py-20 px-6 bg-dark relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/5 to-transparent"></div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif mb-4 text-white">
              Our Process
            </h2>
            <p className="text-gray-muted text-lg max-w-2xl mx-auto">
              Architecture first. Implementation second. Results always.
            </p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-gold/20 via-gold/40 to-gold/20"></div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {processSteps.map((step, index) => (
                <div
                  key={index}
                  className="bg-dark-card p-6 rounded-lg border border-gray-dark/30 text-center relative"
                >
                  <div className="hidden lg:block absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-dark-card border-2 border-gold/50 rounded-full"></div>
                  <div className="text-4xl font-serif text-gold mb-4">{step.number}</div>
                  <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-muted text-sm">{step.description}</p>
                  {index < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-6 text-gold/30">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="relative h-16 bg-dark">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-px h-full bg-gradient-to-b from-gold/30 to-transparent"></div>
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-2 h-2 bg-gold/50 rounded-full"></div>
      </div>

      {/* CONTACT */}
      <section id="contact" className="py-20 px-6 bg-dark-light relative dot-grid">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-serif mb-4 text-white">
              Start Your Systems Audit
            </h2>
            <p className="text-gray-muted text-lg">
              Let&apos;s map your decision points and identify where AI creates leverage.
            </p>
          </div>

          <div className="bg-dark p-8 md:p-12 rounded-lg border border-gray-dark/30">
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm text-gray-muted mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    className="w-full px-4 py-3 bg-dark-light border border-gray-dark/30 rounded-sm text-white focus:border-gold focus:outline-none transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm text-gray-muted mb-2">
                    Company *
                  </label>
                  <input
                    type="text"
                    id="company"
                    required
                    className="w-full px-4 py-3 bg-dark-light border border-gray-dark/30 rounded-sm text-white focus:border-gold focus:outline-none transition-colors"
                    placeholder="Your company"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm text-gray-muted mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    className="w-full px-4 py-3 bg-dark-light border border-gray-dark/30 rounded-sm text-white focus:border-gold focus:outline-none transition-colors"
                    placeholder="you@company.com"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm text-gray-muted mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    required
                    className="w-full px-4 py-3 bg-dark-light border border-gray-dark/30 rounded-sm text-white focus:border-gold focus:outline-none transition-colors"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="industry" className="block text-sm text-gray-muted mb-2">
                    Industry *
                  </label>
                  <select
                    id="industry"
                    required
                    className="w-full px-4 py-3 bg-dark-light border border-gray-dark/30 rounded-sm text-white focus:border-gold focus:outline-none transition-colors"
                  >
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
                  <label htmlFor="urgency" className="block text-sm text-gray-muted mb-2">
                    Timeline
                  </label>
                  <select
                    id="urgency"
                    className="w-full px-4 py-3 bg-dark-light border border-gray-dark/30 rounded-sm text-white focus:border-gold focus:outline-none transition-colors"
                  >
                    <option value="">Select timeline</option>
                    <option value="immediate">Immediate (this month)</option>
                    <option value="quarter">This quarter</option>
                    <option value="planning">Planning phase</option>
                    <option value="exploring">Just exploring</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="goal" className="block text-sm text-gray-muted mb-2">
                  Primary Goal *
                </label>
                <select
                  id="goal"
                  required
                  className="w-full px-4 py-3 bg-dark-light border border-gray-dark/30 rounded-sm text-white focus:border-gold focus:outline-none transition-colors"
                >
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
                <label htmlFor="tools" className="block text-sm text-gray-muted mb-2">
                  Current Tools (optional)
                </label>
                <input
                  type="text"
                  id="tools"
                  className="w-full px-4 py-3 bg-dark-light border border-gray-dark/30 rounded-sm text-white focus:border-gold focus:outline-none transition-colors"
                  placeholder="CRM, phone system, scheduling software..."
                />
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="demo"
                  className="w-5 h-5 mt-0.5 bg-dark-light border border-gray-dark/30 rounded text-gold focus:ring-gold"
                />
                <label htmlFor="demo" className="text-sm text-gray-muted">
                  I want a demo of AIVA Connect or an industry-specific agent
                </label>
              </div>

              <button
                type="submit"
                className="w-full px-8 py-4 bg-gold text-dark font-medium rounded-sm hover:bg-gold-light transition-colors"
              >
                Request Systems Audit
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-muted mt-6">
            Or email directly:{' '}
            <a href="mailto:howard@chatmaninc.com" className="text-gold hover:text-gold-light transition-colors">
              howard@chatmaninc.com
            </a>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-dark border-t border-gray-dark/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <a href="#" className="flex items-center gap-3">
              <img src="/logo.png" alt="Chatman Inc" className="h-28 w-auto" />
            </a>
            <div className="text-sm text-gray-muted text-center md:text-right">
              <p>&copy; 2026 Chatman Inc. All rights reserved.</p>
              <p className="mt-1">
                <a href="mailto:support@chatmaninc.com" className="hover:text-gold transition-colors">
                  support@chatmaninc.com
                </a>
                <span className="mx-2">|</span>
                <Link href="/admin" className="hover:text-gold transition-colors">
                  Admin Portal
                </Link>
              </p>
              <p className="mt-2 text-xs text-gray-muted/70">
                Patent-pending AI systems architecture
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
