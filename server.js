const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Coffee Catalog Data with inline SVG dummy product images
const coffees = [
  {
    id: 1,
    name: "Ethiopian Yirgacheffe (Washed)",
    origin: "Gedeo Zone, Ethiopia",
    roast: "Light Roast",
    notes: "Bergamot, jasmine, lemon zest",
    price: 18.50,
    svg: `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://w3.org" style="border:1px solid #000;background:#f4efe6;"><rect x="16" y="10" width="32" height="44" fill="#d4a373" stroke="#000" stroke-width="2"/><rect x="20" y="20" width="24" height="16" fill="#fff" stroke="#000"/><text x="32" y="31" font-family="serif" font-size="9" text-anchor="middle" fill="#000">ETH</text></svg>`
  },
  {
    id: 2,
    name: "Colombian Supremo Huila",
    origin: "Huila Department, Colombia",
    roast: "Medium Roast",
    notes: "Caramel, red apple, toasted almond",
    price: 16.00,
    svg: `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://w3.org" style="border:1px solid #000;background:#f4efe6;"><rect x="16" y="10" width="32" height="44" fill="#8b5a2b" stroke="#000" stroke-width="2"/><rect x="20" y="20" width="24" height="16" fill="#fff" stroke="#000"/><text x="32" y="31" font-family="serif" font-size="9" text-anchor="middle" fill="#000">COL</text></svg>`
  },
  {
    id: 3,
    name: "Sumatra Mandheling",
    origin: "North Sumatra, Indonesia",
    roast: "Dark Roast",
    notes: "Dark chocolate, cedar, earthy spice",
    price: 17.25,
    svg: `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://w3.org" style="border:1px solid #000;background:#f4efe6;"><rect x="16" y="10" width="32" height="44" fill="#3e2723" stroke="#000" stroke-width="2"/><rect x="20" y="20" width="24" height="16" fill="#fff" stroke="#000"/><text x="32" y="31" font-family="serif" font-size="9" text-anchor="middle" fill="#000">SUM</text></svg>`
  },
  {
    id: 4,
    name: "Monsooned Malabar AA",
    origin: "Malabar Coast, India",
    roast: "Medium-Dark Roast",
    notes: "Roasted nuts, cacao nibs, low acidity",
    price: 16.75,
    svg: `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://w3.org" style="border:1px solid #000;background:#f4efe6;"><rect x="16" y="10" width="32" height="44" fill="#6f4e37" stroke="#000" stroke-width="2"/><rect x="20" y="20" width="24" height="16" fill="#fff" stroke="#000"/><text x="32" y="31" font-family="serif" font-size="9" text-anchor="middle" fill="#000">IND</text></svg>`
  }
];

// Serve the WWW Virtual Library Style Storefront
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>The World Wide Web Virtual Coffee Roastery</title>
      <style>
        body {
          background-color: #ffffff;
          color: #000000;
          font-family: "Times New Roman", Times, serif;
          max-width: 780px;
          margin: 20px auto;
          padding: 0 16px;
          line-height: 1.45;
        }
        h1 { font-size: 2em; margin-bottom: 0.2em; }
        h2 { font-size: 1.3em; margin-top: 1.4em; border-bottom: 1px solid #000; padding-bottom: 2px; }
        a { color: #0000EE; cursor: pointer; text-decoration: underline; }
        a:visited { color: #551A8B; }
        a:active { color: #FF0000; }
        dl { margin-top: 1em; }
        dt { font-weight: bold; margin-top: 1em; font-size: 1.05em; }
        dd { margin-left: 28px; margin-bottom: 0.8em; }
        .item-row { display: flex; align-items: flex-start; gap: 14px; margin-top: 6px; }
        .cart-box { background: #f8f8f8; border: 1px solid #000; padding: 10px 14px; margin: 16px 0; }
        .mono { font-family: "Courier New", Courier, monospace; font-size: 0.9em; }
        hr { border: 0; border-top: 1px solid #000; margin: 16px 0; }
      </style>
    </head>
    <body>
      <h1>The World Wide Web Virtual Coffee Roastery</h1>
      <p>
        A distributed hypertext catalog of roasted whole-bean coffees. 
        Everything is indexed by origin, roast profile, and tasting notes. 
        Served directly from an ephemeral container on Google Cloud.
      </p>
      <p>
        [ <a href="#catalog">Roast Catalog</a> | <a href="#cart">Shopping Basket (<span id="nav-count">0</span>)</a> | <a href="/api/coffees">Raw JSON Index</a> ]
      </p>

      <hr />

      <h2 id="catalog">Index of Available Roasts (250g Whole Bean)</h2>
      <p>Select <u>[Add to Basket]</u> next to any entry to append the item to your order manifest.</p>

      <dl id="coffee-list"></dl>

      <hr />

      <h2 id="cart">Order Manifest &amp; Checkout</h2>
      <div class="cart-box">
        <div id="cart-items">Your basket is currently empty.</div>
        <p><strong>Total Due:</strong> $<span id="cart-total">0.00</span> USD</p>
        <p>
          [ <a onclick="checkout()">Submit Order</a> ] &nbsp;
          [ <a onclick="clearCart()">Clear Basket</a> ]
        </p>
        <p id="order-status" class="mono"></p>
      </div>

      <hr />
      <address>
        Maintained by <a href="https://github.com">the-coder-toni</a> / 
        Automated CI/CD Pipeline Deployment / November 2026
      </address>

      <script>
        let catalog = [];
        let cart = [];

        async function init() {
          const res = await fetch('/api/coffees');
          catalog = await res.json();
          renderCatalog();
        }

        function renderCatalog() {
          const list = document.getElementById('coffee-list');
          list.innerHTML = '';
          catalog.forEach(coffee => {
            const dt = document.createElement('dt');
            dt.innerHTML = \`<a href="#item-\${coffee.id}" id="item-\${coffee.id}">\${coffee.name}</a> — $\${coffee.price.toFixed(2)}\`;

            const dd = document.createElement('dd');
            dd.innerHTML = \`
              <div class="item-row">
                <div>\${coffee.svg}</div>
                <div>
                  <strong>Origin:</strong> \${coffee.origin} | <strong>Profile:</strong> \${coffee.roast}<br/>
                  <strong>Notes:</strong> \${coffee.notes}<br/>
                  Action: <a onclick="addToCart(\${coffee.id})">[Add to Basket]</a>
                </div>
              </div>
            \`;
            list.append(dt, dd);
          });
        }

        function addToCart(id) {
          const item = catalog.find(c => c.id === id);
          if (item) {
            cart.push(item);
            document.getElementById('order-status').textContent = '';
            renderCart();
          }
        }

        function removeFromCart(index) {
          cart.splice(index, 1);
          renderCart();
        }

        function clearCart() {
          cart = [];
          document.getElementById('order-status').textContent = '';
          renderCart();
        }

        function renderCart() {
          const container = document.getElementById('cart-items');
          const totalEl = document.getElementById('cart-total');
          const navCount = document.getElementById('nav-count');

          navCount.textContent = cart.length;

          if (cart.length === 0) {
            container.innerHTML = 'Your basket is currently empty.';
            totalEl.textContent = '0.00';
            return;
          }

          let total = 0;
          let html = '<ul>';
          cart.forEach((item, idx) => {
            total += item.price;
            html += \`<li>\${item.name} ($\${item.price.toFixed(2)}) — <a onclick="removeFromCart(\${idx})">[Remove]</a></li>\`;
          });
          html += '</ul>';
          container.innerHTML = html;
          totalEl.textContent = total.toFixed(2);
        }

        async function checkout() {
          if (cart.length === 0) {
            document.getElementById('order-status').textContent = 'ERROR: Cannot submit an empty manifest.';
            return;
          }
          const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cart })
          });
          const data = await res.json();
          cart = [];
          renderCart();
          document.getElementById('order-status').textContent = 
            \`OK 201: Order #\${data.orderId} confirmed (\${data.itemCount} bags, $\${data.total} USD).\`;
        }

        init();
      </script>
    </body>
    </html>
  `);
});

// REST API Endpoints
app.get('/api/coffees', (req, res) => {
  res.json(coffees);
});

app.post('/api/orders', (req, res) => {
  const { items } = req.body;
  if (!items || !items.length) {
    return res.status(400).json({ error: 'No items in order' });
  }
  const total = items.reduce((sum, item) => sum + item.price, 0).toFixed(2);
  res.status(201).json({
    orderId: Math.floor(100000 + Math.random() * 900000),
    itemCount: items.length,
    total
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Virtual Coffee Roastery running on port ${PORT}`);
});
