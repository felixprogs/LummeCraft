/* ══════════════════════════════════════════
   LUMMECRAFT — shared.js (с поддержкой API)
   Патч для cart modal: submitOrder → API
══════════════════════════════════════════ */
'use strict';

/* ─────────────────────────────────────────
   SHARED INIT (вызывается на каждой странице)
───────────────────────────────────────── */
function sharedInit() {
  updateCartBadge();

  /* Header scroll */
  const header = document.getElementById('mainHeader');
  const scrollTopBtn = document.getElementById('scrollTop');
  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 20);
    scrollTopBtn?.classList.toggle('show', window.scrollY > 400);
  }, { passive: true });

  /* Reveal */
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

  /* Mobile burger */
  document.getElementById('burgerBtn')?.addEventListener('click', () => {
    document.getElementById('mobNav')?.classList.toggle('open');
  });
  document.getElementById('mobNavClose')?.addEventListener('click', () => {
    document.getElementById('mobNav')?.classList.remove('open');
  });

  /* Search overlay */
  document.getElementById('searchOverlay')?.addEventListener('click', function(e) {
    if (e.target === this) closeSearchOverlay();
  });
}

/* ─────────────────────────────────────────
   SEARCH OVERLAY
───────────────────────────────────────── */
function openSearch() {
  const ov = document.getElementById('searchOverlay');
  ov?.classList.add('open');
  setTimeout(() => document.getElementById('searchInp')?.focus(), 100);
}
function closeSearchOverlay() {
  document.getElementById('searchOverlay')?.classList.remove('open');
}
function handleSearchInput(val) {
  const q = val.toLowerCase().trim();
  const wrap = document.getElementById('searchResults');
  if (!wrap) return;
  if (!q) { wrap.innerHTML = ''; return; }
  const found = PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(q) || (p.size && p.size.toLowerCase().includes(q))
  ).slice(0, 6);
  if (!found.length) {
    wrap.innerHTML = '<div style="padding:20px;color:var(--text-muted);text-align:center">Ничего не найдено</div>';
    return;
  }
  wrap.innerHTML = found.map(p => `
    <a class="sr-item" href="catalog.html?id=${p.id}" onclick="closeSearchOverlay()">
      <div class="sr-thumb" data-type="${p.type}">${p.image ? `<img src="${p.image}" alt="">` : '🎁'}</div>
      <div class="sr-info">
        <div class="sr-name">${esc(p.name)}</div>
        <div class="sr-sub">${p.size} · ${fmt(p.price)}</div>
      </div>
    </a>
  `).join('');
}

/* ─────────────────────────────────────────
   CART BADGE
───────────────────────────────────────── */
function updateCartBadge() {
  const cnt = cartCount();
  document.querySelectorAll('.cart-badge, #cartBadge').forEach(b => {
    b.style.display = cnt > 0 ? 'flex' : 'none';
    b.textContent = cnt;
  });
}

/* ─────────────────────────────────────────
   PRODUCT CARD HTML (единый рендер для всех страниц)
───────────────────────────────────────── */
function productCardHTML(p) {
  const inCart = cart.find(c => c.id === p.id);
  const isFav  = favs.has(p.id);

  const paintIcon   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="1.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="1.5" fill="currentColor"/><circle cx="8.5" cy="7.5" r="1.5" fill="currentColor"/><circle cx="6.5" cy="12.5" r="1.5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.4-.3-.4-.5-.9-.5-1.4 0-1.1.9-2 2-2h2.4c2.5 0 4.6-2 4.6-4.6C22 5.9 17.5 2 12 2Z"/></svg>`;
  const diamondIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 12L2 9l4-6Z"/><path d="M2 9h20"/><path d="m12 21 4-12-4-6-4 6 4 12Z"/></svg>`;
  const heartFull   = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"/></svg>`;
  const heartEmpty  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"/></svg>`;
  const cartIco     = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`;
  const checkIco    = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/></svg>`;

  const genericIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 7.3 12 12l-8.5-4.7"/><path d="M12 22V12"/><path d="m20.5 7.3-8.4-4.6a1 1 0 0 0-1 0L3 7.4a1 1 0 0 0-.5.9v7.4a1 1 0 0 0 .5.9l8.5 4.7a1 1 0 0 0 1 0l8.5-4.7a1 1 0 0 0 .5-.9V8.1a1 1 0 0 0-.5-.8Z"/></svg>`;

  const typeLabel = p.type === 'paint' ? 'Картина по номерам'
                   : p.type === 'diamond' ? 'Алмазная мозаика'
                   : '';

  let starsHtml = '';
  if (typeof p.stars === 'number') {
    for (let i=1;i<=5;i++) starsHtml += `<svg viewBox="0 0 24 24" fill="${i<=p.stars?'currentColor':'none'}" stroke="currentColor" stroke-width="1.5" style="width:11px;height:11px;color:${i<=p.stars?'#E6B53C':'#ccc'}"><path d="M12 2 15.1 8.3 22 9.3l-5 4.9L18.2 21 12 17.8 5.8 21 7 14.2 2 9.3l6.9-1Z"/></svg>`;
  }

  return `
  <div class="product-card" onclick="openProductDetail(${p.id})" data-type="${p.type}" data-id="${p.id}">
    <div class="product-img">
      ${p.image
        ? `<img src="${p.image}" alt="${esc(p.name)}" loading="lazy" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.classList.add('img-fallback');this.remove()">`
        : `<div class="product-tile" data-type="${p.type}">
             ${p.type==='paint' ? paintIcon : p.type==='diamond' ? diamondIcon : genericIcon}
           </div>`
      }
      ${p.badge ? `<div class="product-badge">${esc(p.badge)}</div>` : ''}
        ${isFav ? heartFull : heartEmpty}
      </button>
    </div>
    <div class="product-info">
      <div class="product-name">${esc(p.name)}</div>
      <div class="product-size">
        ${[typeLabel, p.size].filter(Boolean).join(' · ')}
        ${starsHtml ? `<span class="product-stars">${starsHtml}</span>` : ''}
      </div>
      <div class="product-prices">
        <div class="price-new">${p.price.toLocaleString('ru')} BYN</div>
        ${p.oldPrice||p.old_price ? `<div class="price-old">${(p.oldPrice||p.old_price).toLocaleString('ru')} BYN</div>` : ''}
      </div>
      ${(p.inStock||p.in_stock)
        ? `<button class="product-add ${inCart?'added':''}" onclick="event.stopPropagation();addToCartItem(${p.id})">
             ${inCart ? `${checkIco} В корзине` : `${cartIco} В корзину`}
           </button>`
        : `<button class="product-add" style="background:var(--text-muted);cursor:not-allowed" disabled>Нет в наличии</button>`
      }
    </div>
  </div>`;
}

/* ─────────────────────────────────────────
   CART ITEM ACTIONS (единые для всех страниц)
───────────────────────────────────────── */
function addToCartItem(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  cartAdd(id);
  updateCartBadge();
  if (typeof refreshCards === 'function') refreshCards();
  toast(`«${p.name}» добавлен в корзину`, 'ok');
}

function toggleFavItem(id) {
  const added = favToggle(id);
  const badge = document.querySelector('.fav-badge');
  if (badge) {
    badge.style.display = favs.size > 0 ? 'flex' : 'none';
    badge.textContent = favs.size;
  }
  if (typeof refreshCards === 'function') refreshCards();
  toast(added ? 'Добавлено в избранное' : 'Удалено из избранного');
}

/* ─────────────────────────────────────────
   PRODUCT DETAIL MODAL
───────────────────────────────────────── */
function openProductDetail(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;

  const modal = document.getElementById('pdModal');
  if (!modal) return;

  const inCart = cart.find(c => c.id === p.id);

  const pdTypeLabel = p.type==='paint' ? 'Картина по номерам' : p.type==='diamond' ? 'Алмазная мозаика' : 'Творческий набор';

  modal.querySelector('.modal-box').innerHTML = `
    <div class="pd-layout">
      <div class="pd-visual" data-type="${p.type}">
        ${p.image ? `<img src="${p.image}" alt="${esc(p.name)}" style="width:100%;height:100%;object-fit:cover">` : `<span style="font-size:90px">🎁</span>`}
      </div>
      <div class="pd-info">
        <button class="modal-close" onclick="document.getElementById('pdModal').classList.remove('open')" style="float:right;margin:-4px -4px 0 0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
        <div class="pd-badge">${pdTypeLabel}</div>
        <div class="pd-name">${esc(p.name)}</div>
        <div class="pd-meta-row">
          ${p.size ? `<span class="pd-chip">${esc(p.size)}</span>` : ''}
          ${p.difficulty ? `<span class="pd-chip">${esc(p.difficulty)}</span>` : (typeof p.stars === 'number' ? `<span class="pd-chip">${p.stars}★</span>` : '')}
          ${p.badge?`<span class="pd-chip" style="background:var(--accent);color:#fff">${esc(p.badge)}</span>`:''}
        </div>
        <div class="pd-price-row">
          <span class="pd-price">${p.price.toLocaleString('ru')} BYN</span>
          ${p.oldPrice||p.old_price?`<span class="pd-old">${(p.oldPrice||p.old_price).toLocaleString('ru')} BYN</span><span class="pd-save">−${Math.round((1-(p.price/(p.oldPrice||p.old_price)))*100)}%</span>`:''}
        </div>
        <div class="pd-desc">${esc(p.desc||p.description||'')}</div>
        <div class="pd-actions">
          <button class="pd-add-btn ${inCart?'added':''}" id="pdAddBtn" onclick="pdAddToCart(${p.id})">
            ${inCart?'✓ В корзине':'В корзину'}
          </button>
          <div class="pd-stock ${(p.inStock||p.in_stock)?'in':'out'}">
            ${(p.inStock||p.in_stock)?'● В наличии':'● Нет в наличии'}
          </div>
        </div>
      </div>
    </div>`;

  modal.classList.add('open');
}

function pdAddToCart(id) {
  addToCartItem(id);
  const btn = document.getElementById('pdAddBtn');
  if (btn) { btn.classList.add('added'); btn.textContent = '✓ В корзине'; }
}

/* ─────────────────────────────────────────
   CART MODAL — OPEN / CLOSE
───────────────────────────────────────── */
function openCart() {
  const ov = document.getElementById('cartOverlay');
  if (!ov) return;
  ov.classList.add('open');
  ov.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
  renderCartModal();
}

function closeCart() {
  const ov = document.getElementById('cartOverlay');
  if (!ov) return;
  ov.classList.remove('open');
  ov.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
}

/* ─────────────────────────────────────────
   CART MODAL — RENDER ITEMS (правая панель)
───────────────────────────────────────── */
function renderCartModal() {
  const list       = document.getElementById('coItemsList');
  const subtotalEl = document.getElementById('coSubtotal');
  const totalEl    = document.getElementById('coTotal');
  const delivEl    = document.getElementById('coDeliveryPrice');
  if (!list) return;

  const items = cartItems(); // полные объекты из PRODUCTS
  if (!items.length) {
    list.innerHTML = '<div style="text-align:center;padding:24px 0;color:var(--text-muted);font-size:14px">Корзина пуста</div>';
    if (subtotalEl) subtotalEl.textContent = '0 BYN';
    if (totalEl) totalEl.textContent = '0 BYN';
    if (delivEl)  delivEl.textContent = '—';
    return;
  }

  const subtotal = cartTotal();
  list.innerHTML = items.map(item => `
    <div class="co-item">
      <div class="co-item-thumb" data-type="${item.type}">${item.emoji||'🎨'}</div>
      <div class="co-item-body">
        <div class="co-item-name">${esc(item.name)}</div>
        <div class="co-item-qty">${item.size} · ${item.qty} шт.</div>
      </div>
      <div class="co-item-price">${(item.price * item.qty).toLocaleString('ru')} BYN</div>
    </div>
  `).join('');

  const deliveryPrice = window._selectedDelivery === 'pickup' ? 0 : 5;
  const deliveryText  = window._selectedDelivery
    ? (window._selectedDelivery === 'pickup' ? 'Бесплатно' : deliveryPrice + ' BYN')
    : '—';
  const total = subtotal + (window._selectedDelivery && window._selectedDelivery !== 'pickup' ? deliveryPrice : 0);

  if (subtotalEl) subtotalEl.textContent = subtotal.toLocaleString('ru') + ' BYN';
  if (delivEl)    delivEl.textContent = deliveryText;
  if (totalEl)    totalEl.textContent = (window._selectedDelivery ? total : subtotal).toLocaleString('ru') + ' BYN';

  // Apply promo if saved
  applyPromoDisplay();
}

/* ─────────────────────────────────────────
   DELIVERY / PAYMENT SELECTION
───────────────────────────────────────── */
window._selectedDelivery = null;
window._selectedPay      = null;
window._promoResult      = null;

function selectDelivery(card) {
  document.querySelectorAll('.delivery-card').forEach(c => c.classList.remove('sel'));
  card.classList.add('sel');
  window._selectedDelivery = card.dataset.delivery;
  document.querySelectorAll('.delivery-fields').forEach(f => f.style.display='none');
  const df = document.getElementById('df-' + window._selectedDelivery);
  if (df) df.style.display = 'block';
  const errEl = document.getElementById('deliveryErr');
  if (errEl) errEl.style.display = 'none';
  renderCartModal();
}

function selectPayCard(card) {
  document.querySelectorAll('.payment-card').forEach(c => c.classList.remove('sel'));
  card.classList.add('sel');
  window._selectedPay = card.dataset.pay;
  const errEl = document.getElementById('payErr');
  if (errEl) errEl.style.display = 'none';
}

function toggleOptional() {
  document.getElementById('optionalToggle')?.classList.toggle('open');
  document.getElementById('coOptional')?.classList.toggle('open');
}

/* ─────────────────────────────────────────
   PROMO
───────────────────────────────────────── */
function submitPromo() {
  const inp = document.getElementById('promoInp');
  if (!inp) return;
  const code = inp.value.trim().toUpperCase();
  const result = applyPromo(code);
  if (result.valid) {
    window._promoResult = { code, pct: result.pct };
    applyPromoDisplay();
    toast(`Промокод применён — скидка ${result.pct}%`, 'ok');
  } else {
    window._promoResult = null;
    toast('Промокод не найден', 'err');
  }
}

function applyPromoDisplay() {
  if (!window._promoResult) return;
  const sub   = cartTotal();
  const disc  = Math.round(sub * window._promoResult.pct / 100);
  const deliv = window._selectedDelivery && window._selectedDelivery !== 'pickup' ? 5 : 0;
  const total = sub - disc + deliv;
  const totalEl = document.getElementById('coTotal');
  if (totalEl) totalEl.textContent = total.toLocaleString('ru') + ' BYN';
}

/* ─────────────────────────────────────────
   VALIDATION HELPERS
───────────────────────────────────────── */
function setFieldErr(el, show) {
  if (!el) return;
  const msg = el.parentElement?.querySelector('.err-msg');
  if (show) {
    el.classList.add('error');
    if (msg) msg.style.display = 'block';
  } else {
    el.classList.remove('error');
    if (msg) msg.style.display = 'none';
  }
}

/* ─────────────────────────────────────────
   PHONE MASK (авто-инициализация)
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const phoneInput = document.getElementById('coPhone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function() {
      let v = this.value.replace(/\D/g,'');
      if (v.startsWith('375')) v = v.slice(3);
      if (v.startsWith('80'))  v = v.slice(1);
      let out = '+375 ';
      if (v.length > 0) out += '(' + v.substring(0,2);
      if (v.length >= 2) out += ') ' + v.substring(2,5);
      if (v.length >= 5) out += '-' + v.substring(5,7);
      if (v.length >= 7) out += '-' + v.substring(7,9);
      this.value = out;
    });
  }

  // Cart overlay close on backdrop click + ESC
  document.getElementById('cartOverlay')?.addEventListener('click', function(e) {
    if (e.target === this) closeCart();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeCart();
      document.getElementById('pdModal')?.classList.remove('open');
      closeSearchOverlay();
    }
  });
  // pdModal close on backdrop
  document.getElementById('pdModal')?.addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('open');
  });
});