/* ══════════════════════════════════════════
   LUMMECRAFT — API Client
   Заменяет localStorage на REST API
══════════════════════════════════════════ */
'use strict';

const API_BASE = '/api';

const API = {

  async request(method, path, body = null) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
    };
    if (body) opts.body = JSON.stringify(body);
    try {
      const res  = await fetch(API_BASE + path, opts);
      const json = await res.json();
      if (!json.ok) throw { status: res.status, message: json.error || json.errors, errors: json.errors };
      return json.data !== undefined ? json.data : json;
    } catch (e) {
      if (e.status !== undefined) throw e;
      throw { status: 0, message: 'Сетевая ошибка. Проверьте соединение.' };
    }
  },

  get:  (path)       => API.request('GET',  path),
  post: (path, body) => API.request('POST', path, body),

  /* ── PRODUCTS ── */
  getProducts: ()     => API.get('/products'),
  getProduct:  (id)   => API.get('/products/' + id),

  /* ── ORDERS ── */
  createOrder: (data) => API.post('/orders', data),
  checkOrder:  (data) => API.post('/orders/check', data),

  /* Админ-эндпоинты убраны: БД и админ-панели больше нет,
     заказы теперь смотрятся и правятся прямо в Google Sheet. */
};
