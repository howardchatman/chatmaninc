'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Services', href: '#services' },
    { name: 'Products', href: '#aiva' },
    { name: 'Case Systems', href: '#systems' },
    { name: 'Process', href: '#process' },
    { name: 'Contact', href: '#contact' },
  ];

  const aiStackFeatures = [
    { name: 'Inbound Calls', status: 'Qualify', color: 'bg-gold' },
    { name: 'Spam Filtering', status: 'Block', color: 'bg-gold' },
    { name: 'Warm Transfer', status: 'Human', color: 'bg-gold' },
    { name: 'Scheduling', status: 'Confirm', color: 'bg-gold' },
    { name: 'Dashboard', status: 'Track', color: 'bg-gold' },
  ];

  const tags = ['Voice Agents', 'Automation', 'Dashboards', 'SaaS Platforms'];

  const demos = [
    {
      title: 'AIVA',
      tag: 'AI Decision Platform',
      description: 'Voice and decision systems managing inbound demand, filtering noise, and routing high-value interactions automatically.',
      link: 'https://connectaiva.com',
    },
    {
      title: 'Real Estate Platform',
      tag: 'AI Architecture',
      description: 'End-to-end property platform with AI-powered lead routing, automated scheduling, and intelligent chat.',
      link: 'https://realestatedemo.chatmaninc.com',
    },
    {
      title: 'Insurance Operations',
      tag: 'AI Architecture',
      description: 'Intelligent policy management with AI decision support and automated claims routing.',
      link: 'https://insurancedemo.chatmaninc.com',
    },
    {
      title: 'Houston Texas Pro',
      tag: 'Directory Platform',
      description: 'Scalable contractor marketplace with intelligent matching and automated lead distribution.',
      link: 'https://houstontexaspro.com',
    },
    {
      title: '30 Day Faith',
      tag: 'Digital Strategy',
      description: 'Go-to-market strategy with automated fulfillment and conversion-optimized funnels.',
      link: 'https://30dayfaith.chatmaninc.com',
    },
    {
      title: 'Security Operations',
      tag: 'Operations Optimization',
      description: 'Operational systems for safety, compliance, and service delivery across enterprise clients.',
      link: 'https://securitydemo.chatmaninc.com',
    },
  ];

  const processSteps = [
    {
      number: '01',
      title: 'Discover',
      description: 'Map performance bottlenecks and decision points across your operations',
    },
    {
      number: '02',
      title: 'Design',
      description: 'Architect intelligent systems with strategic AI integration',
    },
    {
      number: '03',
      title: 'Deploy',
      description: 'Build and launch reliable, scalable solutions',
    },
    {
      number: '04',
      title: 'Optimize',
      description: 'Continuous improvement and system refinement',
    },
  ];

  return (
    <div className="min-h-screen bg-dark">
      {/* Sticky Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-md border-b border-gray-dark/30">
        <div className="max-w-7xl mx-auto px-6 py-2">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href="#" className="flex items-center gap-3">
              <img src="/logo.png" alt="Chatman Inc" className="h-28 w-auto" />
            </a>

            {/* Desktop Nav */}
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

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href="#systems"
                className="px-4 py-2 text-sm border border-gold text-gold hover:bg-gold hover:text-dark transition-colors rounded-sm"
              >
                View Case Systems
              </a>
              <a
                href="#contact"
                className="px-4 py-2 text-sm bg-gold text-dark font-medium hover:bg-gold-light transition-colors rounded-sm"
              >
                Book a Strategy Call
              </a>
            </div>

            {/* Mobile Menu Button */}
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

          {/* Mobile Menu */}
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
                <a
                  href="#contact"
                  className="px-4 py-2 bg-gold text-dark font-medium rounded-sm text-center"
                >
                  Book a Strategy Call
                </a>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative hero-grid">
        {/* Subtle architectural lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/10 to-transparent"></div>
          <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/10 to-transparent"></div>
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-gold/10 to-transparent"></div>
          <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-gold/10 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Content */}
            <div>
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-dark-light rounded-full border border-gray-dark/30 mb-8">
                <span className="w-2 h-2 bg-green rounded-full animate-pulse"></span>
                <span className="text-sm text-gray-muted">Building AI that runs operations — not just demos</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-tight mb-6">
                Complexity into<br />operational <span className="text-gold italic">leverage</span>.
              </h1>

              {/* Description */}
              <p className="text-lg text-gray-muted mb-4 max-w-xl">
                We partner with founders, executives, and business owners to architect AI-powered systems that reduce friction, accelerate decision-making, and create predictable, profitable growth.
              </p>

              <p className="text-sm text-gold italic mb-8 max-w-xl">
                No more missed leads. No more dropped calls. Every customer interaction captured, followed up, and converted into lasting relationships and revenue.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 mb-8">
                <a
                  href="#systems"
                  className="px-6 py-3 bg-dark-light border border-gray-dark/50 text-white hover:border-gold transition-colors rounded-sm"
                >
                  Explore Architecture
                </a>
                <a
                  href="#services"
                  className="px-6 py-3 border border-gray-dark/30 text-gray-muted hover:text-white hover:border-gray-muted transition-colors rounded-sm"
                >
                  View Capabilities
                </a>
              </div>

              {/* Tags */}
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

            {/* Right Content - AI Stack Panel */}
            <div className="bg-dark-card border border-gray-dark/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-gray-muted uppercase tracking-wider">Live Preview</p>
                  <p className="text-lg font-semibold text-white">Operational AI Stack</p>
                </div>
                <span className="px-3 py-1 text-xs bg-green/20 text-green border border-green/30 rounded-full">
                  Production-ready
                </span>
              </div>

              {/* Feature List */}
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

              {/* Narrative */}
              <div className="bg-dark-light p-4 rounded-sm mb-6 border border-gray-dark/20">
                <p className="text-xs text-gray-muted uppercase tracking-wider mb-2">Narrative</p>
                <p className="text-sm text-gray italic">
                  &quot;AIVA doesn&apos;t just answer calls — it decides who deserves you.&quot;
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <a
                  href="https://connectaiva.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 bg-gold text-dark font-medium text-center rounded-sm hover:bg-gold-light transition-colors"
                >
                  View AIVA Connect
                </a>
                <a
                  href="#contact"
                  className="px-4 py-3 border border-gray-dark/30 text-white text-center rounded-sm hover:border-gold transition-colors"
                >
                  Talk to Us
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-dark/20">
                <div className="text-center">
                  <p className="text-xl font-semibold text-white">24/7</p>
                  <p className="text-xs text-gray-muted">Coverage</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-semibold text-white">Human</p>
                  <p className="text-xs text-gray-muted">Only Routing</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-semibold text-white">Audits</p>
                  <p className="text-xs text-gray-muted">Logs</p>
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

      {/* Services Section */}
      <section id="services" className="py-20 px-6 bg-dark-light relative dot-grid">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif mb-4 text-white">
              Our Capabilities
            </h2>
            <p className="text-gray-muted text-lg max-w-2xl mx-auto">
              Not automation. Not dashboards. Intelligent systems that drive real outcomes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Transform Decision-Making',
                description: 'AI-driven decision systems that accelerate outcomes and reduce cognitive load.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
              },
              {
                title: 'Optimize Workflows',
                description: 'Scalable process design eliminating handoff delays and bottlenecks.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
              },
              {
                title: 'Reduce Friction',
                description: 'Custom intelligent platforms and internal tools that just work.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
              },
              {
                title: 'Scale Reliably',
                description: 'Data-informed strategy for sustainable, predictable expansion.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ),
              },
            ].map((service, index) => (
              <div
                key={index}
                className="bg-dark p-6 rounded-lg border border-gray-dark/30 hover:border-gold/50 transition-all group"
              >
                <div className="text-gold mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-gold transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-muted text-sm">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AIVA Connect Spotlight */}
      <section id="aiva" className="py-20 px-6 bg-dark">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-3 py-1 text-xs bg-gold/20 text-gold border border-gold/30 rounded-full mb-4">
                Featured Product
              </span>
              <h2 className="text-3xl md:text-5xl font-serif mb-6 text-white">
                AIVA Connect
              </h2>
              <p className="text-lg text-gray-muted mb-8">
                AI-powered voice reception that qualifies leads, blocks spam, and routes only the calls that matter. Your always-on receptionist that never sleeps.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  'AI-powered voice reception',
                  'Intelligent call routing and filtering',
                  'Lead qualification and scheduling',
                  'CRM integration and logging',
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="w-5 h-5 bg-gold/20 rounded-full flex items-center justify-center">
                      <span className="w-2 h-2 bg-gold rounded-full"></span>
                    </span>
                    <span className="text-gray">{feature}</span>
                  </div>
                ))}
              </div>

              <a
                href="https://connectaiva.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-dark font-medium rounded-sm hover:bg-gold-light transition-colors"
              >
                Explore AIVA Connect
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>

            <div className="bg-dark-card border border-gray-dark/30 rounded-lg overflow-hidden">
              <img
                src="/aiva-mockup.png"
                alt="AIVA Connect Dashboard"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="relative h-16 bg-dark">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-px h-full bg-gradient-to-b from-gold/30 to-transparent"></div>
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-2 h-2 bg-gold/50 rounded-full"></div>
      </div>

      {/* Real Estate Platform Spotlight */}
      <section id="realestate" className="py-20 px-6 bg-dark-light">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="bg-dark-card border border-gray-dark/30 rounded-lg overflow-hidden lg:order-1">
              <img
                src="/realestate-mockup.png"
                alt="Real Estate Platform Dashboard"
                className="w-full h-auto"
              />
            </div>

            <div className="lg:order-2">
              <span className="inline-block px-3 py-1 text-xs bg-gold/20 text-gold border border-gold/30 rounded-full mb-4">
                Featured Platform
              </span>
              <h2 className="text-3xl md:text-5xl font-serif mb-6 text-white">
                Real Estate Platform
              </h2>
              <p className="text-lg text-gray-muted mb-8">
                End-to-end property platform with AI-powered lead routing, automated scheduling, and intelligent chat. Transform how you manage listings, clients, and transactions.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  'AI-powered lead routing and qualification',
                  'Automated scheduling and follow-ups',
                  'Intelligent chat and client communication',
                  'Property management dashboard',
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="w-5 h-5 bg-gold/20 rounded-full flex items-center justify-center">
                      <span className="w-2 h-2 bg-gold rounded-full"></span>
                    </span>
                    <span className="text-gray">{feature}</span>
                  </div>
                ))}
              </div>

              <a
                href="https://realestatedemo.chatmaninc.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-dark font-medium rounded-sm hover:bg-gold-light transition-colors"
              >
                View Demo
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="relative h-16 bg-dark-light">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-px h-full bg-gradient-to-b from-gold/30 to-transparent"></div>
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-2 h-2 bg-gold/50 rounded-full"></div>
      </div>

      {/* Insurance Platform Spotlight */}
      <section id="insurance" className="py-20 px-6 bg-dark">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-3 py-1 text-xs bg-gold/20 text-gold border border-gold/30 rounded-full mb-4">
                Featured Platform
              </span>
              <h2 className="text-3xl md:text-5xl font-serif mb-6 text-white">
                Insurance Platform
              </h2>
              <p className="text-lg text-gray-muted mb-8">
                Intelligent policy management with AI decision support and automated claims routing. Streamline operations and improve customer experience across the insurance lifecycle.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  'AI-powered claims routing and triage',
                  'Intelligent policy management',
                  'Automated underwriting support',
                  'Customer portal and self-service',
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="w-5 h-5 bg-gold/20 rounded-full flex items-center justify-center">
                      <span className="w-2 h-2 bg-gold rounded-full"></span>
                    </span>
                    <span className="text-gray">{feature}</span>
                  </div>
                ))}
              </div>

              <a
                href="https://insurancedemo.chatmaninc.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-dark font-medium rounded-sm hover:bg-gold-light transition-colors"
              >
                View Demo
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>

            <div className="bg-dark-card border border-gray-dark/30 rounded-lg overflow-hidden">
              <img
                src="/insurance-mockup.png"
                alt="Insurance Platform Dashboard"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="relative h-16 bg-dark">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-px h-full bg-gradient-to-b from-gold/30 to-transparent"></div>
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-2 h-2 bg-gold/50 rounded-full"></div>
      </div>

      {/* Case Systems Section */}
      <section id="systems" className="py-20 px-6 bg-dark-light">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif mb-4 text-white">
              Proof of Architectural Execution
            </h2>
            <p className="text-gray-muted text-lg max-w-2xl mx-auto">
              Real systems we&apos;ve built. Real results delivered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demos.map((demo, index) => (
              <div
                key={index}
                className="bg-dark p-6 rounded-lg border border-gray-dark/30 hover:border-gold/50 transition-all group"
              >
                <span className="inline-block px-2 py-1 text-xs bg-gold/20 text-gold rounded mb-4">
                  {demo.tag}
                </span>
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-gold transition-colors">
                  {demo.title}
                </h3>
                <p className="text-gray-muted text-sm mb-4">{demo.description}</p>
                <a
                  href={demo.link}
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
      <div className="relative h-16 bg-dark-light">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-px h-full bg-gradient-to-b from-gold/30 to-transparent"></div>
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-2 h-2 bg-gold/50 rounded-full"></div>
      </div>

      {/* Process Section */}
      <section id="process" className="py-20 px-6 bg-dark relative">
        {/* Subtle connector lines between process steps */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/5 to-transparent"></div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif mb-4 text-white">
              Our Process
            </h2>
            <p className="text-gray-muted text-lg max-w-2xl mx-auto">
              We start with the architecture, not the tools.
            </p>
          </div>

          {/* Process Steps with Connecting Lines */}
          <div className="relative">
            {/* Horizontal connector line (desktop) */}
            <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-gold/20 via-gold/40 to-gold/20"></div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {processSteps.map((step, index) => (
                <div
                  key={index}
                  className="bg-dark-card p-6 rounded-lg border border-gray-dark/30 text-center relative"
                >
                  {/* Node connector */}
                  <div className="hidden lg:block absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-dark-card border-2 border-gold/50 rounded-full"></div>

                  <div className="text-4xl font-serif text-gold mb-4">{step.number}</div>
                  <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-muted text-sm">{step.description}</p>

                  {/* Arrow to next step (desktop) */}
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

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6 bg-dark-light relative dot-grid">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-serif mb-4 text-white">
              Start a Project
            </h2>
            <p className="text-gray-muted text-lg">
              Let&apos;s discuss how AI can transform your operations.
            </p>
          </div>

          <div className="bg-dark p-8 md:p-12 rounded-lg border border-gray-dark/30">
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm text-gray-muted mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    className="w-full px-4 py-3 bg-dark-light border border-gray-dark/30 rounded-sm text-white focus:border-gold focus:outline-none transition-colors"
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm text-gray-muted mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    className="w-full px-4 py-3 bg-dark-light border border-gray-dark/30 rounded-sm text-white focus:border-gold focus:outline-none transition-colors"
                    placeholder="john@company.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="company" className="block text-sm text-gray-muted mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    className="w-full px-4 py-3 bg-dark-light border border-gray-dark/30 rounded-sm text-white focus:border-gold focus:outline-none transition-colors"
                    placeholder="Your Company Inc."
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm text-gray-muted mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full px-4 py-3 bg-dark-light border border-gray-dark/30 rounded-sm text-white focus:border-gold focus:outline-none transition-colors"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="goal" className="block text-sm text-gray-muted mb-2">
                  What are you looking to achieve? *
                </label>
                <textarea
                  id="goal"
                  rows={4}
                  required
                  className="w-full px-4 py-3 bg-dark-light border border-gray-dark/30 rounded-sm text-white focus:border-gold focus:outline-none transition-colors resize-none"
                  placeholder="Tell us about your operational challenges and goals..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full px-8 py-4 bg-gold text-dark font-medium rounded-sm hover:bg-gold-light transition-colors"
              >
                Book a Strategy Call
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-muted mt-6">
            Or email us directly at{' '}
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
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
