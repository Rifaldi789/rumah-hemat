/* Rumah Hemat — router hash + lima halaman + semua interaksi.
   Semua kontrol benar-benar bekerja dan memperbarui angka serta grafik. */
(function (global) {
  "use strict";
  var RH = global.RH;

  var app = document.getElementById("app");
  var nav = document.getElementById("mainnav");
  var editingId = null;
  var filters = { month: "2026-11", category: "semua", type: "semua", q: "" };

  function icon(id) { return '<svg><use href="#' + id + '"/></svg>'; }
  function catBadge(t) {
    if (t.type === "masuk") return '<span class="cat-badge" style="color:#15803d"><span class="dot" style="background:#16a34a"></span>Pemasukan</span>';
    var c = RH.cat(t.category);
    return '<span class="cat-badge" style="color:' + c.color + '"><span class="dot" style="background:' + c.color + '"></span>' + RH.esc(c.name) + "</span>";
  }
  function toast(msg) {
    var old = document.querySelector(".toast");
    if (old) old.remove();
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 2600);
  }
  function todayKey() {
    var d = new Date();
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  }
  function daysUntil(dateStr) {
    var a = new Date(todayKey() + "T00:00:00");
    var b = new Date(dateStr + "T00:00:00");
    return Math.round((b - a) / 86400000);
  }

  /* ---------------- Dashboard ---------------- */
  function viewDashboard() {
    var key = "2026-11";
    var t = RH.monthTotals(key);
    var novCount = RH.state.transactions.filter(function (x) { return RH.monthKey(x.date) === key; }).length;
    var saved = RH.goalMonthlyTotal();
    var cats = RH.categoryTotals(key);
    var parts = RH.CATEGORIES.map(function (c) { return { label: c.name, value: cats[c.id] || 0, color: c.color }; })
      .filter(function (p) { return p.value > 0; })
      .sort(function (a, b) { return b.value - a.value; });
    var legend = parts.map(function (p) {
      return '<li><span class="dot" style="background:' + p.color + '"></span>' + RH.esc(p.label) + "<b>" + RH.fmt(p.value) + "</b></li>";
    }).join("");

    var bills = RH.state.bills.slice().sort(function (a, b) { return a.due < b.due ? -1 : 1; });
    var billsHtml = bills.map(function (b) {
      var d = daysUntil(b.due);
      var pill = b.paid ? '<span class="pill paid">Lunas</span>'
        : d < 0 ? '<span class="pill late">Terlambat ' + (-d) + " hari</span>"
        : d === 0 ? '<span class="pill soon">Jatuh tempo hari ini</span>'
        : '<span class="pill soon">' + d + " hari lagi</span>";
      return '<div class="bill"><span class="tx-ico" style="background:#b45309">' + icon("i-tagihan") + "</span>" +
        '<span><b>' + RH.esc(b.name) + "</b><br><small>" + RH.dateLabel(b.due) + "</small></span>" +
        '<span class="due"><b>' + RH.fmt(b.amount) + "</b>" + pill + "</span></div>";
    }).join("");

    var recent = RH.state.transactions.slice().sort(function (a, b) { return b.date < a.date ? -1 : (b.date > a.date ? 1 : b.id < a.id ? 1 : -1); }).slice(0, 6);
    var recentHtml = recent.map(function (tr) {
      var c = tr.type === "masuk" ? { color: "#16a34a", icon: "i-dompet" } : RH.cat(tr.category);
      return '<li><span class="tx-ico" style="background:' + c.color + '">' + icon(c.icon) + "</span>" +
        '<span class="tx-main"><b>' + RH.esc(tr.note) + "</b><small>" + RH.dateLabel(tr.date) + " &middot; " + (tr.type === "masuk" ? "Pemasukan" : RH.esc(RH.cat(tr.category).name)) + "</small></span>" +
        '<span class="tx-amt ' + (tr.type === "masuk" ? "in" : "out") + '">' + (tr.type === "masuk" ? "+" : "-") + RH.fmt(tr.amount) + "</span></li>";
    }).join("");

    return '' +
      '<section class="hero hero-dashboard"><h1>Selamat datang, Keluarga Andi &amp; Sari</h1>' +
      '<p>November 2026 berjalan hemat: pemasukan naik karena bonus proyek, pengeluaran masih di bawah anggaran. Sisa bulan ini bisa menambah tabungan.</p>' +
      '<span class="hero-chip">Bulan berjalan: November 2026</span></section>' +
      '<div class="grid g4">' +
      '<div class="stat green"><span class="stat-ico">' + icon("i-dompet") + '</span><small>Pemasukan November</small><div class="num">' + RH.fmt(t.income) + '</div><div class="hint">Gaji + freelance + bonus</div></div>' +
      '<div class="stat amber"><span class="stat-ico">' + icon("i-belanja") + '</span><small>Pengeluaran November</small><div class="num">' + RH.fmt(t.expense) + '</div><div class="hint">Dari ' + novCount + " transaksi tercatat</div></div>" +
      '<div class="stat teal"><span class="stat-ico">' + icon("i-rumah") + '</span><small>Sisa bulan ini</small><div class="num">' + RH.fmt(t.left) + '</div><div class="hint">' + Math.round(t.left / t.income * 100) + '% dari pemasukan</div></div>' +
      '<div class="stat plum"><span class="stat-ico">' + icon("i-target") + '</span><small>Ditabung bulan ini</small><div class="num">' + RH.fmt(saved) + '</div><div class="hint">Ke 4 target keluarga</div></div>' +
      "</div>" +
      '<div class="grid g32" style="margin-top:16px">' +
      '<div class="card tint-green"><h2>Ke mana uang pergi?</h2><p class="sub">Pengeluaran November per kategori — klik kategori di halaman Transaksi untuk melihat rinciannya.</p>' +
      '<div class="donut-wrap">' + global.RHCharts.donut(parts, 190) + '<ul class="legend" style="flex:1;min-width:220px">' + legend + "</ul></div></div>" +
      '<div class="card tint-amber"><h2>Enam bulan terakhir</h2><p class="sub">Pemasukan selalu di atas pengeluaran — keluarga ini menabung setiap bulan.</p>' +
      global.RHCharts.bars(RH.MONTHLY) + "</div></div>" +
      '<div class="grid g2" style="margin-top:16px">' +
      '<div class="card tint-rose"><h2>Tagihan bulan ini</h2><p class="sub">Yang sudah lunas dan yang masih menunggu — jangan sampai terlewat.</p>' + billsHtml + "</div>" +
      '<div class="card tint-teal"><h2>Transaksi terakhir</h2><p class="sub">Enam catatan terbaru keluarga.</p><ul class="txlist">' + recentHtml + '</ul>' +
      '<p style="margin:14px 0 0"><a class="btn btn-ghost btn-sm" href="#/transaksi">Lihat semua transaksi &rarr;</a></p></div>' +
      "</div>";
  }

  /* ---------------- Transaksi ---------------- */
  function filteredTx() {
    var q = filters.q.trim().toLowerCase();
    return RH.state.transactions.filter(function (t) {
      if (filters.month !== "semua" && RH.monthKey(t.date) !== filters.month) return false;
      if (filters.category !== "semua" && t.category !== filters.category) return false;
      if (filters.type !== "semua" && t.type !== filters.type) return false;
      if (q && t.note.toLowerCase().indexOf(q) === -1 && RH.cat(t.category).name.toLowerCase().indexOf(q) === -1) return false;
      return true;
    }).sort(function (a, b) { return b.date < a.date ? -1 : (b.date > a.date ? 1 : 0); });
  }

  function viewTransaksi() {
    var months = RH.availableMonths();
    var monthOpts = '<option value="semua">Semua bulan</option>' + months.map(function (k) {
      return '<option value="' + k + '"' + (filters.month === k ? " selected" : "") + ">" + RH.monthLabel(k) + "</option>";
    }).join("");
    var catOpts = '<option value="semua">Semua kategori</option>' + RH.CATEGORIES.map(function (c) {
      return '<option value="' + c.id + '"' + (filters.category === c.id ? " selected" : "") + ">" + RH.esc(c.name) + "</option>";
    }).join("");
    var rows = filteredTx();
    var inc = 0, out = 0;
    rows.forEach(function (t) { if (t.type === "masuk") inc += t.amount; else out += t.amount; });

    var body = rows.map(function (t) {
      return "<tr><td>" + RH.dateLabel(t.date) + "</td><td><b>" + RH.esc(t.note) + "</b></td><td>" + catBadge(t) + "</td>" +
        '<td class="num" style="color:' + (t.type === "masuk" ? "#15803d" : "#9a3412") + ';font-weight:700">' + (t.type === "masuk" ? "+" : "-") + RH.fmt(t.amount) + "</td>" +
        '<td class="hide-sm"><button class="btn btn-ghost btn-sm" data-edit="' + t.id + '">Ubah</button> ' +
        '<button class="btn btn-danger btn-sm" data-del="' + t.id + '">Hapus</button></td></tr>';
    }).join("");
    if (!rows.length) body = '<tr><td colspan="5" style="text-align:center;color:#6b5847;padding:22px">Tidak ada transaksi yang cocok dengan filter. Coba ubah filter atau kata kunci.</td></tr>';

    var editing = editingId ? RH.state.transactions.filter(function (t) { return t.id === editingId; })[0] : null;
    return '' +
      '<section class="hero hero-transaksi"><h1>Transaksi</h1><p>Semua pemasukan dan pengeluaran keluarga, bisa dicari, disaring, ditambah, diubah, dan dihapus. Angka di bawah ikut berubah setiap kali ada perubahan.</p>' +
      '<span class="hero-chip">' + rows.length + " transaksi ditampilkan</span></section>" +
      '<div class="grid g2">' +
      '<div class="card form-card"><h2>' + (editing ? "Ubah transaksi" : "Tambah transaksi") + '</h2><p class="sub">' + (editing ? "Perbaiki catatan yang sudah ada, lalu simpan." : "Catat pemasukan atau pengeluaran baru — langsung masuk ke ringkasan.") + "</p>" +
      '<form id="tx-form"><div class="form-grid">' +
      '<div><label for="f-date">Tanggal</label><input id="f-date" type="date" required value="' + (editing ? editing.date : todayKey()) + '"></div>' +
      '<div><label for="f-amount">Jumlah (Rp)</label><input id="f-amount" type="number" min="1000" step="500" required placeholder="cth 150000" value="' + (editing ? editing.amount : "") + '"></div>' +
      '<div class="full"><label for="f-note">Keterangan</label><input id="f-note" type="text" required maxlength="80" placeholder="cth Belanja sayur di pasar" value="' + (editing ? RH.esc(editing.note) : "") + '"></div>' +
      '<div><label for="f-cat">Kategori</label><select id="f-cat">' + RH.CATEGORIES.map(function (c) {
        return '<option value="' + c.id + '"' + (editing && editing.category === c.id ? " selected" : "") + ">" + RH.esc(c.name) + "</option>";
      }).join("") + "</select></div>" +
      '<div><label for="f-type">Jenis</label><select id="f-type">' +
      '<option value="keluar"' + (editing && editing.type === "keluar" ? " selected" : "") + '>Pengeluaran</option>' +
      '<option value="masuk"' + (editing && editing.type === "masuk" ? " selected" : "") + ">Pemasukan</option></select></div>" +
      '</div><p style="margin:14px 0 0;display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-green" type="submit">' + icon("i-plus") + (editing ? "Simpan perubahan" : "Tambah transaksi") + "</button>" +
      (editing ? '<button class="btn btn-ghost" type="button" id="cancel-edit">Batal</button>' : "") + "</p></form></div>" +
      '<div class="card tint-blue"><h2>Ringkasan hasil saringan</h2><p class="sub">Total dari transaksi yang sedang ditampilkan, bukan seluruh data.</p>' +
      '<div class="kpi-strip" style="grid-template-columns:1fr 1fr 1fr">' +
      '<div class="kpi"><small>Masuk</small><b style="color:#15803d">' + RH.fmt(inc) + "</b></div>" +
      '<div class="kpi"><small>Keluar</small><b style="color:#9a3412">' + RH.fmt(out) + "</b></div>" +
      '<div class="kpi"><small>Selisih</small><b>' + RH.fmt(inc - out) + "</b></div></div>" +
      '<p class="sub" style="margin-top:14px">Bulan dengan transaksi terbanyak adalah November 2026. Gunakan saringan bulan untuk membandingkan dengan Oktober.</p>' +
      '<p><button class="btn btn-ghost btn-sm" id="reset-data">Reset ke data contoh</button></p></div>' +
      "</div>" +
      '<div class="card" style="margin-top:16px"><h2>Daftar transaksi</h2>' +
      '<div class="toolbar">' +
      '<div class="field"><label for="flt-month">Bulan</label><select id="flt-month">' + monthOpts + "</select></div>" +
      '<div class="field"><label for="flt-cat">Kategori</label><select id="flt-cat">' + catOpts + "</select></div>" +
      '<div class="field"><label for="flt-type">Jenis</label><select id="flt-type">' +
      '<option value="semua"' + (filters.type === "semua" ? " selected" : "") + ">Semua</option>" +
      '<option value="masuk"' + (filters.type === "masuk" ? " selected" : "") + ">Pemasukan</option>" +
      '<option value="keluar"' + (filters.type === "keluar" ? " selected" : "") + ">Pengeluaran</option></select></div>" +
      '<div class="search-wrap"><label for="flt-q">Cari</label><div style="position:relative">' + icon("i-cari") + '<input id="flt-q" type="search" placeholder="Cari keterangan atau kategori…" value="' + RH.esc(filters.q) + '"></div></div>' +
      "</div>" +
      '<div style="overflow-x:auto"><table><thead><tr><th>Tanggal</th><th>Keterangan</th><th>Kategori</th><th class="num">Jumlah</th><th class="hide-sm">Aksi</th></tr></thead><tbody>' + body + "</tbody></table></div></div>";
  }

  /* ---------------- Anggaran ---------------- */
  function viewAnggaran() {
    var key = "2026-11";
    var spent = RH.categoryTotals(key);
    var totalBudget = 0, totalSpent = 0;
    var rows = RH.CATEGORIES.map(function (c) {
      var b = RH.BUDGETS[c.id] || 0, s = spent[c.id] || 0;
      totalBudget += b; totalSpent += s;
      var pct = b ? Math.round(s / b * 100) : 0;
      var bar = Math.min(pct, 100);
      var meta = pct > 100
        ? '<span class="over">Lewat anggaran ' + RH.fmt(s - b) + " (" + pct + "%)</span>"
        : '<span class="left">Sisa ' + RH.fmt(b - s) + " (" + pct + "%)</span>";
      return '<div class="budget-row"><div class="budget-top"><span class="tx-ico" style="background:' + c.color + '">' + icon(c.icon) + "</span><b>" + RH.esc(c.name) + "</b>" +
        '<span class="spent">' + RH.fmt(s) + '</span><span class="of">dari ' + RH.fmt(b) + "</span></div>" +
        '<div class="budget-bar"><span class="fill" style="display:block;width:' + bar + "%;background:" + c.color + '"></span></div>' +
        '<div class="budget-meta">' + meta + "<span>Anggaran bulan " + RH.monthLabel(key) + "</span></div></div>";
    }).join("");
    var overall = totalBudget ? Math.round(totalSpent / totalBudget * 100) : 0;
    return '' +
      '<section class="hero hero-anggaran"><h1>Anggaran November</h1><p>Setiap kategori punya batas bulanan. Bar yang penuh berarti hampir habis; yang merah berarti sudah lewat — segera rem pengeluarannya.</p>' +
      '<span class="hero-chip">Total terpakai ' + RH.fmt(totalSpent) + " dari " + RH.fmt(totalBudget) + " (" + overall + "%)</span></section>" +
      '<div class="grid g32"><div class="card tint-amber"><h2>Anggaran per kategori</h2><p class="sub">Dihitung otomatis dari transaksi November yang sudah dicatat.</p>' + rows + "</div>" +
      '<div><div class="card tint-rose"><h2>Perlu perhatian</h2><p class="sub">Kategori yang sudah lewat atau hampir habis.</p>' +
      "<p><b>Makan &amp; Jajan sudah lewat anggaran</b> — terpakai " + RH.fmt(spent.makan) + " dari " + RH.fmt(RH.BUDGETS.makan) + ". Bulan ini ada dua kali makan di luar; masak di rumah bisa menghemat sekitar Rp150.000.</p>" +
      "<p><b>Kesehatan 92%</b> — periksa gigi Nadia sudah dibayar; sisakan dana untuk obat bila ada yang sakit.</p>" +
      "<p><b>Transport 91%</b> — cicilan motor jatuh tempo 28 November, jadi sisanya memang tinggal sedikit.</p></div>" +
      '<div class="card tint-green" style="margin-top:16px"><h2>Cara membaca</h2><p class="sub">Anggaran dibuat di awal bulan dari rata-rata tiga bulan terakhir. Ubah angka anggaran dengan mengedit transaksi — bar di sini mengikuti data, bukan angka yang diketik manual.</p>' +
      '<p><a class="btn btn-green btn-sm" href="#/transaksi">Catat pengeluaran baru &rarr;</a></p></div></div></div>';
  }

  /* ---------------- Target ---------------- */
  function viewTarget() {
    var totalSaved = RH.state.goals.reduce(function (a, g) { return a + g.saved; }, 0);
    var totalTarget = RH.state.goals.reduce(function (a, g) { return a + g.target; }, 0);
    var cards = RH.state.goals.map(function (g) {
      var pct = g.target ? Math.round(g.saved / g.target * 100) : 0;
      return '<div class="card"><div class="goal-card">' +
        '<div class="ring-wrap">' + global.RHCharts.ring(pct, g.color, 96) + '<div class="pct" style="color:' + g.color + '">' + RH.fmt(g.saved) + " / " + RH.fmt(g.target) + "</div></div>" +
        '<div class="goal-info"><h3>' + RH.esc(g.name) + '</h3><p class="goal-note">' + RH.esc(g.note) + "</p>" +
        '<p style="margin:0 0 4px;font-size:13.5px">Setoran rutin <b>' + RH.fmt(g.monthly) + '</b> per bulan &middot; Kurang <b>' + RH.fmt(Math.max(g.target - g.saved, 0)) + "</b> lagi</p>" +
        '<form class="goal-add" data-goal="' + g.id + '"><input type="number" min="1000" step="1000" required placeholder="Jumlah setoran, cth 250000" aria-label="Jumlah setoran untuk ' + RH.esc(g.name) + '">' +
        '<button class="btn btn-green btn-sm" type="submit">+ Tabung</button></form></div>' +
        "</div></div>";
    }).join("");
    return '' +
      '<section class="hero hero-target"><h1>Target tabungan</h1><p>Empat impian keluarga, masing-masing dengan cincin progresnya sendiri. Tambah setoran kapan saja — cincin dan angkanya langsung bergerak.</p>' +
      '<span class="hero-chip">Total terkumpul ' + RH.fmt(totalSaved) + " dari " + RH.fmt(totalTarget) + " (" + Math.round(totalSaved / totalTarget * 100) + "%)</span></section>" +
      '<div class="grid g2">' + cards + "</div>" +
      '<div class="card tint-lilac" style="margin-top:16px"><h2>Kenapa menabung per target?</h2><p class="sub">Uang yang dicampur dalam satu rekening gampang terpakai. Dengan target terpisah, keluarga tahu persis uang liburan tidak boleh dipakai untuk belanja harian — dan dana darurat tetap utuh sampai benar-benar darurat.</p></div>';
  }

  /* ---------------- Laporan ---------------- */
  function viewLaporan() {
    var key = "2026-11", prev = "2026-10";
    var cur = RH.monthTotals(key), prv = RH.monthTotals(prev);
    var curCats = RH.categoryTotals(key), prvCats = RH.categoryTotals(prev);
    function delta(a, b) {
      if (!b) return '<span class="delta flat">baru bulan ini</span>';
      var d = Math.round((a - b) / b * 100);
      if (d === 0) return '<span class="delta flat">sama</span>';
      return '<span class="delta ' + (d > 0 ? "up" : "down") + '">' + (d > 0 ? "+" : "") + d + "%</span>";
    }
    var rows = RH.CATEGORIES.map(function (c) {
      return "<tr><td>" + catBadge({ type: "keluar", category: c.id }) + "</td>" +
        '<td class="num">' + RH.fmt(curCats[c.id] || 0) + '</td><td class="num">' + RH.fmt(prvCats[c.id] || 0) + "</td><td>" + delta(curCats[c.id] || 0, prvCats[c.id] || 0) + "</td></tr>";
    }).join("");
    var biggest = RH.CATEGORIES.map(function (c) { return { c: c, v: curCats[c.id] || 0 }; }).sort(function (a, b) { return b.v - a.v; })[0];
    var trend = cur.expense > prv.expense ? "naik" : "turun";
    var trendPct = prv.expense ? Math.abs(Math.round((cur.expense - prv.expense) / prv.expense * 100)) : 0;
    return '' +
      '<section class="hero hero-laporan"><h1>Laporan November</h1><p>Perbandingan dengan Oktober — mana yang naik, mana yang turun, dan apa artinya untuk bulan depan.</p>' +
      '<span class="hero-chip">November 2026 vs Oktober 2026</span></section>' +
      '<div class="kpi-strip">' +
      '<div class="kpi"><small>Pemasukan</small><b>' + RH.fmt(cur.income) + '</b><div>' + delta(cur.income, prv.income) + " vs Oktober</div></div>" +
      '<div class="kpi"><small>Pengeluaran</small><b>' + RH.fmt(cur.expense) + '</b><div>' + delta(cur.expense, prv.expense) + " vs Oktober</div></div>" +
      '<div class="kpi"><small>Sisa</small><b>' + RH.fmt(cur.left) + '</b><div>' + delta(cur.left, prv.left) + " vs Oktober</div></div></div>" +
      '<div class="card insight" style="margin-top:16px"><h2>Yang perlu diketahui</h2>' +
      "<p>Pengeluaran terbesar bulan ini adalah <b>" + RH.esc(biggest.c.name) + " (" + RH.fmt(biggest.v) + ")</b> — wajar, karena belanja pasar mingguan adalah kebutuhan pokok keluarga.</p>" +
      "<p>Dibanding Oktober, total pengeluaran <b>" + trend + " " + trendPct + "%</b>. Penyebab utamanya adalah cicilan motor dan periksa gigi Nadia yang memang hanya ada di bulan ini.</p>" +
      "<p>Pemasukan naik berkat <b>bonus proyek Andi Rp1.250.000</b>. Kalau bonus ini dialihkan ke DP Rumah, target itu tercapai 3 bulan lebih cepat.</p></div>" +
      '<div class="card" style="margin-top:16px"><h2>Per kategori: November vs Oktober</h2><p class="sub">Semua angka dihitung dari transaksi yang tercatat.</p>' +
      '<div style="overflow-x:auto"><table><thead><tr><th>Kategori</th><th class="num">November</th><th class="num">Oktober</th><th>Perubahan</th></tr></thead><tbody>' + rows + "</tbody></table></div></div>";
  }

  /* ---------------- router & events ---------------- */
  var ROUTES = {
    dashboard: viewDashboard, transaksi: viewTransaksi, anggaran: viewAnggaran,
    target: viewTarget, laporan: viewLaporan
  };

  function render() {
    var hash = (global.location.hash || "#/dashboard").replace(/^#\/?/, "");
    var route = ROUTES[hash] ? hash : "dashboard";
    if (route === "transaksi") { /* filter dipertahankan antar kunjungan */ }
    app.innerHTML = ROUTES[route]();
    Array.prototype.forEach.call(nav.querySelectorAll("a"), function (a) {
      a.classList.toggle("active", a.getAttribute("data-route") === route);
    });
    bindPage(route);
    global.scrollTo(0, 0);
  }

  function bindPage(route) {
    if (route === "transaksi") {
      var form = document.getElementById("tx-form");
      form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var amount = parseInt(document.getElementById("f-amount").value, 10);
        var note = document.getElementById("f-note").value.trim();
        var date = document.getElementById("f-date").value;
        var catId = document.getElementById("f-cat").value;
        var type = document.getElementById("f-type").value;
        if (!note || !date || !(amount > 0)) { toast("Lengkapi semua isian dengan benar."); return; }
        if (editingId) {
          var t = RH.state.transactions.filter(function (x) { return x.id === editingId; })[0];
          if (t) { t.date = date; t.note = note; t.category = catId; t.amount = amount; t.type = type; }
          toast("Transaksi diperbarui.");
          editingId = null;
        } else {
          RH.state.transactions.push({ id: "t" + (RH.state.nextId++), date: date, note: note, category: catId, amount: amount, type: type });
          toast("Transaksi ditambahkan.");
        }
        RH.save();
        render();
      });
      var cancel = document.getElementById("cancel-edit");
      if (cancel) cancel.addEventListener("click", function () { editingId = null; render(); });
      document.getElementById("flt-month").addEventListener("change", function (ev) { filters.month = ev.target.value; render(); });
      document.getElementById("flt-cat").addEventListener("change", function (ev) { filters.category = ev.target.value; render(); });
      document.getElementById("flt-type").addEventListener("change", function (ev) { filters.type = ev.target.value; render(); });
      document.getElementById("flt-q").addEventListener("input", function (ev) {
        filters.q = ev.target.value;
        render();
        // Re-rendering rebuilds the DOM: give the search box its focus back
        // so typing more than one character keeps working.
        var box = document.getElementById("flt-q");
        if (box) {
          box.focus();
          var end = box.value.length;
          try { box.setSelectionRange(end, end); } catch (e) { /* abaikan */ }
        }
      });
      Array.prototype.forEach.call(document.querySelectorAll("[data-edit]"), function (btn) {
        btn.addEventListener("click", function () { editingId = btn.getAttribute("data-edit"); render(); });
      });
      Array.prototype.forEach.call(document.querySelectorAll("[data-del]"), function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-del");
          var t = RH.state.transactions.filter(function (x) { return x.id === id; })[0];
          if (t && global.confirm("Hapus transaksi \"" + t.note + "\" (" + RH.fmt(t.amount) + ")?")) {
            RH.state.transactions = RH.state.transactions.filter(function (x) { return x.id !== id; });
            RH.save();
            toast("Transaksi dihapus.");
            render();
          }
        });
      });
      var reset = document.getElementById("reset-data");
      if (reset) reset.addEventListener("click", function () {
        if (global.confirm("Kembalikan semua data ke contoh awal? Perubahanmu akan hilang.")) {
          RH.reset(); editingId = null; filters = { month: "2026-11", category: "semua", type: "semua", q: "" };
          toast("Data contoh dipulihkan.");
          render();
        }
      });
    }
    if (route === "target") {
      Array.prototype.forEach.call(document.querySelectorAll("form.goal-add"), function (f) {
        f.addEventListener("submit", function (ev) {
          ev.preventDefault();
          var amount = parseInt(f.querySelector("input").value, 10);
          if (!(amount > 0)) { toast("Masukkan jumlah setoran yang benar."); return; }
          var g = RH.state.goals.filter(function (x) { return x.id === f.getAttribute("data-goal"); })[0];
          if (!g) return;
          g.saved += amount;
          RH.save();
          toast(RH.fmt(amount) + " ditambahkan ke " + g.name + ".");
          render();
        });
      });
    }
  }

  global.addEventListener("hashchange", render);
  render();
})(window);
