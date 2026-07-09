const state = {
  user: null,
  page: 'brief',
  products: [],
  categories: [],
  cart: null,
  orders: [],
  filters: { q: '', category: '', sort: 'recommended' },
  orderGrid: { q: '', sort: 'createdAt', dir: 'desc' },
  deliveryMethod: 'standard',
  checkout: {
    line1: '10 Automation Street',
    city: 'London',
    postcode: 'EC1A 1QA',
    cardNumber: '4242424242424242',
    termsAccepted: false,
  },
  toasts: [],
  lastOrder: null,
};

const app = document.getElementById('app');
const money = (value) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Number(value || 0));
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
function testid(id) {
  if (id === 'login-card') return 'data-testid="login-card"';
  if (id === 'login-form') return 'data-form="sign-in"';
  if (id === 'login-email') return 'aria-label="Email address" data-field="email"';
  if (id === 'login-password') return 'aria-label="Password" data-field="password"';
  if (id === 'login-submit') return 'data-cy="sign-in-submit"';
  if (id === 'login-error') return 'data-testid="login-error"';
  if (id === 'brand-home') return 'aria-label="Checkout QA Lab home"';
  if (id === 'logged-in-user') return 'data-testid="logged-in-user"';
  if (id === 'reset-data') return 'data-action="reset-data" aria-label="Reset test data"';
  if (id === 'logout-button') return 'aria-label="Sign out"';
  if (id === 'sidebar') return 'aria-label="Primary navigation"';
  if (id.startsWith('nav-')) return `data-nav="${id.replace('nav-', '')}"`;
  if (id === 'main-content') return 'id="main-content"';
  if (id === 'brief-page') return 'data-testid="brief-page"';
  if (id === 'start-assessment') return 'data-cy="start-assessment"';
  if (id === 'ticket-board') return 'data-testid="ticket-board"';
  if (id.startsWith('product-')) return `data-product-id="${id.replace('product-', '')}"`;
  if (id.startsWith('add-')) return `data-cy="add-to-basket" data-product-id="${id.replace('add-', '')}"`;
  if (id === 'product-search') return 'aria-label="Search products"';
  if (id === 'category-filter') return 'aria-label="Filter by category"';
  if (id === 'sort-filter') return 'aria-label="Sort products"';
  if (id === 'clear-search') return 'aria-label="Clear product filters"';
  if (id === 'product-grid') return 'data-testid="product-grid"';
  if (id === 'cart-panel') return 'aria-label="Shopping basket" data-region="basket"';
  if (id === 'cart-items') return 'data-testid="cart-items"';
  if (id.startsWith('cart-item-')) return `data-basket-row="${id.replace('cart-item-', '')}"`;
  if (id.startsWith('qty-plus-')) return `aria-label="Increase quantity" data-cart-control="increase" data-cart-item="${id.replace('qty-plus-', '')}"`;
  if (id.startsWith('qty-minus-')) return `aria-label="Decrease quantity" data-cart-control="decrease" data-cart-item="${id.replace('qty-minus-', '')}"`;
  if (id.startsWith('qty-')) return `data-quantity-for="${id.replace('qty-', '')}"`;
  if (id.startsWith('remove-')) return `aria-label="Remove item from basket" data-cart-control="remove" data-cart-item="${id.replace('remove-', '')}"`;
  if (id === 'continue-to-checkout') return 'data-cy="continue-to-checkout"';
  if (id === 'checkout-page') return 'data-testid="checkout-page"';
  if (id === 'checkout-summary') return 'aria-label="Checkout basket summary"';
  if (id === 'checkout-form') return 'data-form="checkout-payment"';
  if (id === 'promo-code') return 'aria-label="Promo code"';
  if (id === 'apply-promo') return 'data-cy="apply-promo"';
  if (id === 'delivery-method') return 'aria-label="Delivery method"';
  if (id === 'checkout-grand-total') return 'data-testid="checkout-grand-total"';
  if (id === 'checkout-subtotal') return 'data-total-field="subtotal"';
  if (id === 'checkout-discount') return 'data-total-field="discount"';
  if (id === 'checkout-delivery-fee') return 'data-total-field="delivery"';
  if (id === 'address-line1') return 'aria-label="Address line 1"';
  if (id === 'address-city') return 'aria-label="City"';
  if (id === 'address-postcode') return 'aria-label="Postcode"';
  if (id === 'card-number') return 'aria-label="Card number" inputmode="numeric"';
  if (id === 'terms-checkbox') return 'aria-label="Accept checkout terms"';
  if (id === 'place-order') return 'data-cy="place-order"';
  if (id === 'orders-page') return 'data-testid="orders-page"';
  if (id === 'export-orders') return 'data-cy="export-orders"';
  if (id === 'orders-grid') return 'data-testid="orders-grid"';
  if (id.startsWith('order-row-')) return `data-row-id="${id.replace('order-row-', '')}"`;
  return `data-qa="${id}"`;
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const contentType = res.headers.get('content-type') || '';
  let data;
  if (contentType.includes('application/json')) data = await res.json();
  else data = await res.text();
  if (!res.ok) throw new Error(data?.error || data || `Request failed with ${res.status}`);
  return data;
}

function toast(message, type = 'success') {
  const item = { id: Math.random().toString(36).slice(2), message, type };
  state.toasts.push(item);
  renderToasts();
  setTimeout(() => {
    state.toasts = state.toasts.filter((toast) => toast.id !== item.id);
    renderToasts();
  }, 4200);
}

function renderToasts() {
  let stack = document.querySelector('.toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
  }
  stack.innerHTML = state.toasts.map((item) => `<div class="toast ${item.type}" role="status" ${testid(`toast-${item.type}`)}><span>${escapeHtml(item.message)}</span><button type="button" onclick="dismissToast('${item.id}')" aria-label="Dismiss notification">×</button></div>`).join('');
}
window.dismissToast = (id) => { state.toasts = state.toasts.filter((item) => item.id !== id); renderToasts(); };

async function init() {
  try {
    const { user } = await api('/api/auth/me');
    state.user = user;
    if (user) await loadAll();
  } catch { state.user = null; }
  render();
}

async function loadAll() {
  await Promise.all([loadProducts(), loadCart(), loadOrders()]);
}

async function loadProducts() {
  const params = new URLSearchParams();
  if (state.filters.q) params.set('q', state.filters.q);
  if (state.filters.category) params.set('category', state.filters.category);
  if (state.filters.sort) params.set('sort', state.filters.sort);
  const data = await api(`/api/products?${params}`);
  state.products = data.products;
  state.categories = data.categories;
}

async function loadCart() {
  const data = await api(`/api/cart?delivery=${encodeURIComponent(state.deliveryMethod)}`);
  state.cart = data.cart;
}

async function loadOrders() {
  const data = await api('/api/orders');
  state.orders = data.orders;
}

function setPage(page) {
  state.page = page;
  state.lastOrder = null;
  render();
  if (page === 'orders') loadOrders().then(render);
}

function render() {
  if (!state.user) renderLogin();
  else renderAppShell();
  renderToasts();
}

function renderLogin() {
  app.innerHTML = `
    <main class="login-shell">
      <section class="login-copy">
        <div class="logo-pill"><span class="logo-mark">CX</span><span>Checkout Experience QA Lab</span></div>
        <h1>Sample shopper journey.</h1>
        <p>A focused online shopping scenario that can be understood quickly without product training.</p>
        <div class="login-features">
          <div class="login-feature"><strong>3-5h</strong><span>Focused take-home scope</span></div>
          <div class="login-feature"><strong>UI</strong><span>Realistic browser workflow</span></div>
          <div class="login-feature"><strong>Customer</strong><span>Single shopper account</span></div>
        </div>
      </section>
      <section class="login-card" ${testid('login-card')}>
        <h2>Sign in</h2>
        <p class="muted">Use the account details provided with your assessment invite.</p>
        <form id="login-form" ${testid('login-form')}>
          <label class="field">Email<input id="login-email" ${testid('login-email')} type="email" autocomplete="username" required /></label>
          <label class="field">Password<input id="login-password" ${testid('login-password')} type="password" autocomplete="current-password" required /></label>
          <button class="primary full" type="submit" ${testid('login-submit')}>Sign in</button>
          <div id="login-error" style="display:none" class="error" role="alert" ${testid('login-error')}></div>
        </form>
      </section>
    </main>`;
  document.getElementById('login-form').addEventListener('submit', loginSubmit);
}


async function loginSubmit(event) {
  event.preventDefault();
  const error = document.getElementById('login-error');
  error.style.display = 'none';
  try {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const data = await api('/api/auth/login', { method: 'POST', body: { email, password } });
    state.user = data.user;
    state.page = 'brief';
    await loadAll();
    render();
    toast('Signed in successfully.');
  } catch (err) {
    error.textContent = err.message;
    error.style.display = 'block';
  }
}

async function logout() {
  await api('/api/auth/logout', { method: 'POST' }).catch(() => {});
  state.user = null;
  state.page = 'brief';
  render();
}

async function resetData() {
  await api('/api/test/reset', { method: 'POST' });
  state.lastOrder = null;
  await loadAll();
  render();
  toast('Test data reset.');
}

function renderAppShell() {
  const nav = [
    ['brief', 'Ticket brief', 'Req'],
    ['shop', 'Shop & basket', state.cart?.items?.length || 0],
    ['checkout', 'Checkout / payment', 'Pay'],
    ['orders', 'Orders / export', state.orders.length],
  ];
  app.innerHTML = `
    <div class="app-shell">
      <header class="topbar">
        <div class="env-strip">Staging assessment app — resettable data — no real payment</div>
        <div class="topbar-inner">
          <button class="brand" type="button" onclick="setPage('brief')" ${testid('brand-home')}>
            <span class="logo-mark">CX</span>
            <span><strong>Checkout QA Lab</strong><small>Senior Automation Assessment</small></span>
          </button>
          <div class="user-actions">
            <span class="user-chip" ${testid('logged-in-user')}><i class="role-dot"></i>${escapeHtml(state.user.name)}</span>
            <button class="ghost" type="button" onclick="resetData()" ${testid('reset-data')}>Reset data</button>
            <button class="secondary" type="button" onclick="logout()" ${testid('logout-button')}>Sign out</button>
          </div>
        </div>
      </header>
      <div class="main-layout">
        <aside class="sidebar" ${testid('sidebar')}>
          ${nav.map(([key, label, count]) => `<button class="nav-button ${state.page === key ? 'active' : ''}" type="button" onclick="setPage('${key}')" ${testid(`nav-${key}`)}><span>${label}</span><span class="nav-count">${count}</span></button>`).join('')}
        </aside>
        <main class="content" ${testid('main-content')}>${renderPage()}</main>
      </div>
    </div>`;
  bindCurrentPage();
}

function renderPage() {
  if (state.page === 'brief') return renderBrief();
  if (state.page === 'shop') return renderShop();
  if (state.page === 'checkout') return renderCheckoutPage();
  if (state.page === 'orders') return renderOrders();
  return renderBrief();
}

function renderBrief() {
  return `
    <section class="page" ${testid('brief-page')}>
      <div class="board-intro">
        <div>
          <p class="eyebrow">Shopper journey ticket</p>
          <h1>Test ticket: shopper checkout</h1>
          <p class="muted">Read the requirement card, open the shop page, then complete the task using the provided staging app.</p>
        </div>
        <button class="primary" type="button" onclick="setPage('shop')" ${testid('start-assessment')}>Open shop</button>
      </div>
      <div class="ticket-board" ${testid('ticket-board')}>
        <section class="ticket-column">
          <header><h2>Ticket requirements</h2><span>3</span></header>
          <article class="ticket-card story-card" ${testid('ticket-story')}>
            <div class="wireframe checkout-wireframe" aria-label="Shop and checkout wireframe">
              <div class="wf-label">Shop & basket</div>
              <div class="wf-search">Search products</div>
              <div class="wf-grid"><span>Product card</span><span>Product card</span><span>Product card</span></div>
              <div class="wf-basket"><strong>Basket</strong><small>Item line</small><small>Qty</small><small>Continue</small></div>
              <div class="wf-arrow">↓</div>
              <div class="wf-label">Checkout / payment</div>
              <div class="wf-checkout"><small>Promo code</small><small>Delivery method</small><small>Address + card</small><strong>Totals</strong></div>
            </div>
            <span class="label green">Story</span>
            <h3>As a shopper, I want to buy products online, so that I can complete an order from a basket.</h3>
            <p>The release includes product search, basket quantity changes, a separate checkout step for promo and delivery selection, payment, order confirmation and order history.</p>
          </article>
          <article class="ticket-card" ${testid('business-rules')}>
            <span class="label blue">Acceptance criteria</span>
            <ul class="compact-list">
              <li>Shoppers can search and sort the product catalogue.</li>
              <li>Shoppers can add available products to the basket.</li>
              <li>Shoppers can update quantities or remove items from the basket.</li>
              <li>Basket quantities should respect product availability.</li>
              <li>Shoppers can continue from basket to checkout.</li>
              <li>Checkout should show the products being purchased and the total payable.</li>
              <li>Shoppers can apply eligible promotional offers.</li>
              <li>Promotional offers cannot be combined with other offers or discounts.</li>
              <li>Shoppers can choose a delivery option.</li>
              <li>Required delivery and payment details must be provided before placing an order.</li>
              <li>Completed orders should appear in order history.</li>
              <li>Order information can be exported.</li>
            </ul>
          </article>
          <article class="ticket-card" ${testid('test-data-card')}>
            <span class="label amber">Test data</span>
            <ul class="compact-list">
              <li>Promo codes: <b>SAVE10</b>, <b>WELCOME5</b>.</li>
              <li>Accepted test card: <b>4242424242424242</b>.</li>
              <li>Declined test card: <b>4000000000000002</b>.</li>
            </ul>
          </article>
        </section>
        <section class="ticket-column short-column">
          <header><h2>To test</h2><span>2</span></header>
          <article class="ticket-card">
            <p>Once the ticket has been read, open the shop page and begin testing.</p>
          </article>
          <article class="ticket-card link-card">
            <span class="link-icon">⌁</span>
            <button type="button" onclick="setPage('shop')" ${testid('ticket-open-link')}>Shopper journey app</button>
            <small>localhost:4174</small>
          </article>
        </section>
        <section class="ticket-column short-column">
          <header><h2>Output</h2><span>1</span></header>
          <article class="ticket-card output-card" ${testid('candidate-output')}>
            <p>Once testing is complete, collate your feedback. During the interview, talk us through your findings, your test approach and the choices you made.</p>
          </article>
        </section>
      </div>
    </section>`;
}

function renderShop() {
  return `
    <section class="page" ${testid('shop-page')}>
      <div class="hero slim">
        <p class="eyebrow">Shop & basket</p>
        <h1>Find products and build a basket.</h1>
        <p>Use the ticket rules as your source of truth.</p>
      </div>
      <div class="checkout-grid">
        <div>
          <section class="card">
            <div class="card-header"><div><h2>Product catalogue</h2><p class="muted">Search, filters, sorting, stock and add-to-basket behaviour.</p></div></div>
            <div class="toolbar">
              <label class="field">Search<input id="product-search" value="${escapeHtml(state.filters.q)}" placeholder="Name, SKU, brand or category" ${testid('product-search')} /></label>
              <label class="field">Category<select id="category-filter" ${testid('category-filter')}><option value="">All categories</option>${state.categories.map((c) => `<option ${state.filters.category === c ? 'selected' : ''}>${escapeHtml(c)}</option>`).join('')}</select></label>
              <label class="field">Sort<select id="sort-filter" ${testid('sort-filter')}><option value="recommended">Recommended</option><option value="price-asc" ${state.filters.sort === 'price-asc' ? 'selected' : ''}>Price low to high</option><option value="price-desc" ${state.filters.sort === 'price-desc' ? 'selected' : ''}>Price high to low</option><option value="stock-asc" ${state.filters.sort === 'stock-asc' ? 'selected' : ''}>Stock low to high</option></select></label>
              <button class="secondary" type="button" id="clear-search" ${testid('clear-search')}>Clear</button>
            </div>
          </section>
          <div class="product-grid" ${testid('product-grid')}>
            ${state.products.map(renderProductCard).join('') || `<div class="card empty" ${testid('product-empty')}>No products found.</div>`}
          </div>
        </div>
        <aside class="cart-panel">
          ${renderCartPanel()}
        </aside>
      </div>
    </section>`;
}

function renderProductCard(product) {
  const stockClass = product.stock <= 2 ? 'danger' : product.stock <= 5 ? 'warn' : 'ok';
  return `
    <article class="product-card" role="group" aria-label="Product ${escapeHtml(product.name)}" ${testid(`product-${product.id}`)} data-sku="${escapeHtml(product.sku)}">
      <div class="product-art" aria-hidden="true"><img class="product-image" src="${escapeHtml(product.image)}" alt="" loading="lazy" /></div>
      <div class="product-top">
        <div><a class="product-title" href="#product/${product.id}" onclick="event.preventDefault()">${escapeHtml(product.name)}</a><div class="sku">${escapeHtml(product.sku)} · ${escapeHtml(product.brand)}</div></div>
        <span class="badge">${escapeHtml(product.badge)}</span>
      </div>
      <p class="muted product-meta">${escapeHtml(product.category)} · Rating ${product.rating}/5</p>
      <div class="price-row"><span class="price">${money(product.price)}</span><span class="badge ${stockClass}">${product.stock} in stock</span></div>
      <button class="primary add-basket" type="button" onclick="addToCart('${product.id}')" aria-label="Add ${escapeHtml(product.name)} to basket" ${testid(`add-${product.id}`)} ${product.stock < 0 ? 'disabled' : ''}>Add to basket</button>
    </article>`;
}

function renderCartPanel() {
  const cart = state.cart || { items: [], subtotal: 0 };
  const disabled = !(cart.items && cart.items.length);
  const itemCount = cart.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  return `
    <section class="card" ${testid('cart-panel')}>
      <div class="card-header"><div><h2>Basket</h2><p class="muted">${cart.items.length} item line(s), ${itemCount} item(s)</p></div></div>
      <div ${testid('cart-items')}>
        ${cart.items.map(renderCartItem).join('') || `<div class="empty" ${testid('cart-empty')}>Your basket is empty.</div>`}
      </div>
      <div class="basket-note" ${testid('basket-checkout-note')}>
        Promo code, delivery method and final totals are completed on the checkout page.
      </div>
      <button class="primary full" type="button" onclick="setPage('checkout')" ${testid('continue-to-checkout')} ${disabled ? 'disabled' : ''}>Continue to checkout</button>
    </section>`;
}

function renderCartItem(item) {
  return `
    <div class="cart-item" ${testid(`cart-item-${item.id}`)}>
      <img class="line-thumb" src="${escapeHtml(item.product.image)}" alt="" aria-hidden="true" />
      <div><strong>${escapeHtml(item.product.name)}</strong><small class="muted">${escapeHtml(item.product.sku)} · ${money(item.product.price)} each</small></div>
      <div style="text-align:right"><div class="qty-control"><button type="button" onclick="updateQty('${item.id}', ${item.quantity - 1})" ${testid(`qty-minus-${item.id}`)}>-</button><span ${testid(`qty-${item.id}`)}>${item.quantity}</span><button type="button" onclick="updateQty('${item.id}', ${item.quantity + 1})" ${testid(`qty-plus-${item.id}`)}>+</button></div><button class="ghost" style="margin-top:8px; min-height:32px; padding:5px 9px" onclick="removeItem('${item.id}')" ${testid(`remove-${item.id}`)}>Remove</button></div>
    </div>`;
}

function renderCheckoutPage() {
  const cart = state.cart || { items: [], subtotal: 0, delivery: 0, discount: 0, total: 0 };
  if (!cart.items.length && !state.lastOrder) {
    return `
      <section class="page" ${testid('checkout-page')}>
        <div class="hero slim"><p class="eyebrow">Checkout / payment</p><h1>Checkout.</h1><p>Complete payment after building a basket.</p></div>
        <section class="card empty-checkout" ${testid('checkout-empty')}>
          <h2>Your basket is empty.</h2>
          <p class="muted">Add at least one product before continuing to checkout.</p>
          <button class="primary" type="button" onclick="setPage('shop')" ${testid('back-to-shop')}>Back to shop</button>
        </section>
      </section>`;
  }
  return `
    <section class="page" ${testid('checkout-page')}>
      <div class="hero slim">
        <p class="eyebrow">Checkout / payment</p>
        <h1>Apply offers, choose delivery and pay.</h1>
        <p>Review basket items, complete checkout options, then place the order.</p>
      </div>
      <div class="payment-grid">
        <section class="card" ${testid('checkout-summary')}>
          <div class="card-header"><div><h2>Basket summary</h2><p class="muted">Items carried forward from Shop & basket.</p></div><button class="ghost" type="button" onclick="setPage('shop')" ${testid('edit-basket')}>Edit basket</button></div>
          <div ${testid('checkout-items')}>
            ${cart.items.map(renderCheckoutItem).join('') || `<div class="empty">No basket items.</div>`}
          </div>
          ${state.lastOrder ? `<div class="success-panel" style="margin-top:14px" ${testid('order-success')}><strong>Order confirmed: ${escapeHtml(state.lastOrder.id)}</strong><p class="muted">Total ${money(state.lastOrder.total)}. You can view it on the Orders page.</p><button class="secondary" type="button" onclick="setPage('orders')" ${testid('view-orders')}>View orders</button></div>` : ''}
        </section>
        <section class="card" ${testid('payment-panel')}>
          <div class="card-header"><div><h2>Checkout options</h2><p class="muted">Apply promo, choose delivery and complete payment.</p></div></div>
          <form class="checkout-form" id="checkout-form" ${testid('checkout-form')}>
            <label class="field">Promo code
              <div class="inline"><input id="promo-code" value="" placeholder="SAVE10 or WELCOME5" ${testid('promo-code')} /><button class="secondary" type="button" id="apply-promo" ${testid('apply-promo')}>Apply</button></div>
              ${renderAppliedPromos(cart)}
            </label>
            <label class="field">Delivery method
              <select id="delivery-method" ${testid('delivery-method')}>
                <option value="standard" ${state.deliveryMethod === 'standard' ? 'selected' : ''}>Standard - £3.99, free over £50</option>
                <option value="express" ${state.deliveryMethod === 'express' ? 'selected' : ''}>Express - £7.99</option>
                <option value="collection" ${state.deliveryMethod === 'collection' ? 'selected' : ''}>Collection - Free</option>
              </select>
            </label>
            <div class="totals" ${testid('checkout-totals')}>
              <div><span>Subtotal</span><strong ${testid('checkout-subtotal')}>${money(cart.subtotal)}</strong></div>
              <div><span>Discount</span><strong ${testid('checkout-discount')}>-${money(cart.discount)}</strong></div>
              <div><span>Delivery (${escapeHtml(state.deliveryMethod)})</span><strong ${testid('checkout-delivery-fee')}>${money(cart.delivery)}</strong></div>
              <div class="grand"><span>Total to pay</span><strong ${testid('checkout-grand-total')}>${money(cart.total)}</strong></div>
            </div>
            <label class="field">Address line 1<input id="address-line1" value="${escapeHtml(state.checkout.line1)}" ${testid('address-line1')} /></label>
            <div class="form-grid"><label class="field">City<input id="address-city" value="${escapeHtml(state.checkout.city)}" ${testid('address-city')} /></label><label class="field">Postcode<input id="address-postcode" value="${escapeHtml(state.checkout.postcode)}" ${testid('address-postcode')} /></label></div>
            <label class="field">Card number<input id="card-number" value="${escapeHtml(state.checkout.cardNumber)}" ${testid('card-number')} /></label>
            <label class="inline"><input type="checkbox" id="terms" ${state.checkout.termsAccepted ? 'checked' : ''} ${testid('terms-checkbox')} /> I accept the checkout terms.</label>
            <button class="primary full" type="submit" ${testid('place-order')} ${!(cart.items?.length) ? 'disabled' : ''}>Place order</button>
          </form>
        </section>
      </div>
    </section>`;
}

function renderAppliedPromos(cart) {
  const codes = cart?.promoCodes || (cart?.promoCode ? [cart.promoCode] : []);
  if (!codes.length) return '<small class="muted" data-testid="applied-promos">No promo code applied.</small>';
  return `<div class="applied-promos" data-testid="applied-promos">${codes.map((code) => `<span>${escapeHtml(code)}</span>`).join('')}</div>`;
}

function renderCheckoutItem(item) {
  return `
    <div class="checkout-item" ${testid(`checkout-item-${item.id}`)}>
      <img class="line-thumb" src="${escapeHtml(item.product.image)}" alt="" aria-hidden="true" />
      <div><strong>${escapeHtml(item.product.name)}</strong><small>${escapeHtml(item.product.sku)} · ${item.quantity} × ${money(item.product.price)}</small></div>
      <strong>${money(item.lineTotal)}</strong>
    </div>`;
}

function renderOrders() {
  const rows = sortedOrders().map(renderOrderGridRow).join('');
  return `
    <section class="page" ${testid('orders-page')}>
      <div class="hero slim orders-hero"><p class="eyebrow">Orders and export</p><h1>Order history and CSV export.</h1><p>Use this enterprise-style grid for order confirmation, sorting, filtering and reporting checks.</p></div>
      <section class="card orders-card">
        <div class="report-actions">
          <div><h2>Orders</h2><p class="muted">Review confirmed orders in a grid with sortable columns and an export action.</p></div>
          <button class="primary" type="button" onclick="exportOrders()" ${testid('export-orders')}>Export CSV</button>
        </div>
        <div class="grid-toolbar">
          <label class="field">Quick filter<input id="order-filter" aria-label="Filter orders" value="${escapeHtml(state.orderGrid?.q || '')}" placeholder="Search order, status, delivery or total" /></label>
          <span class="hint">${state.orders.length} confirmed order(s)</span>
        </div>
        <div class="ag-theme-checkout order-grid" role="grid" aria-label="Order history grid" ${testid('orders-grid')} aria-rowcount="${Math.max(1, sortedOrders().length)}" aria-colcount="6">
          <div class="ag-header" role="rowgroup">
            <div class="ag-row ag-header-row" role="row">
              ${renderGridHeader('id', 'Order ID')}
              ${renderGridHeader('status', 'Status')}
              ${renderGridHeader('customer', 'Customer')}
              ${renderGridHeader('deliveryMethod', 'Delivery')}
              ${renderGridHeader('itemCount', 'Items')}
              ${renderGridHeader('total', 'Total')}
            </div>
          </div>
          <div class="ag-body-viewport" role="rowgroup">
            ${rows || `<div class="ag-row ag-empty-row" role="row"><div class="ag-cell empty" role="gridcell" aria-colspan="6" ${testid('orders-empty')}>No orders yet.</div></div>`}
          </div>
        </div>
      </section>
    </section>`;
}

function renderGridHeader(colId, label) {
  const active = state.orderGrid?.sort === colId ? 'active' : '';
  const direction = state.orderGrid?.sort === colId ? (state.orderGrid.dir === 'asc' ? '↑' : '↓') : '';
  return `<button type="button" class="ag-cell ag-header-cell ${active}" role="columnheader" aria-sort="${active ? (state.orderGrid.dir === 'asc' ? 'ascending' : 'descending') : 'none'}" data-col-id="${colId}" onclick="sortOrders('${colId}')"><span>${label}</span><i>${direction}</i></button>`;
}

function renderOrderGridRow(order, index) {
  return `
    <div class="ag-row" role="row" aria-rowindex="${index + 2}" row-index="${index}" ${testid(`order-row-${order.id}`)}>
      <div class="ag-cell order-id" role="gridcell" data-col-id="id"><strong>${escapeHtml(order.id)}</strong><small>${new Date(order.createdAt).toLocaleString('en-GB')}</small></div>
      <div class="ag-cell" role="gridcell" data-col-id="status"><span class="status-pill">${escapeHtml(order.status)}</span></div>
      <div class="ag-cell" role="gridcell" data-col-id="customer">${escapeHtml(order.customer)}</div>
      <div class="ag-cell" role="gridcell" data-col-id="deliveryMethod">${escapeHtml(order.deliveryMethod)}</div>
      <div class="ag-cell" role="gridcell" data-col-id="itemCount">${order.itemCount}</div>
      <div class="ag-cell total-cell" role="gridcell" data-col-id="total"><strong>${money(order.total)}</strong></div>
    </div>`;
}

function sortedOrders() {
  const grid = state.orderGrid || { q: '', sort: 'createdAt', dir: 'desc' };
  const term = String(grid.q || '').trim().toLowerCase();
  let rows = state.orders.filter((order) => {
    const haystack = [order.id, order.status, order.customer, order.deliveryMethod, order.itemCount, order.total].join(' ').toLowerCase();
    return !term || haystack.includes(term);
  });
  rows = rows.slice().sort((a, b) => {
    const field = grid.sort || 'createdAt';
    const av = a[field];
    const bv = b[field];
    if (typeof av === 'number' && typeof bv === 'number') return grid.dir === 'asc' ? av - bv : bv - av;
    return grid.dir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
  });
  return rows;
}

function sortOrders(colId) {
  const current = state.orderGrid || { q: '', sort: 'createdAt', dir: 'desc' };
  state.orderGrid = { ...current, sort: colId, dir: current.sort === colId && current.dir === 'asc' ? 'desc' : 'asc' };
  render();
}

window.sortOrders = sortOrders;

function bindCurrentPage() {
  if (state.page === 'shop') {
    const search = document.getElementById('product-search');
    const category = document.getElementById('category-filter');
    const sort = document.getElementById('sort-filter');
    const clear = document.getElementById('clear-search');
    search?.addEventListener('input', debounce(async (event) => { state.filters.q = event.target.value; await loadProducts(); render(); }, 250));
    category?.addEventListener('change', async (event) => { state.filters.category = event.target.value; await loadProducts(); render(); });
    sort?.addEventListener('change', async (event) => { state.filters.sort = event.target.value; await loadProducts(); render(); });
    clear?.addEventListener('click', async () => { state.filters = { q: '', category: '', sort: 'recommended' }; await loadProducts(); render(); });
  }
  if (state.page === 'orders') {
    const orderFilter = document.getElementById('order-filter');
    orderFilter?.addEventListener('input', debounce((event) => {
      state.orderGrid = { ...(state.orderGrid || {}), q: event.target.value };
      render();
    }, 180));
  }
  if (state.page === 'checkout') {
    document.getElementById('apply-promo')?.addEventListener('click', applyPromo);
    document.getElementById('delivery-method')?.addEventListener('change', async (event) => { state.deliveryMethod = event.target.value; await loadCart(); render(); });
    document.getElementById('checkout-form')?.addEventListener('submit', submitCheckout);
    ['address-line1', 'address-city', 'address-postcode', 'card-number'].forEach((id) => {
      document.getElementById(id)?.addEventListener('input', (event) => {
        const map = { 'address-line1': 'line1', 'address-city': 'city', 'address-postcode': 'postcode', 'card-number': 'cardNumber' };
        state.checkout[map[id]] = event.target.value;
      });
    });
    document.getElementById('terms')?.addEventListener('change', (event) => { state.checkout.termsAccepted = event.target.checked; });
  }
}

function debounce(fn, delay) {
  let id;
  return (...args) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), delay);
  };
}

window.addToCart = async (productId) => {
  try {
    await api('/api/cart/items', { method: 'POST', body: { productId, quantity: 1 } });
    await Promise.all([loadCart(), loadProducts()]);
    render();
    toast('Item added to basket.');
  } catch (err) { toast(err.message, 'error'); }
};

window.updateQty = async (itemId, quantity) => {
  try {
    if (quantity < 1) return removeItem(itemId);
    await api(`/api/cart/items/${itemId}`, { method: 'PATCH', body: { quantity } });
    await loadCart();
    render();
  } catch (err) { toast(err.message, 'error'); }
};

window.removeItem = async (itemId) => {
  try {
    await api(`/api/cart/items/${itemId}`, { method: 'DELETE' });
    await loadCart();
    render();
    toast('Item removed.', 'warn');
  } catch (err) { toast(err.message, 'error'); }
};

async function applyPromo() {
  try {
    const code = document.getElementById('promo-code').value;
    await api('/api/cart/promo', { method: 'POST', body: { code } });
    await loadCart();
    render();
    toast(code ? 'Promotion applied.' : 'Promotion cleared.');
  } catch (err) { toast(err.message, 'error'); }
}

async function submitCheckout(event) {
  event.preventDefault();
  try {
    const body = {
      deliveryMethod: state.deliveryMethod,
      termsAccepted: document.getElementById('terms').checked,
      address: {
        line1: document.getElementById('address-line1').value,
        city: document.getElementById('address-city').value,
        postcode: document.getElementById('address-postcode').value,
      },
      payment: { cardNumber: document.getElementById('card-number').value },
    };
    state.checkout = { ...state.checkout, ...body.address, cardNumber: body.payment.cardNumber, termsAccepted: body.termsAccepted };
    const data = await api('/api/checkout', { method: 'POST', body });
    state.lastOrder = data.order;
    await Promise.all([loadCart(), loadOrders(), loadProducts()]);
    render();
    toast(`Order ${data.order.id} confirmed.`);
  } catch (err) { toast(err.message, 'error'); }
}

window.exportOrders = async () => {
  try {
    const res = await fetch('/api/reports/orders.csv', { credentials: 'same-origin' });
    const text = await res.text();
    if (!res.ok) throw new Error(JSON.parse(text).error || text);
    const blob = new Blob([text], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast('CSV export downloaded.');
  } catch (err) { toast(err.message, 'error'); }
};

window.setPage = setPage;
window.logout = logout;
window.resetData = resetData;

init();
