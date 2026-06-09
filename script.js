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

// ===== EVENTS FROM GOOGLE SHEET =====
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vREZfw_s7rB1L_rK2Mor3AySh7t4HwdPiYH9vPbq4oJsA4Y65K7LDsmowpJemq_F8hTQavu2G7VgWir/pub?output=csv';

const FALLBACK_EVENTS = [
  { date: '2026-04-18', day: '18', month: 'APR', title: 'Pool Party', location: 'Santa Ana, CA', label: 'INVITE ONLY' },
  { date: '2026-04-05', day: '05', month: 'APR', title: 'Row at Redhill', location: 'Santa Ana, CA', label: 'TICKETS' },
  { date: '2026-03-29', day: '24–29', month: 'MAR', title: 'Miami Music Week 2026', location: 'Miami, FL', label: 'RECAP' },
  { date: '2025-07-13', day: '10–13', month: 'JUL', title: 'Ibiza', location: 'Ibiza, Spain', label: '2025' },
];

function parseCSV(text) {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  return lines.slice(1).map(line => {
    const values = [];
    let current = '', inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; }
      else if (ch === ',' && !inQuotes) { values.push(current.trim()); current = ''; }
      else { current += ch; }
    }
    values.push(current.trim());
    const row = {};
    headers.forEach((h, i) => row[h] = values[i] || '');
    return row;
  });
}

function sanitize(str) {
  const el = document.createElement('div');
  el.textContent = str;
  return el.innerHTML;
}

function sheetRowToEvent(row) {
  return {
    date: row.date || '',
    day: row.day || row.day_display || '',
    month: row.month || '',
    title: sanitize(row.title || ''),
    location: sanitize(row.location || ''),
    label: sanitize(row.label || ''),
    link: row.url || row.link || '',
    visible: (row.go_live || row.visible || 'TRUE').toUpperCase() === 'TRUE',
  };
}

function buildEventRow(ev, isPast) {
  const btnClass = isPast ? 'btn btn-sm btn-outline' : 'btn btn-sm';
  const btnContent = ev.link
    ? `<a href="${sanitize(ev.link)}" target="_blank" rel="noopener" class="${btnClass}">${ev.label}</a>`
    : `<span class="${btnClass}">${ev.label}</span>`;
  return `<div class="event-row">
    <div class="event-date">
      <span class="event-day">${ev.day}</span>
      <span class="event-month">${ev.month}</span>
    </div>
    <div class="event-info">
      <h3>${ev.title}</h3>
      <p>${ev.location}</p>
    </div>
    <div class="event-action">
      ${btnContent}
    </div>
  </div>`;
}

function renderEvents(events) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const visible = events.filter(e => e.visible !== false);
  const upcoming = visible.filter(e => new Date(e.date) >= today).sort((a, b) => new Date(a.date) - new Date(b.date));
  const past = visible.filter(e => new Date(e.date) < today).sort((a, b) => new Date(b.date) - new Date(a.date));

  const upcomingEl = document.getElementById('upcomingEvents');
  const pastEl = document.getElementById('pastEvents');
  const pastTitle = document.getElementById('pastShowsTitle');

  upcomingEl.innerHTML = upcoming.length
    ? upcoming.map(e => buildEventRow(e, false)).join('')
    : '<p style="color:var(--text-muted);text-align:center;padding:24px 0;">No upcoming shows — stay tuned.</p>';

  pastEl.innerHTML = past.map(e => buildEventRow(e, true)).join('');
  if (!past.length) pastTitle.style.display = 'none';

  // Re-apply reveal to dynamically added rows
  document.querySelectorAll('.event-row').forEach(el => {
    el.classList.add('reveal');
    if (typeof revealObserver !== 'undefined') revealObserver.observe(el);
  });
}

(async function loadEvents() {
  try {
    const res = await fetch(SHEET_CSV_URL);
    if (!res.ok) throw new Error(res.status);
    const csv = await res.text();
    const rows = parseCSV(csv);
    const events = rows.map(sheetRowToEvent);
    if (events.length) { renderEvents(events); return; }
  } catch (e) {
    console.warn('Sheet fetch failed, using fallback events:', e);
  }
  renderEvents(FALLBACK_EVENTS);
})();

// ===== YOUTUBE CHANNEL =====
const YOUTUBE_API_KEY = 'AIzaSyD9x9nqUqmRm9II-CHAOz7mg436UHbeCe4'; // YouTube Data API v3 — restrict by referrer (cengo.party) + API in Google Cloud
const YOUTUBE_HANDLE  = 'cengo_ofc';
// Shorts have no official API flag — detect by duration. Anything this short or under is treated as a Short.
const SHORT_MAX_SECONDS = 60;

function parseDuration(iso) {
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso || '');
  if (!m) return 0;
  return (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0);
}

function formatTime(secs) {
  secs = Math.round(Number(secs) || 0);
  if (secs <= 0) return '';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const mm = h ? String(m).padStart(2, '0') : String(m);
  return (h ? h + ':' : '') + mm + ':' + String(s).padStart(2, '0');
}

function formatCount(n) {
  const num = Number(n) || 0;
  if (num >= 1e6) return (num / 1e6).toFixed(num >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(num >= 1e4 ? 0 : 1).replace(/\.0$/, '') + 'K';
  return String(num);
}

function timeAgo(iso) {
  const then = new Date(iso).getTime();
  if (!then) return '';
  const secs = Math.max(1, Math.floor((Date.now() - then) / 1000));
  const units = [
    [31536000, 'year'], [2592000, 'month'], [604800, 'week'],
    [86400, 'day'], [3600, 'hour'], [60, 'minute'],
  ];
  for (const [s, label] of units) {
    const v = Math.floor(secs / s);
    if (v >= 1) return `${v} ${label}${v > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

async function fetchYouTube() {
  const base = 'https://www.googleapis.com/youtube/v3';
  // 1) Channel stats + uploads playlist
  const chRes = await fetch(`${base}/channels?part=statistics,contentDetails&forHandle=${YOUTUBE_HANDLE}&key=${YOUTUBE_API_KEY}`);
  if (!chRes.ok) throw new Error('channels ' + chRes.status);
  const chData = await chRes.json();
  const channel = chData.items && chData.items[0];
  if (!channel) throw new Error('channel not found');
  const stats = {
    subscribers: channel.statistics.subscriberCount,
    views: channel.statistics.viewCount,
    videos: channel.statistics.videoCount,
  };
  const uploadsId = channel.contentDetails.relatedPlaylists.uploads;

  // 2) Latest uploads (fetch a wider pool so we can split videos vs Shorts)
  const plRes = await fetch(`${base}/playlistItems?part=snippet,contentDetails&playlistId=${uploadsId}&maxResults=15&key=${YOUTUBE_API_KEY}`);
  if (!plRes.ok) throw new Error('playlistItems ' + plRes.status);
  const plData = await plRes.json();
  let items = (plData.items || []).map(it => {
    const sn = it.snippet || {};
    const thumbs = sn.thumbnails || {};
    const thumb = (thumbs.maxres || thumbs.high || thumbs.medium || thumbs.default || {}).url || '';
    return {
      id: it.contentDetails.videoId,
      title: sn.title || '',
      thumb,
      publishedAt: it.contentDetails.videoPublishedAt || sn.publishedAt || '',
      views: 0,
      isShort: false,
    };
  }).filter(v => v.id);

  // 3) Per-video view counts + duration (duration → Short detection)
  if (items.length) {
    const ids = items.map(v => v.id).join(',');
    const vRes = await fetch(`${base}/videos?part=statistics,contentDetails&id=${ids}&key=${YOUTUBE_API_KEY}`);
    if (vRes.ok) {
      const vData = await vRes.json();
      const meta = {};
      (vData.items || []).forEach(v => {
        meta[v.id] = {
          views: v.statistics.viewCount,
          secs: parseDuration(v.contentDetails && v.contentDetails.duration),
        };
      });
      items = items.map(v => {
        const m = meta[v.id] || {};
        return { ...v, views: m.views || 0, durationSecs: m.secs || 0, isShort: m.secs > 0 && m.secs <= SHORT_MAX_SECONDS };
      });
    }
  }

  // Split: regular videos vs Shorts (preserve newest-first order from the playlist)
  const videos = items.filter(v => !v.isShort);
  const shorts = items.filter(v => v.isShort);

  return { stats, videos, shorts };
}

function buildStats(stats) {
  const cells = [
    { value: formatCount(stats.subscribers), label: 'Subscribers' },
    { value: formatCount(stats.views), label: 'Total Views' },
    { value: formatCount(stats.videos), label: 'Videos' },
  ];
  return cells.map(c => `<div class="yt-stat">
    <span class="yt-stat-value">${c.value}</span>
    <span class="yt-stat-label">${c.label}</span>
  </div>`).join('');
}

function buildFeatured(video) {
  const meta = `${formatCount(video.views)} views · ${timeAgo(video.publishedAt)}`;
  const dur = formatTime(video.durationSecs);
  return `<div class="yt-featured-player" data-video-id="${sanitize(video.id)}">
    <button class="yt-featured-thumb" type="button" aria-label="Play ${sanitize(video.title)}">
      <img src="${sanitize(video.thumb)}" alt="${sanitize(video.title)}" loading="lazy">
      <span class="yt-play"></span>
      ${dur ? `<span class="yt-duration">${dur}</span>` : ''}
    </button>
  </div>
  <div class="yt-featured-info">
    <h3>${sanitize(video.title)}</h3>
    <p>${meta}</p>
  </div>`;
}

function buildVideoCard(video) {
  const meta = `${formatCount(video.views)} views · ${timeAgo(video.publishedAt)}`;
  const dur = formatTime(video.durationSecs);
  return `<a class="yt-card" href="https://www.youtube.com/watch?v=${sanitize(video.id)}" target="_blank" rel="noopener">
    <div class="yt-card-thumb">
      <img src="${sanitize(video.thumb)}" alt="${sanitize(video.title)}" loading="lazy">
      <span class="yt-play yt-play-sm"></span>
      ${dur ? `<span class="yt-duration">${dur}</span>` : ''}
    </div>
    <h4>${sanitize(video.title)}</h4>
    <p>${meta}</p>
  </a>`;
}

function buildShortCard(video) {
  const meta = `${formatCount(video.views)} views`;
  return `<a class="yt-short-card" href="https://www.youtube.com/shorts/${sanitize(video.id)}" target="_blank" rel="noopener">
    <div class="yt-short-thumb">
      <img src="${sanitize(video.thumb)}" alt="${sanitize(video.title)}" loading="lazy">
      <span class="yt-play yt-play-sm"></span>
    </div>
    <h4>${sanitize(video.title)}</h4>
    <p>${meta}</p>
  </a>`;
}

function renderYouTube({ stats, videos, shorts }) {
  const statsEl = document.getElementById('ytStats');
  const featuredEl = document.getElementById('ytFeatured');
  const gridEl = document.getElementById('ytGrid');
  const shortsWrap = document.getElementById('ytShortsWrap');
  const shortsEl = document.getElementById('ytShorts');

  statsEl.innerHTML = buildStats(stats);

  // Featured = latest regular video (never a Short); grid = the rest, capped
  if (videos.length) {
    featuredEl.innerHTML = buildFeatured(videos[0]);
    gridEl.innerHTML = videos.slice(1, 7).map(buildVideoCard).join('');

    // Click-to-load facade for the featured video
    const player = featuredEl.querySelector('.yt-featured-player');
    if (player) {
      const thumb = player.querySelector('.yt-featured-thumb');
      thumb.addEventListener('click', () => {
        const id = player.getAttribute('data-video-id');
        player.innerHTML = `<iframe src="https://www.youtube.com/embed/${id}?autoplay=1&rel=0"
          title="YouTube video" frameborder="0" allowfullscreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>`;
      });
    }
  } else {
    featuredEl.style.display = 'none';
    gridEl.style.display = 'none';
  }

  // Shorts row (hidden entirely if none)
  if (shorts.length && shortsWrap && shortsEl) {
    shortsEl.innerHTML = shorts.slice(0, 10).map(buildShortCard).join('');
  } else if (shortsWrap) {
    shortsWrap.style.display = 'none';
  }

  // Re-apply reveal to dynamically added cards
  [featuredEl, ...gridEl.querySelectorAll('.yt-card'), shortsWrap].forEach(el => {
    if (!el) return;
    el.classList.add('reveal');
    if (typeof revealObserver !== 'undefined') revealObserver.observe(el);
  });
}

function renderYouTubeFallback() {
  const section = document.getElementById('youtube');
  if (section) section.classList.add('yt-fallback');
}

(async function loadYouTube() {
  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'PASTE_KEY_HERE') { renderYouTubeFallback(); return; }
  try {
    const data = await fetchYouTube();
    if (data.videos.length || data.shorts.length) { renderYouTube(data); return; }
  } catch (e) {
    console.warn('YouTube fetch failed, using fallback:', e);
  }
  renderYouTubeFallback();
})();

// ===== SCROLL REVEAL (reversible) =====
const revealElements = document.querySelectorAll(
  '.section-tag, .section-title, .about-image-wrap, .about-content, ' +
  '.yt-stats, .yt-featured, .spotify-embed, .events-past-title, .event-row, .contact-info, .contact-form, .parallax-quote'
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

// ===== COMING SOON (Beatport & Apple Music) =====
document.querySelectorAll('.coming-soon-link').forEach(link => {
  let animating = false;
  link.addEventListener('click', (e) => {
    e.preventDefault();
    if (animating) return;
    animating = true;

    // Phase 1: shrink logo + wipe in "Coming Soon"
    link.classList.remove('show-return');
    link.classList.add('show-coming-soon');

    // Phase 2: after text flips out, grow logo back
    setTimeout(() => {
      link.classList.remove('show-coming-soon');
      link.classList.add('show-return');
    }, 1600);

    // Cleanup
    setTimeout(() => {
      link.classList.remove('show-return');
      animating = false;
    }, 2050);
  });
});

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
  const heroImg = document.querySelector('.hero-bg-img');
  let currentHeroOffset = 0;
  let lastScroll = 0;

  function updateParallax() {
    const scrolled = window.scrollY;
    const scrollingUp = scrolled < lastScroll;
    lastScroll = scrolled;

    // Hero parallax — slow drift down, fast snap-back up
    if (heroImg) {
      const targetOffset = scrolled * 0.15;
      if (scrollingUp) {
        // Lerp fast toward target when scrolling up (80% catch-up per frame)
        currentHeroOffset += (targetOffset - currentHeroOffset) * 0.8;
      } else {
        // Lerp slow when scrolling down (natural parallax lag)
        currentHeroOffset += (targetOffset - currentHeroOffset) * 0.3;
      }
      // Snap to 0 when very close to top
      if (scrolled < 10) currentHeroOffset = 0;
      heroImg.style.transform = `scale(1.05) translateY(${currentHeroOffset}px)`;
    }

    // Section divider parallax
    parallaxImages.forEach(img => {
      const rect = img.parentElement.getBoundingClientRect();
      const yPos = rect.top * 0.3;
      img.style.transform = `translateY(${yPos}px)`;
    });
  }

  // Use rAF loop for smoother lerp instead of scroll event
  function parallaxLoop() {
    updateParallax();
    requestAnimationFrame(parallaxLoop);
  }
  requestAnimationFrame(parallaxLoop);
}
