import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, MapPin, Send, CheckCircle, Linkedin, Github, RefreshCw, Copy, Check, MessageCircle } from 'lucide-react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const EMAIL = 'osamaibrahim1948@gmail.com';
  const WHATSAPP = '201024276623';
  const WHATSAPP_DISPLAY = '+20 102 4276 623';

  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});

  const validateForm = () => {
    const newErrors: { name?: string; email?: string; message?: string } = {};
    if (!name.trim()) newErrors.name = 'Please provide your name.';
    if (!email.trim()) {
      newErrors.email = 'Please provide your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!message.trim()) newErrors.message = 'Please type a brief message.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCopyText = async (text: string, setFlag: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setFlag(true);
    setTimeout(() => setFlag(false), 2000);
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormState('submitting');

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: '2a956b8e-98f0-4d4b-9512-52e4723f225c',
          name,
          email,
          message,
          subject: `New portfolio message from ${name}`,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setFormState('success');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setFormState('idle');
        alert('Something went wrong. Please try again.');
      }
    } catch {
      setFormState('idle');
      alert('Network error. Please try again.');
    }
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      {/* Ambient background colors */}
      <div className="absolute left-[-200px] bottom-[-200px] w-[600px] h-[600px] bg-brand-primary/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute right-[-100px] top-[10%] w-[400px] h-[400px] bg-brand-tertiary/5 rounded-full blur-[110px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">

        {/* Header Block */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
            Let's Build Something Great Together
          </h2>
          <p className="font-sans text-white/60 text-base sm:text-lg max-w-2xl mx-auto">
            Have an open opportunity, a project concept, or just want to discuss Web3 architecture? Drop me a message.
          </p>
        </div>

        {/* Contact Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Left Column: Info cards */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="font-serif text-2xl font-light text-white tracking-tight mb-4">
              Direct Contact Details
            </h3>

            {/* Email card */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-start gap-4 hover:border-brand-primary/20 transition-all">
              <div className="relative group/icon shrink-0">
                <div className="p-3 bg-brand-primary/10 rounded-xl border border-brand-primary/15 text-brand-primary cursor-pointer">
                  <Mail className="w-5 h-5" />
                </div>

                <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-brand-surface border border-white/10 text-white text-xs whitespace-nowrap opacity-0 translate-y-1 group-hover/icon:opacity-100 group-hover/icon:translate-y-0 transition-all duration-200 shadow-xl z-20">
                  {EMAIL}
                  <span className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-brand-surface border-r border-b border-white/10 rotate-45 -mt-1" />
                </div>
              </div>

              <div className="space-y-1 flex-1 min-w-0">
                <span className="label-caps !text-[9px] text-white/50 block">Email Address</span>
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${EMAIL}`}
                    className="block text-white font-semibold text-sm sm:text-base hover:text-brand-primary transition-colors hover:underline truncate"
                  >
                    {EMAIL}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopyText(EMAIL, setCopiedEmail)}
                    title="Copy email"
                    className="shrink-0 p-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-brand-primary/40 text-white/60 hover:text-brand-primary transition-all cursor-pointer"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <AnimatePresence>
                  {copiedEmail && (
                    <motion.span
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-[10px] text-emerald-400 font-semibold block"
                    >
                      Copied to clipboard!
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Location card */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-start gap-4 hover:border-brand-primary/20 transition-all">
              <div className="p-3 bg-brand-secondary/10 rounded-xl border border-brand-secondary/15 text-brand-secondary shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="label-caps !text-[9px] text-white/50 block">Current Location</span>
                <p className="text-white font-semibold text-sm sm:text-base">
                  Egypt (Open to Remote & Relocation)
                </p>
              </div>
            </div>

            {/* Social profiles row */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 hover:border-brand-primary/20 transition-all">
              <span className="label-caps !text-[9px] text-white/50 block">Social Channels</span>
              <div className="flex gap-4">
                <a
                  href="https://www.linkedin.com/in/osamaibrhim"
                  target="_blank"
                  rel="noreferrer"
                  className="w-11 h-11 bg-white/5 border border-white/10 hover:border-brand-primary/40 hover:text-brand-primary text-white/70 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                  title="LinkedIn Profile"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="https://github.com/OsamaIbrhim"
                  target="_blank"
                  rel="noreferrer"
                  className="w-11 h-11 bg-white/5 border border-white/10 hover:border-brand-primary/40 hover:text-brand-primary text-white/70 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                  title="GitHub Profile"
                >
                  <Github className="w-5 h-5" />
                </a>
                {/* <a
                  href={`https://wa.me/${WHATSAPP}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-11 h-11 bg-white/5 border border-white/10 hover:border-brand-primary/40 hover:text-brand-primary text-white/70 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                  title="WhatsApp"
                >
                  <div className="relative group/wa shrink-0">
                    <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/15 text-emerald-400 cursor-pointer">

                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.518 5.26l-.999 3.648 3.97-1.042zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                      </svg>
                    </div>

                    <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-brand-surface border border-white/10 text-white text-xs whitespace-nowrap opacity-0 translate-y-1 group-hover/wa:opacity-100 group-hover/wa:translate-y-0 transition-all duration-200 shadow-xl z-20">
                      {WHATSAPP_DISPLAY}
                      <span className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-brand-surface border-r border-b border-white/10 rotate-45 -mt-1" />
                    </div>
                  </div>
                </a> */}
              </div>

              {/* WhatsApp card */}
              <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-start gap-4 hover:border-emerald-500/20 transition-all">

                <div className="relative group/wa shrink-0">
                  <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/15 text-emerald-400 cursor-pointer">

                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.518 5.26l-.999 3.648 3.97-1.042zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                  </div>

                  <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-brand-surface border border-white/10 text-white text-xs whitespace-nowrap opacity-0 translate-y-1 group-hover/wa:opacity-100 group-hover/wa:translate-y-0 transition-all duration-200 shadow-xl z-20">
                    {WHATSAPP_DISPLAY}
                    <span className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-brand-surface border-r border-b border-white/10 rotate-45 -mt-1" />
                  </div>
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <span className="label-caps !text-[9px] text-white/50 block">WhatsApp</span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/${WHATSAPP}`}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-white font-semibold text-sm sm:text-base hover:text-emerald-400 transition-colors hover:underline truncate"
                    >
                      {WHATSAPP_DISPLAY}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopyText(WHATSAPP_DISPLAY, setCopiedPhone)}
                      title="Copy number"
                      className="shrink-0 p-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-emerald-500/40 text-white/60 hover:text-emerald-400 transition-all cursor-pointer"
                    >
                      {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <AnimatePresence>
                    {copiedPhone && (
                      <motion.span
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-[10px] text-emerald-400 font-semibold block"
                      >
                        Copied to clipboard!
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Interaction Form */}
          <div className="lg:col-span-7">
            <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
              <h3 className="font-serif text-xl sm:text-2xl font-light text-white mb-6">
                Send a Quick Message
              </h3>

              <form onSubmit={handleSendMessage} className="space-y-6">

                {/* Name field */}
                <div>
                  <label htmlFor="name-input" className="block text-xs uppercase font-bold text-white/50 mb-2 label-caps">Your Full Name</label>
                  <input
                    id="name-input"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                    }}
                    placeholder="e.g. Osama Ibrahim"
                    className={`w-full bg-black/40 border ${errors.name ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-brand-primary'
                      } rounded-xl px-5 py-3.5 text-white text-sm sm:text-base focus:outline-none transition-all placeholder:text-white/30`}
                  />
                  {errors.name && (
                    <span className="text-xs text-rose-500 mt-1.5 block font-sans">{errors.name}</span>
                  )}
                </div>

                {/* Email field */}
                <div>
                  <label htmlFor="email-input" className="block text-xs uppercase font-bold text-white/50 mb-2 label-caps">Email Address</label>
                  <input
                    id="email-input"
                    type="text"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                    }}
                    placeholder="e.g. osama@example.com"
                    className={`w-full bg-black/40 border ${errors.email ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-brand-primary'
                      } rounded-xl px-5 py-3.5 text-white text-sm sm:text-base focus:outline-none transition-all placeholder:text-white/30`}
                  />
                  {errors.email && (
                    <span className="text-xs text-rose-500 mt-1.5 block font-sans">{errors.email}</span>
                  )}
                </div>

                {/* Message field */}
                <div>
                  <label htmlFor="message-input" className="block text-xs uppercase font-bold text-white/50 mb-2 label-caps">Message Contents</label>
                  <textarea
                    id="message-input"
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      if (errors.message) setErrors(prev => ({ ...prev, message: undefined }));
                    }}
                    placeholder="Hi Osama, I would love to chat about..."
                    rows={4}
                    className={`w-full bg-black/40 border ${errors.message ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-brand-primary'
                      } rounded-xl px-5 py-3.5 text-white text-sm sm:text-base focus:outline-none transition-all placeholder:text-white/30 resize-none`}
                  />
                  {errors.message && (
                    <span className="text-xs text-rose-500 mt-1.5 block font-sans">{errors.message}</span>
                  )}
                </div>

                {/* Action button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={formState === 'submitting'}
                    className="w-full bg-white text-[#020205] hover:bg-white/95 disabled:opacity-50 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-98 text-sm sm:text-base uppercase tracking-wider cursor-pointer"
                  >
                    {formState === 'submitting' ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin text-[#020205]" />
                        Simulating Secure Handshake...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-[#020205]" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Simulated Success Message Popup */}
              <AnimatePresence>
                {formState === 'success' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0 z-30 bg-brand-surface/95 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8 rounded-3xl"
                  >
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1, type: 'spring', damping: 15 }}
                    >
                      <CheckCircle className="w-14 h-14 text-emerald-400 mb-4" />
                    </motion.div>
                    <h4 className="font-display text-xl sm:text-2xl font-bold text-white mb-2">
                      Message Sent Successfully!
                    </h4>
                    <p className="text-white/60 text-sm font-sans mb-6 max-w-xs">
                      Your mock message was dispatched securely. Thank you for connecting with Osama.
                    </p>
                    <button
                      type="button"
                      onClick={() => setFormState('idle')}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div >
    </section >
  );
}
