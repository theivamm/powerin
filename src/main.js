const nav = document.getElementById('nav');
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');

burger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('is-open');
  burger.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
});

navLinks.addEventListener('click', (e) => {
  if (e.target.closest('a')) {
    navLinks.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  }
});

const onScroll = () => nav.classList.toggle('is-stuck', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

const counters = document.querySelectorAll('[data-count]');
const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count);
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / 900, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countObserver.unobserve(el);
    });
  },
  { threshold: 0.6 }
);
counters.forEach((el) => countObserver.observe(el));

const sections = [...document.querySelectorAll('main section[id]')];
const linkObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.querySelectorAll('a[href^="#"]').forEach((a) => {
        a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: '-45% 0px -50% 0px' }
);
sections.forEach((s) => linkObserver.observe(s));

const form = document.getElementById('sampleForm');
const select = form.querySelector('select[name="linea"]');

document.querySelectorAll('[data-line]').forEach((btn) => {
  btn.addEventListener('click', () => {
    select.value = btn.dataset.line;
  });
});

const initialLine = new URLSearchParams(location.search).get('linea');
if (initialLine && select.querySelector(`option[value="${initialLine}"]`)) {
  select.value = initialLine;
}

const validators = {
  nombre: (v) => v.trim().length >= 2,
  email: (v) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()),
  telefono: (v) => v.replace(/\D/g, '').length >= 8,
  linea: (v) => v.length > 0
};

form.querySelectorAll('input, select').forEach((input) => {
  input.addEventListener('blur', () => {
    const check = validators[input.name];
    if (!check) return;
    input.closest('.field').classList.toggle('has-error', !check(input.value));
  });
  input.addEventListener('input', () => input.closest('.field').classList.remove('has-error'));
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  let valid = true;

  Object.entries(validators).forEach(([name, check]) => {
    const input = form.elements[name];
    const ok = check(input.value);
    input.closest('.field').classList.toggle('has-error', !ok);
    if (!ok) valid = false;
  });

  if (!valid) {
    form.querySelector('.has-error input, .has-error select')?.focus();
    return;
  }

  console.log('sample request', Object.fromEntries(new FormData(form)));
  document.getElementById('formOk').hidden = false;
  form.reset();
  form.querySelector('.has-error')?.classList.remove('has-error');
  document.getElementById('formOk').scrollIntoView({ behavior: 'smooth', block: 'center' });
});

document.getElementById('year').textContent = new Date().getFullYear();
