/* ══════════════════════════════════════════
   LUMMECRAFT — Data & Storage
══════════════════════════════════════════ */
'use strict';

/* ── PRODUCT CATALOG ── */
const PRODUCTS = [
  {
    id:1, name:'Вечерний Париж', type:'paint', size:'40×50',
    difficulty:'Средняя', stars:3, price:39, oldPrice:49,
    badge:'Хит', inStock:true, image:'images/products/1.jpg',
    images:[
      'images/products/1.jpg',
      'images/products/1-2.jpg'
    ],
    desc:'Романтичный ночной Париж с мерцающей Эйфелевой башней. Идеально для первого опыта.',
    includes:['Холст','Краски 24 цвета','3 кисти','Инструкция'],
    rating:4.8, reviews:124
  },
  {
    id:2, name:'Закат на море', type:'paint', size:'30×40',
    difficulty:'Лёгкая', stars:1, price:25, oldPrice:34,
    badge:'−26%', inStock:true, image:'images/products/2.jpg',
    desc:'Нежный морской закат с тёплыми оттенками золота и розового. Отличный выбор для начинающих.',
    includes:['Холст','Краски 12 цветов','2 кисти','Инструкция'],
    rating:4.6, reviews:87
  },
  {
    id:3, name:'Северное сияние', type:'diamond', size:'40×50',
    difficulty:'Средняя', stars:3, price:49, oldPrice:62,
    badge:'Хит', inStock:true, image:'images/products/3.jpg',
    desc:'Завораживающее северное сияние над снежными горами. Стразы переливаются как настоящие звёзды.',
    includes:['Канва с клеем','Стразы 28 цветов','Ручка-аппликатор','Пинцет','Поднос'],
    rating:4.9, reviews:203
  },
  {
    id:4, name:'Весенний сад', type:'paint', size:'50×65',
    difficulty:'Средняя', stars:3, price:55, oldPrice:null,
    badge:null, inStock:true, image:'images/products/4.jpg',
    desc:'Пышный весенний сад с цветущими деревьями. Большой формат для подробной работы.',
    includes:['Холст','Краски 30 цветов','4 кисти','Инструкция','Рамка'],
    rating:4.7, reviews:56
  },
  {
    id:5, name:'Коты у окна', type:'diamond', size:'30×40',
    difficulty:'Лёгкая', stars:2, price:32, oldPrice:40,
    badge:'−20%', inStock:true, image:'images/products/5.jpg',
    desc:'Два уютных кота, смотрящих в окно на дождь. Идеально для подарка любителям кошек.',
    includes:['Канва с клеем','Стразы 18 цветов','Ручка-аппликатор','Пинцет'],
    rating:4.8, reviews:178
  },
  {
    id:6, name:'Горный пейзаж', type:'paint', size:'60×80',
    difficulty:'Сложная', stars:5, price:75, oldPrice:95,
    badge:'Новинка', inStock:true, image:'images/products/6.jpg',
    desc:'Величественные горные вершины в лучах рассветного солнца. Для опытных художников.',
    includes:['Холст','Краски 40 цветов','5 кистей','Инструкция','Рамка','Мольберт'],
    rating:4.9, reviews:34
  },
  {
    id:7, name:'Лебеди на озере', type:'diamond', size:'50×65',
    difficulty:'Сложная', stars:5, price:68, oldPrice:null,
    badge:null, inStock:false, image:'images/products/7.jpg',
    desc:'Элегантные белые лебеди на зеркальной глади озера. Высокая детализация.',
    includes:['Канва с клеем','Стразы 35 цветов','2 ручки-аппликатора','Пинцет','Поднос'],
    rating:4.7, reviews:42
  },
  {
    id:8, name:'Ночной город', type:'paint', size:'40×50',
    difficulty:'Средняя', stars:3, price:42, oldPrice:53,
    badge:'−21%', inStock:true, image:'images/products/8.jpg',
    desc:'Яркий ночной мегаполис с огнями небоскрёбов. Динамичная городская сцена.',
    includes:['Холст','Краски 26 цветов','3 кисти','Инструкция'],
    rating:4.5, reviews:91
  },
  {
    id:9, name:'Тропические птицы', type:'diamond', size:'40×50',
    difficulty:'Средняя', stars:4, price:45, oldPrice:null,
    badge:'Новинка', inStock:true, image:'images/products/9.jpg',
    desc:'Яркие тропические попугаи среди экзотических цветов. Взрыв красок и позитива.',
    includes:['Канва с клеем','Стразы 32 цвета','Ручка-аппликатор','Пинцет','Поднос'],
    rating:4.8, reviews:29
  },
  {
    id:10, name:'Сакура в цвету', type:'paint', size:'30×40',
    difficulty:'Лёгкая', stars:1, price:22, oldPrice:30,
    badge:'Хит', inStock:true, image:'images/products/10.jpg',
    desc:'Нежная японская сакура в полном цвету. Медитативный и расслабляющий сюжет.',
    includes:['Холст','Краски 10 цветов','2 кисти','Инструкция'],
    rating:4.9, reviews:267
  },
  {
    id:11, name:'Мандала Дзен', type:'diamond', size:'30×40',
    difficulty:'Средняя', stars:3, price:35, oldPrice:null,
    badge:null, inStock:true, image:'images/products/11.jpg',
    desc:'Симметричная мандала с геометрическими узорами. Идеально для медитации и расслабления.',
    includes:['Канва с клеем','Стразы 20 цветов','Ручка-аппликатор','Пинцет'],
    rating:4.7, reviews:115
  },
  {
    id:12, name:'Итальянский дворик', type:'paint', size:'50×65',
    difficulty:'Средняя', stars:4, price:58, oldPrice:73,
    badge:'−21%', inStock:true, image:'images/products/12.jpg',
    desc:'Уютный итальянский дворик с цветами и виноградом. Атмосфера средиземноморского лета.',
    includes:['Холст','Краски 32 цвета','4 кисти','Инструкция','Рамка'],
    rating:4.6, reviews:78
  },
  {
    id:13, name:'Осенний лес', type:'paint', size:'40×50',
    difficulty:'Средняя', stars:3, price:40, oldPrice:50,
    badge:null, inStock:true, image:'images/products/13.jpg',
    desc:'Золотая осень в берёзовом лесу. Тёплые оттенки жёлтого, оранжевого и красного.',
    includes:['Холст','Краски 22 цвета','3 кисти','Инструкция'],
    rating:4.7, reviews:63
  },
  {
    id:14, name:'Феникс в огне', type:'diamond', size:'40×50',
    difficulty:'Сложная', stars:5, price:59, oldPrice:75,
    badge:'−21%', inStock:true, image:'images/products/14.jpg',
    desc:'Мистический феникс в языках пламени. Тысячи переливающихся страз создают эффект свечения.',
    includes:['Канва с клеем','Стразы 40 цветов','2 ручки-аппликатора','Пинцет','Поднос'],
    rating:4.9, reviews:47
  },
  {
    id:15, name:'Маяк на скале', type:'paint', size:'30×40',
    difficulty:'Лёгкая', stars:2, price:28, oldPrice:null,
    badge:'Новинка', inStock:true, image:'images/products/15.jpg',
    desc:'Одинокий маяк на скалистом берегу в туманный день. Атмосферный морской сюжет.',
    includes:['Холст','Краски 16 цветов','2 кисти','Инструкция'],
    rating:4.5, reviews:18
  },
  {
    id:16, name:'Кот-астронавт', type:'diamond', size:'30×40',
    difficulty:'Лёгкая', stars:2, price:30, oldPrice:38,
    badge:'Хит', inStock:true, image:'images/products/16.jpg',
    desc:'Милый кот в скафандре среди звёзд. Забавный сюжет для детей и взрослых.',
    includes:['Канва с клеем','Стразы 22 цвета','Ручка-аппликатор','Пинцет'],
    rating:5.0, reviews:312
  },
  {
    id:17, name:'Краски', type:'other', price:30, oldPrice:38,
    badge:'Хит', inStock:true, image:'images/products/17.jpg',
    size:null, difficulty:null, stars:null,
    desc:'Набор красок разного вида',
    includes:['Краски','Кисточка'],
    rating:5.0, reviews:312
  },
];

/* ── STORAGE KEYS ── */
const LS = {
  CART:   'lc_cart_v2',
  FAVS:   'lc_favs_v2',
  ORDERS: 'lc_orders_v2',
  PROMO:  'lc_promo',
};

/* ── SAFE JSON PARSE ── */
function safeGet(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function safeSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); return true; }
  catch { console.warn('localStorage full'); return false; }
}

/* ── CART STATE ── */
let cart = safeGet(LS.CART, []);
window.cart = cart; // глобальный псевдоним для cart.js и inline-скриптов
let favs = new Set(safeGet(LS.FAVS, []));

function saveCart() {
  safeSet(LS.CART, cart);
  window.cart = cart; // держим window.cart в синхронизации
}
function saveFavs() { safeSet(LS.FAVS, [...favs]); }

function cartAdd(id, qty = 1) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p || !p.inStock) return false;
  const ex = cart.find(c => c.id === id);
  if (ex) { ex.qty = Math.min(ex.qty + qty, 99); }
  else { cart.push({ id, qty }); }
  saveCart();
  return true;
}
function cartRemove(id) { cart = window.cart = cart.filter(c => c.id !== id); saveCart(); }
function cartSetQty(id, qty) {
  if (qty <= 0) { cartRemove(id); return; }
  const ex = cart.find(c => c.id === id);
  if (ex) { ex.qty = Math.min(qty, 99); saveCart(); }
}
function cartClear() { cart = window.cart = []; saveCart(); }
function cartTotal()  { return cart.reduce((s,i) => { const p = PRODUCTS.find(x=>x.id===i.id); return s + (p ? p.price * i.qty : 0); }, 0); }
function cartCount()  { return cart.reduce((s,i) => s + i.qty, 0); }
function cartItems()  { return cart.map(c => ({ ...PRODUCTS.find(x=>x.id===c.id), qty:c.qty })).filter(Boolean); }

function favToggle(id) {
  if (favs.has(id)) favs.delete(id); else favs.add(id);
  saveFavs(); return favs.has(id);
}

/* ── ORDERS ── */
function getOrders()  { return safeGet(LS.ORDERS, []); }
function saveOrders(o) { safeSet(LS.ORDERS, o); }
function addOrder(orderData) {
  const orders = getOrders();
  const id = 'LC-' + Date.now().toString(36).toUpperCase();
  const order = {
    id, date: new Date().toISOString(),
    items: cartItems(), total: cartTotal(),
    status: 'processing',
    ...orderData
  };
  orders.unshift(order);
  saveOrders(orders);
  return order;
}

/* ── PROMO CODES ── */
const PROMOS = { 'LUMMECRAFT10': 10, 'HOBBY15': 15, 'WELCOME20': 20 };
function applyPromo(code) {
  const pct = PROMOS[code.trim().toUpperCase()];
  return pct ? { valid:true, pct, label:`Скидка ${pct}%` } : { valid:false };
}

/* ── SANITIZE STRING (XSS protection) ── */
function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}

/* ── FORMAT PRICE ── */
function fmt(n) { return Number(n).toLocaleString('ru') + ' BYN'; }

/* ── STAR RENDER ── */
function stars(n, total=5) {
  return Array.from({length:total}, (_,i) =>
    `<span class="s ${i < n ? 'on':'off'}">★</span>`
  ).join('');
}

/* ── DEBOUNCE ── */
function debounce(fn, ms) {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(()=>fn(...a), ms); };
}

/* ── TOAST ── */
function toast(msg, type='', dur=2800) {
  const wrap = document.getElementById('toastWrap');
  if (!wrap) return;
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), dur);
}