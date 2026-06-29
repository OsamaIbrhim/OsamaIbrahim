import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

const PHRASES: Record<string, string[]> = {
    ar: ['السلام عليكم', 'صلِّ على النبي'],
    us: ['Hello', 'Welcome', 'Hi there'],
    gb: ['Hello', 'Good day', 'Welcome'],
    in: ['नमस्ते', 'स्वागत है', 'Hello'],
    fr: ['Bonjour', 'Bienvenue', 'Salut'],
    cn: ['你好', '欢迎', '您好'],
    default: ['Hello', 'Welcome'],
};

const ARABIC_COUNTRIES = ['EG', 'SA', 'AE', 'KW', 'QA', 'BH', 'OM', 'JO', 'IQ', 'YE'];
const SWITCH_INTERVAL = 1500;

function getPhraseKey(countryCode = ''): string {
    const code = countryCode.toUpperCase();
    if (ARABIC_COUNTRIES.includes(code)) return 'ar';
    const map: Record<string, string> = { US: 'us', GB: 'gb', IN: 'in', FR: 'fr', CN: 'cn' };
    return map[code] || 'default';
}

export default function CursorWord() {
    const [pos, setPos] = useState({ x: -100, y: -100 });
    const [index, setIndex] = useState(0);
    const [phraseKey, setPhraseKey] = useState('default');

    useEffect(() => {
        const cached = localStorage.getItem('visitor_key');
        if (cached) {
            setPhraseKey(cached);
            return;
        }
        let active = true;
        fetch('https://ipapi.co/json/')
            .then((res) => res.json())
            .then((data) => {
                if (!active) return;
                const key = getPhraseKey(data.country_code);
                setPhraseKey(key);
                localStorage.setItem('visitor_key', key);
            })
            .catch(() => active && setPhraseKey('default'));
        return () => { active = false; };
    }, []);

    useEffect(() => {
        const handleMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', handleMove);
        return () => window.removeEventListener('mousemove', handleMove);
    }, []);

    useEffect(() => {
        setIndex(0);
        const id = setInterval(() => {
            const list = PHRASES[phraseKey] || PHRASES.default;
            setIndex((prev) => (prev + 1) % list.length);
        }, SWITCH_INTERVAL);
        return () => clearInterval(id);
    }, [phraseKey]);

    const list = PHRASES[phraseKey] || PHRASES.default;

    return (
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
            <motion.span
                animate={{ x: pos.x + 16, y: pos.y + 16 }}
                transition={{ type: 'spring', damping: 30, stiffness: 400, mass: 0.5 }}
                style={{ mixBlendMode: 'difference', color: '#ffffff' }}
                className="absolute top-0 left-0 text-sm font-semibold whitespace-nowrap select-none"
            >
                {list[index]}
            </motion.span>
        </div>
    );
}