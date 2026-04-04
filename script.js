// ===== DEVICE DETECTION =====
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// ===== CURSOR GLOW (desktop only) =====
const cursorGlow = document.getElementById('cursorGlow');
const heroSection = document.getElementById('hero');
const heroSpotlight = document.getElementById('heroSpotlight');

if (!isTouchDevice) {
  document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';

    const heroRect = heroSection.getBoundingClientRect();
    const inHero = (
      e.clientY >= heroRect.top &&
      e.clientY <= heroRect.bottom &&
      e.clientX >= heroRect.left &&
      e.clientX <= heroRect.right
    );

    cursorGlow.classList.toggle('glow-hero', inHero);

    if (inHero) {
      const xPercent = ((e.clientX - heroRect.left) / heroRect.width) * 100;
      const yPercent = ((e.clientY - heroRect.top) / heroRect.height) * 100;
      heroSpotlight.style.setProperty('--spot-x', xPercent + '%');
      heroSpotlight.style.setProperty('--spot-y', yPercent + '%');
    }
  });
}

// ===== NAVIGATION SCROLL =====
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
});

// ===== MOBILE MENU =====
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  mobileMenu.classList.toggle('active');
  document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
});

document.querySelectorAll('.mobile-menu-link').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
  });
});

// ===== SCROLL REVEAL (reversible) =====
const revealElements = document.querySelectorAll(
  '.section-tag, .section-title, .about-image-wrap, .about-content, ' +
  '.spotify-embed, .events-past-title, .event-row, .contact-info, .contact-form, .parallax-quote'
);

revealElements.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    } else {
      entry.target.classList.remove('visible');
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// ===== FEATURE SPLIT SLIDE-IN (reversible) =====
const featureElements = document.querySelectorAll('.feature-split-image, .feature-split-content');
if (featureElements.length) {
  const featureObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      } else {
        entry.target.classList.remove('visible');
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: '0px 0px -40px 0px'
  });
  featureElements.forEach(el => featureObserver.observe(el));
}

// ===== STAT COUNT-UP =====
function formatStat(value, format) {
  if (format === 'K') return (value / 1000).toFixed(value >= 1000 ? 0 : 1).replace(/\.0$/, '') + 'K';
  return value.toString();
}

function animateCount(el, target, suffix, format, duration) {
  const startTime = performance.now();

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(target * eased);
    el.textContent = formatStat(current, format) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }

  if (suffix === '∞+') {
    el.textContent = '∞+';
  } else {
    el.textContent = '0' + suffix;
    requestAnimationFrame(tick);
  }
}

function resetCount(el, suffix) {
  el.textContent = suffix === '∞+' ? '∞+' : '0' + suffix;
}

const statData = [
  { suffix: '+', target: 50, format: null },
  { suffix: '+', target: 10000, format: 'K' },
  { suffix: '∞+', target: 0, format: null }
];

const statsSection = document.querySelector('.about-stats');
const statNumbers = document.querySelectorAll('.stat-number');

if (statsSection && statNumbers.length) {
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        statNumbers.forEach((el, i) => {
          const data = statData[i];
          if (data) animateCount(el, data.target, data.suffix, data.format, 1500);
        });
      } else {
        statNumbers.forEach((el, i) => {
          const data = statData[i];
          if (data) resetCount(el, data.suffix);
        });
      }
    });
  }, { threshold: 0.3 });

  statsObserver.observe(statsSection);
}

// ===== SMOOTH ANCHOR SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ===== CONTACT FORM =====
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = contactForm.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  btn.textContent = 'Sending...';
  btn.disabled = true;

  fetch(contactForm.action, {
    method: 'POST',
    body: new FormData(contactForm),
    headers: { 'Accept': 'application/json' }
  }).then(res => {
    if (res.ok) {
      btn.textContent = 'Sent!';
      btn.style.background = '#22c55e';
      contactForm.reset();
    } else {
      btn.textContent = 'Error — try again';
      btn.style.background = '#dc2626';
    }
  }).catch(() => {
    btn.textContent = 'Error — try again';
    btn.style.background = '#dc2626';
  }).finally(() => {
    btn.disabled = false;
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
    }, 2000);
  });
});

// ===== O-PLAYER =====
const heroO = document.getElementById('heroO');
const heroWaveBars = document.getElementById('heroWaveBars');

// Generate small wave bars under the title
const barCount = 24;
for (let i = 0; i < barCount; i++) {
  const bar = document.createElement('div');
  bar.className = 'hero-wave-bar';
  const t = i / (barCount - 1);
  const h = Math.sin(t * Math.PI) * (0.4 + Math.random() * 0.6);
  bar.style.height = Math.max(3, h * 20) + 'px';
  bar.style.animationDelay = (i * 0.07) + 's';
  heroWaveBars.appendChild(bar);
}

let playTimer = null;

function startPlaying(duration) {
  clearTimeout(playTimer);
  heroO.classList.add('playing');
  heroWaveBars.classList.add('active');
  playTimer = setTimeout(() => {
    heroO.classList.remove('playing');
    heroWaveBars.classList.remove('active');
    playTimer = null;
  }, duration);
}

// Auto-play on landing for 2 seconds
setTimeout(() => startPlaying(2000), 800);

// Click/tap O to play for 4 seconds
heroO.addEventListener('click', () => {
  startPlaying(4000);
});

if (isTouchDevice) {
  heroO.addEventListener('touchend', (e) => {
    e.preventDefault();
    startPlaying(4000);
  });
}

// ===== PARALLAX EFFECTS (desktop only — iOS can't handle this smoothly) =====
if (!isTouchDevice) {
  const parallaxImages = document.querySelectorAll('.parallax-img');

  function updateParallax() {
    const scrolled = window.scrollY;

    const hero = document.querySelector('.hero-bg-img');
    if (hero) {
      hero.style.transform = `scale(1.05) translateY(${scrolled * 0.15}px)`;
    }

    parallaxImages.forEach(img => {
      const rect = img.parentElement.getBoundingClientRect();
      const speed = 0.3;
      const yPos = rect.top * speed;
      img.style.transform = `translateY(${yPos}px)`;
    });
  }

  window.addEventListener('scroll', updateParallax, { passive: true });
}
