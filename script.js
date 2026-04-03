// ===== CURSOR GLOW =====
const cursorGlow = document.getElementById('cursorGlow');
const heroSection = document.getElementById('hero');
const heroSpotlight = document.getElementById('heroSpotlight');

document.addEventListener('mousemove', (e) => {
  cursorGlow.style.left = e.clientX + 'px';
  cursorGlow.style.top = e.clientY + 'px';

  // Detect if cursor is over the hero section
  const heroRect = heroSection.getBoundingClientRect();
  const inHero = (
    e.clientY >= heroRect.top &&
    e.clientY <= heroRect.bottom &&
    e.clientX >= heroRect.left &&
    e.clientX <= heroRect.right
  );

  cursorGlow.classList.toggle('glow-hero', inHero);

  // Update spotlight position relative to hero
  if (inHero) {
    const xPercent = ((e.clientX - heroRect.left) / heroRect.width) * 100;
    const yPercent = ((e.clientY - heroRect.top) / heroRect.height) * 100;
    heroSpotlight.style.setProperty('--spot-x', xPercent + '%');
    heroSpotlight.style.setProperty('--spot-y', yPercent + '%');
  }
});

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

// ===== SCROLL REVEAL =====
const revealElements = document.querySelectorAll(
  '.section-tag, .section-title, .about-image-wrap, .about-content, ' +
  '.spotify-embed, .event-row, .contact-info, .contact-form, .parallax-quote'
);

revealElements.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// ===== FEATURE SPLIT SLIDE-IN =====
const featureElements = document.querySelectorAll('.feature-split-image, .feature-split-content');
if (featureElements.length) {
  const featureObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        featureObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: '0px 0px -40px 0px'
  });
  featureElements.forEach(el => featureObserver.observe(el));
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
  btn.textContent = 'Sent!';
  btn.style.background = '#22c55e';
  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.background = '';
    contactForm.reset();
  }, 2000);
});

// ===== PARALLAX EFFECTS =====
const parallaxImages = document.querySelectorAll('.parallax-img');

function updateParallax() {
  const scrolled = window.scrollY;

  // Hero parallax
  const hero = document.querySelector('.hero-bg-img');
  if (hero) {
    hero.style.transform = `scale(1.05) translateY(${scrolled * 0.15}px)`;
  }

  // Section divider parallax
  parallaxImages.forEach(img => {
    const rect = img.parentElement.getBoundingClientRect();
    const speed = 0.3;
    const yPos = rect.top * speed;
    img.style.transform = `translateY(${yPos}px)`;
  });
}

window.addEventListener('scroll', updateParallax, { passive: true });
