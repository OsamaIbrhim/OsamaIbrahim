import { useState, FormEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';
import { ExternalLink, Code2, ChevronRight, X, Heart, Star, Send, Play, Layers, Box, Film, Volume2, Maximize, Code, Activity, Droplet, ShieldCheck, School, Server } from 'lucide-react';
import { projects } from '../data/projects';
import { Project } from '../types';

export default function Projects() {
  const [filter, setFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Ratings for Movie Hub Sandbox
  const [movieRating, setMovieRating] = useState<number>(4);
  const [watchlist, setWatchlist] = useState<string[]>([]);

  // Network of Trust Sandbox States
  const [studentName, setStudentName] = useState('');
  const [isMinting, setIsMinting] = useState(false);
  const [mintedCert, setMintedCert] = useState<string | null>(null);

  // API sandbox states
  const [selectedEndpoint, setSelectedEndpoint] = useState('GET /api/products');
  const [apiResponse, setApiResponse] = useState<any>({
    status: 'success',
    results: 3,
    data: [
      { id: '1', name: 'Premium Mechanical Keyboard', price: 129.99, stock: 45 },
      { id: '2', name: 'Ultra-Wide Gaming Monitor 34"', price: 449.99, stock: 12 },
      { id: '3', name: 'Ergonomic Standing Desk', price: 299.99, stock: 18 }
    ]
  });

  const filteredProjects = filter === 'all'
    ? projects
    : projects.filter(p => p.category === filter);

  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedProject]);

  const handleAddToWatchlist = (movie: string) => {
    if (watchlist.includes(movie)) {
      setWatchlist(watchlist.filter(item => item !== movie));
    } else {
      setWatchlist([...watchlist, movie]);
    }
  };

  return (
    <section id="projects" className="py-24 relative overflow-hidden bg-brand-surface/20">
      {/* Background glow decoration */}
      <div className="absolute right-[-200px] bottom-1/2 w-[500px] h-[500px] bg-brand-tertiary/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">

        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
            Featured Projects
          </h2>
          <p className="font-sans text-white/60 text-base sm:text-lg max-w-2xl mx-auto">
            A selection of my recent works across decentralized Web3 frameworks and MERN backends.
          </p>
        </div>

        {/* Categories Selector Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {['all', 'fullstack', 'frontend', 'backend', 'web3'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setFilter(cat);
                document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold tracking-wide uppercase transition-all duration-300 cursor-pointer border ${filter === cat
                ? 'bg-white text-[#020205] border-white shadow-[0_4px_20px_rgba(255,255,255,0.15)]'
                : 'bg-white/5 text-white/70 border-white/10 hover:border-white/25 hover:text-white hover:bg-white/10'
                }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>

        {/* Projects Grid Layout */}
        <AnimatePresence mode="wait">
          {filteredProjects.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full text-center py-20 text-white/50"
            >
              <Layers className="w-10 h-10 mx-auto mb-4 opacity-40" />
              <p className="text-lg">No projects in this category yet.</p>
            </motion.div>
          ) : (
            <motion.div
              key={filter}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project) => {
                  const isBlockchain = project.id === 'not';
                  const isDisney = project.id === 'disney-clone';
                  const isYoutube = project.id === 'youtube-clone';
                  const isDoctorApi = project.id === 'doctor-api';
                  const isBDP = project.id === 'blood-donation-platform';
                  const isEduChain = project.id === 'education-blockchain';

                  const hoverBorderClass =
                    isBlockchain ? 'hover:border-primary/40' :
                      isDisney ? 'hover:border-secondary/40' :
                        'hover:border-tertiary/40';

                  const accentTextClass =
                    isBlockchain ? 'group-hover:text-primary' :
                      isDisney ? 'group-hover:text-secondary' :
                        'group-hover:text-tertiary';

                  const bgAccentClass =
                    isBlockchain ? 'bg-primary/10 border-primary/20 text-primary' :
                      isDisney ? 'bg-secondary/10 border-secondary/20 text-secondary' :
                        'bg-tertiary/10 border-tertiary/20 text-tertiary';

                  const btnHoverClass =
                    isBlockchain ? 'hover:bg-primary/20 hover:border-primary/40 text-on-surface hover:text-primary' :
                      isDisney ? 'hover:bg-secondary/20 hover:border-secondary/40 text-on-surface hover:text-secondary' :
                        'hover:bg-tertiary/20 hover:border-tertiary/40 text-on-surface hover:text-tertiary';

                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      className={`glass-panel rounded-2xl overflow-hidden group flex flex-col h-full border border-white/5 ${hoverBorderClass} transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]`}
                    >
                      {/* Project Image Panel */}
                      <div className="h-56 bg-surface-container-lowest relative overflow-hidden flex items-center justify-center p-6">
                        <div className="absolute inset-0 bg-gradient-to-br from-surface-container to-background opacity-80"></div>

                        {/* Render BDP Mockup */}
                        {isBDP && (
                          <div className="relative z-10 w-full h-full border border-white/10 rounded-xl bg-surface-container/40 backdrop-blur-sm overflow-hidden flex flex-col p-3">
                            <div className="absolute inset-0 flex items-center justify-center opacity-20">
                              <Activity className="w-full h-16 text-rose-500" strokeWidth={1.5} />
                            </div>

                            <div className="relative z-10 grid grid-cols-2 gap-2 mb-2">
                              <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                                <div className="w-8 h-1.5 bg-rose-500/60 rounded mb-1.5" />
                                <div className="w-12 h-1 bg-white/10 rounded" />
                              </div>
                              <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                                <div className="w-6 h-1.5 bg-white/30 rounded mb-1.5" />
                                <div className="w-10 h-1 bg-white/10 rounded" />
                              </div>
                            </div>

                            <div className="relative z-10 flex-1 flex items-center justify-center">
                              <Droplet
                                className="w-16 h-16 text-rose-500 fill-rose-500/30 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)] group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                          </div>
                        )}

                        {/* Render Disney+ Clone Mockup */}
                        {isDisney && (
                          <div className="relative z-10 w-full h-full border border-white/10 rounded-xl bg-surface-container/50 backdrop-blur-sm overflow-hidden flex flex-col">
                            <div className="h-8 bg-surface-container/80 border-b border-white/5 flex items-center px-4 gap-2">
                              <div className="w-2 h-2 rounded-full bg-white/20"></div>
                              <div className="w-16 h-2 rounded bg-white/10 ml-2"></div>
                              <div className="ml-auto flex gap-1">
                                <div className="w-4 h-4 rounded bg-white/10"></div>
                              </div>
                            </div>
                            <div className="flex-1 p-3 flex flex-col gap-3">
                              <div className="h-1/2 w-full bg-gradient-to-r from-secondary/20 to-transparent rounded-lg relative overflow-hidden">
                                <div className="absolute bottom-2 left-2 w-20 h-4 bg-white/20 rounded"></div>
                              </div>
                              <div className="flex gap-2 h-1/3">
                                <div className="w-1/3 h-full bg-white/5 rounded"></div>
                                <div className="w-1/3 h-full bg-white/5 rounded"></div>
                                <div className="w-1/3 h-full bg-white/5 rounded"></div>
                              </div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <Film className="text-6xl text-secondary drop-shadow-[0_0_15px_rgba(169,199,255,0.5)] scale-75 group-hover:scale-150 transition-transform duration-500">
                                movie
                              </Film>
                            </div>
                          </div>
                        )}

                        {/* Render YouTube Clone Mockup */}
                        {isYoutube && (
                          <div className="relative z-10 w-full h-full border border-white/10 rounded-xl bg-surface-container/40 backdrop-blur-sm overflow-hidden flex flex-col justify-end p-3">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
                                <Play className="material-symbols-outlined text-white pl-1">play_arrow</Play>
                              </div>
                            </div>
                            <div className="w-full h-1 bg-white/10 rounded-full mb-3 relative">
                              <div className="absolute left-0 top-0 h-full w-1/3 bg-tertiary rounded-full"></div>
                              <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full"></div>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-white/50">
                              <span>02:14</span>
                              <div className="flex gap-2">
                                <span className="material-symbols-outlined text-[14px]">volume_up</span>
                                <span className="material-symbols-outlined text-[14px]">fullscreen</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Render Network of Trust Mockup */}
                        {isBlockchain && (
                          <div className="relative z-10 w-full h-full border border-white/10 rounded-xl bg-surface-container/30 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                            <svg
                              className="absolute inset-0 w-full h-full text-primary opacity-20"
                              viewBox="0 0 200 120"
                              fill="none"
                              stroke="currentColor"
                            >
                              <path d="M40 30 L100 60 M100 60 L160 30 M40 90 L100 60 M100 60 L160 90 M40 30 L40 90 M160 30 L160 90" strokeWidth="1" />

                              <circle cx="40" cy="30" r="6" fill="currentColor" />
                              <circle cx="160" cy="30" r="6" fill="currentColor" />
                              <circle cx="40" cy="90" r="6" fill="currentColor" />
                              <circle cx="160" cy="90" r="6" fill="currentColor" />
                              <circle cx="100" cy="60" r="9" fill="currentColor" />
                            </svg>
                            <ShieldCheck
                              className="relative z-10 w-16 h-16 text-primary drop-shadow-[0_0_15px_rgba(0,210,255,0.5)] group-hover:scale-110 transition-transform duration-500"
                              strokeWidth={1.5}
                            />
                          </div>
                        )}

                        {/* Render Education Blockchain Mockup */}
                        {isEduChain && (
                          <div className="relative z-10 w-full h-full border border-white/10 rounded-xl bg-surface-container/30 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-20">
                              {[0, 1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center">
                                  <div className="w-8 h-8 border-2 border-primary rounded-md rotate-45" />
                                  {i < 3 && <div className="w-3 h-0.5 bg-primary" />}
                                </div>
                              ))}
                            </div>

                            <School className="text-6xl text-primary drop-shadow-[0_0_15px_rgba(0,210,255,0.5)] group-hover:scale-110 transition-transform duration-500 relative z-10">
                              school
                            </School>
                          </div>
                        )}

                        {/* Render Doctor API Mockup */}
                        {isDoctorApi && (
                          <div className="relative z-10 w-full h-full border border-white/10 rounded-xl bg-surface-container/50 backdrop-blur-sm overflow-hidden flex flex-col">
                            <div className="h-7 bg-surface-container/80 border-b border-white/5 flex items-center px-3 gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-rose-500/60" />
                              <div className="w-2 h-2 rounded-full bg-amber-400/60" />
                              <div className="w-2 h-2 rounded-full bg-emerald-500/60" />
                              <span className="ml-2 text-[9px] font-mono text-white/40">api.routes.js</span>
                            </div>
                            <div className="flex-1 p-3 flex flex-col gap-2 font-mono">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">GET</span>
                                <div className="h-1.5 w-20 bg-white/15 rounded" />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary">POST</span>
                                <div className="h-1.5 w-16 bg-white/15 rounded" />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-400">PUT</span>
                                <div className="h-1.5 w-24 bg-white/15 rounded" />
                              </div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <Server className="text-6xl text-tertiary drop-shadow-[0_0_15px_rgba(0,210,255,0.5)] scale-75 group-hover:scale-100 transition-transform duration-500">
                                api
                              </Server>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Info Text Body */}
                      <div className="p-8 flex flex-col flex-1">
                        <h3 className={`font-display text-2xl font-semibold text-on-surface mb-3 ${accentTextClass} transition-colors`}>
                          {project.title}
                        </h3>
                        <p className="text-on-surface-variant text-base mb-6 flex-1 leading-relaxed">
                          {project.description}
                        </p>

                        {/* Tech Tags chips row */}
                        <div className="flex flex-wrap gap-2 mb-8">
                          {project.tags.slice(0, 3).map((tag, tIndex) => {
                            const isFirst = tIndex === 0;
                            return (
                              <span
                                key={tIndex}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide border ${isFirst
                                  ? bgAccentClass
                                  : 'bg-surface-container border-white/5 text-on-surface-variant'
                                  }`}
                              >
                                {tag}
                              </span>
                            );
                          })}
                        </div>

                        {/* Interactive Button row */}
                        <div className="flex items-center gap-3 mt-auto">
                          <button
                            onClick={() => setSelectedProject(project)}
                            className={`flex-1 bg-surface-container border border-white/5 ${btnHoverClass} text-sm font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer`}
                          >
                            <ExternalLink  className=" text-lg">open_in_new</ExternalLink> Live Demo
                          </button>
                          <a
                            href={project.githubUrl}
                            className="w-12 h-10 bg-surface-container hover:bg-surface-container-high border border-white/5 text-on-surface-variant hover:text-on-surface rounded-lg flex items-center justify-center transition-all duration-300 cursor-pointer"
                            title="GitHub Repository"
                          >
                            <Code  className="material-symbols-outlined text-lg">code</Code >
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Project Details Modal / Interactive Sandbox Engine */}
        {createPortal(
          <AnimatePresence>
            {selectedProject && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setSelectedProject(null);
                  setMintedCert(null);
                  setStudentName('');
                }}
                className="fixed inset-0 z-50 bg-brand-bg/85 backdrop-blur-md 
                flex items-center justify-center p-4 overflow-y-auto"
              >
                <motion.div
                  initial={{ scale: 0.95, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                  className="bg-brand-surface border border-white/10 
                  rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto 
                  shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative"
                >
                  {/* Close Button */}
                  <button
                    onClick={() => {
                      setSelectedProject(null);
                      setMintedCert(null);
                      setStudentName('');
                    }}
                    className="absolute right-4 top-4 z-50 w-9 h-9 rounded-full bg-brand-surface 
                    border border-white/10 hover:border-white/30 text-white flex items-center justify-center 
                    transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Hero Header Cover */}
                  <div className="relative h-48 md:h-64 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t 
                    from-brand-surface via-brand-surface/40 to-transparent z-10 pointer-events-none" />
                    <img
                      src={selectedProject.image}
                      alt={selectedProject.title}
                      className="w-full h-full object-cover opacity-45"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-6 left-6 md:left-8 z-10 space-y-1">
                      <span className="px-3 py-1 rounded-full bg-brand-primary/20 
                      text-brand-primary text-xs font-semibold uppercase tracking-wider 
                      border border-brand-primary/30">
                        {selectedProject.category}
                      </span>
                      <h3 className="font-display text-2xl md:text-3xl font-extrabold text-white">
                        {selectedProject.title}
                      </h3>
                    </div>
                  </div>

                  {/* Content Details Grid */}
                  <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Left Main Overview column */}
                    <div className="md:col-span-7 space-y-6">
                      <div className="space-y-3">
                        <h4 className="text-sm uppercase tracking-wider font-semibold 
                        text-brand-primary"
                        >
                          Project Overview
                        </h4>
                        <p className="text-on-surface-variant text-sm md:text-base leading-relaxed font-sans">
                          {selectedProject.longDescription}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm uppercase tracking-wider font-semibold text-brand-primary"
                        >
                          Architectural Accomplishments
                        </h4>
                        <ul className="space-y-2.5 text-on-surface-variant text-sm font-sans">
                          {selectedProject.highlights.map((item, index) => (
                            <li key={index} className="flex items-start gap-2.5">
                              <ChevronRight className="w-4 h-4 text-brand-primary mt-1 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm uppercase tracking-wider font-semibold text-brand-primary">Full Tech Stack</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedProject.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-3 py-1.5 rounded-lg bg-brand-surface-high/60 border border-white/5 text-white text-xs font-semibold font-mono"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Live Interactive Sandbox Widget Column */}
                    <div className="md:col-span-5 bg-brand-surface-high/30 rounded-xl border border-white/5 p-6 space-y-5">
                      <div className="border-b border-white/5 pb-2">
                        <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider font-mono">Live Interactive Playground</span>
                        <h4 className="font-display text-base font-extrabold text-white">Sandbox</h4>
                      </div>

                      {/* Movie Hub Sandbox */}
                      {selectedProject.id === 'mern-movie-hub' && (
                        <div className="space-y-4">
                          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                            <p className="text-xs text-on-surface-variant">Click to test the watchlist persistence & user feedback middleware.</p>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-white font-medium">Inception (2010)</span>
                                <button
                                  onClick={() => handleAddToWatchlist('Inception')}
                                  className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase cursor-pointer ${watchlist.includes('Inception') ? 'bg-rose-500 text-white' : 'bg-brand-primary/20 text-brand-primary'
                                    }`}
                                >
                                  {watchlist.includes('Inception') ? 'Remove' : '+ Watchlist'}
                                </button>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-white font-medium">Interstellar (2014)</span>
                                <button
                                  onClick={() => handleAddToWatchlist('Interstellar')}
                                  className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase cursor-pointer ${watchlist.includes('Interstellar') ? 'bg-rose-500 text-white' : 'bg-brand-primary/20 text-brand-primary'
                                    }`}
                                >
                                  {watchlist.includes('Interstellar') ? 'Remove' : '+ Watchlist'}
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <span className="text-xs text-on-surface-variant block">Submit Movie Score:</span>
                            <div className="flex gap-1.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => setMovieRating(star)}
                                  className="text-yellow-400 hover:scale-110 transition-transform cursor-pointer"
                                >
                                  <Star className={`w-5 h-5 ${star <= movieRating ? 'fill-yellow-400' : 'text-gray-600'}`} />
                                </button>
                              ))}
                            </div>
                            <span className="text-[10px] text-brand-primary font-mono block">Watchlist count: {watchlist.length} items curated.</span>
                          </div>
                        </div>
                      )}

                      {/* Disney+ Clone Sandbox */}
                      {selectedProject.id === 'disney-clone' && (
                        <div className="space-y-4">
                          <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-center space-y-3">
                            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-brand-surface flex items-center justify-center border border-white/5">
                              <Play className="w-10 h-10 text-brand-primary animate-pulse" />
                              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[10px] text-white/60">
                                <span>Streaming Live Preview</span>
                                <span>0:45 / 2:30</span>
                              </div>
                            </div>
                            <span className="text-xs text-on-surface-variant block">Responsive movie details, dynamic row category loaders.</span>
                          </div>
                        </div>
                      )}

                      {/* YouTube Clone Sandbox */}
                      {selectedProject.id === 'youtube-clone' && (
                        <div className="space-y-4">
                          <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-center space-y-3">
                            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-brand-surface flex items-center justify-center border border-white/5">
                              <Play className="w-10 h-10 text-brand-tertiary animate-pulse" />
                              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[10px] text-white/60">
                                <span>RapidAPI V3 Integration</span>
                                <span>Live Feed Active</span>
                              </div>
                            </div>
                            <span className="text-xs text-on-surface-variant block">Debounced query handlers fetching related videos in real-time.</span>
                          </div>
                        </div>
                      )}

                      {/* Buttons footer */}
                      <div className="pt-2 flex gap-3">
                        {selectedProject.isUpcoming ? (
                          <div className="relative flex-1">
                            <span className="absolute -top-2 -right-2 z-10 px-2 py-0.5 rounded-full bg-amber-400 text-[#020205] text-[9px] font-extrabold uppercase tracking-wider shadow-lg">
                              Upcoming
                            </span>
                            <span className="block w-full bg-brand-primary/20 text-white/50 border border-brand-primary/30 py-2.5 rounded-xl text-center text-xs font-bold tracking-wide uppercase cursor-not-allowed select-none">
                              Launch Application
                            </span>
                          </div>
                        ) : (
                          <a
                            href={selectedProject.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 bg-brand-primary text-brand-bg hover:shadow-[0_0_20px_rgba(0,210,255,0.3)] py-2.5 rounded-xl text-center text-xs font-bold tracking-wide uppercase transition-all duration-300"
                          >
                            Launch Application
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
      </div>
    </section>
  );
}
