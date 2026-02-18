/* ============================================================
   NusaNews — app.js
   Modern Indonesian News Portal
   API: berita-indo-api-next.vercel.app (via local proxy /api/*)
   ============================================================ */

'use strict';

// ── Config ────────────────────────────────────────────────────
const API_BASE = 'https://berita-indo-api-next.vercel.app/api';
const PROXY_URL = 'https://api.allorigins.win/get?url=';

// Sources mapped to their API endpoints and categories
const SOURCES = {
    'cnn-news': {
        name: 'CNN Indonesia',
        endpoint: '/api/cnn-news',
        categories: [
            { key: '', label: 'Semua' },
            { key: 'nasional', label: 'Nasional' },
            { key: 'internasional', label: 'Internasional' },
            { key: 'ekonomi', label: 'Ekonomi' },
            { key: 'olahraga', label: 'Olahraga' },
            { key: 'teknologi', label: 'Teknologi' },
            { key: 'hiburan', label: 'Hiburan' },
            { key: 'gaya-hidup', label: 'Gaya Hidup' },
        ],
    },
    'cnbc-news': {
        name: 'CNBC Indonesia',
        endpoint: '/api/cnbc-news',
        categories: [
            { key: '', label: 'Semua' },
            { key: 'market', label: 'Market' },
            { key: 'news', label: 'News' },
            { key: 'entrepreneur', label: 'Entrepreneur' },
            { key: 'syariah', label: 'Syariah' },
            { key: 'tech', label: 'Tech' },
            { key: 'lifestyle', label: 'Lifestyle' },
        ],
    },
    'antara-news': {
        name: 'Antara',
        endpoint: '/api/antara-news',
        categories: [
            { key: 'terkini', label: 'Terkini' },
            { key: 'top-news', label: 'Top News' },
            { key: 'politik', label: 'Politik' },
            { key: 'hukum', label: 'Hukum' },
            { key: 'ekonomi', label: 'Ekonomi' },
            { key: 'metro', label: 'Metro' },
            { key: 'sepakbola', label: 'Sepakbola' },
            { key: 'olahraga', label: 'Olahraga' },
            { key: 'humaniora', label: 'Humaniora' },
            { key: 'lifestyle', label: 'Lifestyle' },
            { key: 'hiburan', label: 'Hiburan' },
            { key: 'dunia', label: 'Dunia' },
            { key: 'tekno', label: 'Tekno' },
            { key: 'otomotif', label: 'Otomotif' },
        ],
    },
    'tempo-news': {
        name: 'Tempo',
        endpoint: '/api/tempo-news',
        categories: [
            { key: '', label: 'Semua' },
            { key: 'nasional', label: 'Nasional' },
            { key: 'bisnis', label: 'Bisnis' },
            { key: 'metro', label: 'Metro' },
            { key: 'dunia', label: 'Dunia' },
            { key: 'bola', label: 'Bola' },
            { key: 'sport', label: 'Sport' },
            { key: 'cantik', label: 'Cantik' },
            { key: 'tekno', label: 'Tekno' },
            { key: 'otomotif', label: 'Otomotif' },
            { key: 'nusantara', label: 'Nusantara' },
        ],
    },
    'republika-news': {
        name: 'Republika',
        endpoint: '/api/republika-news',
        categories: [
            { key: '', label: 'Semua' },
            { key: 'news', label: 'News' },
            { key: 'nusantara', label: 'Nusantara' },
            { key: 'khazanah', label: 'Khazanah' },
            { key: 'islam-digest', label: 'Islam Digest' },
            { key: 'internasional', label: 'Internasional' },
            { key: 'ekonomi', label: 'Ekonomi' },
            { key: 'sepakbola', label: 'Sepakbola' },
            { key: 'leisure', label: 'Leisure' },
        ],
    },
    'okezone-news': {
        name: 'Okezone',
        endpoint: '/api/okezone-news',
        categories: [{ key: '', label: 'Semua' }],
    },
    'tribun-news': {
        name: 'Tribun News',
        endpoint: '/api/tribun-news',
        categories: [{ key: '', label: 'Semua' }],
    },
    'suara-news': {
        name: 'Suara',
        endpoint: '/api/suara-news',
        categories: [
            { key: '', label: 'Semua' },
            { key: 'bisnis', label: 'Bisnis' },
            { key: 'bola', label: 'Bola' },
            { key: 'lifestyle', label: 'Lifestyle' },
            { key: 'entertainment', label: 'Entertainment' },
            { key: 'otomotif', label: 'Otomotif' },
            { key: 'tekno', label: 'Tekno' },
            { key: 'health', label: 'Kesehatan' },
        ],
    },
    'kumparan-news': {
        name: 'Kumparan',
        endpoint: '/api/kumparan-news',
        categories: [{ key: '', label: 'Semua' }],
    },
    'bbc-news': {
        name: 'BBC Indonesia',
        endpoint: '/api/bbc-news',
        categories: [{ key: '', label: 'Semua' }],
    },
    'voa-news': {
        name: 'VOA Indonesia',
        endpoint: '/api/voa-news',
        categories: [{ key: '', label: 'Semua' }],
    },
};

// ── State ─────────────────────────────────────────────────────
let state = {
    source: 'cnn-news',
    category: '',
    articles: [],
    displayed: 0,
    perPage: 12,
    loading: false,
    theme: localStorage.getItem('nn-theme') || 'dark',
    viewMode: 'grid',
    cache: {},
};

// ── DOM Refs ──────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

const preloader = $('preloader');
const newsGrid = $('news-grid');
const heroFeatured = $('hero-featured');
const heroSidebar = $('hero-sidebar');
const sourceBadge = $('source-badge');
const sourceCount = $('source-count');
const categoryScroll = $('category-scroll');
const loadMoreBtn = $('load-more-btn');
const loadMoreWrap = $('load-more-wrap');
const ticker = $('ticker');
const liveClock = $('live-clock');
const themeToggle = $('theme-toggle');
const hamburger = $('hamburger');
const mainNav = $('main-nav');
const searchInput = $('search-input');
const searchBtn = $('search-btn');
const searchOverlay = $('search-overlay');
const searchResults = $('search-results-grid');
const searchDisplay = $('search-query-display');
const closeSearch = $('close-search');
const modalOverlay = $('modal-overlay');
const modalClose = $('modal-close');
const modalContent = $('modal-content');
const toast = $('toast');
const gridViewBtn = $('grid-view-btn');
const listViewBtn = $('list-view-btn');

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    startClock();
    buildNav();
    buildFooterLinks();
    loadNews('cnn-news', '');

    setTimeout(() => preloader.classList.add('hidden'), 1800);
});

// ── Theme ─────────────────────────────────────────────────────
function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
}
themeToggle.addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('nn-theme', state.theme);
    applyTheme();
    showToast(state.theme === 'dark' ? '🌙 Mode Gelap aktif' : '☀️ Mode Terang aktif');
});

// ── Clock ─────────────────────────────────────────────────────
function startClock() {
    const update = () => {
        const now = new Date();
        liveClock.textContent = now.toLocaleDateString('id-ID', {
            weekday: 'short', day: 'numeric', month: 'short',
            hour: '2-digit', minute: '2-digit'
        });
    };
    update();
    setInterval(update, 60000);
}

// ── Build Nav ─────────────────────────────────────────────────
function buildNav() {
    const navList = $('nav-list');
    navList.innerHTML = Object.entries(SOURCES).map(([key, src], i) => `
    <li>
      <a href="#" class="nav-link ${i === 0 ? 'active' : ''}"
         data-source="${key}" data-category="">
        ${src.name}
      </a>
    </li>
  `).join('');

    navList.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            navList.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            loadNews(link.dataset.source, link.dataset.category || '');
            if (mainNav.classList.contains('open')) {
                mainNav.classList.remove('open');
                hamburger.classList.remove('active');
            }
        });
    });
}

function buildFooterLinks() {
    // Footer source links
    document.querySelectorAll('.footer-links a[data-source]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const src = link.dataset.source;
            const cat = link.dataset.category || '';
            loadNews(src, cat);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            $$('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.source === src));
        });
    });
}

// ── Category Bar ──────────────────────────────────────────────
function renderCategoryBar(sourceKey, activeCategory) {
    const cats = SOURCES[sourceKey]?.categories || [{ key: '', label: 'Semua' }];
    categoryScroll.innerHTML = cats.map(cat => `
    <button class="cat-btn ${cat.key === activeCategory ? 'active' : ''}" data-cat="${cat.key}">
      ${cat.label}
    </button>
  `).join('');

    categoryScroll.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            categoryScroll.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadNews(state.source, btn.dataset.cat);
        });
    });
}

// ── Build API URL ─────────────────────────────────────────────
function buildApiUrl(sourceKey, category) {
    const src = SOURCES[sourceKey];
    if (!src) return null;

    // Antara requires a category, default to 'terkini'
    if (sourceKey === 'antara-news') {
        const cat = category || 'terkini';
        return `${API_BASE}/antara-news/${cat}`;
    }

    if (category) {
        return `${API_BASE}/${sourceKey}/${category}`;
    }
    return `${API_BASE}/${sourceKey}`;
}

// ── Load News ─────────────────────────────────────────────────
async function loadNews(sourceKey, category) {
    if (state.loading) return;
    state.loading = true;
    state.source = sourceKey;
    state.category = category;
    state.articles = [];
    state.displayed = 0;

    const srcInfo = SOURCES[sourceKey];
    sourceBadge.textContent = srcInfo?.name || sourceKey;
    sourceCount.textContent = '';
    renderCategoryBar(sourceKey, category);
    renderSkeletons();
    heroFeatured.innerHTML = '';
    heroSidebar.innerHTML = '';
    loadMoreWrap.style.display = 'none';

    const targetUrl = buildApiUrl(sourceKey, category);
    const proxyUrl = `${PROXY_URL}${encodeURIComponent(targetUrl)}&timestamp=${Date.now()}`;
    const cacheKey = targetUrl;

    try {
        let posts;
        if (state.cache[cacheKey]) {
            posts = state.cache[cacheKey];
        } else {
            const res = await fetch(proxyUrl);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const proxyData = await res.json();

            // AllOrigins wraps the result in a 'contents' string (which is JSON)
            const data = JSON.parse(proxyData.contents);

            // API returns { messages, total, data: [...] }
            posts = data?.data || [];
            if (!Array.isArray(posts) || posts.length === 0) throw new Error('Tidak ada artikel');
            state.cache[cacheKey] = posts;
        }

        state.articles = posts;
        sourceCount.textContent = `${posts.length} artikel`;

        renderHero(posts.slice(0, 4), sourceKey);
        renderGrid(false);
        updateTicker(posts.slice(0, 10));

    } catch (err) {
        console.error('[loadNews]', err);
        renderError(sourceKey, category, err.message);
        showToast('Gagal memuat berita: ' + err.message, true);
    } finally {
        state.loading = false;
    }
}

// ── Get Image ─────────────────────────────────────────────────
function getImage(post) {
    // Different sources use different image fields
    if (post.image?.small) return post.image.small;
    if (post.image?.large) return post.image.large;
    if (post.image) return post.image;
    if (post.thumbnail) return post.thumbnail;
    if (post.enclosure?.url) return post.enclosure.url;
    return null;
}

// ── Render Hero ───────────────────────────────────────────────
function renderHero(posts, sourceKey) {
    if (!posts.length) return;
    const main = posts[0];
    const sides = posts.slice(1, 4);
    const img = getImage(main);
    const srcName = SOURCES[sourceKey]?.name || sourceKey;

    heroFeatured.innerHTML = `
    ${img
            ? `<img class="hero-img" src="${img}" alt="${escHtml(main.title)}" loading="lazy" onerror="this.style.display='none'">`
            : `<div class="hero-img" style="background:linear-gradient(135deg,#1a1a2e,#16213e)"></div>`
        }
    <div class="hero-gradient"></div>
    <div class="hero-body">
      <div class="hero-source">
        <span class="live-dot"></span>
        ${srcName}
      </div>
      <h2 class="hero-title">${escHtml(main.title)}</h2>
      <div class="hero-meta">
        <span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ${formatDate(main.isoDate || main.pubDate)}
        </span>
        ${main.creator ? `<span>✍️ ${escHtml(main.creator)}</span>` : ''}
      </div>
    </div>
  `;
    heroFeatured.style.cursor = 'pointer';
    heroFeatured.onclick = () => openModal(main, sourceKey);

    heroSidebar.innerHTML = sides.map((post, i) => {
        const sImg = getImage(post);
        return `
      <div class="hero-side-card fade-in" style="animation-delay:${i * 0.08}s" data-idx="${i}">
        ${sImg
                ? `<img class="hero-side-img" src="${sImg}" alt="${escHtml(post.title)}" loading="lazy" onerror="this.style.background='var(--bg3)';this.style.display='none'">`
                : `<div class="hero-side-img" style="background:var(--bg3)"></div>`
            }
        <div class="hero-side-body">
          <div class="hero-side-source">${srcName}</div>
          <div class="hero-side-title">${escHtml(post.title)}</div>
          <div class="hero-side-time">${formatDate(post.isoDate || post.pubDate)}</div>
        </div>
      </div>
    `;
    }).join('');

    heroSidebar.querySelectorAll('.hero-side-card').forEach((card, i) => {
        card.addEventListener('click', () => openModal(sides[i], sourceKey));
    });
}

// ── Render Grid ───────────────────────────────────────────────
function renderGrid(append = false) {
    const start = append ? state.displayed : 0;
    const end = Math.min(start + state.perPage, state.articles.length);
    const slice = state.articles.slice(start, end);

    if (!append) newsGrid.innerHTML = '';

    slice.forEach((post, i) => {
        const card = createCard(post, state.source, i);
        newsGrid.appendChild(card);
    });

    state.displayed = end;
    loadMoreWrap.style.display = state.displayed < state.articles.length ? 'flex' : 'none';
}

function createCard(post, sourceKey, idx) {
    const card = document.createElement('div');
    card.className = 'news-card fade-in';
    card.style.animationDelay = `${(idx % state.perPage) * 0.04}s`;

    const img = getImage(post);
    const srcName = SOURCES[sourceKey]?.name || sourceKey;
    const catLabel = state.category
        ? (SOURCES[sourceKey]?.categories?.find(c => c.key === state.category)?.label || state.category)
        : 'Terbaru';

    const imgHtml = img
        ? `<img class="card-img" src="${img}" alt="${escHtml(post.title)}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'card-img-placeholder\\'><svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'1\\'><rect x=\\'3\\' y=\\'3\\' width=\\'18\\' height=\\'18\\' rx=\\'2\\'/><circle cx=\\'8.5\\' cy=\\'8.5\\' r=\\'1.5\\'/><polyline points=\\'21 15 16 10 5 21\\'/></svg></div>'">`
        : `<div class="card-img-placeholder"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`;

    card.innerHTML = `
    <div class="card-img-wrap">
      ${imgHtml}
      <span class="card-category">${catLabel}</span>
    </div>
    <div class="card-body">
      <div class="card-source">${srcName}</div>
      <h3 class="card-title">${escHtml(post.title)}</h3>
      ${post.contentSnippet ? `<p class="card-desc">${escHtml(stripHtml(post.contentSnippet))}</p>` : ''}
      <div class="card-footer">
        <span class="card-time">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ${formatDate(post.isoDate || post.pubDate)}
        </span>
        <span class="card-read-btn">
          Baca
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </span>
      </div>
    </div>
  `;

    card.addEventListener('click', () => openModal(post, sourceKey));
    return card;
}

// ── Render Skeletons ──────────────────────────────────────────
function renderSkeletons() {
    newsGrid.innerHTML = Array(8).fill(0).map(() => `
    <div class="skeleton">
      <div class="skeleton-img"></div>
      <div class="skeleton-body">
        <div class="skeleton-line short"></div>
        <div class="skeleton-line medium"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
    </div>
  `).join('');
}

// ── Render Error ──────────────────────────────────────────────
function renderError(sourceKey, category, msg) {
    newsGrid.innerHTML = `
    <div class="error-state">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <h3>Gagal memuat berita</h3>
      <p>${msg || 'Terjadi kesalahan. Silakan coba lagi.'}</p>
      <button class="retry-btn" onclick="loadNews('${sourceKey}','${category}')">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></svg>
        Coba Lagi
      </button>
    </div>
  `;
    heroFeatured.innerHTML = '';
    heroSidebar.innerHTML = '';
}

// ── Load More ─────────────────────────────────────────────────
loadMoreBtn.addEventListener('click', () => {
    loadMoreBtn.classList.add('loading');
    loadMoreBtn.querySelector('span').textContent = 'Memuat...';
    setTimeout(() => {
        renderGrid(true);
        loadMoreBtn.classList.remove('loading');
        loadMoreBtn.querySelector('span').textContent = 'Muat Lebih Banyak';
    }, 400);
});

// ── View Toggle ───────────────────────────────────────────────
gridViewBtn.addEventListener('click', () => {
    state.viewMode = 'grid';
    newsGrid.classList.remove('list-view');
    gridViewBtn.classList.add('active');
    listViewBtn.classList.remove('active');
});
listViewBtn.addEventListener('click', () => {
    state.viewMode = 'list';
    newsGrid.classList.add('list-view');
    listViewBtn.classList.add('active');
    gridViewBtn.classList.remove('active');
});

// ── Modal ─────────────────────────────────────────────────────
function openModal(post, sourceKey) {
    const img = getImage(post);
    const desc = post.contentSnippet ? stripHtml(post.contentSnippet) : 'Klik tombol di bawah untuk membaca artikel lengkap.';
    const srcName = SOURCES[sourceKey]?.name || sourceKey;

    modalContent.innerHTML = `
    <div class="modal-source-badge">
      <span class="live-dot" style="background:var(--primary)"></span>
      ${srcName}
    </div>
    <h2 class="modal-title">${escHtml(post.title)}</h2>
    ${img ? `<img class="modal-img" src="${img}" alt="${escHtml(post.title)}" onerror="this.style.display='none'">` : ''}
    <div class="modal-meta">
      <span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        ${formatDate(post.isoDate || post.pubDate)}
      </span>
      ${post.creator ? `<span>✍️ ${escHtml(post.creator)}</span>` : ''}
    </div>
    <p class="modal-desc">${escHtml(desc)}</p>
    <a class="modal-link" href="${post.link}" target="_blank" rel="noopener noreferrer">
      Baca Artikel Lengkap
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
    </a>
  `;

    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); closeSearchOverlay(); }
});
function closeModal() {
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
}

// ── Ticker ────────────────────────────────────────────────────
function updateTicker(posts) {
    if (!posts.length) return;
    const items = posts.map(p => escHtml(p.title)).join('  •  ');
    ticker.innerHTML = `<span>${items}</span>`;
}

// ── Search ────────────────────────────────────────────────────
searchBtn.addEventListener('click', doSearch);
searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });

async function doSearch() {
    const q = searchInput.value.trim();
    if (!q) return;

    searchDisplay.textContent = `"${q}"`;
    searchOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    searchResults.innerHTML = `<div class="skeleton" style="grid-column:1/-1;height:200px"><div class="skeleton-img" style="height:100%"></div></div>`;

    // Collect all cached articles
    const allPosts = [];
    Object.entries(state.cache).forEach(([key, posts]) => {
        // Determine source from URL
        const srcKey = Object.keys(SOURCES).find(k => key.includes(k)) || state.source;
        posts.forEach(p => allPosts.push({ ...p, _source: srcKey }));
    });
    // Include current articles
    state.articles.forEach(p => {
        if (!allPosts.find(a => a.link === p.link)) {
            allPosts.push({ ...p, _source: state.source });
        }
    });

    const lower = q.toLowerCase();
    const results = allPosts.filter(p =>
        p.title?.toLowerCase().includes(lower) ||
        p.contentSnippet?.toLowerCase().includes(lower)
    );

    if (!results.length) {
        searchResults.innerHTML = `
      <div class="no-results">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <h3>Tidak ada hasil</h3>
        <p>Coba kata kunci lain atau jelajahi sumber berita lain terlebih dahulu.</p>
      </div>
    `;
        return;
    }

    searchResults.innerHTML = '';
    results.slice(0, 30).forEach((post, i) => {
        const card = createCard(post, post._source, i);
        searchResults.appendChild(card);
    });
}

closeSearch.addEventListener('click', closeSearchOverlay);
function closeSearchOverlay() {
    searchOverlay.classList.remove('open');
    document.body.style.overflow = '';
}

// ── Toast ─────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, isError = false) {
    toast.textContent = msg;
    toast.className = `toast show${isError ? ' error' : ''}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}

// ── Helpers ───────────────────────────────────────────────────
function escHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
function stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}
function formatDate(dateStr) {
    if (!dateStr) return 'Baru saja';
    try {
        const d = new Date(dateStr);
        const diff = Math.floor((Date.now() - d) / 1000);
        if (diff < 60) return 'Baru saja';
        if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`;
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return dateStr; }
}

// ── Scroll & Logo ─────────────────────────────────────────────
$('logo-home').addEventListener('click', e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mainNav.classList.toggle('open');
});
window.addEventListener('scroll', () => {
    $('header').style.boxShadow = window.scrollY > 20 ? '0 4px 30px rgba(0,0,0,0.3)' : 'none';
}, { passive: true });
