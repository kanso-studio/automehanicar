/* ============================================================
   1. NAVIGACIJA — skrolovanje + aktivni link
============================================================ */
const nav = document.getElementById('nav');
const toTop = document.getElementById('toTop');

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  nav.classList.toggle('scrolled', y > 20);
  toTop.classList.toggle('show', y > 600);
}, { passive: true });

toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* Aktivni link na osnovu sekcije u vidnom polju */
const navLinks = [...document.querySelectorAll('.nav__links a')];
const sections = navLinks
  .map(a => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.toggle(
        'active',
        l.getAttribute('href') === '#' + entry.target.id
      ));
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });

sections.forEach(s => sectionObserver.observe(s));

/* ============================================================
   2. MOBILNI MENI
============================================================ */
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');

function closeMenu() {
  burger.classList.remove('open');
  mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
}

burger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  burger.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMenu();
});

/* ============================================================
   3. REVEAL ANIMACIJE
============================================================ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ============================================================
   4. BROJAČI
============================================================ */
const counters = document.querySelectorAll('.counter');

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = +el.dataset.target;
    const dur = 1600;
    const start = performance.now();

    function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString('sr-RS');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });

counters.forEach(c => counterObserver.observe(c));

/* ============================================================
   5. EFFECT SVETLA NA KARTICAMA USLUGA
============================================================ */
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

/* ============================================================
   6. FILTER GALERIJE
============================================================ */
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = [...document.querySelectorAll('.gallery__item')];

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const f = btn.dataset.filter;
    galleryItems.forEach(item => {
      const show = f === 'all' || item.dataset.cat === f;
      item.classList.toggle('hide', !show);
    });
    refreshLightboxList();
  });
});

/* ============================================================
   7. LIGHTBOX
============================================================ */
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbCounter = document.getElementById('lbCounter');
let visibleItems = [...galleryItems];
let currentIndex = 0;

function refreshLightboxList() {
  visibleItems = galleryItems.filter(i => !i.classList.contains('hide'));
}

function openLightbox(index) {
  refreshLightboxList();
  currentIndex = index;
  updateLightbox();
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function updateLightbox() {
  const item = visibleItems[currentIndex];
  if (!item) return;
  const src = item.dataset.src || item.querySelector('img').src;
  lbImg.src = src;
  lbImg.alt = item.querySelector('img').alt;
  lbCounter.textContent = `${currentIndex + 1} / ${visibleItems.length}`;
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function nextImage() {
  currentIndex = (currentIndex + 1) % visibleItems.length;
  updateLightbox();
}

function prevImage() {
  currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
  updateLightbox();
}

galleryItems.forEach(item => {
  item.addEventListener('click', () => {
    refreshLightboxList();
    openLightbox(visibleItems.indexOf(item));
  });
});

document.getElementById('lbClose').addEventListener('click', closeLightbox);
document.getElementById('lbNext').addEventListener('click', nextImage);
document.getElementById('lbPrev').addEventListener('click', prevImage);

lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') nextImage();
  if (e.key === 'ArrowLeft') prevImage();
});

/* ============================================================
   8. FORME — validacija i slanje
============================================================ */
function validateField(field) {
  const val = field.value.trim();
  let ok = true;

  if (field.hasAttribute('required') && !val) ok = false;

  if (field.type === 'email' && val) {
    ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }
  if (field.type === 'tel' && val) {
    ok = /^[0-9+\s()/-]{6,20}$/.test(val);
  }

  field.classList.toggle('err', !ok);
  return ok;
}

/* --- Glavna forma --- */
const mainForm = document.getElementById('mainForm');
const formMsg = document.getElementById('formMsg');

mainForm.addEventListener('submit', e => {
  e.preventDefault();

  const fields = [...mainForm.querySelectorAll('input, select, textarea')];
  let valid = true;

  fields.forEach(f => {
    if (f.type === 'checkbox') {
      if (!f.checked) { valid = false; }
      return;
    }
    if (!validateField(f)) valid = false;
  });

  if (!valid) {
    const firstErr = mainForm.querySelector('.err');
    if (firstErr) {
      firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstErr.focus({ preventScroll: true });
    }
    return;
  }

  const btn = mainForm.querySelector('button[type="submit"]');
  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = 'Šaljem...';

  setTimeout(() => {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
    mainForm.reset();
    fields.forEach(f => f.classList.remove('err'));
    formMsg.classList.add('show');
    formMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });

    setTimeout(() => formMsg.classList.remove('show'), 8000);
  }, 1100);
});

/* Uklanjanje greške pri kucanju */
mainForm.querySelectorAll('input, select, textarea').forEach(f => {
  f.addEventListener('input', () => f.classList.remove('err'));
  f.addEventListener('change', () => f.classList.remove('err'));
});

/* --- Brza forma u hero sekciji --- */
const quickForm = document.getElementById('quickForm');

quickForm.addEventListener('submit', e => {
  e.preventDefault();

  const name = document.getElementById('qName');
  const phone = document.getElementById('qPhone');
  let ok = true;

  [name, phone].forEach(f => {
    const good = f.value.trim().length >= 3;
    f.style.borderColor = good ? '' : '#ff5d5d';
    if (!good) ok = false;
  });

  if (!ok) return;

  const btn = quickForm.querySelector('button[type="submit"]');
  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = 'Šaljem...';

  setTimeout(() => {
    btn.disabled = false;
    btn.innerHTML = '✓ Zahtev poslat!';
    btn.style.background = 'linear-gradient(120deg,#10b981,#047857)';
    quickForm.reset();

    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.background = '';
    }, 3200);
  }, 900);
});

/* ============================================================
   9. SMOOTH SCROLL (fallback za starije browsere)
============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href');
    if (id === '#' || id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const offset = nav.offsetHeight + 16;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
