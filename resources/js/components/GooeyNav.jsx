import { useRef, useEffect, useState } from 'react';
import './GooeyNav.css';

const GooeyNav = ({
    items = [], animationTime = 600, particleCount = 9,
    particleDistances = [60, 8], particleR = 120, timeVariance = 200,
    colors = [1, 2, 3, 1, 2, 3, 1, 4], initialActiveIndex = 0, onNavigate,
}) => {
    const containerRef = useRef(null);
    const navRef = useRef(null);
    const filterRef = useRef(null);
    const textRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(initialActiveIndex);

    const noise = (n = 1) => n / 2 - Math.random() * n;
    const getXY = (d, i, total) => {
        const a = ((360 + noise(8)) / total) * i * (Math.PI / 180);
        return [d * Math.cos(a), d * Math.sin(a)];
    };
    const createParticle = (i, t, d, r) => {
        const rotate = noise(r / 10);
        return {
            start: getXY(d[0], particleCount - i, particleCount),
            end: getXY(d[1] + noise(7), particleCount - i, particleCount),
            time: t, scale: 1 + noise(0.2),
            color: colors[Math.floor(Math.random() * colors.length)],
            rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10,
        };
    };
    const makeParticles = (el) => {
        el.style.setProperty('--time', `${animationTime * 2 + timeVariance}ms`);
        for (let i = 0; i < particleCount; i++) {
            const t = animationTime * 2 + noise(timeVariance * 2);
            const p = createParticle(i, t, particleDistances, particleR);
            el.classList.remove('active');
            setTimeout(() => {
                const particle = document.createElement('span');
                const point = document.createElement('span');
                particle.className = 'gooey-particle';
                particle.style.setProperty('--start-x', `${p.start[0]}px`);
                particle.style.setProperty('--start-y', `${p.start[1]}px`);
                particle.style.setProperty('--end-x', `${p.end[0]}px`);
                particle.style.setProperty('--end-y', `${p.end[1]}px`);
                particle.style.setProperty('--time', `${p.time}ms`);
                particle.style.setProperty('--scale', `${p.scale}`);
                particle.style.setProperty('--color', `var(--color-${p.color}, white)`);
                particle.style.setProperty('--rotate', `${p.rotate}deg`);
                point.className = 'gooey-point';
                particle.appendChild(point);
                el.appendChild(particle);
                requestAnimationFrame(() => el.classList.add('active'));
                setTimeout(() => { try { el.removeChild(particle); } catch {} }, t);
            }, 30);
        }
    };
    const updatePos = (el) => {
        if (!containerRef.current || !filterRef.current || !textRef.current) return;
        const cr = containerRef.current.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        const s = { left: `${r.x - cr.x}px`, top: `${r.y - cr.y}px`, width: `${r.width}px`, height: `${r.height}px` };
        Object.assign(filterRef.current.style, s);
        Object.assign(textRef.current.style, s);
        textRef.current.innerText = el.innerText;
    };
    const handleClick = (e, index) => {
        if (activeIndex === index) return;
        setActiveIndex(index);
        updatePos(e.currentTarget);
        if (filterRef.current) {
            filterRef.current.querySelectorAll('.gooey-particle').forEach(p => filterRef.current.removeChild(p));
        }
        if (textRef.current) {
            textRef.current.classList.remove('active');
            void textRef.current.offsetWidth;
            textRef.current.classList.add('active');
        }
        if (filterRef.current) makeParticles(filterRef.current);
        if (onNavigate) onNavigate(items[index], index);
    };
    useEffect(() => {
        if (!navRef.current || !containerRef.current) return;
        const li = navRef.current.querySelectorAll('li')[activeIndex];
        if (li) { updatePos(li); textRef.current?.classList.add('active'); }
        const ro = new ResizeObserver(() => {
            const cur = navRef.current?.querySelectorAll('li')[activeIndex];
            if (cur) updatePos(cur);
        });
        ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, [activeIndex]);

    return (
        <div className="gooey-nav" ref={containerRef}>
            <nav>
                <ul ref={navRef}>
                    {items.map((item, i) => (
                        <li key={i} className={activeIndex === i ? 'active' : ''}>
                            <a href="#" onClick={e => { e.preventDefault(); handleClick(e, i); }}>
                                {item.icon && <item.icon className="w-[18px] h-[18px] shrink-0" strokeWidth={2} />}
                                <span>{item.label}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            <span className="effect filter" ref={filterRef} />
            <span className="effect text" ref={textRef} />
        </div>
    );
};

export default GooeyNav;
