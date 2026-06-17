function fetchJSON(url, opts) {
  return fetch(url, opts).then(function (res) {
    if (!res.ok) {
      throw new Error('HTTP error ' + res.status);
    }
    return res.json();
  });
}

(function () {
  var styleId = 'app-modal-styles';
  if (!document.getElementById(styleId)) {
    var style = document.createElement('style');
    style.id = styleId;
    style.textContent = '\
      .app-overlay {\
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;\
        background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;\
        z-index: 9999;\
      }\
      .app-card {\
        background: #fff; padding: 20px 24px; border-radius: 8px; box-shadow: 0 6px 24px rgba(0,0,0,0.2);\
        max-width: 90%; min-width: 260px; text-align: center; font-family: sans-serif;\
      }\
      .app-card p { margin: 0 0 12px 0; font-size: 16px; color: #111; }\
      .app-card .app-close { background: #0078d4; color: #fff; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; }\
    ';
    document.head.appendChild(style);
  }

  window.showCenteredCard = function (msg, opts) {
    opts = opts || {};
    var autoClose = typeof opts.autoClose === 'number' ? opts.autoClose : 2000;

    var existing = document.getElementById('app-centered-card');
    if (existing) {
      var p = existing.querySelector('p');
      if (p) p.textContent = msg;
      if (existing._timer) {
        clearTimeout(existing._timer);
      }
      if (autoClose > 0) {
        existing._timer = setTimeout(function () { removeModal(existing); }, autoClose);
      }
      return;
    }

    var overlay = document.createElement('div');
    overlay.className = 'app-overlay';
    overlay.id = 'app-centered-card';

    var card = document.createElement('div');
    card.className = 'app-card';

    var p = document.createElement('p');
    p.textContent = msg;

    var btn = document.createElement('button');
    btn.className = 'app-close';
    btn.textContent = opts.buttonText || 'Fechar';
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      removeModal(overlay);
    });

    overlay.addEventListener('click', function () {
      removeModal(overlay);
    });
    card.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    card.appendChild(p);
    card.appendChild(btn);
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    if (autoClose > 0) {
      overlay._timer = setTimeout(function () { removeModal(overlay); }, autoClose);
    }

    function removeModal(el) {
      if (!el) return;
      if (el._timer) clearTimeout(el._timer);
      if (el.parentNode) el.parentNode.removeChild(el);
    }
  };
})();

function renderMenu() {
  var menu = document.getElementById('menu');
  if (!menu) return;
  fetchJSON('/api/catalog').then(function (items) {
    menu.innerHTML = '';
    var grid = document.createElement('div');
    grid.className = 'items-grid';
    if (!items || items.length === 0) {
      grid.innerHTML = '<p style="color:var(--muted)">Nenhum item disponível no momento.</p>';
    } else {
      for (var i = 0; i < items.length; i = i + 1) {
        var it = items[i];
        var div = document.createElement('div');
        div.className = 'item';
        function normalizeName(n){ return (n||'').normalize ? n.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().trim() : n.toLowerCase().trim(); }
        var images = {
          'cafe expresso': 'expresso.png',
          'cafe americano': 'americano.png',
          'cappuccino': 'cappucino.png',
          'cappucino': 'cappucino.png',
          'latte': 'latte.png',
          'bolo de chocolate': 'bolo.png',
          'bolo': 'bolo.png'
        };
        var key = normalizeName(it.name).replace(/[^a-z0-9 ]+/g,'');
        var imgFile = images[key];
        var thumbHtml;
        if (imgFile) {
          thumbHtml = '<div class="thumb"><img src="/assets/' + imgFile + '" alt="' + (it.name || '') + '"></div>';
        } else {
          thumbHtml = '<div class="thumb">' + (it.name.charAt(0) || '?') + '</div>';
        }
        var html = thumbHtml + '<div class="meta"><h3>' + it.name + ' - R$ ' + it.price.toFixed(2) + '</h3><p>' + it.desc + '</p></div>' +
          '<div class="qty"><button onclick="addToCart(' + it.id + ',1)">+1</button></div>';
        div.innerHTML = html;
        grid.appendChild(div);
      }
    }
    menu.appendChild(grid);
  }).catch(function (e) {
    console.error('Erro ao carregar catálogo:', e);
    menu.innerHTML = '<p style="color:var(--muted)">Erro ao carregar o menu. Tente recarregar a página.</p>';
  });
}

function addToCart(id, qty) {
  var body = JSON.stringify({ id: id, qty: qty });
  fetchJSON('/api/cart/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body
  }).then(function () {
    if (window.showCenteredCard) {
      window.showCenteredCard('Item adicionado ao carrinho', { autoClose: 2000, buttonText: 'OK' });
    } else {
      alert('Item adicionado ao carrinho');
    }
    renderCart();
  }).catch(function (e) {
    alert('Erro: ' + e.message);
  });
}

function renderCart() {
  var cartDiv = document.getElementById('cart');
  if (!cartDiv) return;
  fetchJSON('/api/cart').then(function (cart) {
    cartDiv.innerHTML = '';
    var toPayment = document.getElementById('toPayment');
    var footerTotalEl = document.getElementById('footerTotal');
    if (!cart.items || cart.items.length === 0) {
      cartDiv.innerHTML = '<p>Carrinho vazio</p>';
      if (toPayment) {
        toPayment.style.display = 'none';
      }
      if (footerTotalEl) footerTotalEl.textContent = 'R$ 0.00';
      return;
    }
    if (toPayment) {
      toPayment.style.display = 'inline-block';
    }
    for (var i = 0; i < cart.items.length; i = i + 1) {
      var ci = cart.items[i];
      var it = ci.item;
      var div = document.createElement('div');
      div.className = 'item';
      var html = '<div class="meta"><h3>' + it.name + ' - R$ ' + it.price.toFixed(2) + '</h3><p>Quantidade: ' + ci.qty + '</p></div>' +
        '<div class="qty"><button onclick="removeFromCart(' + it.id + ')">Remover</button></div>';
      div.innerHTML = html;
      cartDiv.appendChild(div);
    }
    var totalValue = 0;
    if (typeof cart.total === 'number') {
      totalValue = cart.total;
    } else if (cart.total) {
      var parsed = Number(cart.total);
      if (!isNaN(parsed)) totalValue = parsed;
    }
    if ((!totalValue || totalValue === 0) && cart.items && cart.items.length) {
      for (var j = 0; j < cart.items.length; j = j + 1) {
        var ci2 = cart.items[j];
        var it2 = ci2.item;
        var qty2 = Number(ci2.qty) || 0;
        var price2 = Number(it2.price) || 0;
        totalValue += price2 * qty2;
      }
    }

    var total = document.createElement('div');
    total.className = 'item';
    total.innerHTML = '<div class="meta"><strong>Total</strong></div><div><strong>R$ ' + totalValue.toFixed(2) + '</strong></div>';
    cartDiv.appendChild(total);
    if (footerTotalEl) footerTotalEl.textContent = 'R$ ' + totalValue.toFixed(2);
  }).catch(function (e) {
    console.error(e);
  });
}

function removeFromCart(id) {
  var body = JSON.stringify({ id: id });
  fetchJSON('/api/cart/remove', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body
  }).then(function () {
    renderCart();
  }).catch(function (e) {
    console.error(e);
  });
}

function preparePayment() {
  var summary = document.getElementById('summary');
  if (!summary) return;
  fetchJSON('/api/cart').then(function (cart) {
    if (!cart.items || cart.items.length === 0) {
      alert('Carrinho vazio');
      window.location.href = '/menu.html';
      return;
    }
    summary.innerHTML = '';
    for (var i = 0; i < cart.items.length; i = i + 1) {
      var ci = cart.items[i];
      var it = ci.item;
      var div = document.createElement('div');
      div.className = 'summary-line';
      div.innerHTML = '<div>' + it.name + ' x ' + ci.qty + '</div><div>R$ ' + (it.price * ci.qty).toFixed(2) + '</div>';
      summary.appendChild(div);
    }
    var tot = document.createElement('div');
    tot.className = 'summary-line';
    tot.innerHTML = '<strong>Total</strong><strong>R$ ' + cart.total.toFixed(2) + '</strong>';
    summary.appendChild(tot);
  }).catch(function (e) {
    console.error(e);
  });
}

function payNow() {
  fetchJSON('/api/checkout', { method: 'POST' }).then(function () {
    window.location.href = '/thankyou.html';
  }).catch(function (e) {
    alert('Erro ao processar pagamento: ' + e.message);
  });
}

document.addEventListener('DOMContentLoaded', function () {
  renderMenu();
  renderCart();
  preparePayment();
  var payBtn = document.getElementById('payNow');
  if (payBtn) {
    payBtn.addEventListener('click', payNow);
  }
  var toPayment = document.getElementById('toPayment');
  if (toPayment) {
    toPayment.addEventListener('click', function () { window.location.href = '/payment.html'; });
  }
});