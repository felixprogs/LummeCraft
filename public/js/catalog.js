/* ══════════════════════════════════════════
   LUMMECRAFT — Catalog Page
══════════════════════════════════════════ */
'use strict';

/* ── STATE ── */
const CAT_PER_PAGE = 12;
let catState = {
  types:      ['paint', 'diamond','other'],
  sizes:      [],           // пусто = все
  difficulty: 0,            // 0 = любая, 1-5
  priceMin:   0,
  priceMax:   9999,
  inStockOnly:false,
  sort:       'popular',
  page:       1,
  view:       'grid',       // 'grid' | 'list'
  query:      '',
};

/* ── APPLY FILTERS ── */
function getFiltered() {
  let list = [...PRODUCTS];

  // Search query
  if (catState.query) {
    const q = catState.query.toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.size && p.size.toLowerCase().includes(q)) ||
      (p.difficulty && p.difficulty.toLowerCase().includes(q)) ||
      (p.badge && p.badge.toLowerCase().includes(q))
    );
  }

  // Type
  if (catState.types.length && catState.types.length < 3)
    list = list.filter(p => catState.types.includes(p.type));

  // Size
  if (catState.sizes.length)
    list = list.filter(p => catState.sizes.includes(p.size));

  // Difficulty stars
  if (catState.difficulty > 0)
    list = list.filter(p => p.stars === catState.difficulty);

  // Price
  list = list.filter(p => p.price >= catState.priceMin && p.price <= catState.priceMax);

  // In stock
  if (catState.inStockOnly) list = list.filter(p => p.inStock);

  // Sort
  switch (catState.sort) {
    case 'cheap':    list.sort((a,b) => a.price - b.price); break;
    case 'expensive':list.sort((a,b) => b.price - a.price); break;
    case 'rating':   list.sort((a,b) => b.rating - a.rating); break;
    case 'new':      list.sort((a,b) => b.id - a.id); break;
    case 'discount': list.sort((a,b) => {
      const da = a.oldPrice ? (a.oldPrice-a.price)/a.oldPrice : 0;
      const db = b.oldPrice ? (b.oldPrice-b.price)/b.oldPrice : 0;
      return db - da;
    }); break;
    default: /* popular — original order */ break;
  }

  return list;
}

/* ── RENDER GRID ── */
function renderCatalog() {
  const grid = document.getElementById('catGrid');
  const countEl = document.getElementById('catCount');
  if (!grid) return;

  const filtered = getFiltered();
  const total    = filtered.length;
  const pages    = Math.ceil(total / CAT_PER_PAGE);
  catState.page  = Math.min(catState.page, pages || 1);
  const slice = filtered.slice(
    (catState.page - 1) * CAT_PER_PAGE,
    catState.page * CAT_PER_PAGE
  );

  if (countEl) countEl.textContent = `Найдено: ${total} товар${ending(total)}`;

  if (!slice.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="icon">🔍</div>
        <h3>Ничего не найдено</h3>
        <p>Попробуйте изменить фильтры или поисковый запрос</p>
        <button class="btn btn-secondary btn-sm" style="margin-top:8px" onclick="resetFilters()">Сбросить фильтры</button>
      </div>`;
    renderPagination(0, 1);
    renderActiveTags();
    return;
  }

  grid.className = `catalog-grid ${catState.view === 'list' ? 'list' : ''}`;
  grid.innerHTML = slice.map(p => productCardHTML(p)).join('');
  renderPagination(total, pages);
  renderActiveTags();
}

function ending(n) {
  const mod10 = n % 10, mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 19) return 'ов';
  if (mod10 === 1) return '';
  if (mod10 >= 2 && mod10 <= 4) return 'а';
  return 'ов';
}

/* ── PAGINATION ── */
function renderPagination(total, pages) {
  const pg = document.getElementById('pagination');
  if (!pg) return;
  if (pages <= 1) { pg.innerHTML = ''; return; }

  const cur = catState.page;
  let html = '';

  const mkBtn = (label, page, cls='') =>
    `<button class="pg-btn ${page===cur?'on':''} ${cls}" ${page?`onclick="goPage(${page})"`:''}>${label}</button>`;

  html += mkBtn('←', cur > 1 ? cur-1 : null);

  // Page numbers with ellipsis
  const range = new Set([1, pages, cur-1, cur, cur+1].filter(p => p >= 1 && p <= pages));
  const sorted = [...range].sort((a,b)=>a-b);
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) html += `<button class="pg-btn ellipsis">…</button>`;
    html += mkBtn(p, p);
    prev = p;
  }

  html += mkBtn('→', cur < pages ? cur+1 : null);
  pg.innerHTML = html;
}

function goPage(n) {
  catState.page = n;
  renderCatalog();
  window.scrollTo({ top: document.getElementById('catGrid')?.offsetTop - 100, behavior:'smooth' });
}

/* ── ACTIVE FILTER TAGS ── */
function renderActiveTags() {
  const wrap = document.getElementById('activeTags');
  if (!wrap) return;
  const tags = [];

  if (catState.types.length === 1) {
    const typeLabels = {
      'paint': 'Картины по номерам',
      'diamond': 'Алмазная мозаика',
      'other': 'Другое'
    };

    const currentType = catState.types[0];

    tags.push({
      label: typeLabels[currentType] || 'Неизвестная категория',
      clear: () => {
        catState.types = ['paint', 'diamond', 'other']; 
        resetTypeUI();
      }
    });
  }
  catState.sizes.forEach(s =>
    tags.push({ label: s, clear: () => { catState.sizes = catState.sizes.filter(x=>x!==s); syncSizeChips(); } })
  );

  if (catState.difficulty > 0)
    tags.push({ label: `Сложность: ${catState.difficulty}★`, clear: () => { catState.difficulty=0; syncDiffBtns(); } });

  if (catState.priceMin > 0 || catState.priceMax < 9999)
    tags.push({ label: `${catState.priceMin}–${catState.priceMax} BYN`, clear: () => { catState.priceMin=0; catState.priceMax=9999; syncPriceUI(); } });

  if (catState.inStockOnly)
    tags.push({ label: 'В наличии', clear: () => { catState.inStockOnly=false; syncStockUI(); } });

  if (catState.query)
    tags.push({ label: `«${catState.query}»`, clear: () => { catState.query=''; const si=document.getElementById('catSearchInp'); if(si) si.value=''; } });

  wrap.innerHTML = tags.map((t,i) =>
    `<span class="af-tag" onclick="clearTag(${i})"><span>${esc(t.label)}</span><span class="x">×</span></span>`
  ).join('');

  // store for onclick
  wrap._tagActions = tags.map(t => t.clear);
}

function clearTag(i) {
  const wrap = document.getElementById('activeTags');
  if (wrap._tagActions && wrap._tagActions[i]) { wrap._tagActions[i](); catState.page=1; renderCatalog(); }
}

/* ── FILTER CONTROLS ── */
function setType(type, checked) {
  if (checked) { if (!catState.types.includes(type)) catState.types.push(type); }
  else catState.types = catState.types.filter(t => t !== type);
  catState.page = 1; renderCatalog();
}
function resetTypeUI() {
  ['paint','diamond', 'other'].forEach(t => {
    const cb = document.querySelector(`.fp-check input[data-type="${t}"]`);
    if (cb) cb.checked = true;
  });
}

function toggleSize(chip, size) {
  chip.classList.toggle('on');
  if (catState.sizes.includes(size)) catState.sizes = catState.sizes.filter(s=>s!==size);
  else catState.sizes.push(size);
  catState.page=1; renderCatalog();
}
function syncSizeChips() {
  document.querySelectorAll('.size-chip').forEach(c => {
    c.classList.toggle('on', catState.sizes.includes(c.dataset.size));
  });
}

function setDiff(n) {
  catState.difficulty = catState.difficulty === n ? 0 : n;
  syncDiffBtns(); catState.page=1; renderCatalog();
}
function syncDiffBtns() {
  document.querySelectorAll('.diff-btn').forEach(b => {
    b.classList.toggle('on', +b.dataset.diff === catState.difficulty);
  });
}

function applyPrice() {
  const mn = document.getElementById('priceMin');
  const mx = document.getElementById('priceMax');
  catState.priceMin = mn ? Math.max(0, parseInt(mn.value)||0) : 0;
  catState.priceMax = mx ? Math.min(9999, parseInt(mx.value)||9999) : 9999;
  if (catState.priceMin > catState.priceMax) [catState.priceMin, catState.priceMax] = [catState.priceMax, catState.priceMin];
  catState.page=1; renderCatalog();
}
function syncPriceUI() {
  const mn = document.getElementById('priceMin');
  const mx = document.getElementById('priceMax');
  if (mn) mn.value = catState.priceMin || '';
  if (mx) mx.value = catState.priceMax >= 9999 ? '' : catState.priceMax;
}

function setStock(checked) { catState.inStockOnly = checked; catState.page=1; renderCatalog(); }
function syncStockUI() {
  const cb = document.getElementById('stockOnly');
  if (cb) cb.checked = catState.inStockOnly;
}

function resetFilters() {
  catState = { ...catState, types:['paint','diamond','other'], sizes:[], difficulty:0, priceMin:0, priceMax:9999, inStockOnly:false, page:1, query:'' };
  // sync UI
  document.querySelectorAll('.fp-check input[data-type]').forEach(cb => cb.checked=true);
  syncSizeChips(); syncDiffBtns(); syncPriceUI(); syncStockUI();
  const si = document.getElementById('catSearchInp');
  if (si) si.value = '';
  renderCatalog();
  toast('Фильтры сброшены');
}

function setSort(val) { catState.sort=val; catState.page=1; renderCatalog(); }
function setView(v, btn) {
  catState.view = v;
  document.querySelectorAll('.vt-btn').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  renderCatalog();
}

/* inline search in catalog header */
const doCatSearch = debounce(q => { catState.query=q; catState.page=1; renderCatalog(); }, 250);

/* ── FILTER PANEL MOBILE TOGGLE ── */
function toggleFilterPanel() {
  document.getElementById('filtersPanelWrap')?.classList.toggle('open');
}

/* ── OPEN PRODUCT BY URL PARAM ── */
function checkUrlParam() {
  const id = parseInt(new URLSearchParams(location.search).get('id'));
  if (id) {
    history.replaceState(null,'', location.pathname); // clean URL
    setTimeout(() => openProductDetail(id), 200);
  }
}

/* ── REFRESH CARDS (called after cart/fav changes) ── */
function refreshCards() { renderCatalog(); }

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  sharedInit();
  renderCatalog();
  checkUrlParam();

  // Price inputs: apply on Enter
  ['priceMin','priceMax'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => { if(e.key==='Enter') applyPrice(); });
  });
});