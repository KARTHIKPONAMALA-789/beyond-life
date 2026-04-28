import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiCheck, FiShield, FiUsers, FiRefreshCw, FiStar, FiFileText, FiChevronDown } from 'react-icons/fi';
import { HiOutlineDocumentText, HiOutlineShieldCheck, HiOutlineUserGroup, HiOutlineRefresh, HiOutlineStar } from 'react-icons/hi';

const BeyondLifePremium = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const testimonials = [
    {
      id: 1,
      name: 'Eleanor Vanderbilt',
      role: 'Philanthropist',
      content: 'As someone with complex international assets, BeyondLife provided estate planning sophistication that rivaled our family office—at a fraction of the cost.',
      rating: 5
    },
    {
      id: 2,
      name: 'Dr. Marcus Wei',
      role: 'Neurosurgeon',
      content: 'Between surgeries, I completed my entire estate plan during lunch breaks. The medical power of attorney provisions are exceptionally well-crafted for physicians.',
      rating: 5
    },
    {
      id: 3,
      name: 'The Laurent Family',
      role: 'Multi-generational estate',
      content: 'Three generations of our family now have coordinated estate plans with perfect continuity. The dynasty trust options are unparalleled in digital platforms.',
      rating: 5
    }
  ];

  const plans = [
    {
      name: 'Legacy Foundation',
      price: '$499',
      description: 'Comprehensive wealth preservation',
      features: [
        'Irrevocable Trust Structures',
        'Multi-Generational Planning',
        'Charitable Remainder Trusts',
        'Family Limited Partnerships',
        'Private Trustee Selection'
      ],
      featured: false
    },
    {
      name: 'Dynasty Collection',
      price: '$1,999',
      description: 'Ultra-high-net-worth solution',
      features: [
        'Everything in Legacy Foundation',
        'Offshore Asset Protection',
        'Complex Beneficiary Strategies',
        'Art & Collectibles Rider',
        'Concierge Attorney Review',
        '24/7 Family Office Support'
      ],
      featured: true
    },
    {
      name: 'Global Heritage',
      price: '$3,999',
      description: 'International estate mastery',
      features: [
        'Everything in Dynasty Collection',
        'Multi-Jurisdictional Planning',
        'Cross-Border Tax Optimization',
        'Dual Citizenship Provisions',
        'Personal Estate Architect',
        'Annual Plan Review'
      ],
      featured: false
    }
  ];

  const features = [
    {
      icon: <HiOutlineDocumentText className="h-8 w-8" />,
      title: 'Boutique Document Crafting',
      description: 'Each clause meticulously designed by Ivy League estate attorneys'
    },
    {
      icon: <HiOutlineUserGroup className="h-8 w-8" />,
      title: 'Family Governance',
      description: 'Integrated family meeting protocols and succession roadmaps'
    },
    {
      icon: <HiOutlineShieldCheck className="h-8 w-8" />,
      title: 'Cyber Heritage Vault™',
      description: 'Military-grade encrypted storage with blockchain verification'
    },
    {
      icon: <HiOutlineRefresh className="h-8 w-8" />,
      title: 'Dynamic Provisions',
      description: 'Auto-updating clauses based on life events and law changes'
    },
    {
      icon: <HiOutlineStar className="h-8 w-8" />,
      title: 'Concierge Service',
      description: 'Dedicated estate specialist available via private channel'
    }
  ];

  return (
    <div className="font-sans antialiased bg-gray-50 text-gray-900">
      {/* Luxury Navigation */}
      <header className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white shadow-xl py-2' : 'bg-transparent py-4'}`}>
        <nav className="max-w-8xl mx-auto px-8">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center"
            >
              <span className="text-3xl font-light tracking-tight">
                <span className="text-indigo-800 ">Beyond</span>
                <span className="text-gray-700">Life</span>
                <span className="text-indigo-600">&</span>
                <span className="text-gray-800">Will</span>
              </span>
            </motion.div>

            <div className="hidden lg:flex items-center space-x-10">
              <motion.div className="flex space-x-8">
                {['Features', 'Solutions', 'Testimonials', 'Resources'].map((item, index) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="relative text-sm font-medium uppercase tracking-wider text-gray-700 hover:text-indigo-600 transition-colors"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-indigo-600 transition-all group-hover:w-full"></span>
                  </motion.a>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center space-x-4"
              >
                <a href="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
                  Client Portal
                </a>
                <a
                  href="/AuthPage"
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white text-sm font-medium rounded-full shadow-lg hover:shadow-xl transition-all hover:from-indigo-700 hover:to-indigo-900"
                >
                  Request Consultation
                </a>
              </motion.div>
            </div>

            <button
              className="lg:hidden p-2 text-gray-700 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-white shadow-xl"
            >
              <div className="px-8 py-6 space-y-6">
                {['Features', 'Solutions', 'Testimonials', 'Resources'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="block text-sm font-medium uppercase tracking-wider text-gray-700 hover:text-indigo-600 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item}
                  </a>
                ))}
                <div className="pt-4 border-t border-gray-200">
                  <a
                    href="/login"
                    className="block w-full px-4 py-2 text-center text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                  >
                    Client Portal
                  </a>
                  <a
                    href="/contact"
                    className="block w-full mt-4 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white text-sm font-medium rounded-full shadow-lg text-center"
                  >
                    Request Consultation
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen pt-32 pb-20 flex items-center ">
        <div className="absolute inset-0 bg-gray-900 opacity-40"></div>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover filter brightness-50"
          poster="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-woman-signing-a-document-1723-large.mp4" type="video/mp4" />
        </video>

        <div className="relative max-w-8xl mx-auto px-8 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}

            >
              <h1 className="text-5xl md:text-6xl font-light leading-tight text-white">
                <span className="block text-white">The Art of</span>
                <span className="font-medium">Legacy Architecture</span>
              </h1>
              <p className="mt-6 text-xl text-gray-100 max-w-2xl">
                BeyondLife & Will redefines estate planning as a bespoke service—merging cutting-edge technology with white-glove advisory for discerning clients.
              </p>
              <div className="mt-12 flex flex-wrap gap-6">
                <motion.a
                  href="/contact"
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white text-lg font-medium rounded-full shadow-2xl hover:shadow-3xl transition-all hover:from-indigo-700 hover:to-indigo-900 flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Begin Your Legacy Plan
                  <FiArrowRight className="ml-2" />
                </motion.a>
                <a
                  href="#process"
                  className="px-8 py-4 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg text-white text-lg font-medium rounded-full border border-white border-opacity-20 hover:bg-opacity-20 transition-all flex items-center"
                >
                  Explore Our Process
                  <FiChevronDown className="ml-2" />
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="bg-white bg-opacity-15 backdrop-filter backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white border-opacity-20"
            >
              <div className="p-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-light text-white">Your Legacy Blueprint</h3>
                  <div className="p-3 bg-indigo-600 bg-opacity-80 rounded-full">
                    <HiOutlineShieldCheck className="h-6 w-6 text-white" />
                  </div>
                </div>

                <div className="mt-8 space-y-5">
                  {['Dynasty Trust Framework', 'Family Governance Protocol', 'Digital Asset Vault', 'Philanthropic Roadmap'].map((item, index) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-start"
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div className="flex items-center justify-center h-5 w-5 rounded-full bg-indigo-600">
                          <FiCheck className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      <p className="ml-3 text-lg text-gray-200">{item}</p>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  className="mt-10 bg-white bg-opacity-20 rounded-xl p-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-medium">Plan Progress</h4>
                    <span className="text-sm text-gray-300">85% complete</span>
                  </div>
                  <div className="mt-3 h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '85%' }}
                      transition={{ delay: 1.2, duration: 1.5, ease: "easeOut" }}
                    />
                  </div>
                  <motion.button
                    className="mt-4 w-full py-3 bg-white text-indigo-800 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Continue Your Plan
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
          <motion.a
            href="#features"
            className="text-white animate-bounce"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.a>
        </div>
      </section>

      {/* Luxury Brand Marquee */}
      <div className="bg-gray-900 py-12">
        <div className="max-w-8xl mx-auto px-8">
          <div className="text-center mb-12">
            <h3 className="text-sm uppercase tracking-widest text-gray-400 mb-2">Trusted By Elite Families Worldwide</h3>
            <div className="w-24 h-px bg-indigo-600 mx-auto"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            {['Forbes', 'Bloomberg', 'The Economist', 'Financial Times'].map((brand, index) => (
              <motion.div
                key={brand}
                className="flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <span className="text-2xl font-light text-gray-300 opacity-80 hover:opacity-100 transition-opacity">{brand}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Signature Features */}
      <section id="features" className="py-28 bg-white">
        <div className="max-w-8xl mx-auto px-8">
          <div className="text-center mb-20">
            <motion.h2
              className="text-4xl md:text-5xl font-light leading-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <span className="block">Beyond Digital Wills</span>
              <span className="font-medium">A New Standard in Legacy Planning</span>
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
            >
              We combine institutional-grade estate planning with the convenience of modern technology, serving as your family's private digital family office.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-gray-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-gray-100"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-medium mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}

            <motion.div
              className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-2xl p-8 text-white"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <div className="w-14 h-14 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-white mb-6">
                <FiUsers className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-medium mb-3">Family Governance Council</h3>
              <p className="text-indigo-100 mb-6">Our exclusive program for multi-generational wealth continuity planning and family education.</p>
              <a href="#" className="inline-flex items-center text-white font-medium group">
                Learn About Our Council
                <FiArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Signature Process */}
      <section id="process" className="py-28 bg-gray-50">
        <div className="max-w-8xl mx-auto px-8">
          <div className="text-center mb-20">
            <motion.h2
              className="text-4xl md:text-5xl font-light leading-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <span className="block">The BeyondLife</span>
              <span className="font-medium">Signature Process</span>
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
            >
              A meticulously crafted journey that transforms estate planning from obligation to strategic advantage.
            </motion.p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 transform -translate-x-1/2"></div>

            {[
              {
                step: 'Discovery',
                title: 'Legacy Architecture Session',
                description: '90-minute private consultation with our Senior Legacy Designer to map your family ecosystem and objectives',
                icon: <FiFileText className="h-6 w-6" />
              },
              {
                step: 'Design',
                title: 'Custom Document Crafting',
                description: 'Our legal team hand-drafts each provision using institutional templates refined over decades',
                icon: <FiRefreshCw className="h-6 w-6" />
              },
              {
                step: 'Review',
                title: 'Family Governance Workshop',
                description: 'Interactive session to align all stakeholders with the plan and its implementation',
                icon: <FiUsers className="h-6 w-6" />
              },
              {
                step: 'Execution',
                title: 'White-Glove Signing Ceremony',
                description: 'We coordinate all legal formalities with notaries and witnesses for flawless execution',
                icon: <FiCheck className="h-6 w-6" />
              },
              {
                step: 'Continuity',
                title: 'Annual Legacy Review',
                description: 'Scheduled updates and family meetings to ensure perpetual relevance of your plan',
                icon: <FiStar className="h-6 w-6" />
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className={`relative mb-16 ${index % 2 === 0 ? 'lg:pr-24' : 'lg:pl-24'}`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className={`flex flex-col lg:flex-row ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center`}>
                  <div className={`flex-shrink-0 mb-6 lg:mb-0 ${index % 2 === 0 ? 'lg:mr-8' : 'lg:ml-8'}`}>
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600">
                      {item.icon}
                    </div>
                  </div>
                  <div className={`flex-1 ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'} text-center lg:text-left`}>
                    <span className="text-sm font-medium tracking-widest text-indigo-600">{item.step}</span>
                    <h3 className="text-2xl font-medium mt-2 mb-3">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
                {index < 4 && (
                  <div className="hidden lg:block absolute left-1/2 top-16 h-full w-px bg-gray-200 transform -translate-x-1/2"></div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Elite Testimonials */}
      <section className="py-28 bg-indigo-900 text-white">
        <div className="max-w-8xl mx-auto px-8">
          <div className="text-center mb-20">
            <motion.h2
              className="text-4xl md:text-5xl font-light leading-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <span className="block">Trusted By</span>
              <span className="font-medium">The World's Most Discerning Families</span>
            </motion.h2>
          </div>

          <div className="relative h-96">
            <AnimatePresence mode="wait">
              {testimonials.map((testimonial, index) => (
                activeTestimonial === index && (
                  <motion.div
                    key={testimonial.id}
                    className="absolute inset-0 flex flex-col items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="max-w-3xl text-center">
                      <div className="text-3xl font-light leading-snug mb-8">
                        "{testimonial.content}"
                      </div>
                      <div className="flex justify-center space-x-2 mb-6">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`}
                          />
                        ))}
                      </div>
                      <div className="text-xl font-medium">{testimonial.name}</div>
                      <div className="text-indigo-300">{testimonial.role}</div>
                    </div>
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </div>

          <div className="flex justify-center mt-12 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTestimonial(index)}
                className={`w-3 h-3 rounded-full ${activeTestimonial === index ? 'bg-white' : 'bg-gray-500'}`}
                aria-label={`View testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Concierge Plans */}
      <section id="pricing" className="py-28 bg-white">
        <div className="max-w-8xl mx-auto px-8">
          <div className="text-center mb-20">
            <motion.h2
              className="text-4xl md:text-5xl font-light leading-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <span className="block">Concierge</span>
              <span className="font-medium">Estate Planning Services</span>
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
            >
              Select the level of service that matches your family's complexity and aspirations.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                className={`rounded-2xl overflow-hidden ${plan.featured ? 'shadow-2xl transform lg:-translate-y-6' : 'shadow-lg'}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ scale: plan.featured ? 1.02 : 1.01 }}
              >
                <div className={`${plan.featured ? 'bg-indigo-900' : 'bg-gray-900'} h-2`}></div>
                <div className={`p-8 ${plan.featured ? 'border-2 border-indigo-900 border-t-0' : 'border border-gray-200 border-t-0'}`}>
                  {plan.featured && (
                    <div className="mb-4 -mt-8">
                      <span className="inline-block bg-indigo-900 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                        Preferred by Families
                      </span>
                    </div>
                  )}
                  <h3 className={`text-2xl font-medium mb-2 ${plan.featured ? 'text-indigo-900' : 'text-gray-900'}`}>{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  <div className="mb-8">
                    <span className="text-4xl font-light text-gray-900">{plan.price}</span>
                    <span className="text-gray-600"> one-time</span>
                  </div>
                  <ul className="space-y-3 mb-10">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <FiCheck className={`h-5 w-5 flex-shrink-0 mt-1 ${plan.featured ? 'text-indigo-600' : 'text-gray-500'}`} />
                        <span className="ml-3 text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="/signup"
                    className={`block w-full py-4 px-6 rounded-lg text-center font-medium transition-all ${plan.featured
                        ? 'bg-indigo-900 text-white hover:bg-indigo-800'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                  >
                    Begin Your Plan
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <a href="/contact" className="inline-flex items-center text-indigo-600 font-medium text-lg group">
              Schedule a Private Consultation
              <FiArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <svg className="absolute inset-0 w-full h-full" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="small-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#small-grid)" />
          </svg>
        </div>
        <div className="relative max-w-6xl mx-auto px-8 text-center">
          <motion.h2
            className="text-4xl md:text-5xl font-light leading-tight mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="block">Begin Crafting Your</span>
            <span className="font-medium">Enduring Legacy Today</span>
          </motion.h2>
          <motion.p
            className="text-xl text-gray-300 max-w-3xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            Our Senior Legacy Designers are ready to guide you through every step of creating a plan that reflects your values and vision.
          </motion.p>
          <div className="flex flex-wrap justify-center gap-6">
            <motion.a
              href="/contact"
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white text-lg font-medium rounded-full shadow-2xl hover:shadow-3xl transition-all hover:from-indigo-700 hover:to-indigo-900 flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Request Private Consultation
              <FiArrowRight className="ml-2" />
            </motion.a>
            <a
              href="tel:+18885551234"
              className="px-8 py-4 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg text-white text-lg font-medium rounded-full border border-white border-opacity-20 hover:bg-opacity-20 transition-all flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
              +1 (888) 555-1234
            </a>
          </div>
        </div>
      </section>

      {/* Luxury Footer */}
      <footer className="bg-gray-100">
        <div className="max-w-8xl mx-auto px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <h3 className="text-2xl font-light mb-6">
                <span className="text-indigo-800">Beyond</span>
                <span className="text-gray-700">Life</span>
                <span className="text-indigo-600">&</span>
                <span className="text-gray-800">Will</span>
              </h3>
              <p className="text-gray-600 mb-6">
                Redefining legacy planning for the modern era through technology and timeless wisdom.
              </p>
              <div className="flex space-x-4">
                {['twitter', 'linkedin', 'instagram'].map((social) => (
                  <a
                    key={social}
                    href={`https://${social}.com`}
                    className="text-gray-500 hover:text-indigo-600 transition-colors"
                  >
                    <span className="sr-only">{social}</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {[
              {
                title: 'Services',
                links: ['Legacy Planning', 'Dynasty Trusts', 'Family Governance', 'Philanthropy', 'Digital Assets']
              },
              {
                title: 'Resources',
                links: ['Insights', 'Case Studies', 'Webinars', 'Family Office', 'FAQ']
              },
              {
                title: 'Company',
                links: ['About Us', 'Our Approach', 'Leadership', 'Careers', 'Contact']
              }
            ].map((column, index) => (
              <div key={index}>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-900 mb-4">{column.title}</h4>
                <ul className="space-y-3">
                  {column.links.map((link, i) => (
                    <li key={i}>
                      <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} BeyondLife & Will. All rights reserved.
              </p>
              <div className="mt-4 md:mt-0 flex space-x-6">
                <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">Privacy Policy</a>
                <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">Terms of Service</a>
                <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">Disclosures</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BeyondLifePremium;