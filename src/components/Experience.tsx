import { motion } from 'motion/react';
import { Briefcase, ArrowRight } from 'lucide-react';
import { ExperienceItem } from '../types';

const experiences: ExperienceItem[] = [
  {
    role: 'Full Stack Developer',
    company: 'DigiCrafterz',
    period: 'May 2024 – Dec 2024',
    project: 'Project: Sendifier CRM Platform',
    highlights: [
      'Developed and maintained features for Sendifier CRM using the MERN stack.',
      'Designed efficient, normalized, and optimized database schemas in MongoDB.',
      'Implemented robust and secure RESTful API endpoints with Node.js and Express.js.',
      'Built dynamic, intuitive, and highly responsive UI components with React.js.'
    ]
  }
];

export default function Experience() {
  return (
    <section id="experience" className="py-24 relative overflow-hidden">
      {/* Background visual helpers */}
      <div className="absolute left-[-200px] top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 md:px-8">
        
        {/* Header Block */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
            Professional Experience
          </h2>
          <p className="font-sans text-white/60 text-base sm:text-lg max-w-2xl mx-auto">
            My journey in building production-ready scalable applications.
          </p>
        </div>

        {/* Timeline Engine */}
        <div className="relative pl-6 md:pl-0 space-y-12 before:content-[''] before:absolute before:left-[11px] md:before:left-1/2 md:before:-translate-x-1/2 before:top-4 before:bottom-4 before:w-[2px] before:bg-gradient-to-b before:from-brand-primary before:via-brand-secondary/50 before:to-transparent">
          
          {experiences.map((exp, i) => {
            const isEven = i % 2 === 0;
            return (
              <div key={i} className="relative md:flex items-center justify-between group">
                
                {/* Desktop layout left-aligned spacer/timeframe */}
                <div className={`hidden md:block w-[45%] ${isEven ? 'text-right pr-12' : 'order-1 pl-12'}`}>
                  <motion.span
                    initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="inline-block px-4 py-1.5 rounded-full bg-white/5 text-brand-primary font-semibold text-xs border border-white/10 shadow-lg label-caps"
                  >
                    {exp.period}
                  </motion.span>
                </div>

                {/* Pulsing Central Timeline Node */}
                <div className="absolute left-[-20px] md:left-1/2 md:-translate-x-1/2 w-6 h-6 rounded-full bg-brand-bg border-4 border-brand-primary z-10 shadow-[0_0_15px_rgba(139,92,246,0.6)] group-hover:scale-125 transition-transform duration-300" />

                {/* Experience Card */}
                <div className={`w-full md:w-[45%] ${isEven ? 'md:pl-12' : 'md:pr-12'}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="glass-panel overflow-hidden rounded-2xl border border-white/5 hover:border-brand-primary/30 transition-all duration-300 relative group shadow-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                  >
                    {/* Visual Header Mockup for CRM / Backend Platform */}
                    <div className="h-56 bg-brand-surface/40 relative overflow-hidden flex items-center justify-center p-6 border-b border-white/5">
                      <div className="absolute inset-0 bg-gradient-to-br from-surface-container to-background opacity-80"></div>
                      <div className="relative z-10 w-full h-full border border-white/10 rounded-xl bg-surface-container/50 backdrop-blur-sm overflow-hidden flex flex-col justify-between p-4 font-mono text-[10px]">
                        {/* CRM Mockup Top Bar */}
                        <div className="flex justify-between items-center text-white/40 border-b border-white/5 pb-1.5">
                          <div className="flex gap-1.5 items-center">
                            <span className="w-2 h-2 rounded-full bg-red-500/80"></span>
                            <span className="w-2 h-2 rounded-full bg-yellow-500/80"></span>
                            <span className="w-2 h-2 rounded-full bg-green-500/80"></span>
                          </div>
                          <div className="text-[9px] uppercase tracking-wider font-semibold text-white/55">Sendifier_CRM_Engine</div>
                          <div className="w-6"></div>
                        </div>
                        
                        {/* Active Pipeline Flow */}
                        <div className="flex-1 py-2 flex flex-col justify-center gap-2">
                          <div className="flex justify-between items-center bg-white/5 px-2.5 py-1.5 rounded border border-white/5">
                            <span className="text-white/60 font-mono">POST /api/crm/leads</span>
                            <span className="text-green-400 font-bold">201 OK</span>
                          </div>
                          <div className="flex justify-between items-center bg-white/5 px-2.5 py-1.5 rounded border border-white/5">
                            <span className="text-white/60 font-mono">MongoDB Cluster</span>
                            <span className="text-primary font-bold animate-pulse">CONNECTED</span>
                          </div>
                        </div>

                        {/* Sparklines / Performance indicator */}
                        <div className="flex justify-between items-center text-white/40 pt-1.5 border-t border-white/5 text-[9px]">
                          <span>Pipeline Latency: 12ms</span>
                          <div className="flex items-end gap-1 h-3">
                            <span className="h-2 w-1 bg-primary/40 rounded-sm"></span>
                            <span className="h-2.5 w-1 bg-primary/60 rounded-sm"></span>
                            <span className="h-3 w-1 bg-primary rounded-sm"></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 sm:p-8">
                      {/* Mobile Timeframe badge */}
                      <div className="md:hidden mb-4">
                        <span className="inline-block px-3 py-1.5 rounded-full bg-white/5 text-brand-primary font-semibold text-xs border border-white/10 shadow label-caps">
                          {exp.period}
                        </span>
                      </div>

                      {/* Role Header */}
                      <div className="flex items-center gap-3.5 mb-2">
                        <div className="p-2.5 rounded-xl bg-brand-primary/10 border border-brand-primary/15 text-brand-primary group-hover:scale-110 transition-transform">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-display text-xl sm:text-2xl font-extrabold text-white group-hover:text-brand-primary transition-colors">
                            {exp.role}
                          </h3>
                          <p className="text-brand-primary font-semibold text-base">
                            {exp.company}
                          </p>
                        </div>
                      </div>

                      {/* Project subtitle if applicable */}
                      {exp.project && (
                        <div className="mt-3 mb-4 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                          <p className="text-white/80 font-medium text-xs font-mono">
                            {exp.project}
                          </p>
                        </div>
                      )}

                      {/* Bullet Achievements */}
                      <ul className="space-y-3 mt-4 text-white/70 text-sm sm:text-base leading-relaxed font-sans">
                        {exp.highlights.map((hl, k) => (
                          <li key={k} className="flex items-start gap-2.5">
                            <ArrowRight className="w-4 h-4 text-brand-primary shrink-0 mt-1" />
                            <span>{hl}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                </div>

              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
}
