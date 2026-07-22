/* ══════════════════════════════════════════
   LUMMECRAFT — Cart Modal Logic (shared)
   Подключать после: config.js, data.js, shared.js
══════════════════════════════════════════ */
'use strict';

/* ── OPEN / CLOSE ── */
async function openCart() {
  // Ждём, пока cart-modal.html домонтируется в DOM (если ещё не успел)
  if (window._cartModalReady) await window._cartModalReady;

  const overlay = document.getElementById('cartOverlay');
  if (!overlay) { console.error('[cart] #cartOverlay не найден даже после монтирования'); return; }

  // Сбрасываем экран успеха при каждом открытии
  const successEl = document.getElementById('coSuccess');
  if (successEl) successEl.style.display = 'none';

  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  renderCartItems();
}

function closeCart() {
  const overlay = document.getElementById('cartOverlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/* ── RENDER ITEMS (right panel) ── */
function renderCartItems() {
  const list       = document.getElementById('coItemsList');
  const subtotalEl = document.getElementById('coSubtotal');
  const totalEl    = document.getElementById('coTotal');
  const delivEl    = document.getElementById('coDeliveryPrice');
  if (!list) return;

  const items = typeof cartItems === 'function' ? cartItems() : (window.cart || []);

  if (!items.length) {
    list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:14px">Корзина пуста</div>';
    if (subtotalEl) subtotalEl.textContent = '0 BYN';
    if (delivEl)    delivEl.textContent    = '—';
    if (totalEl)    totalEl.textContent    = '0 BYN';
    return;
  }

  let subtotal = 0;
  list.innerHTML = items.map(item => {
    const lineTotal = item.price * (item.qty || 1);
    subtotal += lineTotal;
    return `<div class="co-item" data-id="${item.id}">
      <div class="co-item-thumb" data-type="${item.type || 'paint'}">${item.emoji || '🎨'}</div>
      <div class="co-item-body">
        <div class="co-item-name">${item.name}</div>
        <div class="co-item-qty-row">
          <button class="co-item-qty-btn" onclick="cartItemChangeQty(${item.id}, -1)" aria-label="Меньше">−</button>
          <span class="co-item-qty">${item.qty || 1}</span>
          <button class="co-item-qty-btn" onclick="cartItemChangeQty(${item.id}, 1)" aria-label="Больше">+</button>
        </div>
      </div>
      <div class="co-item-right">
        <div class="co-item-price">${lineTotal} BYN</div>
        <button class="co-item-remove" onclick="cartItemRemove(${item.id})" aria-label="Удалить">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
        </button>
      </div>
    </div>`;
  }).join('');

  const isPickup      = window._selectedDelivery === 'pickup';
  const deliveryCost  = (window._selectedDelivery && !isPickup) ? 5 : 0;
  const deliveryLabel = window._selectedDelivery
    ? (isPickup ? 'Бесплатно' : deliveryCost + ' BYN')
    : '—';

  // Скидка по промокоду
  const pct = (window._promoCode && typeof PROMOS !== 'undefined') ? (PROMOS[window._promoCode] || 0) : 0;
  const discount = pct ? Math.round(subtotal * pct) / 100 : 0;
  const finalTotal = Math.max(subtotal + deliveryCost - discount, 0);

  const discountRow  = document.getElementById('coDiscountRow');
  const discountEl    = document.getElementById('coDiscount');
  const promoLabelEl  = document.getElementById('coPromoLabel');
  if (discountRow) discountRow.style.display = pct ? 'flex' : 'none';
  if (discountEl)  discountEl.textContent = '−' + discount + ' BYN';
  if (promoLabelEl) promoLabelEl.textContent = pct ? ` (${window._promoCode}, −${pct}%)` : '';

  if (subtotalEl) subtotalEl.textContent = subtotal + ' BYN';
  if (delivEl)    delivEl.textContent    = deliveryLabel;
  if (totalEl)    totalEl.textContent    = finalTotal + ' BYN';
}

/* ── ITEM QTY / REMOVE ── */
function cartItemChangeQty(id, delta) {
  // Используем cartSetQty/cartRemove из data.js — они синхронизируют и cart (let) и window.cart
  const item = window.cart.find(c => c.id === id);
  if (!item) return;
  const newQty = item.qty + delta;
  if (typeof cartSetQty === 'function') {
    cartSetQty(id, newQty); // при qty<=0 внутри вызовет cartRemove
  } else {
    if (newQty <= 0) window.cart = window.cart.filter(c => c.id !== id);
    else item.qty = newQty;
  }
  if (typeof updateCartBadge === 'function') updateCartBadge();
  if (typeof renderProducts  === 'function') renderProducts();
  if (typeof renderCatalog   === 'function') renderCatalog();
  renderCartItems();
}

function cartItemRemove(id) {
  // cartRemove из data.js синхронизирует let cart и window.cart и сохраняет в LS
  if (typeof cartRemove === 'function') {
    cartRemove(id);
  } else {
    window.cart = window.cart.filter(c => c.id !== id);
  }
  if (typeof updateCartBadge === 'function') updateCartBadge();
  if (typeof renderProducts  === 'function') renderProducts();
  if (typeof renderCatalog   === 'function') renderCatalog();
  renderCartItems();
}

/* ── DELIVERY ── */
window._selectedDelivery = null;

function selectDelivery(card) {
  document.querySelectorAll('.delivery-card').forEach(c => c.classList.remove('sel'));
  card.classList.add('sel');
  window._selectedDelivery = card.dataset.delivery;

  document.querySelectorAll('.delivery-fields').forEach(f => f.style.display = 'none');
  const df = document.getElementById('df-' + window._selectedDelivery);
  if (df) df.style.display = 'block';

  const errEl = document.getElementById('deliveryErr');
  if (errEl) errEl.style.display = 'none';

  renderCartItems();
}

/* ── PAYMENT ── */
window._selectedPay = null;

function selectPayCard(card) {
  document.querySelectorAll('.payment-card').forEach(c => c.classList.remove('sel'));
  card.classList.add('sel');
  window._selectedPay = card.dataset.pay;

  const errEl = document.getElementById('payErr');
  if (errEl) errEl.style.display = 'none';
}

/* ── OPTIONAL CONTACTS TOGGLE ── */
function toggleOptional() {
  document.getElementById('optionalToggle')?.classList.toggle('open');
  document.getElementById('coOptional')?.classList.toggle('open');
}

/* ── PROMO ── */
window._promoCode = null;

function submitPromo() {
  const val = document.getElementById('promoInp')?.value.trim();
  if (!val) return;
  const result = typeof applyPromo === 'function' ? applyPromo(val) : { valid: false };
  if (result.valid) {
    window._promoCode = val.toUpperCase();
    toast(result.label + ' применена!', 'ok');
  } else {
    window._promoCode = null;
    toast('Промокод не найден', 'err');
  }
  renderCartItems();
}

/* ── FIELD ERROR HELPER ── */
function setFieldErr(el, show) {
  if (!el) return;
  const msg = el.parentElement?.querySelector('.err-msg');
  el.classList.toggle('error', show);
  if (msg) msg.style.display = show ? 'block' : 'none';
}

/* ── SUBMIT ORDER ── */
window._submitting = false;

async function submitOrder() {
  if (window._submitting) return;

  const name    = document.getElementById('coName');
  const surname = document.getElementById('coSurname');
  const phone   = document.getElementById('coPhone');

  if (!name || !phone) { openCart(); return; }

  let ok = true;

  setFieldErr(name, !name.value.trim()); if (!name.value.trim()) ok = false;
  if (surname) { setFieldErr(surname, !surname.value.trim()); if (!surname.value.trim()) ok = false; }

  const phoneClean = phone.value.replace(/\D/g, '');
  setFieldErr(phone, phoneClean.length < 7); if (phoneClean.length < 7) ok = false;

  const delivErrEl = document.getElementById('deliveryErr');
  if (!window._selectedDelivery) {
    if (delivErrEl) delivErrEl.style.display = 'block';
    ok = false;
  } else {
    if (delivErrEl) delivErrEl.style.display = 'none';
    const del = window._selectedDelivery;
    if (del === 'europost') {
      const city = document.getElementById('coCity'), branch = document.getElementById('coBranch');
      setFieldErr(city,   !city?.value.trim());   if (!city?.value.trim())   ok = false;
      setFieldErr(branch, !branch?.value.trim()); if (!branch?.value.trim()) ok = false;
    } else if (del === 'belpost') {
      const city = document.getElementById('coCityBp'), branch = document.getElementById('coBranchBp');
      setFieldErr(city,   !city?.value.trim());   if (!city?.value.trim())   ok = false;
      setFieldErr(branch, !branch?.value.trim()); if (!branch?.value.trim()) ok = false;
    } else if (del === 'courier') {
      const street = document.getElementById('coStreet'), house = document.getElementById('coHouse');
      setFieldErr(street, !street?.value.trim()); if (!street?.value.trim()) ok = false;
      setFieldErr(house,  !house?.value.trim());  if (!house?.value.trim())  ok = false;
    }
  }

  const payErrEl = document.getElementById('payErr');
  if (!window._selectedPay) {
    if (payErrEl) payErrEl.style.display = 'block';
    ok = false;
  } else {
    if (payErrEl) payErrEl.style.display = 'none';
  }

  const consent    = document.getElementById('coConsent');
  const consentErr = document.getElementById('consentErr');
  if (consent && !consent.checked) {
    if (consentErr) consentErr.style.display = 'block';
    ok = false;
  } else {
    if (consentErr) consentErr.style.display = 'none';
  }

  if (typeof cartCount === 'function' && cartCount() === 0) {
    toast('Корзина пуста', 'err'); return;
  }

  if (!ok) {
    document.querySelector('.co-left-scroll .error, .err-msg[style*="block"]')
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const del = window._selectedDelivery;
  let fullAddress = '';
  if      (del === 'europost') fullAddress = `Европочта: г. ${document.getElementById('coCity').value.trim()}, отд. ${document.getElementById('coBranch').value.trim()}`;
  else if (del === 'belpost')  fullAddress = `Белпочта: г. ${document.getElementById('coCityBp').value.trim()}, отд. ${document.getElementById('coBranchBp').value.trim()}`;
  else if (del === 'courier')  fullAddress = `Курьер: ул. ${document.getElementById('coStreet').value.trim()}, д. ${document.getElementById('coHouse').value.trim()}`;
  else                         fullAddress = 'Самовывоз';

  const items = typeof cartItems === 'function' ? cartItems() : (window.cart || []);

  const payload = {
    first_name: name.value.trim(),
    last_name:  surname?.value.trim() || '',
    phone:      phone.value.trim(),
    email:      document.getElementById('coEmail')?.value.trim() || '',
    telegram:   document.getElementById('coTelegram')?.value.trim() || '',
    instagram:  document.getElementById('coInstagram')?.value.trim() || '',
    delivery:   del,
    address:    fullAddress,
    payment:    window._selectedPay,
    comment:    document.getElementById('coComment')?.value.trim() || '',
    promo:      window._promoCode || '',
    items:      items.map(i => ({ id: i.id, qty: i.qty })),
  };

  window._submitting = true;
  const btn     = document.getElementById('coSubmitBtn');
  const label   = document.getElementById('coSubmitLabel');
  const spinner = document.getElementById('coSubmitSpinner');
  if (btn)     btn.disabled = true;
  if (label)   label.textContent = 'Оформляем...';
  if (spinner) spinner.style.display = 'block';

  const resetBtn = () => {
    window._submitting = false;
    if (btn)     btn.disabled = false;
    if (label)   label.textContent = 'Оформить заказ';
    if (spinner) spinner.style.display = 'none';
  };

  try {
    const order = await API.createOrder(payload);
    // Уведомления (Telegram + Email) отправляет сервер внутри POST /api/orders —
    // на фронте больше не нужны ни токены, ни отдельный вызов.

    if (typeof cartClear === 'function') cartClear();
    if (typeof updateCartBadge === 'function') updateCartBadge();
    if (typeof renderProducts === 'function') renderProducts();
    if (typeof renderCatalog  === 'function') renderCatalog();

    // Сбрасываем форму и состояние для следующего заказа
    document.getElementById('coName')?.value && (document.getElementById('coName').value = '');
    document.getElementById('coSurname')?.value && (document.getElementById('coSurname').value = '');
    document.getElementById('coPhone')?.value && (document.getElementById('coPhone').value = '');
    document.getElementById('coComment')?.value && (document.getElementById('coComment').value = '');
    document.getElementById('coEmail')?.value && (document.getElementById('coEmail').value = '');
    document.getElementById('coTelegram')?.value && (document.getElementById('coTelegram').value = '');
    document.getElementById('coInstagram')?.value && (document.getElementById('coInstagram').value = '');
    document.getElementById('promoInp')?.value && (document.getElementById('promoInp').value = '');
    document.querySelectorAll('.delivery-card').forEach(c => c.classList.remove('sel'));
    document.querySelectorAll('.delivery-fields').forEach(f => f.style.display = 'none');
    document.querySelectorAll('.payment-card').forEach(c => c.classList.remove('sel'));
    window._selectedDelivery = null;
    window._selectedPay      = null;
    window._promoCode        = null;
    if (document.getElementById('coConsent')) document.getElementById('coConsent').checked = false;

    const successEl = document.getElementById('coSuccess');
    const successSub = document.querySelector('#coSuccess .co-success-sub');
    if (successSub) successSub.textContent = `Номер заказа: ${order.id}. Мы свяжемся с вами в ближайшее время для подтверждения.`;
    if (successEl) successEl.style.display = 'flex';

    resetBtn();
  } catch (err) {
    console.error('[submitOrder]', err);
    if (err.errors && typeof err.errors === 'object') {
      const fieldMap = { first_name: name, last_name: surname, phone: phone };
      Object.keys(err.errors).forEach(f => setFieldErr(fieldMap[f], true));
      toast('Проверьте правильность заполнения полей', 'err');
    } else {
      toast(err.message || 'Ошибка при оформлении заказа', 'err');
    }
    resetBtn();
  }
}

/* ── PHONE MASK ── */
function _initPhoneMask() {
  const el = document.getElementById('coPhone');
  if (!el) return;
  el.addEventListener('input', function () {
    let v = this.value.replace(/\D/g, '');
    if (v.startsWith('375')) v = v.slice(3);
    if (v.startsWith('80'))  v = v.slice(1);
    let out = '+375 ';
    if (v.length > 0) out += '(' + v.substring(0, 2);
    if (v.length >= 2) out += ') ' + v.substring(2, 5);
    if (v.length >= 5) out += '-' + v.substring(5, 7);
    if (v.length >= 7) out += '-' + v.substring(7, 9);
    this.value = out;
  });
}

/* ── GLOBAL ALIASES ── */
window.openCart        = openCart;
window.closeCart       = closeCart;
window.openCheckout    = openCart;
window.closeCheckout   = closeCart;
window.selectDelivery  = selectDelivery;
window.selectPayCard   = selectPayCard;
window.selectPay       = selectPayCard;
window.submitOrder     = submitOrder;
window.renderCartItems = renderCartItems;
window.toggleOptional  = toggleOptional;
window.submitPromo     = submitPromo;
window.cartItemRemove  = cartItemRemove;
window.cartItemChangeQty = cartItemChangeQty;

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  _initPhoneMask();

  document.getElementById('cartOverlay')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeCart();
  });

  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });
});