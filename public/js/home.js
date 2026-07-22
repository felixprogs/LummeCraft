/* ══════════════════════════════════════════
   LUMMECRAFT — Home Page
══════════════════════════════════════════ */
'use strict';

/* Products shown on homepage (hits) */
const HOME_IDS = [1, 2, 3, 5, 10, 8, 9, 12];

function refreshCards() {
  renderHomeProducts();
}

function renderHomeProducts() {
  const grid = document.getElementById('homeGrid');
  if (!grid) return;
  const list = HOME_IDS.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
  grid.innerHTML = list.map(p => productCardHTML(p)).join('');
}

function switchHomeTab(btn, type) {
  document.querySelectorAll('#homeTabBar .tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const grid = document.getElementById('homeGrid');
  if (!grid) return;
  let list = PRODUCTS;
  if (type === 'paint')   list = PRODUCTS.filter(p => p.type === 'paint');
  if (type === 'diamond') list = PRODUCTS.filter(p => p.type === 'diamond');
  if (type === 'sale')    list = PRODUCTS.filter(p => p.oldPrice);
  if (type === 'new')     list = PRODUCTS.filter(p => p.badge === 'Новинка');
  grid.innerHTML = list.slice(0, 8).map(p => productCardHTML(p)).join('');
}

function subscribeNewsletter() {
  const inp = document.getElementById('nlEmail');
  if (!inp) return;
  const email = inp.value.trim();
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    toast('Введите корректный email', 'err');
    inp.focus();
    return;
  }
  // Save to localStorage for demo
  const subs = safeGet('lc_subscribers', []);
  if (!subs.includes(email)) { subs.push(email); safeSet('lc_subscribers', subs); }
  toast('Подписка оформлена! Промокод WELCOME20 выслан на email', 'ok', 4000);
  inp.value = '';
}

function toggleFaq(el) { el.classList.toggle('open'); }

document.addEventListener('DOMContentLoaded', () => {
  sharedInit();
  renderHomeProducts();
  initEmailJS();
});
