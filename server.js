const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const PORT = process.env.PORT || 4174;
const PUBLIC_DIR = path.join(__dirname, 'public');

const USERS = [
  { id: 'u-shopper', name: 'Avery Shopper', email: 'shopper@test.local', password: 'Automation123!', role: 'shopper' },
];

const baseProducts = [
  { id: 'p-1001', sku: 'SKU-LAP-13-PRO', name: 'NovaBook Pro 13', brand: 'Nova', category: 'Laptops', price: 1299, stock: 6, rating: 4.8, badge: 'Best seller', image: '/assets/products/p-1001.png' },
  { id: 'p-1002', sku: 'SKU-AUD-PODS', name: 'Auralite Noise Cancelling Pods', brand: 'Auralite', category: 'Audio', price: 179, stock: 12, rating: 4.6, badge: 'New', image: '/assets/products/p-1002.png' },
  { id: 'p-1003', sku: 'SKU-MON-4K-27', name: 'VistaView 27in 4K Monitor', brand: 'Vista', category: 'Displays', price: 399, stock: 4, rating: 4.7, badge: 'Limited stock', image: '/assets/products/p-1003.png' },
  { id: 'p-1004', sku: 'SKU-KBD-MECH', name: 'Keystone Mechanical Keyboard', brand: 'Keystone', category: 'Accessories', price: 119, stock: 15, rating: 4.5, badge: 'Popular', image: '/assets/products/p-1004.png' },
  { id: 'p-1005', sku: 'SKU-MSE-ERG', name: 'Orbit Ergonomic Mouse', brand: 'Orbit', category: 'Accessories', price: 69, stock: 2, rating: 4.4, badge: 'Low stock', image: '/assets/products/p-1005.png' },
  { id: 'p-1006', sku: 'SKU-BAG-CITY', name: 'MetroTech City Backpack', brand: 'MetroTech', category: 'Bags', price: 89, stock: 20, rating: 4.3, badge: 'Travel ready', image: '/assets/products/p-1006.png' },
  { id: 'p-1007', sku: 'SKU-CAM-STREAM', name: 'Clarity Stream Camera', brand: 'Clarity', category: 'Accessories', price: 149, stock: 7, rating: 4.2, badge: 'Remote work', image: '/assets/products/p-1007.png' },
  { id: 'p-1008', sku: 'SKU-DOCK-USB-C', name: 'PortHub USB-C Dock', brand: 'PortHub', category: 'Accessories', price: 159, stock: 5, rating: 4.6, badge: 'Staff pick', image: '/assets/products/p-1008.png' },
  { id: 'p-1009', sku: 'SKU-TAB-AIR-11', name: 'SlateAir Tablet 11', brand: 'Slate', category: 'Tablets', price: 549, stock: 9, rating: 4.6, badge: 'Lightweight', image: '/assets/products/p-1009.png' },
  { id: 'p-1010', sku: 'SKU-WAT-FIT-2', name: 'PulseFit Smart Watch', brand: 'PulseFit', category: 'Wearables', price: 229, stock: 11, rating: 4.4, badge: 'Health pick', image: '/assets/products/p-1010.png' },
  { id: 'p-1011', sku: 'SKU-SPK-MINI', name: 'RoomBeam Mini Speaker', brand: 'RoomBeam', category: 'Audio', price: 79, stock: 18, rating: 4.1, badge: 'Portable', image: '/assets/products/p-1011.png' },
  { id: 'p-1012', sku: 'SKU-CHR-65W', name: 'VoltEdge 65W Charger', brand: 'VoltEdge', category: 'Power', price: 49, stock: 25, rating: 4.7, badge: 'Essential', image: '/assets/products/p-1012.png' },
  { id: 'p-1013', sku: 'SKU-CBL-USBC-2M', name: 'FlexLine USB-C Cable 2m', brand: 'FlexLine', category: 'Power', price: 19, stock: 40, rating: 4.5, badge: 'Value', image: '/assets/products/p-1013.png' },
  { id: 'p-1014', sku: 'SKU-HDD-2TB', name: 'ArchivePlus 2TB Portable Drive', brand: 'ArchivePlus', category: 'Storage', price: 129, stock: 8, rating: 4.3, badge: 'Backup', image: '/assets/products/p-1014.png' },
  { id: 'p-1015', sku: 'SKU-SSD-1TB', name: 'FlashVault 1TB SSD', brand: 'FlashVault', category: 'Storage', price: 139, stock: 13, rating: 4.8, badge: 'Fast', image: '/assets/products/p-1015.png' },
  { id: 'p-1016', sku: 'SKU-CHAIR-ERG', name: 'WorkWell Ergonomic Chair', brand: 'WorkWell', category: 'Office', price: 349, stock: 3, rating: 4.5, badge: 'Low stock', image: '/assets/products/p-1016.png' },
  { id: 'p-1017', sku: 'SKU-LAMP-DESK', name: 'Lumina Desk Lamp', brand: 'Lumina', category: 'Office', price: 30, stock: 16, rating: 4.2, badge: 'Desk setup', image: '/assets/products/p-1017.png' },
  { id: 'p-1018', sku: 'SKU-HUB-HDMI', name: 'PortHub HDMI Travel Hub', brand: 'PortHub', category: 'Accessories', price: 99, stock: 0, rating: 4.4, badge: 'Sold out', image: '/assets/products/p-1018.png' },
];

let products;
let carts;
let orders;
let sessions;
let audit;

function resetState() {
  products = baseProducts.map((p) => ({ ...p }));
  carts = new Map();
  orders = [];
  sessions = new Map();
  audit = [];
}

function resetTestData() {
  products = baseProducts.map((p) => ({ ...p }));
  carts = new Map();
  orders = [];
  audit = [];
}
resetState();

function auditLog(req, status, userId, extra = {}) {
  const entry = {
    id: crypto.randomBytes(4).toString('hex'),
    at: new Date().toISOString(),
    method: req.method,
    path: new URL(req.url, `http://${req.headers.host}`).pathname,
    status,
    userId: userId || 'anonymous',
    ...extra,
  };
  audit.unshift(entry);
  audit = audit.slice(0, 60);
}

function send(res, status, body, headers = {}) {
  const payload = body === undefined ? '' : JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers,
  });
  res.end(payload);
}

function sendText(res, status, text, type = 'text/plain; charset=utf-8', headers = {}) {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store', ...headers });
  res.end(text);
}

function parseCookies(req) {
  const header = req.headers.cookie || '';
  return Object.fromEntries(header.split(';').map((item) => item.trim()).filter(Boolean).map((item) => {
    const index = item.indexOf('=');
    return [decodeURIComponent(item.slice(0, index)), decodeURIComponent(item.slice(index + 1))];
  }));
}

function getUser(req) {
  const sid = parseCookies(req).sid;
  const userId = sid && sessions.get(sid);
  return USERS.find((user) => user.id === userId) || null;
}

function requireAuth(req, res) {
  const user = getUser(req);
  if (!user) {
    send(res, 401, { error: 'Unauthorised. Please sign in.' });
    auditLog(req, 401);
    return null;
  }
  return user;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) reject(new Error('Payload too large'));
    });
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch (error) { reject(error); }
    });
  });
}

function cartFor(userId) {
  if (!carts.has(userId)) carts.set(userId, { items: [], promoCodes: [] });
  const cart = carts.get(userId);
  if (!Array.isArray(cart.promoCodes)) cart.promoCodes = cart.promoCode ? [cart.promoCode] : [];
  cart.promoCode = cart.promoCodes[cart.promoCodes.length - 1] || '';
  return cart;
}

function enrichCart(cart) {
  const items = cart.items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return { ...item, product, lineTotal: Number(((product?.price || 0) * item.quantity).toFixed(2)) };
  });
  const subtotal = Number(items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2));
  const promoCodes = Array.isArray(cart.promoCodes) ? cart.promoCodes : (cart.promoCode ? [cart.promoCode] : []);
  return { items, promoCodes, promoCode: promoCodes[promoCodes.length - 1] || '', subtotal };
}

function calculateTotals(cart, deliveryMethod) {
  const enriched = enrichCart(cart);
  let delivery = 0;
  if (deliveryMethod === 'standard') delivery = enriched.subtotal >= 50 ? 0 : 3.99;
  if (deliveryMethod === 'express') delivery = enriched.subtotal >= 50 ? 0 : 7.99;
  if (deliveryMethod === 'collection') delivery = 0;

  let discount = 0;
  const promoCodes = Array.isArray(cart.promoCodes) ? cart.promoCodes : (cart.promoCode ? [cart.promoCode] : []);
  for (const promoCode of promoCodes) {
    if (promoCode === 'SAVE10') discount += Number((enriched.subtotal * 0.1).toFixed(2));
    if (promoCode === 'WELCOME5' && enriched.subtotal > 30) discount += 5;
  }

  const total = Number(Math.max(0, enriched.subtotal - discount + delivery).toFixed(2));
  return { ...enriched, deliveryMethod, delivery, discount, total };
}

function orderSummary(order) {
  return {
    id: order.id,
    createdAt: order.createdAt,
    status: order.status,
    itemCount: order.items.length,
    total: order.total,
    deliveryMethod: order.deliveryMethod,
    customer: order.customer,
  };
}

async function handleApi(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  try {
    if (pathname === '/api/test/reset' && req.method === 'POST') {
      resetTestData();
      send(res, 200, { ok: true, message: 'Test data reset. Active session preserved.' });
      auditLog(req, 200, null, { action: 'reset' });
      return;
    }

    if (pathname === '/api/auth/login' && req.method === 'POST') {
      const body = await readBody(req);
      const user = USERS.find((u) => u.email.toLowerCase() === String(body.email || '').toLowerCase() && u.password === body.password);
      if (!user) {
        send(res, 401, { error: 'Invalid credentials.' });
        auditLog(req, 401, null, { action: 'login_failed' });
        return;
      }
      const sid = crypto.randomBytes(18).toString('hex');
      sessions.set(sid, user.id);
      const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
      send(res, 200, { user: safeUser }, { 'Set-Cookie': `sid=${sid}; HttpOnly; SameSite=Lax; Path=/; Max-Age=7200` });
      auditLog(req, 200, user.id, { action: 'login_success' });
      return;
    }

    if (pathname === '/api/auth/logout' && req.method === 'POST') {
      const sid = parseCookies(req).sid;
      if (sid) sessions.delete(sid);
      send(res, 200, { ok: true }, { 'Set-Cookie': 'sid=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0' });
      auditLog(req, 200, null, { action: 'logout' });
      return;
    }

    if (pathname === '/api/auth/me' && req.method === 'GET') {
      const user = getUser(req);
      send(res, 200, { user: user ? { id: user.id, name: user.name, email: user.email, role: user.role } : null });
      auditLog(req, 200, user?.id);
      return;
    }

    const user = requireAuth(req, res);
    if (!user) return;

    if (pathname === '/api/brief' && req.method === 'GET') {
      send(res, 200, {
        title: 'Senior QA checkout assessment',
        expectedSubmission: ['Collated feedback', 'Interview walkthrough notes'],
        rules: [
          'Search must match product name, SKU, brand or category.',
          'Cart quantity must be between 1 and the available stock, with a maximum of 5 units per product.',
          'SAVE10 gives 10% off item subtotal only, capped at £20. WELCOME5 gives £5 off item subtotal when subtotal is at least £30.',
          'Only one promo code can be active per order. Applying a new promo should replace the previous promo, and the same promo must not be applied twice.',
          'Standard delivery is £3.99 and free at £50+. Express delivery is always £7.99. Collection is free.',
          'Declined test card 4000000000000002 must block checkout. Valid test card 4242424242424242 may complete checkout.',
        ],
      });
      auditLog(req, 200, user.id);
      return;
    }

    if (pathname === '/api/products' && req.method === 'GET') {
      const q = String(url.searchParams.get('q') || '').trim().toLowerCase();
      const category = String(url.searchParams.get('category') || '');
      const sort = String(url.searchParams.get('sort') || 'recommended');
      let rows = products.filter((product) => {
        const matchesCategory = !category || product.category === category;
        const searchable = [product.name, product.brand, product.category].join(' ').toLowerCase();
        const matchesSearch = !q || searchable.includes(q);
        return matchesCategory && matchesSearch;
      });
      if (sort === 'price-asc') rows = rows.slice().sort((a, b) => a.price - b.price);
      if (sort === 'price-desc') rows = rows.slice().sort((a, b) => b.price - a.price);
      if (sort === 'stock-asc') rows = rows.slice().sort((a, b) => b.stock - a.stock);
      send(res, 200, { products: rows, categories: [...new Set(products.map((p) => p.category))] });
      auditLog(req, 200, user.id, { q, category, sort });
      return;
    }

    if (pathname === '/api/cart' && req.method === 'GET') {
      const delivery = String(url.searchParams.get('delivery') || 'standard');
      send(res, 200, { cart: calculateTotals(cartFor(user.id), delivery) });
      auditLog(req, 200, user.id);
      return;
    }

    if (pathname === '/api/cart/items' && req.method === 'POST') {
      const body = await readBody(req);
      const product = products.find((p) => p.id === body.productId);
      const quantity = Number(body.quantity || 1);
      if (!product) return send(res, 404, { error: 'Product not found.' });
      if (!Number.isFinite(quantity) || quantity < 1 || quantity > 5 || quantity > product.stock) {
        send(res, 400, { error: 'Quantity must be between 1 and available stock, maximum 5.' });
        auditLog(req, 400, user.id);
        return;
      }
      const cart = cartFor(user.id);
      const existing = cart.items.find((item) => item.productId === product.id);
      if (existing) existing.quantity = Math.min(product.stock, Math.min(5, existing.quantity + quantity));
      else cart.items.push({ id: crypto.randomBytes(4).toString('hex'), productId: product.id, quantity });
      send(res, 201, { cart: calculateTotals(cart, 'standard') });
      auditLog(req, 201, user.id, { productId: product.id, quantity });
      return;
    }

    const patchCartMatch = pathname.match(/^\/api\/cart\/items\/([^/]+)$/);
    if (patchCartMatch && req.method === 'PATCH') {
      const body = await readBody(req);
      const cart = cartFor(user.id);
      const item = cart.items.find((row) => row.id === patchCartMatch[1]);
      if (!item) return send(res, 404, { error: 'Basket item not found.' });
      const product = products.find((p) => p.id === item.productId);
      const quantity = Number(body.quantity);
      if (!Number.isFinite(quantity) || quantity > 5 || quantity > product.stock) {
        send(res, 400, { error: 'Quantity must be between 1 and available stock, maximum 5.' });
        auditLog(req, 400, user.id);
        return;
      }
      item.quantity = quantity;
      send(res, 200, { cart: calculateTotals(cart, 'standard') });
      auditLog(req, 200, user.id, { itemId: item.id, quantity });
      return;
    }

    if (patchCartMatch && req.method === 'DELETE') {
      const cart = cartFor(user.id);
      cart.items = cart.items.filter((item) => item.id !== patchCartMatch[1]);
      send(res, 200, { cart: calculateTotals(cart, 'standard') });
      auditLog(req, 200, user.id, { itemId: patchCartMatch[1], action: 'remove_cart_item' });
      return;
    }

    if (pathname === '/api/cart/promo' && req.method === 'POST') {
      const body = await readBody(req);
      const code = String(body.code || '').trim().toUpperCase();
      if (!['SAVE10', 'WELCOME5', ''].includes(code)) {
        send(res, 400, { error: 'Promo code not recognised.' });
        auditLog(req, 400, user.id, { code });
        return;
      }
      const cart = cartFor(user.id);
      if (code === '') {
        cart.promoCodes = [];
        cart.promoCode = '';
      } else {
        cart.promoCodes.push(code);
        cart.promoCode = code;
      }
      send(res, 200, { cart: calculateTotals(cart, 'standard') });
      auditLog(req, 200, user.id, { code, appliedPromos: cart.promoCodes });
      return;
    }

    if (pathname === '/api/checkout' && req.method === 'POST') {
      const body = await readBody(req);
      const cart = cartFor(user.id);
      const totals = calculateTotals(cart, body.deliveryMethod || 'standard');
      if (!totals.items.length) return send(res, 400, { error: 'Basket is empty.' });
      if (!body.termsAccepted) return send(res, 400, { error: 'Terms must be accepted.' });
      if (!body.address || !String(body.address.line1 || '').trim() || !String(body.address.postcode || '').trim()) return send(res, 400, { error: 'Delivery address is incomplete.' });
      if (!body.payment || !String(body.payment.cardNumber || '').trim()) return send(res, 400, { error: 'Payment card is required.' });
      for (const item of totals.items) {
        const product = products.find((p) => p.id === item.product.id);
        if (!product || item.quantity < 1 || item.quantity > product.stock || item.quantity > 5) return send(res, 400, { error: `Invalid quantity for ${item.product.name}.` });
      }
      totals.items.forEach((item) => {
        const product = products.find((p) => p.id === item.product.id);
        product.stock -= item.quantity;
      });
      const order = {
        id: `ORD-${String(orders.length + 10001).padStart(5, '0')}`,
        userId: user.id,
        customer: user.email,
        status: 'Confirmed',
        createdAt: new Date().toISOString(),
        deliveryMethod: body.deliveryMethod || 'standard',
        address: body.address,
        items: totals.items.map((item) => ({ sku: item.product.sku, name: item.product.name, quantity: item.quantity, price: item.product.price, lineTotal: item.lineTotal })),
        subtotal: totals.subtotal,
        discount: totals.discount,
        promoCodes: totals.promoCodes || [],
        delivery: totals.delivery,
        total: totals.total,
      };
      orders.unshift(order);
      send(res, 201, { order });
      auditLog(req, 201, user.id, { orderId: order.id, total: order.total });
      return;
    }

    if (pathname === '/api/orders' && req.method === 'GET') {
      const rows = orders.filter((order) => order.userId === user.id);
      send(res, 200, { orders: rows.map(orderSummary) });
      auditLog(req, 200, user.id);
      return;
    }

    const orderMatch = pathname.match(/^\/api\/orders\/([^/]+)$/);
    if (orderMatch && req.method === 'GET') {
      const order = orders.find((row) => row.id === orderMatch[1]);
      if (!order) return send(res, 404, { error: 'Order not found.' });
      if (order.userId !== user.id) return send(res, 403, { error: 'Order belongs to another user.' });
      send(res, 200, { order });
      auditLog(req, 200, user.id, { orderId: order.id });
      return;
    }

    if (pathname === '/api/reports/orders.csv' && req.method === 'GET') {
      const rows = orders.filter((o) => o.userId === user.id);
      const csv = ['Order ID,Status,Customer,Delivery,Subtotal,Discount,Delivey Fee,Total,Created At']
        .concat(rows.map((o) => [o.id, o.status, o.customer, o.deliveryMethod, o.subtotal, o.discount, o.delivery, o.subtotal, o.createdAt].join(',')))
        .join('\n');
      sendText(res, 200, csv, 'text/csv; charset=utf-8', { 'Content-Disposition': 'attachment; filename="orders.csv"' });
      auditLog(req, 200, user.id, { action: 'export_csv' });
      return;
    }

    if (pathname === '/api/audit' && req.method === 'GET') {
      send(res, 404, { error: 'Endpoint not found.' });
      auditLog(req, 404, user.id);
      return;
    }

    send(res, 404, { error: 'Endpoint not found.' });
    auditLog(req, 404, user.id);
  } catch (error) {
    send(res, 500, { error: 'Server error.', detail: error.message });
    auditLog(req, 500, null, { error: error.message });
  }
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';
  let filePath = path.join(PUBLIC_DIR, pathname);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendText(res, 403, 'Forbidden');
    return;
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(PUBLIC_DIR, 'index.html');
  }
  const ext = path.extname(filePath).toLowerCase();
  const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png' };
  sendText(res, 200, fs.readFileSync(filePath), types[ext] || 'application/octet-stream', { 'Cache-Control': 'no-cache' });
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/')) handleApi(req, res);
  else serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`Checkout Senior QA Assessment running at http://localhost:${PORT}`);
});
