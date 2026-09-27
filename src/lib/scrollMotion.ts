import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { setLenis } from './scroll';

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * Owns all scroll-linked motion. Components only mark elements with data
 * attributes; this sets up smooth scrolling and the effects in one place, so
 * reduced motion and small screens can switch everything off together.
 *
 *   data-split          heading lines rise out of a mask when they enter
 *   data-scrub-words    paragraph words brighten as you scroll through them
 *   data-scale-in       media grows from 0.82 to 1 while entering
 *   data-parallax="n"   drifts by n × its height while crossing the viewport
 *   data-hero-out       eases back and fades as the hero scrolls away
 *   .stack-card         featured project cards stack and recede (desktop)
 */
// The page is prerendered and fully visible before this runs (after a reload
// mid-page, or a deep link, that can be seconds in on a slow phone). Effects
// whose trigger point is already behind them must not jump: a reveal that has
// passed is skipped, and a scrub already under way eases into place instead of
// snapping.
const passed = (el: Element, at: number) => el.getBoundingClientRect().top < window.innerHeight * at;
const scrubFor = (el: Element, at: number) => (passed(el, at) ? 1 : true);

export function startScrollMotion() {
  ScrollTrigger.config({ ignoreMobileResize: true });
  const mm = gsap.matchMedia();

  mm.add(
    {
      motion: '(prefers-reduced-motion: no-preference)',
      desktop: '(min-width: 768px)',
    },
    (ctx) => {
      const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean };
      if (!motion) return;

      // ── Smooth scroll ──
      const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 });
      setLenis(lenis);
      lenis.on('scroll', ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      // ── Heading line reveals ──
      // autoSplit re-splits once web fonts load (and on resize); the tween is
      // returned from onSplit so GSAP can rebuild it each time.
      const splits: SplitText[] = [];
      gsap.utils.toArray<HTMLElement>('[data-split]').forEach((el) => {
        const split = SplitText.create(el, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'split-line',
          autoSplit: true,
          onSplit: (self) =>
            passed(el, 0.88)
              ? undefined
              : gsap.from(self.lines, {
                  yPercent: 115,
                  duration: 1.1,
                  ease: 'expo.out',
                  stagger: 0.08,
                  scrollTrigger: { trigger: el, start: 'top 88%', once: true },
                }),
        });
        splits.push(split);
      });

      // ── Word-by-word scrub ──
      gsap.utils.toArray<HTMLElement>('[data-scrub-words]').forEach((el) => {
        const split = SplitText.create(el, {
          type: 'words',
          // Leave the words to be read as they are; a label on a <p> is invalid ARIA.
          aria: 'none',
          autoSplit: true,
          onSplit: (self) =>
            gsap.fromTo(
              self.words,
              { opacity: 0.16 },
              {
                opacity: 1,
                ease: 'none',
                stagger: 0.1,
                scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 45%', scrub: scrubFor(el, 0.82) },
              },
            ),
        });
        splits.push(split);
      });

      // ── Media scale-in ──
      gsap.utils.toArray<HTMLElement>('[data-scale-in]').forEach((el) => {
        gsap.fromTo(
          el,
          { scale: 0.82, clipPath: 'inset(12% 8% 12% 8% round 4px)' },
          {
            scale: 1,
            clipPath: 'inset(0% 0% 0% 0% round 4px)',
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 35%', scrub: scrubFor(el, 0.95) },
          },
        );
      });

      // ── Parallax ──
      gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
        const amount = parseFloat(el.dataset.parallax || '0.15');
        gsap.fromTo(
          el,
          { yPercent: -amount * 50 },
          {
            yPercent: amount * 50,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: scrubFor(el, 1) },
          },
        );
      });

      // ── Hero exit ──
      gsap.utils.toArray<HTMLElement>('[data-hero-out]').forEach((el) => {
        gsap.to(el, {
          yPercent: -12,
          opacity: 0.25,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: scrubFor(el, 0) },
        });
      });

      // ── Stacking project cards (desktop only) ──
      if (desktop) {
        const cards = gsap.utils.toArray<HTMLElement>('.stack-card');
        cards.forEach((card, i) => {
          const next = cards[i + 1];
          if (!next) return;
          gsap.to(card.querySelector('.stack-card-inner'), {
            scale: 0.92,
            opacity: 0.35,
            ease: 'none',
            scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 15%', scrub: scrubFor(next, 1) },
          });
        });
      }

      // Content that changes height (accordions, fonts) must re-measure triggers.
      let raf = 0;
      const ro = new ResizeObserver(() => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => ScrollTrigger.refresh());
      });
      ro.observe(document.body);
      document.fonts?.ready.then(() => ScrollTrigger.refresh());

      return () => {
        ro.disconnect();
        cancelAnimationFrame(raf);
        splits.forEach((s) => s.revert());
        gsap.ticker.remove(tick);
        lenis.destroy();
        setLenis(null);
      };
    },
  );

  return () => mm.revert();
}
