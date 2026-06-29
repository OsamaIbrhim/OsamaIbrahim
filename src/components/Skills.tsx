import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Server, Database, Coins, Settings, BookOpen, Sparkles, ChevronRight } from 'lucide-react';
import { skillCategories } from '../data/skills';
import { SkillItem } from '../types';

export default function Skills() {
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);

  // Map category strings to Lucide icon components
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'web':
        return <Globe className="w-6 h-6 text-brand-primary" />;
      case 'dns':
        return <Server className="w-6 h-6 text-brand-secondary" />;
      case 'database':
        return <Database className="w-6 h-6 text-brand-primary" />;
      case 'currency_bitcoin':
        return <Coins className="w-6 h-6 text-brand-tertiary" />;
      case 'build':
        return <Settings className="w-6 h-6 text-on-surface" />;
      case 'architecture':
        return <BookOpen className="w-6 h-6 text-brand-tertiary" />;
      default:
        return <Globe className="w-6 h-6" />;
    }
  };

  return (
    <section id="skills" className="py-24 relative overflow-hidden">
      {/* Background radial accent glow */}
      <div className="absolute left-[10%] top-[20%] w-[450px] h-[450px] bg-brand-primary/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        
        {/* Header Title */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
            Technical Arsenal
          </h2>
          <p className="font-sans text-white/60 text-base sm:text-lg max-w-2xl mx-auto">
            The programming languages, frameworks, and databases I use to bring fluid, production-ready web platforms to life.
          </p>
        </div>

        {/* Dynamic Skill Insight Panel */}
        <div className="mb-12">
          <AnimatePresence mode="wait">
            {selectedSkill ? (
              <motion.div
                key={selectedSkill.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl mx-auto p-5 rounded-2xl bg-brand-primary/10 border border-brand-primary/30 backdrop-blur-md flex items-start gap-4 shadow-[0_4px_30px_rgba(0,210,255,0.08)]"
              >
                <div className="p-2 rounded-lg bg-brand-primary/20 text-brand-primary shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 animate-spin-slow" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-display text-base font-bold text-white flex items-center gap-1.5">
                    {selectedSkill.name} <span className="text-[10px] uppercase font-bold text-brand-primary font-mono bg-brand-primary/15 px-1.5 py-0.5 rounded">Selected Insight</span>
                  </h4>
                  <p className="text-on-surface-variant text-xs sm:text-sm font-sans leading-relaxed">
                    {selectedSkill.description}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSkill(null)}
                  className="text-on-surface-variant hover:text-white ml-auto text-xs font-mono font-bold hover:underline cursor-pointer"
                >
                  Dismiss
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-xs text-white/50 font-mono italic"
              >
                💡 Protip: Click on any skill item below to unlock deep technical context.
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skillCategories.map((cat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Category Header */}
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform">
                    {getIcon(cat.icon)}
                  </div>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">
                    {cat.title}
                  </h3>
                </div>

                {/* Skill item pills */}
                <div className="flex flex-wrap gap-2.5">
                  {cat.skills.map((skill, sIdx) => {
                    const isSelected = selectedSkill?.name === skill.name;
                    return (
                      <button
                        key={sIdx}
                        onClick={() => setSelectedSkill(isSelected ? null : skill)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium font-sans border transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-white text-[#020205] border-white font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                            : 'bg-white/5 text-white/70 hover:text-brand-primary border-white/5 hover:border-brand-primary/20 hover:bg-white/10'
                        }`}
                      >
                        {skill.name}
                        <ChevronRight className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-all ${
                          isSelected ? 'opacity-100 text-[#020205] rotate-90' : 'text-brand-primary'
                        }`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
