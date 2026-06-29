import { motion } from 'motion/react';
import { Calendar, Cpu, Code2, Coins } from 'lucide-react';
import osamaAvatar from '../assets/images/osama_avatar.png';

export default function About() {
  const stats = [
    {
      value: '8+',
      label: 'Months Exp',
      icon: <Calendar className="w-5 h-5 text-brand-primary" />,
      glowColor: 'hover:border-brand-primary/40'
    },
    {
      value: '10+',
      label: 'RESTful APIs',
      icon: <Cpu className="w-5 h-5 text-brand-secondary" />,
      glowColor: 'hover:border-brand-secondary/40'
    },
    {
      label: 'MERN STACK',
      value: 'MERN',
      isIcon: true,
      icon: <Code2 className="w-8 h-8 text-brand-primary" />,
      glowColor: 'hover:border-brand-primary/40'
    },
    {
      label: 'WEB3 & DAPP',
      value: 'Web3',
      isIcon: true,
      icon: <Coins className="w-8 h-8 text-brand-tertiary" />,
      glowColor: 'hover:border-brand-tertiary/40'
    }
  ];

  return (
    <section id="about" className="py-24 relative overflow-hidden">
      {/* Background glow decoration */}
      <div className="absolute right-[-100px] top-[100px] w-[350px] h-[350px] bg-brand-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="glass-panel rounded-3xl p-8 md:p-16 relative overflow-hidden border-white/10 shadow-[0_12px_50px_rgba(0,0,0,0.6)]">
          
          {/* Subtle top background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-tertiary/10 rounded-full blur-[80px] pointer-events-none" />

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mb-12 text-white tracking-tight">
            About Me
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Portrait & Biography */}
            <div className="lg:col-span-6 space-y-8">
              {/* Desktop Portrait Frame */}
              <div className="hidden lg:block relative w-full max-w-[320px] aspect-[4/5] rounded-2xl overflow-hidden group shadow-2xl border border-white/10">
                <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-transparent to-transparent opacity-60 z-10" />
                <div className="absolute inset-0 bg-brand-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />
                <img
                  src={osamaAvatar}
                  alt="Osama Ibrahim"
                  className="bg-white/[0.02] backdrop-blur-md w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Responsive description blocks */}
              <div className="space-y-6 text-white/70 text-base sm:text-lg leading-relaxed font-sans">
                <p>
                  I am an early-career Full Stack Software Engineer with professional experience in building and deploying robust web applications. As a Computer Science graduate with a strong foundation in software engineering principles, I approach problem-solving with rigorous analysis and efficient architecture.
                </p>
                <p>
                  I specialize in creating efficient, scalable backends and intuitive, responsive frontends. I love bridging clean, human-centered UI with cryptographic Web3 integrations, bringing a holistic approach to every project I touch, from initial design concepts to cloud deployment.
                </p>
              </div>
            </div>

            {/* Right Column: Statistics Grid */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className={`bg-white/[0.02] backdrop-blur-md p-8 rounded-2xl border border-white/5 text-center transition-all duration-300 flex flex-col items-center justify-center gap-4 group ${stat.glowColor} hover:-translate-y-1 hover:bg-white/[0.04] shadow-lg`}
                >
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 group-hover:scale-110 group-hover:border-white/10 transition-transform">
                    {stat.icon}
                  </div>
                  
                  {stat.isIcon ? (
                    <div className="space-y-1">
                      <div className="font-display text-xl font-bold text-white tracking-tight">
                        {stat.value}
                      </div>
                      <div className="label-caps !text-[10px] text-white/50">
                        {stat.label}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="font-display text-4xl sm:text-5xl font-extrabold text-white">
                        {stat.value}
                      </div>
                      <div className="label-caps !text-[11px] text-white/50">
                        {stat.label}
                      </div>
                    </div>
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
