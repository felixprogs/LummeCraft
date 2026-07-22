"""
LummeCraft — Backend Server
Flask + Google Sheets (вместо SQLite) + Telegram/Email уведомления

Архитектура:
  - Товары (PRODUCTS) — статический список в этом файле (как раньше в data.js).
    Если нужно поменять цену/наличие — правишь тут и рестартуешь сервер.
  - Заказы больше НЕ хранятся в БД. Каждый заказ дописывается строкой
    в Google Sheet через service account (см. .env.example и README ниже).
  - Админ-панель убрана: единственный способ посмотреть/поменять статус
    заказа — открыть саму таблицу в Google Sheets.
  - Проверка статуса заказа покупателем (/api/orders/check) читает
    все строки из таблицы и ищет совпадение по id+телефону.

Настройка Google Sheets (сделать один раз):
  1. console.cloud.google.com → создать проект → включить Google Sheets API.
  2. IAM & Admin → Service Accounts → Create Service Account → создать JSON-ключ,
     сохранить как service-account.json (НЕ коммитить в git).
  3. Открыть service-account.json, найти "client_email" — это адрес вида
     xxx@xxx.iam.gserviceaccount.com.
  4. Создать Google Sheet, нажать "Поделиться" и дать этому client_email
     доступ Editor.
  5. Скопировать ID таблицы из URL:
     https://docs.google.com/spreadsheets/d/ЭТОТ_КУСОК/edit
  6. В .env указать GOOGLE_CREDENTIALS_FILE (путь к json) и GOOGLE_SHEET_ID.
"""

import os
import re
import json
import secrets
import threading
import requests
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from dotenv import load_dotenv
import gspread
from google.oauth2.service_account import Credentials

load_dotenv()

# ─────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(BASE_DIR, 'public')

app = Flask(__name__, static_folder=PUBLIC_DIR, static_url_path='')
app.secret_key = secrets.token_hex(32)

# ── Секреты — только на сервере, в .env ──
TG_TOKEN             = os.environ.get('TG_TOKEN', '')
TG_CHAT_ID           = os.environ.get('TG_CHAT_ID', '')
EMAILJS_PRIVATE_KEY  = os.environ.get('EMAILJS_PRIVATE_KEY', '')
EMAILJS_SERVICE_ID   = os.environ.get('EMAILJS_SERVICE_ID', '')
EMAILJS_TEMPLATE_ID  = os.environ.get('EMAILJS_TEMPLATE_ID', '')
EMAILJS_PUBLIC_KEY   = os.environ.get('EMAILJS_PUBLIC_KEY', '')
SHOP_EMAIL           = os.environ.get('SHOP_EMAIL', 'hello@lummecraft.by')

GOOGLE_CREDENTIALS_FILE = os.environ.get('GOOGLE_CREDENTIALS_FILE', os.path.join(BASE_DIR, 'service-account.json'))
GOOGLE_SHEET_ID         = os.environ.get('GOOGLE_SHEET_ID', '')
GOOGLE_SHEET_NAME       = os.environ.get('GOOGLE_SHEET_NAME', 'Orders')

# Локальный файл-предохранитель. Пишется ДО попытки уйти в Sheets — так
# заказ физически не теряется, даже если Google недоступен, аккаунт
# отключили или кончился лимит запросов. Раз в день стоит открывать
# файл и проверять, нет ли там записей, которые не попали в таблицу
# (см. orders_backup_synced=False).
ORDERS_BACKUP_FILE = os.path.join(BASE_DIR, 'orders_backup.jsonl')

# ─────────────────────────────────────────────
# ТОВАРЫ (статический каталог, как раньше в data.js)
# ─────────────────────────────────────────────

PRODUCTS = [
    {'id':1,'name':'Вечерний Париж','type':'paint','size':'40×50','difficulty':'Средняя','stars':3,'price':39,'oldPrice':49,'badge':'Хит','inStock':True,'image':'images/products/1.jpg'},
    {'id':2,'name':'Закат на море','type':'paint','size':'30×40','difficulty':'Лёгкая','stars':1,'price':25,'oldPrice':34,'badge':'−26%','inStock':True,'image':'images/products/2.jpg'},
    {'id':3,'name':'Северное сияние','type':'diamond','size':'40×50','difficulty':'Средняя','stars':3,'price':49,'oldPrice':62,'badge':'Хит','inStock':True,'image':'images/products/3.jpg'},
    {'id':4,'name':'Весенний сад','type':'paint','size':'50×65','difficulty':'Средняя','stars':3,'price':55,'oldPrice':None,'badge':None,'inStock':True,'image':'images/products/4.jpg'},
    {'id':5,'name':'Коты у окна','type':'diamond','size':'30×40','difficulty':'Лёгкая','stars':2,'price':32,'oldPrice':40,'badge':'−20%','inStock':True,'image':'images/products/5.jpg'},
    {'id':6,'name':'Горный пейзаж','type':'paint','size':'60×80','difficulty':'Сложная','stars':5,'price':75,'oldPrice':95,'badge':'Новинка','inStock':True,'image':'images/products/6.jpg'},
    {'id':7,'name':'Лебеди на озере','type':'diamond','size':'50×65','difficulty':'Сложная','stars':5,'price':68,'oldPrice':None,'badge':None,'inStock':False,'image':'images/products/7.jpg'},
    {'id':8,'name':'Ночной город','type':'paint','size':'40×50','difficulty':'Средняя','stars':3,'price':42,'oldPrice':53,'badge':'−21%','inStock':True,'image':'images/products/8.jpg'},
    {'id':9,'name':'Тропические птицы','type':'diamond','size':'40×50','difficulty':'Средняя','stars':4,'price':45,'oldPrice':None,'badge':'Новинка','inStock':True,'image':'images/products/9.jpg'},
    {'id':10,'name':'Сакура в цвету','type':'paint','size':'30×40','difficulty':'Лёгкая','stars':1,'price':22,'oldPrice':30,'badge':'Хит','inStock':True,'image':'images/products/10.jpg'},
    {'id':11,'name':'Мандала Дзен','type':'diamond','size':'30×40','difficulty':'Средняя','stars':3,'price':35,'oldPrice':None,'badge':None,'inStock':True,'image':'images/products/11.jpg'},
    {'id':12,'name':'Итальянский дворик','type':'paint','size':'50×65','difficulty':'Средняя','stars':4,'price':58,'oldPrice':73,'badge':'−21%','inStock':True,'image':'images/products/12.jpg'},
    {'id':13,'name':'Осенний лес','type':'paint','size':'40×50','difficulty':'Средняя','stars':3,'price':40,'oldPrice':50,'badge':None,'inStock':True,'image':'images/products/13.jpg'},
    {'id':14,'name':'Феникс в огне','type':'diamond','size':'40×50','difficulty':'Сложная','stars':5,'price':59,'oldPrice':75,'badge':'−21%','inStock':True,'image':'images/products/14.jpg'},
    {'id':15,'name':'Маяк на скале','type':'paint','size':'30×40','difficulty':'Лёгкая','stars':2,'price':28,'oldPrice':None,'badge':'Новинка','inStock':True,'image':'images/products/15.jpg'},
    {'id':16,'name':'Кот-астронавт','type':'diamond','size':'30×40','difficulty':'Лёгкая','stars':2,'price':30,'oldPrice':38,'badge':'Хит','inStock':True,'image':'images/products/16.jpg'},
    {'id':17,'name':'Краски','type':'other','size':None,'difficulty':None,'stars':None,'price':30,'oldPrice':38,'badge':'Хит','inStock':True,'image':'images/products/17.jpg'},
]

PRODUCTS_BY_ID = {p['id']: p for p in PRODUCTS}

PROMOS = {'LUMMECRAFT10': 10, 'HOBBY15': 15, 'WELCOME20': 20}

# ─────────────────────────────────────────────
# GOOGLE SHEETS — вместо БД
# ─────────────────────────────────────────────

SHEET_HEADERS = [
    'id', 'created_at', 'first_name', 'last_name', 'phone', 'email',
    'telegram', 'instagram',
    'delivery', 'address', 'payment', 'comment', 'total', 'promo',
    'discount', 'final_total', 'status', 'items',
]

_gs_client = None

def _get_worksheet():
    """Ленивая авторизация + получение (или создание) листа с заказами."""
    global _gs_client
    if not GOOGLE_SHEET_ID:
        raise RuntimeError('GOOGLE_SHEET_ID не задан в .env')
    if _gs_client is None:
        creds = Credentials.from_service_account_file(
            GOOGLE_CREDENTIALS_FILE,
            scopes=['https://www.googleapis.com/auth/spreadsheets'],
        )
        _gs_client = gspread.authorize(creds)
    sh = _gs_client.open_by_key(GOOGLE_SHEET_ID)
    try:
        ws = sh.worksheet(GOOGLE_SHEET_NAME)
    except gspread.WorksheetNotFound:
        ws = sh.add_worksheet(title=GOOGLE_SHEET_NAME, rows=1000, cols=len(SHEET_HEADERS))
        ws.append_row(SHEET_HEADERS)
    return ws

def _items_text(items):
    return '; '.join(f"{it['name']} ({it.get('size') or '-'}) x{it['qty']}" for it in items)

def append_order_to_sheet(order):
    """Дописывает заказ строкой в Google Sheet. Бросает исключение при сбое —
    вызывающий код решает, критично это или нет."""
    ws = _get_worksheet()
    row = [
        order['id'], order['created_at'], order['first_name'], order['last_name'],
        order['phone'], order.get('email') or '',
        order.get('telegram') or '', order.get('instagram') or '',
        order['delivery'], order['address'],
        order['payment'], order.get('comment') or '', order['total'],
        order.get('promo') or '', order.get('discount') or 0, order['final_total'],
        order['status'], _items_text(order['items']),
    ]
    ws.append_row(row, value_input_option='USER_ENTERED')

def find_order_in_sheet(order_id, phone_digits):
    ws = _get_worksheet()
    for record in ws.get_all_records():
        if str(record.get('id', '')).strip().upper() == order_id:
            db_phone = re.sub(r'\D', '', str(record.get('phone', '')))
            if db_phone[-7:] == phone_digits[-7:]:
                return record
    return None

# ─────────────────────────────────────────────
# ЛОКАЛЬНЫЙ БЭКАП ЗАКАЗОВ (предохранитель на случай сбоя Sheets)
# ─────────────────────────────────────────────

_backup_lock = threading.Lock()

def backup_order_locally(order, synced):
    """Дописывает заказ в orders_backup.jsonl. synced=True, если он
    уже успешно улетел в Google Sheet, False — если нет (и его нужно
    будет занести туда вручную или ре-синком)."""
    record = {**order, 'synced_to_sheet': synced}
    with _backup_lock:
        with open(ORDERS_BACKUP_FILE, 'a', encoding='utf-8') as f:
            f.write(json.dumps(record, ensure_ascii=False) + '\n')

def find_order_in_backup(order_id, phone_digits):
    if not os.path.exists(ORDERS_BACKUP_FILE):
        return None
    with open(ORDERS_BACKUP_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                rec = json.loads(line)
            except json.JSONDecodeError:
                continue
            if str(rec.get('id', '')).strip().upper() == order_id:
                db_phone = re.sub(r'\D', '', str(rec.get('phone', '')))
                if db_phone[-7:] == phone_digits[-7:]:
                    return rec
    return None

# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────

ORDER_COUNTER_FILE = os.path.join(BASE_DIR, 'order_counter.txt')
_order_counter_lock = threading.Lock()

def _load_order_counter():
    try:
        with open(ORDER_COUNTER_FILE, 'r') as f:
            return int(f.read().strip())
    except (FileNotFoundError, ValueError):
        return 0

_order_counter = _load_order_counter()

def gen_order_id():
    """Короткий строго уникальный номер: LC-000001, LC-000002, ...
    Счётчик хранится в order_counter.txt и переживает рестарт сервера."""
    global _order_counter
    with _order_counter_lock:
        _order_counter += 1
        n = _order_counter
        with open(ORDER_COUNTER_FILE, 'w') as f:
            f.write(str(n))
    return f"LC-{n:06d}"

def validate_phone(phone):
    return len(re.sub(r'\D', '', phone)) >= 7

def validate_required(data, fields):
    errors = {}
    for f in fields:
        v = data.get(f, '')
        if not v or not str(v).strip():
            errors[f] = 'Обязательное поле'
    return errors

def api_ok(data=None, **kw):
    resp = {'ok': True}
    if data is not None: resp['data'] = data
    resp.update(kw)
    return jsonify(resp)

def api_err(msg, code=400):
    return jsonify({'ok': False, 'error': msg}), code

# ─────────────────────────────────────────────
# УВЕДОМЛЕНИЯ О ЗАКАЗЕ (Telegram + EmailJS)
# ─────────────────────────────────────────────

def notify_telegram(order):
    if not TG_TOKEN or not TG_CHAT_ID:
        return
    lines = '\n'.join(
        f"• {it['name']} ({it.get('size') or '-'}) × {it['qty']} = {it['price'] * it['qty']:.2f} BYN"
        for it in order['items']
    )
    social_lines = ''
    if order.get('telegram'):
        social_lines += f"\n💬 Telegram: {order['telegram']}"
    if order.get('instagram'):
        social_lines += f"\n📸 Instagram: {order['instagram']}"

    text = (
        f"🆕 Новый заказ {order['id']}\n"
        f"👤 {order['first_name']} {order['last_name']}\n"
        f"📞 {order['phone']}"
        f"{social_lines}\n"
        f"🚚 {order['delivery']}: {order['address']}\n"
        f"💳 {order['payment']}\n\n{lines}\n\n"
        f"Итого: {order['final_total']:.2f} BYN"
        + (f" (скидка {order['discount']:.2f})" if order.get('discount') else '')
    )
    if order.get('comment'):
        text += f"\n💬 {order['comment']}"
    if order.get('_sheet_warning'):
        text = "⚠️ НЕ ЗАПИСАЛСЯ В GOOGLE SHEET — занеси вручную!\n\n" + text
    try:
        requests.post(
            f"https://api.telegram.org/bot{TG_TOKEN}/sendMessage",
            json={'chat_id': TG_CHAT_ID, 'text': text}, timeout=5,
        )
    except requests.RequestException as e:
        print(f"[notify_telegram] ошибка: {e}")

def notify_email(order):
    if not (EMAILJS_SERVICE_ID and EMAILJS_TEMPLATE_ID and (EMAILJS_PRIVATE_KEY or EMAILJS_PUBLIC_KEY)):
        return
    payload = {
        'service_id': EMAILJS_SERVICE_ID,
        'template_id': EMAILJS_TEMPLATE_ID,
        'user_id': EMAILJS_PUBLIC_KEY,
        'accessToken': EMAILJS_PRIVATE_KEY,
        'template_params': {
            'order_id': order['id'],
            'order_date': order['created_at'],
            'name': f"{order['first_name']} {order['last_name']}",
            'phone': order['phone'],
            'telegram': order.get('telegram') or '—',
            'instagram': order.get('instagram') or '—',
            'address': order['address'],
            'payment': order['payment'],
            'items_text': _items_text(order['items']),
            'total': f"{order['total']:.2f}",
            'discount': f"{order.get('discount', 0):.2f}",
            'promo': order.get('promo') or '—',
            'comment': order.get('comment') or '—',
            'to_email': SHOP_EMAIL,
        },
    }
    try:
        resp = requests.post('https://api.emailjs.com/api/v1.0/email/send', json=payload, timeout=5)
        if resp.status_code != 200:
            print(f"[notify_email] EmailJS вернул {resp.status_code}: {resp.text}")
        else:
            print("[notify_email] письмо отправлено успешно")
    except requests.RequestException as e:
        print(f"[notify_email] ошибка сети: {e}")

def notify_new_order(order):
    notify_telegram(order)
    notify_email(order)

# ─────────────────────────────────────────────
# API: PRODUCTS
# ─────────────────────────────────────────────

@app.route('/api/products', methods=['GET'])
def get_products():
    return api_ok(PRODUCTS)

@app.route('/api/products/<int:pid>', methods=['GET'])
def get_product(pid):
    p = PRODUCTS_BY_ID.get(pid)
    if not p:
        return api_err('Товар не найден', 404)
    return api_ok(p)

# ─────────────────────────────────────────────
# API: ORDERS
# ─────────────────────────────────────────────

@app.route('/api/orders', methods=['POST'])
def create_order():
    data = request.get_json(silent=True) or {}

    required = ['first_name', 'last_name', 'phone', 'delivery', 'address', 'payment', 'items']
    errors = validate_required(data, required)
    if not validate_phone(data.get('phone', '')):
        errors['phone'] = 'Некорректный номер телефона'

    items_in = data.get('items', [])
    if not isinstance(items_in, list) or len(items_in) == 0:
        errors['items'] = 'Корзина пуста'

    if errors:
        return jsonify({'ok': False, 'errors': errors}), 422

    # Цены и наличие считаем по серверному каталогу, а не по данным клиента
    total = 0.0
    enriched_items = []
    for item in items_in:
        pid = item.get('id')
        qty = max(1, int(item.get('qty', 1)))
        p = PRODUCTS_BY_ID.get(pid)
        if not p or not p['inStock']:
            return api_err(f'Товар #{pid} недоступен', 422)
        price = float(p['price'])
        total += price * qty
        enriched_items.append({
            'product_id': pid, 'name': p['name'], 'price': price,
            'qty': qty, 'size': p['size'], 'type': p['type'],
        })

    promo    = str(data.get('promo', '')).strip().upper()
    pct      = PROMOS.get(promo, 0)
    discount = round(total * pct / 100, 2) if pct else 0.0
    final    = round(total - discount, 2)

    address_raw = data.get('address', '')
    if isinstance(address_raw, dict):
        parts = [address_raw.get(k, '') for k in ['city', 'branch', 'street', 'house', 'apt', 'floor'] if address_raw.get(k)]
        address_str = ', '.join(parts)
    else:
        address_str = str(address_raw).strip()

    order = {
        'id': gen_order_id(),
        'created_at': datetime.now().isoformat(timespec='seconds'),
        'first_name': str(data['first_name']).strip(),
        'last_name': str(data['last_name']).strip(),
        'phone': str(data['phone']).strip(),
        'email': str(data.get('email', '')).strip(),
        'telegram': str(data.get('telegram', '')).strip(),
        'instagram': str(data.get('instagram', '')).strip(),
        'delivery': str(data['delivery']).strip(),
        'address': address_str,
        'payment': str(data['payment']).strip(),
        'comment': str(data.get('comment', '')).strip(),
        'total': total,
        'promo': promo or '',
        'discount': discount,
        'final_total': final,
        'status': 'new',
        'items': enriched_items,
    }

    try:
        append_order_to_sheet(order)
        backup_order_locally(order, synced=True)
    except Exception as e:
        # Google Sheets недоступен — заказ ВСЁ РАВНО не теряется:
        # он уже записан в orders_backup.jsonl (synced_to_sheet=False),
        # и уведомление в Telegram помечено предупреждением, чтобы
        # это было легко заметить и перенести в таблицу вручную.
        print(f"[create_order] Google Sheets недоступен, заказ сохранён в бэкап: {e}")
        backup_order_locally(order, synced=False)
        order['_sheet_warning'] = True

    notify_new_order(order)
    order.pop('_sheet_warning', None)
    return api_ok(order, message='Заказ оформлен'), 201


@app.route('/api/orders/check', methods=['POST'])
def check_order():
    data     = request.get_json(silent=True) or {}
    order_id = str(data.get('order_id', '')).strip().upper()
    phone    = re.sub(r'\D', '', str(data.get('phone', '')))

    if not order_id or not phone:
        return api_err('Введите номер заказа и телефон')

    try:
        record = find_order_in_sheet(order_id, phone)
    except Exception as e:
        print(f"[check_order] Google Sheets недоступен, ищу в бэкапе: {e}")
        record = find_order_in_backup(order_id, phone)

    if not record:
        return api_err('Заказ не найден или телефон не совпадает', 404)

    return api_ok(record)

# ─────────────────────────────────────────────
# STATIC PAGES
# ─────────────────────────────────────────────

@app.route('/')
def index():
    return send_from_directory(PUBLIC_DIR, 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory(PUBLIC_DIR, filename)

# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────

if __name__ == '__main__':
    print("✅  LummeCraft server running on http://localhost:5000")
    print(f"📁  Serving static files from: {PUBLIC_DIR}")
    print(f"🗄️   Локальный бэкап заказов: {ORDERS_BACKUP_FILE}")
    if not GOOGLE_SHEET_ID:
        print("⚠️   GOOGLE_SHEET_ID не задан в .env — заказы будут только в бэкап-файле!")
    app.run(debug=True, port=5000, use_reloader=False)