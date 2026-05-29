import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';

const DEFAULT_GLOW = '124, 58, 237';

const updateGlow = (card, mx, my, glow, r) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--glow-x', `${((mx - rect.left) / rect.width) * 100}%`);
    card.style.setProperty('--glow-y', `${((my - rect.top) / rect.height) * 100}%`);
    card.style.setProperty('--glow-intensity', glow.toString());
    card.style.setProperty('--glow-radius', `${r}px`);
};

const GlobalSpotlight = ({ gridRef, disabled, radius = 300, color = DEFAULT_GLOW }) => {
    const ref = useRef(null);
    useEffect(() => {
        if (disabled || !gridRef?.current) return;
        const el = document.createElement('div');
        el.className = 'bento-global-spotlight';
        el.style.cssText = `position:fixed;width:800px;height:800px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(${color},0.15) 0%,rgba(${color},0.08) 15%,rgba(${color},0.04) 25%,transparent 50%);z-index:200;opacity:0;transform:translate(-50%,-50%);mix-blend-mode:screen;`;
        document.body.appendChild(el);
        ref.current = el;
        const prox = radius * 0.5, fade = radius * 0.75;
        const onMove = (e) => {
            if (!ref.current || !gridRef.current) return;
            const sec = gridRef.current.closest('.bento-section');
            const sr = sec?.getBoundingClientRect();
            const inside = sr && e.clientX >= sr.left && e.clientX <= sr.right && e.clientY >= sr.top && e.clientY <= sr.bottom;
            const cards = gridRef.current.querySelectorAll('.bento-card');
            if (!inside) { gsap.to(ref.current, { opacity: 0, duration: 0.3 }); cards.forEach(c => c.style.setProperty('--glow-intensity', '0')); return; }
            let min = Infinity;
            cards.forEach(c => {
                const cr = c.getBoundingClientRect();
                const d = Math.max(0, Math.hypot(e.clientX - cr.left - cr.width / 2, e.clientY - cr.top - cr.height / 2) - Math.max(cr.width, cr.height) / 2);
                min = Math.min(min, d);
                updateGlow(c, e.clientX, e.clientY, d <= prox ? 1 : d <= fade ? (fade - d) / (fade - prox) : 0, radius);
            });
            gsap.to(ref.current, { left: e.clientX, top: e.clientY, duration: 0.1 });
            gsap.to(ref.current, { opacity: min <= prox ? 0.8 : min <= fade ? ((fade - min) / (fade - prox)) * 0.8 : 0, duration: 0.2 });
        };
        const onLeave = () => { gridRef.current?.querySelectorAll('.bento-card').forEach(c => c.style.setProperty('--glow-intensity', '0')); if (ref.current) gsap.to(ref.current, { opacity: 0, duration: 0.3 }); };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseleave', onLeave);
        return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseleave', onLeave); ref.current?.remove(); };
    }, [gridRef, disabled, radius, color]);
    return null;
};

const MagicBentoGrid = ({ enableSpotlight = true, enableTilt = true, enableMagnetism = true, clickEffect = true, spotlightRadius = 300, glowColor = DEFAULT_GLOW, className = '', children }) => {
    const gridRef = useRef(null);
    const [mobile, setMobile] = useState(false);
    useEffect(() => { const check = () => setMobile(window.innerWidth <= 768); check(); window.addEventListener('resize', check); return () => window.removeEventListener('resize', check); }, []);
    const disabled = mobile;
    useEffect(() => {
        if (disabled || !gridRef.current) return;
        const cards = gridRef.current.querySelectorAll('.bento-card');
        const cleanups = [];
        cards.forEach(card => {
            const onMove = (e) => {
                const r = card.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, cx = r.width / 2, cy = r.height / 2;
                if (enableTilt) gsap.to(card, { rotateX: ((y - cy) / cy) * -5, rotateY: ((x - cx) / cx) * 5, duration: 0.1, transformPerspective: 800 });
                if (enableMagnetism) gsap.to(card, { x: (x - cx) * 0.03, y: (y - cy) * 0.03, duration: 0.3 });
            };
            const onLeave = () => { if (enableTilt) gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.3 }); if (enableMagnetism) gsap.to(card, { x: 0, y: 0, duration: 0.3 }); };
            const onClick = (e) => {
                if (!clickEffect) return;
                const r = card.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
                const max = Math.max(Math.hypot(x, y), Math.hypot(x - r.width, y), Math.hypot(x, y - r.height), Math.hypot(x - r.width, y - r.height));
                const ripple = document.createElement('div');
                ripple.style.cssText = `position:absolute;width:${max * 2}px;height:${max * 2}px;border-radius:50%;background:radial-gradient(circle,rgba(${glowColor},0.4) 0%,rgba(${glowColor},0.2) 30%,transparent 70%);left:${x - max}px;top:${y - max}px;pointer-events:none;z-index:1000;`;
                card.appendChild(ripple);
                gsap.fromTo(ripple, { scale: 0, opacity: 1 }, { scale: 1, opacity: 0, duration: 0.8, onComplete: () => ripple.remove() });
            };
            card.addEventListener('mousemove', onMove);
            card.addEventListener('mouseleave', onLeave);
            card.addEventListener('click', onClick);
            cleanups.push(() => { card.removeEventListener('mousemove', onMove); card.removeEventListener('mouseleave', onLeave); card.removeEventListener('click', onClick); });
        });
        return () => cleanups.forEach(fn => fn());
    }, [disabled, enableTilt, enableMagnetism, clickEffect, glowColor, children]);

    return (
        <>
            {enableSpotlight && <GlobalSpotlight gridRef={gridRef} disabled={disabled} radius={spotlightRadius} color={glowColor} />}
            <div ref={gridRef} className={`bento-section ${className}`} style={{ position: 'relative' }}>{children}</div>
        </>
    );
};

export default MagicBentoGrid;
