/* Power In — interacciones · GSAP (cargado por CDN en index.html) */
const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(pointer: fine)').matches;

/* ---------- Tema claro / oscuro ---------- */
const root = document.documentElement;
const themeBtn = $('#theme');
const setTheme = (t) => {
  root.setAttribute('data-theme', t);
  try { localStorage.setItem('pi-theme', t); } catch (e) {}
  themeBtn.setAttribute('aria-label', t === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
};
setTheme(root.getAttribute('data-theme') || 'light');
themeBtn.addEventListener('click', () => {
  setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  if (!reduce && gsap) gsap.fromTo(themeBtn, { rotate: -120, scale: 0.6 }, { rotate: 0, scale: 1, duration: 0.7, ease: 'back.out(2)' });
});

$('#year').textContent = new Date().getFullYear();

/* ---------- Formulario (funciona sin GSAP) ---------- */
const form = $('#sampleForm');
const validators = {
  nombre: (v) => v.trim().length >= 2,
  email: (v) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()),
  telefono: (v) => v.replace(/\D/g, '').length >= 8,
};
$$('[data-line]').forEach((a) =>
  a.addEventListener('click', () => {
    const r = form.querySelector(`input[name="linea"][value="${a.dataset.line}"]`);
    if (r) r.checked = true;
  })
);
$$('input[type="text"], input[type="email"], input[type="tel"]', form).forEach((i) => {
  i.addEventListener('blur', () => {
    const c = validators[i.name];
    if (c) i.closest('.field').classList.toggle('has-error', !c(i.value));
  });
  i.addEventListener('input', () => i.closest('.field').classList.remove('has-error'));
});
form.addEventListener('submit', (e) => {
  e.preventDefault();
  let ok = true;
  Object.entries(validators).forEach(([n, c]) => {
    const i = form.elements[n];
    const v = c(i.value);
    i.closest('.field').classList.toggle('has-error', !v);
    if (!v) ok = false;
  });
  if (!ok) return form.querySelector('.has-error input')?.focus();
  console.log('sample request', Object.fromEntries(new FormData(form)));
  const okBox = $('#formOk');
  okBox.hidden = false;
  form.reset();
  if (gsap && !reduce) gsap.fromTo(okBox, { y: 20, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.8)' });
});

/* ---------- Menú fullscreen ---------- */
const burger = $('#burger');
const menu = $('#menu');
let menuTl;
const buildMenu = () => {
  if (!gsap) return;
  const r = burger.getBoundingClientRect();
  menu.style.clipPath = `circle(0% at ${r.left + r.width / 2}px ${r.top + r.height / 2}px)`;
  menuTl = gsap.timeline({ paused: true, defaults: { ease: 'power3.inOut' } })
    .set(menu, { visibility: 'visible' })
    .to(menu, { clipPath: `circle(150% at ${r.left + r.width / 2}px ${r.top + r.height / 2}px)`, duration: 0.8 })
    .from('.menu__links a span', { yPercent: 120, rotate: 6, duration: 0.7, stagger: 0.07, ease: 'power4.out' }, '-=0.35')
    .from('.menu__links a i', { opacity: 0, x: -14, duration: 0.5, stagger: 0.07 }, '<')
    .from('.menu__close', { scale: 0, rotate: -180, duration: 0.7, ease: 'back.out(2)' }, 0.4)
    .from('.menu__foot > *', { y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' }, '-=0.5')
    .from('.menu__ghost', { xPercent: -15, opacity: 0, duration: 1.1, ease: 'power3.out' }, 0.2);
};
const setMenu = (open) => {
  burger.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  menu.setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('is-locked', open);
  if (!gsap || reduce) {
    menu.style.visibility = open ? 'visible' : 'hidden';
    menu.style.clipPath = open ? 'none' : '';
    return;
  }
  if (open) { buildMenu(); menuTl.timeScale(1).play(); }
  else menuTl?.timeScale(1.6).reverse();
};
burger.addEventListener('click', () => setMenu(!burger.classList.contains('is-open')));
$$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
$('#menuClose').addEventListener('click', () => setMenu(false));
addEventListener('keydown', (e) => { if (e.key === 'Escape' && burger.classList.contains('is-open')) setMenu(false); });
addEventListener('resize', () => { if (innerWidth > 900 && burger.classList.contains('is-open')) setMenu(false); });

if (!gsap || !ScrollTrigger) {
  console.warn('GSAP no cargó: la página funciona sin animaciones.');
} else if (!reduce) {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  initMotion();
}

function initMotion() {
  /* Fondo girando + barra de progreso */
  gsap.to('.bg', { rotation: 360, duration: 160, ease: 'none', repeat: -1 });
  gsap.to('#progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

  /* ----- Palabra por palabra, patrones aleatorios ----- */
  const patterns = [
    () => ({ yPercent: 120, rotate: rand(4, 12) }),
    () => ({ yPercent: -120, rotate: rand(-12, -4) }),
    () => ({ xPercent: -90, opacity: 0, skewX: 25 }),
    () => ({ xPercent: 90, opacity: 0, skewX: -25 }),
    () => ({ scale: 0, rotate: rand(-40, 40), opacity: 0 }),
    () => ({ rotationX: -100, transformOrigin: '50% 0%', opacity: 0 }),
    () => ({ y: 40, opacity: 0, filter: 'blur(14px)' }),
    () => ({ scale: 2.4, opacity: 0, filter: 'blur(10px)' }),
  ];
  const splitWords = (el) => {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((t) => {
            if (!t) return;
            if (/^\s+$/.test(t)) return frag.appendChild(document.createTextNode(' '));
            const w = document.createElement('span');
            w.className = 'w';
            const wi = document.createElement('span');
            wi.className = 'wi';
            wi.textContent = t;
            w.appendChild(wi);
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    return $$('.wi', el);
  };
  const animateWords = (words, vars = {}) => {
    const tl = gsap.timeline(vars);
    words.forEach((w) => {
      tl.fromTo(w, { ...pick(patterns)() }, { yPercent: 0, xPercent: 0, y: 0, x: 0, scale: 1, rotate: 0, rotationX: 0, skewX: 0, opacity: 1, filter: 'blur(0px)', duration: rand(0.7, 1.1), ease: 'power4.out' }, rand(0, 0.55));
    });
    return tl;
  };
  $$('[data-split]').forEach((el) => {
    const words = splitWords(el);
    if (el.classList.contains('hero__title')) return (window.__heroWords = words);
    animateWords(words, { scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });

  /* ----- Hero intro ----- */
  const heroTl = gsap.timeline({ delay: 0.15 });
  heroTl
    .from('.nav__pill, .nav__right > *', { y: -60, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' })
    .from('.hero__pill', { scale: 0.6, opacity: 0, duration: 0.6, ease: 'back.out(2)' }, 0.3)
    .add(animateWords(window.__heroWords || []), 0.45)
    .from('.hero__ghost span', { yPercent: 60, opacity: 0, duration: 1.4, ease: 'power4.out' }, 0.5)
    .from('.hero__row > *', { y: 30, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out' }, 1.0)
    .from('.hero__img', { yPercent: 18, scale: 0.88, opacity: 0, duration: 1.4, ease: 'power4.out' }, 0.9)
    .from('.hero__stage .chip, .hero__stat', { scale: 0, rotate: () => rand(-25, 25), opacity: 0, duration: 0.8, stagger: { each: 0.1, from: 'random' }, ease: 'back.out(2.4)' }, 1.5);

  /* Flotados continuos */
  $$('[data-float]').forEach((el) => {
    gsap.to(el, { y: () => rand(-16, -8), x: () => rand(-8, 8), rotate: () => rand(-4, 4), duration: () => rand(2.2, 3.6), ease: 'sine.inOut', yoyo: true, repeat: -1, delay: rand(0, 1.5) });
  });
  gsap.to('.hero__img', { y: -10, duration: 4, ease: 'sine.inOut', yoyo: true, repeat: -1 });

  /* Parallax hero */
  gsap.to('.hero__ghost span', { xPercent: -14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__stage', { yPercent: -8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* ----- CTAs con efectos constantes ----- */
  $$('.cta').forEach((cta, i) => {
    const inner = document.createElement('span');
    inner.className = 'cta__in';
    while (cta.firstChild) inner.appendChild(cta.firstChild);
    const fx = document.createElement('span');
    fx.className = 'cta__fx';
    fx.innerHTML = '<i></i>';
    const ring = document.createElement('span');
    ring.className = 'cta__ring';
    cta.append(ring, fx, inner);
    if (cta.classList.contains('cta--ghost')) return;
    const d = rand(0, 1.2);
    gsap.fromTo(fx.firstChild, { xPercent: -160 }, { xPercent: 420, duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 1.4, delay: d });
    gsap.fromTo(ring, { scaleX: 1, scaleY: 1, opacity: 0.55 }, { scaleX: 1.14, scaleY: 1.7, opacity: 0, duration: 1.8, ease: 'power2.out', repeat: -1, delay: d });
    gsap.to(cta, { scale: 1.035, duration: 1.1, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: d });
    const arr = $('.cta__arr', cta);
    if (arr) gsap.to(arr, { x: 5, duration: 0.5, ease: 'power1.inOut', yoyo: true, repeat: -1, repeatDelay: 0.6, delay: d });
    if (fine) {
      const qx = gsap.quickTo(inner, 'x', { duration: 0.4, ease: 'power3' });
      const qy = gsap.quickTo(inner, 'y', { duration: 0.4, ease: 'power3' });
      cta.addEventListener('pointermove', (e) => {
        const r = cta.getBoundingClientRect();
        qx((e.clientX - r.left - r.width / 2) * 0.22);
        qy((e.clientY - r.top - r.height / 2) * 0.35);
      });
      cta.addEventListener('pointerleave', () => { qx(0); qy(0); });
    }
  });

  /* ----- Marquee con velocidad de scroll ----- */
  const track = $('.marquee__track');
  const mq = gsap.to(track, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
  ScrollTrigger.create({
    onUpdate: (self) => {
      const v = self.getVelocity();
      const dir = v < 0 ? -1 : 1;
      gsap.timeline({ overwrite: true })
        .to(mq, { timeScale: dir * (1 + Math.abs(v) / 250), duration: 0.2 })
        .to(mq, { timeScale: 1, duration: 1 }, '+=0.1');
      gsap.to(track, { skewX: gsap.utils.clamp(-12, 12, v / -300), duration: 0.3, overwrite: 'auto' });
    },
  });

  /* ----- Reveals en lote con patrones aleatorios ----- */
  const revealFrom = [
    () => ({ y: 70, opacity: 0 }),
    () => ({ y: 60, rotate: rand(-4, 4), opacity: 0 }),
    () => ({ scale: 0.85, y: 40, opacity: 0 }),
    () => ({ x: rand(-60, 60), opacity: 0, rotate: rand(-3, 3) }),
  ];
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 95%',
    once: true,
    onEnter: (els) => els.forEach((el, i) => gsap.fromTo(el, pick(revealFrom)(), { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1, duration: 0.9, delay: i * 0.1, ease: 'power3.out', clearProps: 'transform' })),
  });
  gsap.set('[data-reveal]', { opacity: 0 });

  /* Contadores */
  $$('[data-count]').forEach((el) => {
    const obj = { v: 0 };
    gsap.to(obj, { v: Number(el.dataset.count), duration: 1.6, ease: 'power3.out', onUpdate: () => (el.textContent = Math.round(obj.v)), scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });

  /* Tiles: numerales vivos */
  $$('.tile__n').forEach((n) => gsap.from(n, { yPercent: 100, rotate: 10, opacity: 0, duration: 0.9, ease: 'back.out(2)', scrollTrigger: { trigger: n, start: 'top 90%', once: true } }));

  /* Productos: tilt 3D + parallax del envase */
  $$('[data-tilt]').forEach((card) => {
    const pack = $('.line__pack', card);
    gsap.to(pack, { y: -14, rotate: () => rand(-2, 2), duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    if (!fine) return;
    const rx = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3' });
    const ry = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3' });
    const px = gsap.quickTo(pack, 'x', { duration: 0.6, ease: 'power3' });
    gsap.set(card, { transformPerspective: 1200 });
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      rx(nx * 6); ry(-ny * 6); px(nx * 30);
    });
    card.addEventListener('pointerleave', () => { rx(0); ry(0); px(0); });
  });

  /* Comparativa */
  gsap.from('.table__row', { xPercent: -12, opacity: 0, duration: 0.8, stagger: 0.09, ease: 'power3.out', scrollTrigger: { trigger: '.table', start: 'top 80%', once: true } });
  gsap.fromTo('.table__row .is-us', { boxShadow: 'inset 0 0 0 0 rgba(91,61,245,0)' }, { boxShadow: 'inset 0 0 0 2px rgba(91,61,245,.45)', duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.12 });

  /* Pasos */
  gsap.from('.step__n', { scale: 0.3, rotate: -30, opacity: 0, duration: 0.9, stagger: 0.18, ease: 'back.out(2)', scrollTrigger: { trigger: '.steps', start: 'top 75%', once: true } });

  /* CTA final: orbes */
  gsap.to('.final__orb--a', { x: -60, y: 50, scale: 1.2, duration: 6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  gsap.to('.final__orb--b', { rotation: 360, duration: 40, ease: 'none', repeat: -1 });
  gsap.from('.form .field, .form .cta', { y: 24, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.form', start: 'top 80%', once: true } });

  /* ----- Footer sorpresa: texto gigante detrás de la imagen ----- */
  const ft = gsap.timeline({ scrollTrigger: { trigger: '.footer', start: 'top 85%', end: 'bottom bottom', scrub: 0.8 } });
  ft.fromTo('.footer__giant .g1', { xPercent: -30 }, { xPercent: 8, ease: 'none' }, 0)
    .fromTo('.footer__giant .g2', { xPercent: 30 }, { xPercent: -8, ease: 'none' }, 0)
    .fromTo('.footer__img', { yPercent: 28, scale: 0.82 }, { yPercent: 0, scale: 1, ease: 'power1.out' }, 0);
  gsap.from('.footer__grid > *', { y: 30, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.footer__grid', start: 'top 92%', once: true } });

  /* ----- WhatsApp flotante ----- */
  const wa = $('#wa');
  gsap.to(wa, { opacity: 1, scale: 1, duration: 0.8, delay: 1.8, ease: 'back.out(2.5)' });
  $$('.wa__ring', wa).forEach((r, i) => gsap.fromTo(r, { scale: 1, opacity: 0.7 }, { scale: 1.9, opacity: 0, duration: 2, ease: 'power2.out', repeat: -1, delay: i * 1 }));
  gsap.timeline({ repeat: -1, repeatDelay: 3.5, delay: 3 })
    .to(wa, { y: -18, duration: 0.25, ease: 'power2.out' })
    .to(wa, { y: 0, duration: 0.6, ease: 'bounce.out' })
    .to(wa, { rotate: 14, duration: 0.08, repeat: 5, yoyo: true, ease: 'none' }, '-=0.5')
    .to(wa, { rotate: 0, duration: 0.1 });

  /* ----- Nav activo ----- */
  $$('main section[id]').forEach((s) =>
    ScrollTrigger.create({
      trigger: s, start: 'top 45%', end: 'bottom 45%',
      onToggle: (self) => self.isActive && $$('.nav__links a').forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${s.id}`)),
    })
  );

  addEventListener('load', () => ScrollTrigger.refresh());
  setTimeout(() => ScrollTrigger.refresh(), 1500);
}
