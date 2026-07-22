/* ══════════════════════════════════════
   LUMMECRAFT — UI / Render
══════════════════════════════════════ */

const STAR_SVG = '<svg class="icn" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2 15.1 8.3 22 9.3l-5 4.9L18.2 21 12 17.8 5.8 21 7 14.2 2 9.3l6.9-1Z"/></svg>';

function renderStars(n) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += STAR_SVG.replace('class="icn"', `class="icn ${i <= n ? 'on' : 'off'}"`);
  }
  return html;
}

function productCard(p, small = false) {
  const inCart = cart.find(c => c.id === p.id);
  const isFav  = favs.has(p.id);

  const paintIcon   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="13.5" cy="6.5" r="1.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="1.5" fill="currentColor"/><circle cx="8.5" cy="7.5" r="1.5" fill="currentColor"/><circle cx="6.5" cy="12.5" r="1.5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.4-.3-.4-.5-.9-.5-1.4 0-1.1.9-2 2-2h2.4c2.5 0 4.6-2 4.6-4.6C22 5.9 17.5 2 12 2Z"/></svg>`;
  const diamondIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12l4 6-10 12L2 9l4-6Z"/><path d="M2 9h20"/><path d="m12 21 4-12-4-6-4 6 4 12Z"/></svg>`;

  const heartFull  = `<svg class="icn" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"/></svg>`;
  const heartEmpty = `<svg class="icn" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"/></svg>`;

  const cartIcon  = `<svg class="icn" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`;
  const checkIcon = `<svg class="icn" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/></svg>`;

  return `
  <div class="product-card" onclick="openProductDetail(${p.id})" data-type="${p.type}" data-id="${p.id}">
    <div class="product-img">
      <div class="product-tile" data-type="${p.type}">
        ${p.type === 'paint' ? paintIcon : diamondIcon}
      </div>
      ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
      <button class="product-fav ${isFav ? 'active' : ''}" aria-label="В избранное" onclick="toggleFav(event,${p.id})">
        ${isFav ? heartFull : heartEmpty}
      </button>
    </div>
    <div class="product-info">
      <div class="product-name">${p.name}</div>
      <div class="product-size">
        ${p.type === 'paint' ? 'Картина по номерам' : 'Алмазная мозаика'} · ${p.size}
        <span class="product-stars" aria-label="Сложность ${p.stars} из 5">${renderStars(p.stars)}</span>
      </div>
      <div class="product-prices">
        <div class="price-new">${p.price.toLocaleString('ru')} BYN</div>
        ${p.oldPrice ? `<div class="price-old">${p.oldPrice.toLocaleString('ru')} BYN</div>` : ''}
      </div>
      ${p.inStock
        ? `<button class="product-add ${inCart ? 'added' : ''}" onclick="addToCart(event,${p.id})">
             ${inCart ? `${checkIcon} В корзине` : `${cartIcon} В корзину`}
           </button>`
        : `<button class="product-add" style="background:var(--text-muted);cursor:not-allowed" disabled>Нет в наличии</button>`
      }
    </div>
  </div>`;
}

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  const list = products.filter(p => {
    if (currentTab === 'all')     return true;
    if (currentTab === 'paint')   return p.type === 'paint';
    if (currentTab === 'diamond') return p.type === 'diamond';
    if (currentTab === 'sale')    return p.oldPrice !== null;
    return true;
  }).slice(0, 8);
  grid.innerHTML = list.map(p => productCard(p)).join('');
}
function openModal() {
  document.getElementById('pdModal').classList.add('is-open');
}

function closeModal() {
  document.getElementById('pdModal').classList.remove('is-open');
}
function renderCatalog() {
  const grid = document.getElementById('catalogGrid');
  if (!grid) return;
  grid.innerHTML = products.map(p => productCard(p, true)).join('');
  const countEl = document.getElementById('catalogCount');
  if (countEl) countEl.textContent = `Показано ${products.length} товаров`;
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  const total = cart.reduce((s, i) => s + i.qty, 0);
  if (badge) {
    badge.style.display = total > 0 ? 'flex' : 'none';
    badge.textContent = total;
  }
}

function renderCart() {
  const body   = document.getElementById('cartBody');
  const footer = document.getElementById('cartFooter');
  if (!body) return;

  const trashIcon = `<svg class="icn" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;
  const bagIcon   = `<svg class="icn icn-xl" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`;

  if (cart.length === 0) {
    body.innerHTML = `<div class="cart-empty">
      <div class="cart-empty-icon">${bagIcon}</div>
      <p>Корзина пуста</p>
      <span>Добавьте товары из каталога</span>
    </div>`;
    if (footer) footer.style.display = 'none';
    return;
  }

  if (footer) footer.style.display = 'block';
  body.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img">${item.emoji || '🎨'}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-size">${item.size} · ${item.difficulty}</div>
        <div class="cart-item-bottom">
          <div class="qty-control">
            <button class="qty-btn" onclick="changeQty(${item.id},-1)">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" onclick="changeQty(${item.id},1)">+</button>
          </div>
          <div class="cart-item-price">${(item.price * item.qty).toLocaleString('ru')} BYN</div>
          <button class="cart-item-del" aria-label="Удалить" onclick="removeFromCart(${item.id})">${trashIcon}</button>
        </div>
      </div>
    </div>
  `).join('');

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const el = document.getElementById('cartTotal');
  if (el) el.textContent = total.toLocaleString('ru') + ' BYN';
}
