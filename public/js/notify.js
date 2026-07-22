/* ══════════════════════════════════════════
   LUMMECRAFT — Уведомления (Telegram + Email)
   DEPRECATED: вся логика уведомлений перенесена на сервер
   (см. server.py → notify_new_order(), вызывается внутри
   POST /api/orders). Токены Telegram и EmailJS больше не
   должны находиться в браузере — этот файл оставлен только
   как no-op заглушка, чтобы не сломать старые вызовы со
   страниц, которые ещё не обновили (index.html и т.п.).
   Можно смело удалить <script src="js/notify.js"> и
   <script src="...@emailjs/browser...">, когда все страницы
   перестанут их вызывать.
══════════════════════════════════════════ */
'use strict';

function initEmailJS() {
  // no-op: EmailJS теперь вызывается с сервера
}

async function sendTelegram() {
  // no-op: Telegram теперь отправляется с сервера
  return true;
}

async function sendEmail() {
  // no-op: Email теперь отправляется с сервера
  return true;
}

async function notifyOrder() {
  // no-op: сервер уже отправил оба уведомления при создании заказа
  return { tg: true, email: true };
}
