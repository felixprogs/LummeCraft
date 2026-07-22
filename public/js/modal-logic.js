/* ═══════════════════════════════════════════════════════════════
   LUMMECRAFT — Product Detail Modal Logic
   "The Artisan's Reveal" — Cinematic Gallery Reveal
   State-based visibility (visibility + clip-path, no display:none)
═══════════════════════════════════════════════════════════════ */
'use strict';

/* ── SVG ICONS ── */
const PD_PAINT_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="13.5" cy="6.5" r="1.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="1.5" fill="currentColor"/><circle cx="8.5" cy="7.5" r="1.5" fill="currentColor"/><circle cx="6.5" cy="12.5" r="1.5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.4-.3-.4-.5-.9-.5-1.4 0-1.1.9-2 2-2h2.4c2.5 0 4.6-2 4.6-4.6C22 5.9 17.5 2 12 2Z"/></svg>`;

const PD_DIAMOND_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12l4 6-10 12L2 9l4-6Z"/><path d="M2 9h20"/><path d="m12 21 4-12-4-6-4 6 4 12Z"/></svg>`;

const PD_SPARKLE_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3Z"/></svg>`;

const PD_HEART_FULL = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"/></svg>`;

const PD_HEART_EMPTY = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"/></svg>`;

const PD_CART_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`;

const PD_CHECK_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>`;

/* ── HELPERS ── */

function pdEsc(str) {
  if (typeof esc === 'function') return esc(str);
  const div = document.createElement('div');
  div.textContent = String(str ?? '');
  return div.innerHTML;
}

function pdStarsHTML(n) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="pd-star ${i <= n ? 'on' : 'off'}">★</span>`;
  }
  return html;
}

function pdCategoryLabel(type) {
  if (type === 'paint')   return 'Картина по номерам';
  if (type === 'diamond') return 'Алмазная мозаика';
  return 'Творческий набор';
}

function pdDifficultyLabel(stars) {
  if (stars <= 2) return 'Лёгкая сложность';
  if (stars <= 3) return 'Средняя сложность';
  return 'Высокая сложность';
}

function pdStageIcon(type) {
  if (type === 'paint')   return PD_PAINT_ICON;
  if (type === 'diamond') return PD_DIAMOND_ICON;
  return PD_SPARKLE_ICON;
}

function pdKitContents(product) {
  /* Use product's own contents if available (data.js использует поле `includes`) */
  const own = product.includes || product.contents;
  if (own && Array.isArray(own) && own.length)
    return own;

  /* Generate based on type */
  if (product.type === 'paint') {
    return [
      'Холст с пронумерованным контуром',
      'Акриловые краски (24+ цветов)',
      'Набор кистей (3 шт.)',
      'Контрольный лист с образцом',
      'Крепёж для подвешивания на стену'
    ];
  }
  if (product.type === 'diamond') {
    return [
      'Холст с самоклеящимся слоем',
      'Стразы (30+ цветов)',
      'Ручка-стилус для выкладки',
      'Восковый карандаш и лоток',
      'Пинцет и запасные стразы'
    ];
  }
  return ['Полный набор для творчества', 'Подробная инструкция', 'Все необходимые материалы'];
}

function pdInCart(id) {
  return typeof cart !== 'undefined' && !!cart.find(c => c.id === id);
}

function pdIsFav(id) {
  return typeof favs !== 'undefined' && favs.has(id);
}

/* ── GALLERY / CAROUSEL ── */

let pdGalleryImages = [];
let pdGalleryIdx    = 0;

function pdGetImages(product) {
  if (Array.isArray(product.images) && product.images.length) return product.images;
  const single = product.image || product.img;
  return single ? [single] : [];
}

function pdCarouselHTML(images, name) {
  if (!images.length) return '';
  const slides = images.map((src, i) =>
    `<div class="pd-slide"><img src="${src}" alt="${pdEsc(name)}${images.length > 1 ? ' — фото ' + (i + 1) : ''}" loading="${i === 0 ? 'eager' : 'lazy'}"></div>`
  ).join('');

  if (images.length === 1) {
    return `<div class="pd-carousel" data-single="true"><div class="pd-carousel-track" id="pdCarouselTrack">${slides}</div></div>`;
  }

  const dots = images.map((_, i) =>
    `<span class="pd-car-dot ${i === 0 ? 'on' : ''}" onclick="event.stopPropagation();pdCarouselGoTo(${i})"></span>`
  ).join('');

  return `
    <div class="pd-carousel">
      <div class="pd-carousel-track" id="pdCarouselTrack">${slides}</div>
      <button class="pd-car-arrow prev" onclick="event.stopPropagation();pdCarouselMove(-1)" aria-label="Предыдущее фото">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <button class="pd-car-arrow next" onclick="event.stopPropagation();pdCarouselMove(1)" aria-label="Следующее фото">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </button>
      <div class="pd-car-dots">${dots}</div>
    </div>`;
}

function pdCarouselRender() {
  const track = document.getElementById('pdCarouselTrack');
  if (track) track.style.transform = `translateX(-${pdGalleryIdx * 100}%)`;
  document.querySelectorAll('#pdModal .pd-car-dot').forEach((d, i) => d.classList.toggle('on', i === pdGalleryIdx));
}

function pdCarouselMove(dir) {
  if (!pdGalleryImages.length) return;
  pdGalleryIdx = (pdGalleryIdx + dir + pdGalleryImages.length) % pdGalleryImages.length;
  pdCarouselRender();
}

function pdCarouselGoTo(i) {
  pdGalleryIdx = i;
  pdCarouselRender();
}

/* Swipe support (touch + mouse) */
function pdInitCarouselSwipe() {
  const stage = document.querySelector('#pdModal .pd-image-stage');
  if (!stage || pdGalleryImages.length < 2) return;
  let startX = 0, dx = 0, dragging = false;

  const onStart = x => { dragging = true; startX = x; dx = 0; };
  const onMove  = x => { if (dragging) dx = x - startX; };
  const onEnd   = () => {
    if (!dragging) return;
    dragging = false;
    if (Math.abs(dx) > 40) pdCarouselMove(dx < 0 ? 1 : -1);
    dx = 0;
  };

  stage.addEventListener('touchstart', e => onStart(e.touches[0].clientX), { passive: true });
  stage.addEventListener('touchmove',  e => onMove(e.touches[0].clientX),  { passive: true });
  stage.addEventListener('touchend', onEnd);

  stage.addEventListener('mousedown', e => onStart(e.clientX));
  stage.addEventListener('mousemove', e => onMove(e.clientX));
  stage.addEventListener('mouseup', onEnd);
  stage.addEventListener('mouseleave', () => { if (dragging) onEnd(); });
}

/* ── OPEN MODAL ── */

function openProductDetail(id) {
  const product = typeof PRODUCTS !== 'undefined' ? PRODUCTS.find(p => p.id === id) : null;
  if (!product) return;

  const modal = document.getElementById('pdModal');
  if (!modal) return;

  const layout = modal.querySelector('.pd-layout');
  if (!layout) return;

  const inCart = pdInCart(product.id);
  const isFav  = pdIsFav(product.id);

  pdGalleryImages = pdGetImages(product);
  pdGalleryIdx    = 0;

  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

  /* Build the Gallery Reveal layout */
  layout.innerHTML = `
    <div class="pd-image-stage" data-type="${product.type}">
      ${pdGalleryImages.length
        ? pdCarouselHTML(pdGalleryImages, product.name)
        : `<div class="pd-stage-icon">${pdStageIcon(product.type)}</div>`
      }
      ${product.badge
        ? `<div class="pd-badge ${product.badge.toLowerCase().includes('акци') || product.badge.toLowerCase().includes('sale') ? 'sale' : ''}">${pdEsc(product.badge)}</div>`
        : ''
      }
    </div>

    <div class="pd-info">
      <div class="pd-info-content">
        <div class="pd-category">${pdCategoryLabel(product.type)}${product.size ? ' · ' + pdEsc(product.size) : ''}</div>
        <h2>${pdEsc(product.name)}</h2>

        ${typeof product.stars === 'number'
          ? `<div class="pd-rating-row">
               <span class="pd-stars">${pdStarsHTML(product.stars)}</span>
               <span class="pd-difficulty-label">${pdDifficultyLabel(product.stars)}</span>
             </div>`
          : ''
        }

        <div class="pd-prices">
          <span class="pd-price-new">${product.price.toLocaleString('ru')} BYN</span>
          ${product.oldPrice
            ? `<span class="pd-price-old">${product.oldPrice.toLocaleString('ru')} BYN</span>`
            : ''
          }
          ${discount > 0
            ? `<span class="pd-discount">−${discount}%</span>`
            : ''
          }
        </div>

        ${(product.desc || product.description)
          ? `<p class="pd-description">${pdEsc(product.desc || product.description)}</p>`
          : ''
        }

        <div class="pd-anatomy">
          <div class="pd-anatomy-title">Состав набора</div>
          <ul class="pd-anatomy-list">
            ${pdKitContents(product).map(item => `<li>${pdEsc(item)}</li>`).join('')}
          </ul>
        </div>
      </div>

      <div class="pd-purchase-bar">
        ${product.inStock
          ? `<button class="pd-btn-cart ${inCart ? 'added' : ''}" id="pdAddCartBtn" onclick="pdHandleCart(event, ${product.id})">
               ${inCart ? PD_CHECK_ICON + '<span>В корзине</span>' : PD_CART_ICON + '<span>В корзину</span>'}
             </button>`
          : `<button class="pd-btn-cart disabled" disabled>Нет в наличии</button>`
        }
      </div>
    </div>
  `;

  /* Reveal */
  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';

  /* Carousel swipe support */
  pdInitCarouselSwipe();

  /* Move focus to close button for accessibility */
  setTimeout(() => {
    const closeBtn = modal.querySelector('.modal-close-trigger');
    if (closeBtn) closeBtn.focus();
  }, 100);
}

/* ── CLOSE MODAL ── */

function closeProductModal() {
  const modal = document.getElementById('pdModal');
  if (!modal) return;
  modal.classList.remove('is-open');
  document.body.style.overflow = '';
}

/* ── CART / FAV HANDLERS (update button state in-place) ── */

function pdHandleCart(event, id) {
  if (event) event.stopPropagation();

  const btn = document.getElementById('pdAddCartBtn');
  if (!btn || btn.classList.contains('added')) return;

  /* Call the global addToCart if available */
  if (typeof addToCart === 'function') {
    addToCart(event, id);
  }

  /* Update button to "added" state */
  btn.classList.add('added');
  btn.innerHTML = PD_CHECK_ICON + '<span>В корзине</span>';
}

function pdHandleFav(event, id) {
  if (event) event.stopPropagation();

  const btn = document.getElementById('pdFavBtn');
  if (!btn) return;

  /* Call the global toggleFav if available */
  if (typeof toggleFav === 'function') {
    toggleFav(event, id);
  }

  /* Update button state */
  setTimeout(() => {
    const isFav = pdIsFav(id);
    btn.classList.toggle('active', isFav);
    btn.innerHTML = isFav ? PD_HEART_FULL : PD_HEART_EMPTY;
  }, 50);
}

/* ── INIT: event listeners ── */

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('pdModal');
  if (!modal) return;

  /* Ensure aria-modal */
  modal.setAttribute('aria-modal', 'true');

  /* Click on scrim (outside the box) → close */
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeProductModal();
    }
  });

  /* ESC key → close, ←/→ → switch photo */
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeProductModal();
    if (e.key === 'ArrowLeft')  pdCarouselMove(-1);
    if (e.key === 'ArrowRight') pdCarouselMove(1);
  });
});