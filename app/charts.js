/* Rumah Hemat — grafik SVG buatan sendiri: donat, batang, dan cincin target.
   Tanpa pustaka, tanpa gambar luar. */
(function (global) {
  "use strict";

  /* Donat pengeluaran per kategori. parts: [{label, value, color}] */
  function donut(parts, size) {
    size = size || 190;
    var total = parts.reduce(function (a, p) { return a + p.value; }, 0);
    var r = 78, cx = 100, cy = 100, circ = 2 * Math.PI * r;
    var offset = 0, segs = "";
    parts.forEach(function (p) {
      if (!p.value) return;
      var frac = p.value / total;
      var len = frac * circ;
      segs += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + p.color +
        '" stroke-width="26" stroke-dasharray="' + Math.max(len - 2, 1).toFixed(1) + " " + (circ - Math.max(len - 2, 1)).toFixed(1) +
        '" stroke-dashoffset="' + (-offset).toFixed(1) + '" transform="rotate(-90 ' + cx + " " + cy + ')"/>';
      offset += len;
    });
    return '<svg viewBox="0 0 200 200" width="' + size + '" height="' + size + '" role="img" aria-label="Diagram donat pengeluaran">' +
      '<circle cx="100" cy="100" r="78" fill="none" stroke="#f1e4cf" stroke-width="26"/>' + segs +
      '<text x="100" y="96" text-anchor="middle" font-size="13" fill="#6b5847">Total keluar</text>' +
      '<text x="100" y="118" text-anchor="middle" font-size="17" font-weight="800" fill="#2c2118">' + global.RH.fmtShort(total) + "</text>" +
      "</svg>";
  }

  /* Batang 6 bulan: pemasukan vs pengeluaran. months: [{label, income, expense}] */
  function bars(months) {
    var max = 0;
    months.forEach(function (m) { max = Math.max(max, m.income, m.expense); });
    var rows = months.map(function (m) {
      var iw = Math.max((m.income / max) * 100, 2);
      var ew = Math.max((m.expense / max) * 100, 2);
      return '<div class="bar-row"><span class="lbl">' + m.label + '</span>' +
        '<span><span class="bar-track" style="display:block;margin-bottom:4px"><span class="bar-fill" style="display:block;width:' + iw.toFixed(1) + '%;background:#15803d"></span></span>' +
        '<span class="bar-track" style="display:block"><span class="bar-fill" style="display:block;width:' + ew.toFixed(1) + '%;background:#ea580c"></span></span></span>' +
        '<span class="val">' + global.RH.fmtShort(m.income) + "<br>" + global.RH.fmtShort(m.expense) + "</span></div>";
    }).join("");
    return rows +
      '<p class="sub" style="margin:10px 0 0"><span style="color:#15803d;font-weight:700">&#9632;</span> Pemasukan &nbsp; <span style="color:#ea580c;font-weight:700">&#9632;</span> Pengeluaran</p>';
  }

  /* Cincin progres target tabungan. pct 0..100. */
  var ringCount = 0;
  function ring(pct, color, size) {
    size = size || 96;
    ringCount += 1;
    var patId = "ringdots" + ringCount;
    var r = 40, circ = 2 * Math.PI * r;
    var done = Math.min(Math.max(pct, 0), 100) / 100 * circ;
    return '<svg viewBox="0 0 100 100" width="' + size + '" height="' + size + '" role="img" aria-label="' + Math.round(pct) + ' persen tercapai">' +
      '<defs><pattern id="' + patId + '" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.4" fill="' + color + '" opacity="0.35"/></pattern></defs>' +
      '<circle cx="50" cy="50" r="40" fill="url(#' + patId + ')" stroke="#efe3cf" stroke-width="11"/>' +
      '<circle cx="50" cy="50" r="40" fill="none" stroke="' + color + '" stroke-width="11" stroke-linecap="round" ' +
      'stroke-dasharray="' + done.toFixed(1) + " " + circ.toFixed(1) + '" transform="rotate(-90 50 50)"/>' +
      '<text x="50" y="55" text-anchor="middle" font-size="19" font-weight="800" fill="#2c2118">' + Math.round(pct) + "%</text>" +
      "</svg>";
  }

  global.RHCharts = { donut: donut, bars: bars, ring: ring };
})(window);
