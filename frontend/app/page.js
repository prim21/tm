"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import CardSwap, { Card } from '../components/CardSwap';
import { ArrowRight, CheckCircle2, Layout, Users, Zap, TrendingUp, ListChecks, Code2, Sliders, Activity, Search, Plus, FileText, MoreHorizontal, Calendar, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [text, setText] = useState('');
  const fullText = "your productivity.";

  useEffect(() => {
    if (text.length < fullText.length) {
      const timeout = setTimeout(() => {
        setText(fullText.slice(0, text.length + 1));
      }, 100); // Typing speed
      return () => clearTimeout(timeout);
    }
  }, [text]);

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      router.push('/tasks');
    }
  }, [user, router]);

  const { scrollYProgress } = useScroll();
  const smoothScroll = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const waveY = useTransform(smoothScroll, [0.5, 1], ["0%", "-100%"]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactMessage, setContactMessage] = useState({ type: '', text: '' });

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactLoading(true);
    setContactMessage({ type: '', text: '' });

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactForm)
      });

      let data;
      try {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error("Failed to parse JSON:", text);
          throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
        }
      } catch (e) {
        throw e;
      }

      if (response.ok) {
        setContactMessage({ type: 'success', text: 'Thank you! Your message has been sent successfully.' });
        setContactForm({ name: '', email: '', message: '' });
      } else {
        // Use the specific validation error if available, otherwise fallback to the general message
        const errorMessage = data.errors && data.errors.length > 0
          ? data.errors[0].msg
          : data.message || 'Failed to send message. Please try again.';

        setContactMessage({ type: 'error', text: errorMessage });
      }
    } catch (error) {
      console.error("Submission Error:", error);
      setContactMessage({ type: 'error', text: `Error: ${error.message}` });
    } finally {
      setContactLoading(false);
    }
  };

  const handleContactChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 selection:bg-gray-900 selection:text-white overflow-hidden font-sans">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/70 backdrop-blur-xl border-b border-gray-100 z-50">
        <div className="w-full max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex lg:grid lg:grid-cols-2 gap-0 lg:gap-12 items-center h-20 justify-between relative z-20">
            {/* Logo aligned with Hero Text */}
            <div className="flex items-center lg:w-full lg:max-w-2xl lg:ml-auto lg:mr-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center shadow-lg shadow-gray-900/20">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-gray-900 tracking-tight">TaskFlow</span>
              </div>
            </div>

            {/* Right Side: CTA Buttons */}
            <div className="flex items-center justify-end lg:justify-start lg:w-full">
              <div className="flex items-center gap-4 lg:w-full lg:max-w-[640px] lg:justify-end">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20 hover:shadow-gray-900/40"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>

          {/* Centered Navigation Links (Desktop) */}
          <div className="hidden md:flex absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
            <div className="flex items-center gap-10">
              <a href="#home" className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm">Home</a>
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm">Features</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm">Contact Us</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-10 lg:pt-48 lg:pb-16 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 -z-10 w-[800px] h-[800px] bg-gradient-to-b from-indigo-50 to-white rounded-full blur-3xl opacity-50 translate-x-1/3 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-gradient-to-t from-blue-50 to-white rounded-full blur-3xl opacity-50 -translate-x-1/3 translate-y-1/4"></div>

        <div className="w-full max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="max-w-2xl relative z-10 text-center lg:text-left mx-auto lg:mx-0 lg:ml-auto lg:mr-0">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full mb-8 border border-indigo-100 mx-auto lg:mx-0">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                <span className="text-sm font-semibold text-indigo-900">Built for Productivity</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-8 leading-[1.1] tracking-tight">
                TaskFlow can transform
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 inline-block cursor-blink border-gray-900 pl-1">
                  {text}
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                TaskFlow's all-in-one task management platform helps you increase productivity and accomplish more every day.
              </p>

              <div className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-4 mb-12">
                <Link
                  href="/signup"
                  className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white text-base font-semibold rounded-2xl hover:bg-gray-800 transition-all shadow-xl shadow-gray-900/20 hover:shadow-gray-900/40 hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 text-base font-semibold rounded-2xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center"
                >
                  Sign In
                </Link>
              </div>
            </div>

            {/* Right Content - Animated GSAP Cards */}
            <div className="relative h-[600px] w-full flex items-center justify-center lg:justify-start mt-10 lg:mt-0">
              {/* Decorative elements behind cards */}
              <div className="absolute right-10 top-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
              <div className="absolute right-40 bottom-20 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-1000"></div>

              <div className="relative z-10 w-full max-w-[640px] h-[480px]">
                <CardSwap
                  width="100%"
                  height="100%"
                  cardDistance={50}
                  verticalDistance={70}
                  delay={2000}
                  skewAmount={2}
                >

                  {/* Card 1: Task Board UI */}
                  <Card customClass="bg-white border border-gray-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden rounded-3xl">
                    <div className="h-full flex flex-col bg-gray-50/30">
                      {/* Header */}
                      <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-white">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                            <ListChecks className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm leading-tight">My Tasks</h3>
                            <p className="text-[10px] text-gray-400 font-medium">Sprint 42</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                            <Search className="w-3 h-3" />
                          </div>
                          <div className="bg-gray-900 text-white px-2.5 py-1 rounded-md text-[10px] font-medium flex items-center gap-1 shadow-md shadow-gray-900/10">
                            <Plus className="w-3 h-3" /> New
                          </div>
                        </div>
                      </div>

                      {/* Board Columns */}
                      <div className="flex gap-3 p-4 h-full overflow-hidden items-start">
                        {/* Column 1: Todo */}
                        <div className="flex-1 flex flex-col gap-2.5 min-w-0">
                          <div className="flex items-center justify-between px-1">
                            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">To Do</span>
                            <span className="bg-gray-100 text-gray-500 text-[9px] px-1.5 py-0.5 rounded-full font-medium">3</span>
                          </div>

                          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-default group">
                            <div className="flex justify-between items-start mb-2">
                              <span className="bg-orange-50 text-orange-600 text-[9px] px-1.5 py-0.5 rounded font-medium border border-orange-100">High</span>
                              <MoreHorizontal className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <span className="text-xs font-semibold text-gray-800 block mb-2 leading-snug">Update landing page visuals</span>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                              <div className="flex -space-x-1.5">
                                <div className="w-4 h-4 rounded-full bg-pink-100 border border-white"></div>
                                <div className="w-4 h-4 rounded-full bg-blue-100 border border-white"></div>
                              </div>
                              <span className="text-[9px] text-gray-400 font-medium">Oct 24</span>
                            </div>
                          </div>

                          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm opacity-60">
                            <div className="h-2 w-16 bg-gray-100 rounded mb-2"></div>
                            <div className="h-3 w-full bg-gray-50 rounded"></div>
                          </div>
                        </div>

                        {/* Column 2: In Progress */}
                        <div className="flex-1 flex flex-col gap-2.5 min-w-0">
                          <div className="flex items-center justify-between px-1">
                            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">In Progress</span>
                            <span className="bg-blue-50 text-blue-600 text-[9px] px-1.5 py-0.5 rounded-full font-medium">1</span>
                          </div>

                          <div className="bg-white p-3 rounded-xl border-l-2 border-l-blue-500 border-y border-r border-gray-100 shadow-sm cursor-default">
                            <span className="text-xs font-semibold text-gray-800 block mb-1">Client Meeting</span>
                            <p className="text-[10px] text-gray-500 leading-tight mb-2">Discuss Q4 roadmap & requirements</p>
                            <div className="flex items-center gap-1 text-[9px] text-blue-600 font-medium bg-blue-50 w-fit px-1.5 py-0.5 rounded">
                              <Activity className="w-2.5 h-2.5" />
                              <span>In Progress</span>
                            </div>
                          </div>
                        </div>

                        {/* Column 3: Done */}
                        <div className="flex-1 flex flex-col gap-2.5 min-w-0">
                          <div className="flex items-center justify-between px-1">
                            <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Done</span>
                            <span className="bg-emerald-50 text-emerald-600 text-[9px] px-1.5 py-0.5 rounded-full font-medium">12</span>
                          </div>
                          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl h-20 flex items-center justify-center">
                            <span className="text-[9px] text-gray-400 font-medium">Drop here</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Card 2: Document UI */}
                  <Card customClass="bg-white border border-gray-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden rounded-3xl">
                    <div className="h-full flex flex-col bg-white">
                      <div className="flex justify-between items-center p-6 pb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                            <Layout className="w-4 h-4" />
                          </div>
                          <h3 className="font-bold text-gray-900 text-sm">Documents</h3>
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors shadow-md shadow-blue-600/20 flex items-center gap-1.5">
                          <Plus className="w-3 h-3" /> New
                        </button>
                      </div>

                      <div className="flex gap-6 px-6 border-b border-gray-100 mb-5">
                        <button className="text-xs font-medium text-blue-600 border-b-2 border-blue-600 pb-2.5 -mb-px">Recent</button>
                        <button className="text-xs font-medium text-gray-400 hover:text-gray-600 pb-2.5 transition-colors">Shared</button>
                        <button className="text-xs font-medium text-gray-400 hover:text-gray-600 pb-2.5 transition-colors">Archived</button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 px-6">
                        {/* Doc Item 1 */}
                        <div className="group cursor-pointer">
                          <div className="aspect-[4/3] bg-gray-50 rounded-xl mb-2.5 border border-gray-100 group-hover:border-blue-200 group-hover:bg-blue-50/30 transition-all flex items-center justify-center relative overflow-hidden">
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-blue-600">
                                <MoreHorizontal className="w-3 h-3" />
                              </div>
                            </div>
                            <FileText className="w-8 h-8 text-gray-300 group-hover:text-blue-500 transition-colors shadow-sm" />
                          </div>
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-semibold text-xs text-gray-900 group-hover:text-blue-600 transition-colors">Marketing Plan</div>
                              <div className="text-[10px] text-gray-400 mt-0.5">Updated 2m ago</div>
                            </div>
                          </div>
                        </div>

                        {/* Doc Item 2 */}
                        <div className="group cursor-pointer">
                          <div className="aspect-[4/3] bg-gray-50 rounded-xl mb-2.5 border border-gray-100 flex items-center justify-center">
                            <div className="w-8 h-8 rounded bg-white shadow-sm flex items-center justify-center opacity-50">
                              <span className="text-[8px] font-bold text-gray-300">PDF</span>
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-xs text-gray-900">Q4 Report</div>
                            <div className="text-[10px] text-gray-400 mt-0.5">Updated 2h ago</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Card 3: Calendar UI */}
                  <Card customClass="bg-white border border-gray-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden rounded-3xl">
                    <div className="h-full flex flex-col p-5 bg-white">
                      <div className="flex justify-between items-center mb-5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-gray-900 text-sm">February</span>
                        </div>
                        <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-0.5 border border-gray-100">
                          <button className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600"><ChevronLeft className="w-3 h-3" /></button>
                          <button className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600"><ChevronRight className="w-3 h-3" /></button>
                        </div>
                      </div>

                      {/* Calendar Grid */}
                      <div className="flex-1 flex flex-col">
                        <div className="grid grid-cols-7 mb-3 text-center">
                          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                            <div key={i} className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{d}</div>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-y-2 gap-x-1 flex-1 text-center text-xs text-gray-600">
                          {/* Empty start days */}
                          <div className="p-1"></div><div className="p-1"></div>

                          {/* Days 1-6 */}
                          {[1, 2, 3, 4, 5, 6].map(d => (
                            <div key={d} className="h-9 p-1 flex items-start justify-start text-[9px] font-medium text-gray-500 hover:bg-gray-50 rounded-md transition-colors">
                              {d}
                            </div>
                          ))}

                          {/* Day 7 (Selected) */}
                          <div className="h-9 p-1 flex items-start justify-start relative bg-purple-600 rounded-lg shadow-lg shadow-purple-500/30">
                            <span className="text-[9px] font-bold text-white z-10">7</span>
                          </div>

                          {/* Days 8-12 */}
                          {[8, 9, 10, 11, 12].map(d => (
                            <div key={d} className="h-9 p-1 flex items-start justify-start text-[9px] font-medium text-gray-500 hover:bg-gray-50 rounded-md transition-colors">
                              {d}
                            </div>
                          ))}

                          {/* Day 13 (Dot) */}
                          <div className="h-9 p-1 flex flex-col items-start justify-between hover:bg-gray-50 rounded-md transition-colors cursor-pointer">
                            <span className="text-[9px] font-medium text-gray-500">13</span>
                            <div className="w-1 h-1 rounded-full bg-purple-500 mb-1 ml-1"></div>
                          </div>

                          {/* Days 14-19 */}
                          {[14, 15, 16, 17, 18, 19].map(d => (
                            <div key={d} className="h-9 p-1 flex items-start justify-start text-[9px] font-medium text-gray-500 hover:bg-gray-50 rounded-md transition-colors">
                              {d}
                            </div>
                          ))}

                          {/* Day 20 (Event) */}
                          <div className="h-9 p-1 flex flex-col items-start justify-between hover:bg-gray-50 rounded-md transition-colors cursor-pointer group">
                            <span className="text-[9px] font-medium text-gray-500">20</span>
                            <div className="w-full bg-purple-50 rounded border border-purple-100 flex items-center px-1.5 py-0.5 shadow-sm">
                              <div className="w-1 h-1 rounded-full bg-purple-500 mr-1.5 shrink-0"></div>
                              <span className="text-[7px] font-bold text-purple-700 truncate">Design Sprint</span>
                            </div>
                          </div>

                          {/* Day 21 */}
                          <div className="h-9 p-1 flex items-start justify-start text-[9px] font-medium text-gray-500 hover:bg-gray-50 rounded-md transition-colors">
                            21
                          </div>

                          {/* Days 22-28 */}
                          {[22, 23, 24, 25, 26, 27, 28].map(d => (
                            <div key={d} className="h-9 p-1 flex items-start justify-start text-[9px] font-medium text-gray-400">
                              {d}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>

                </CardSwap>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="scroll-mt-32 pt-16 pb-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.5 }}
            className="text-center mb-16 max-w-2xl mx-auto"
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              {["Everything", "you", "need", "to", "succeed"].map((word, index, array) => (
                <motion.span
                  key={index}
                  className={`inline-block ${index < array.length - 1 ? 'mr-2' : ''}`}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: 0.5,
                        ease: "easeOut"
                      }
                    }
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.h2>
            <motion.p
              className="text-lg text-gray-500 font-normal"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    delay: 0.5
                  }
                }
              }}
            >
              Powerful features designed to help you get more done. Simple, intuitive, and effective.
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            <motion.div
              variants={itemVariants}
              className="p-8 rounded-3xl bg-gray-50 hover:bg-white border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                <ListChecks className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Project Management</h3>
              <p className="text-gray-500 leading-relaxed font-normal">
                Organize tasks by project, switch between contexts seamlessly, and never miss a deadline.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="p-8 rounded-3xl bg-gray-50 hover:bg-white border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Prioritization</h3>
              <p className="text-gray-500 leading-relaxed font-normal">
                Automatically prioritize tasks based on urgency and importance. Focus on what matters most.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="p-8 rounded-3xl bg-gray-50 hover:bg-white border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Performance Tracking</h3>
              <p className="text-gray-500 leading-relaxed font-normal">
                Track your productivity, monitor completion rates, and visualize your efficiency over time.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="scroll-mt-32 pt-16 pb-40 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Get in Touch
            </h2>
            <p className="text-lg text-gray-500">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>

          <motion.div
            className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 relative z-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{
              opacity: 1,
              y: 0,
              transition: {
                type: "spring",
                bounce: 0.4,
                duration: 0.8
              }
            }}
            viewport={{ once: false }}
            animate={{
              y: [0, -10, 0],
              transition: {
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1 // Wait for entrance to finish roughly
              }
            }}
          >
            <motion.form
              onSubmit={handleContactSubmit}
              className="space-y-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false }}
              variants={{
                hidden: { opacity: 1 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.15,
                    delayChildren: 0.3
                  }
                }
              }}
            >
              <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02, borderColor: "#111827", boxShadow: "0px 0px 0px 4px rgba(17, 24, 39, 0.1)" }}
                  transition={{ duration: 0.2 }}
                  type="text"
                  id="name"
                  name="name"
                  value={contactForm.name}
                  onChange={handleContactChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none transition-colors"
                  placeholder="Your name"
                />
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02, borderColor: "#111827", boxShadow: "0px 0px 0px 4px rgba(17, 24, 39, 0.1)" }}
                  transition={{ duration: 0.2 }}
                  type="email"
                  id="email"
                  name="email"
                  value={contactForm.email}
                  onChange={handleContactChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none transition-colors"
                  placeholder="you@example.com"
                />
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <motion.textarea
                  whileFocus={{ scale: 1.02, borderColor: "#111827", boxShadow: "0px 0px 0px 4px rgba(17, 24, 39, 0.1)" }}
                  transition={{ duration: 0.2 }}
                  id="message"
                  name="message"
                  value={contactForm.message}
                  onChange={handleContactChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none transition-colors resize-none"
                  placeholder="How can we help?"
                ></motion.textarea>
              </motion.div>

              {contactMessage.text && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className={`p-4 rounded-xl ${contactMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}
                >
                  {contactMessage.text}
                </motion.div>
              )}

              <motion.button
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: ["0 10px 15px -3px rgba(0, 0, 0, 0.1)", "0 20px 25px -5px rgba(0, 0, 0, 0.1)", "0 10px 15px -3px rgba(0, 0, 0, 0.1)"]
                }}
                transition={{
                  boxShadow: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
                type="submit"
                disabled={contactLoading}
                className="w-full py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 shadow-lg shadow-gray-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {contactLoading ? 'Sending...' : 'Send Message'}
              </motion.button>
            </motion.form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white relative -mt-64">
        {/* Wave SVG */}
        <motion.div
          style={{ y: waveY }}
          className="absolute top-0 left-0 w-full overflow-hidden leading-[0] z-0"
        >
          <svg
            className="relative block w-full h-[200px] md:h-[300px]"
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,120 C400,100 800,10 1200,0 L1200,120 L0,120 Z"
              className="fill-gray-900"
            />
          </svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-48 pb-16 relative z-10"
        >
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-2xl font-bold">TaskFlow</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                The ultimate productivity platform built to help you achieve more.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-6">Resources</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Productivity Tips</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-16 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2026 TaskFlow. Empowering Great Work.</p>
          </div>
        </motion.div>
      </footer>
    </div>
  );
}
