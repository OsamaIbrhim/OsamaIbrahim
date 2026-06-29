import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, CheckCircle2, Cpu, Code2, Database, Globe, Layers, Sparkles } from 'lucide-react';

const codeSnippets = {
  typescript: `export const engineer = {
  name: 'Osama Ibrahim',
  role: 'Full Stack MERN Developer',
  stack: [
    'React', 'Node.js',
    'MongoDB', 'Solidity'
  ],
  build() {
    return 'Scalable Solutions';
  }
};`,
  solidity: `contract Credentials {
  struct Record {
    string hash;
    uint256 timestamp;
  }
  
  mapping(address => Record) public docs;

  function verify(string memory _hash) public {
    docs[msg.sender] = Record(_hash, block.timestamp);
  }
}`,
  telemetry: `[System Init] Booting stack...
[Database] MongoDB connection established.
[API] Listening on port 3000.
[Web3] Syncing contract with Sepolia.
[Status] Fully Operational.`
};

export default function Hero() {
  const [activeTab, setActiveTab] = useState<'typescript' | 'solidity' | 'telemetry'>('typescript');
  const [typingText, setTypingText] = useState('');
  const [systemUptime, setSystemUptime] = useState(0);
  const [cpuLoad, setCpuLoad] = useState(12);

  // Periodic updates for simulated telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemUptime(prev => prev + 1);
      setCpuLoad(Math.floor(Math.random() * 25) + 10);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Smooth typing effect for the active snippet
  useEffect(() => {
    let index = 0;
    const fullText = codeSnippets[activeTab];
    setTypingText('');

    const interval = setInterval(() => {
      if (index < fullText.length) {
        setTypingText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 12);

    return () => clearInterval(interval);
  }, [activeTab]);

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-[90vh] flex flex-col justify-center py-20 bg-gradient-premium overflow-hidden"
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-brand-primary/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-brand-tertiary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Left Column - Intro Information */}
        <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6 md:space-y-8">
          
          {/* Portrait & Available Badge row */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Portrait Avatar - matching second design beautifully */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative lg:hidden w-16 h-16 rounded-full border-2 border-brand-primary/30 p-0.5 overflow-hidden shadow-[0_0_20px_rgba(139,92,246,0.2)]"
            >
              <img
                src="/src/assets/images/os.ico"
                alt="Osama Ibrahim"
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
            >
              <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
              <span className="label-caps !text-[10px] text-white/75">
                Available for opportunities
              </span>
            </motion.div>
          </div>

          {/* Dynamic Headline */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="space-y-3"
          >
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white leading-[1.1] tracking-tight">
              Building Digital <br />
              <span className="text-gradient italic font-normal">Experiences</span>
            </h1>
          </motion.div>

          {/* Subheading description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="font-sans text-base sm:text-lg md:text-xl text-white/60 max-w-xl leading-relaxed"
          >
            Early-Career Full Stack Software Engineer bridging robust backend architectures with seamless frontend experiences. Passionate about Web3 and scalable applications with 8+ months of experience.
          </motion.p>

          {/* Interactive Actions */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-wrap gap-4 w-full sm:w-auto"
          >
            <button
              onClick={() => handleScrollTo('projects')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-[#020205] hover:bg-white/90 font-bold text-base px-8 py-4 rounded-full transition-all hover:scale-102 duration-300 cursor-pointer"
            >
              View Projects
              <ArrowRight className="w-4 h-4 text-[#020205]" />
            </button>
            <button
              onClick={() => handleScrollTo('contact')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent text-white border border-white/20 hover:border-white/50 hover:bg-white/5 font-semibold text-base px-8 py-4 rounded-full transition-all hover:scale-102 duration-300 cursor-pointer"
            >
              Contact Me
            </button>
          </motion.div>
        </div>

        {/* Right Column - Terminal Showcase */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="lg:col-span-5 relative w-full aspect-[4/3] md:aspect-[1.25] max-w-[550px] mx-auto z-10"
        >
          {/* Subtle frame border glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/20 to-brand-tertiary/10 rounded-2xl blur-xl opacity-80" />

          {/* Main Glass Panel */}
          <div className="glass-panel rounded-2xl w-full h-full relative overflow-hidden flex flex-col shadow-2xl border-white/10">
            
            {/* Terminal Top Window Bar */}
            <div className="bg-brand-surface/90 px-4 py-3.5 flex justify-between items-center border-b border-white/5">
              <div className="flex gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-red-500/80 hover:scale-105 transition-transform" />
                <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/80 hover:scale-105 transition-transform" />
                <div className="w-3.5 h-3.5 rounded-full bg-green-500/80 hover:scale-105 transition-transform" />
              </div>
              <div className="font-mono text-xs text-white/50">developer@osama-ibrahim:~</div>
              <div className="w-12" /> {/* spacer */}
            </div>

            {/* Dashboard / Telemetry Top Stats */}
            <div className="px-6 py-4 bg-brand-surface/40 flex justify-between items-center border-b border-white/5">
              <div className="space-y-0.5">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-white/40">System Status</div>
                <div className="text-sm font-bold text-brand-primary flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-primary animate-pulse" />
                  ONLINE
                </div>
              </div>
              
              {/* Tabs selector */}
              <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
                <button
                  onClick={() => setActiveTab('typescript')}
                  className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded transition-colors cursor-pointer ${
                    activeTab === 'typescript' ? 'bg-brand-primary/20 text-brand-primary' : 'text-white/50 hover:text-white'
                  }`}
                >
                  Specs
                </button>
                <button
                  onClick={() => setActiveTab('solidity')}
                  className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded transition-colors cursor-pointer ${
                    activeTab === 'solidity' ? 'bg-brand-primary/20 text-brand-primary' : 'text-white/50 hover:text-white'
                  }`}
                >
                  Web3
                </button>
                <button
                  onClick={() => setActiveTab('telemetry')}
                  className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded transition-colors cursor-pointer ${
                    activeTab === 'telemetry' ? 'bg-brand-primary/20 text-brand-primary' : 'text-white/50 hover:text-white'
                  }`}
                >
                  Logs
                </button>
              </div>
            </div>

            {/* Code Snippet / Logger Body */}
            <div className="p-6 flex-1 flex flex-col justify-between overflow-hidden bg-brand-bg/60 font-mono text-xs relative">
              <div className="absolute right-4 top-4 text-[10px] text-white/30 select-none uppercase">
                {activeTab === 'typescript' ? 'TypeScript' : activeTab === 'solidity' ? 'Solidity' : 'Live Output'}
              </div>

              <div className="overflow-y-auto max-h-[160px] md:max-h-[180px] scrollbar-thin text-white/80 leading-relaxed whitespace-pre pr-2">
                <code>
                  {activeTab === 'telemetry' ? (
                    <div className="space-y-1 text-green-400">
                      <div>{`> uptime: ${systemUptime}s | CPU Load: ${cpuLoad}%`}</div>
                      <div>{typingText}</div>
                    </div>
                  ) : activeTab === 'typescript' ? (
                    <div>
                      <span className="text-pink-400">export const</span> <span className="text-brand-primary font-bold">engineer</span> = &#123;
                      <br />
                      &nbsp;&nbsp;name: <span className="text-emerald-400">'Osama Ibrahim'</span>,
                      <br />
                      &nbsp;&nbsp;role: <span className="text-emerald-400">'Full Stack MERN Developer'</span>,
                      <br />
                      &nbsp;&nbsp;stack: [
                      <br />
                      &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">'React'</span>, <span className="text-emerald-400">'Node.js'</span>,
                      <br />
                      &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">'MongoDB'</span>, <span className="text-emerald-400">'Solidity'</span>
                      <br />
                      &nbsp;&nbsp;],
                      <br />
                      &nbsp;&nbsp;build() &#123;
                      <br />
                      &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400">return</span> <span className="text-emerald-400">'Scalable Solutions'</span>;
                      <br />
                      &nbsp;&nbsp;&#125;
                      <br />
                      &#125;;
                    </div>
                  ) : (
                    <div className="text-purple-300">
                      {typingText}
                    </div>
                  )}
                </code>
              </div>

              {/* Activity Sparkline (mock commits graph from screenshot) */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-end gap-1.5 h-12 justify-between">
                {[45, 60, 35, 75, 50, 95, 40, 85, 65, 80, 55, 30, 70, 90, 45].map((val, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${val}%` }}
                    transition={{
                      delay: i * 0.03,
                      type: 'spring',
                      stiffness: 80,
                      damping: 10,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      repeatDelay: 5 + Math.random() * 5
                    }}
                    className={`w-full rounded-sm ${
                      activeTab === 'solidity'
                        ? 'bg-brand-tertiary/40 group-hover:bg-brand-tertiary'
                        : activeTab === 'telemetry'
                        ? 'bg-emerald-500/40'
                        : 'bg-brand-primary/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
