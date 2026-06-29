import { motion } from 'motion/react';
import { GraduationCap, Award, ShieldCheck, Calendar } from 'lucide-react';
import { Certification } from '../types';

const certifications: Certification[] = [
  {
    title: 'The Complete 2024 Web Development Bootcamp',
    issuer: 'Udemy (Angela Yu)',
    year: '2024',
    verified: true
  },
  {
    title: 'MERN Stack Front To Back',
    issuer: 'Udemy (Brad Traversy)',
    year: '2024',
    verified: true
  },
  {
    title: "Ethereum and Solidity: The Complete Developer's Guide",
    issuer: 'Udemy (Stephen Grider)',
    year: '2024',
    verified: true
  }
];

export default function Education() {
  return (
    <section id="education" className="py-24 relative overflow-hidden bg-brand-surface/25">
      {/* Background decorations */}
      <div className="absolute right-[-150px] bottom-[10%] w-[400px] h-[400px] bg-brand-primary/5 rounded-full blur-[110px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
            Education & Credentials
          </h2>
          <p className="font-sans text-white/60 text-base sm:text-lg max-w-2xl mx-auto">
            Accredited qualifications and specialized bootcamps verifying my academic knowledge.
          </p>
        </div>

        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Academic Background */}
          <div className="lg:col-span-5 space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-brand-primary/10 rounded-xl border border-brand-primary/15 text-brand-primary">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl font-light text-white tracking-tight">
                Academic Degree
              </h3>
            </div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 relative group hover:border-brand-primary/20 transition-all duration-300"
            >
              <div className="absolute top-6 right-6 flex items-center gap-1 text-[10px] font-semibold text-brand-primary bg-white/5 px-2.5 py-1 rounded-full border border-white/10 label-caps">
                <Calendar className="w-3 h-3" />
                2020 - 2025
              </div>

              <span className="text-brand-primary font-bold text-sm tracking-widest uppercase block mb-2 font-sans">Menoufia University</span>
              <h4 className="font-display text-xl sm:text-2xl font-extrabold text-white mb-3">
                B.Sc. in Computer Science
              </h4>
              <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-6 font-sans">
                Focused on fundamental software engineering, computer architectures, and high-performance system designs. Graduated with robust theoretical insights coupled with proactive web technologies execution.
              </p>

              {/* Core Focus Fields */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <span className="text-xs uppercase font-bold text-white block">Core Curriculum Focus:</span>
                <div className="flex flex-wrap gap-2">
                  {['Data Structures', 'Algorithms', 'OOP', 'Database Management', 'Software Design', 'Operating Systems'].map((sub, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2.5 py-1 rounded-md bg-white/5 text-white/70 text-xs border border-white/5 font-mono"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Certifications */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-brand-secondary/10 rounded-xl border border-brand-secondary/15 text-brand-secondary">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl font-light text-white tracking-tight">
                Verified Credentials
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
              {certifications.map((cert, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-brand-secondary/30 transition-all duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group hover:-translate-y-1"
                >
                  <div className="space-y-1">
                    <h4 className="font-display text-base sm:text-lg font-bold text-white group-hover:text-brand-secondary transition-colors">
                      {cert.title}
                    </h4>
                    <p className="text-white/60 text-xs sm:text-sm font-sans flex items-center gap-1.5">
                      Issued by: <span className="text-white font-medium">{cert.issuer}</span>
                    </p>
                  </div>

                  {cert.verified && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/15 shrink-0 self-start sm:self-auto">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Verified
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
