import { motion } from 'motion/react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Education from './components/Education';
import Contact from './components/Contact';
import CursorWordTrail from './components/CursorWordTrail'
import { Mail, Linkedin, Github } from 'lucide-react';

export default function App() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-brand-bg text-white min-h-screen font-sans antialiased overflow-x-hidden selection:bg-brand-primary/30 selection:text-white">
      {/* Immersive Atmospheric Grid Overlays */}
      <div className="atmosphere" />
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      {/* Top sticky navbar */}
      <Navbar />

      {/* Core Portfolio Sections */}
      <main className="relative z-10">
        <CursorWordTrail />
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Education />
        <Contact />
      </main>

      {/* Professional Footer Component */}
      <footer className="relative z-10 border-t border-white/5 bg-brand-surface py-12 md:py-16 overflow-hidden">
        {/* Subtle decorative bottom glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[150px] bg-brand-primary/5 rounded-full blur-[90px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          
          {/* Logo & Credits block */}
          <div className="space-y-3 text-center md:text-left">
            <div className="flex justify-center md:justify-start items-center gap-2.5 font-display text-lg font-bold">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-brand-bg font-extrabold text-sm">
                O
              </div>
              <span className="text-white">Osama Ibrahim</span>
            </div>
            <p className="text-on-surface-variant text-xs sm:text-sm font-sans">
              Professional Full Stack MERN Developer Portfolio. Deployed securely.
            </p>
          </div>

          {/* Social Links Row */}
          <div className="flex flex-col items-center md:items-end gap-4">
            <div className="flex gap-4">
              <a
                href="mailto:osamaibrahim1948@gmail.com"
                className="w-10 h-10 rounded-lg bg-brand-surface-high border border-white/5 hover:border-brand-primary/30 text-on-surface-variant hover:text-brand-primary flex items-center justify-center transition-colors cursor-pointer"
                title="Send Email"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/osamaibrhim"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-lg bg-brand-surface-high border border-white/5 hover:border-brand-primary/30 text-on-surface-variant hover:text-brand-primary flex items-center justify-center transition-colors cursor-pointer"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/OsamaIbrhim"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-lg bg-brand-surface-high border border-white/5 hover:border-brand-primary/30 text-on-surface-variant hover:text-brand-primary flex items-center justify-center transition-colors cursor-pointer"
                title="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
            
            <span className="text-[11px] text-on-surface-variant/75 font-mono">
              &copy; {currentYear} Osama Ibrahim. All Rights Reserved.
            </span>
          </div>

        </div>
      </footer>
    </div>
  );
}
