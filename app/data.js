/* Rumah Hemat — data & state. Seed keluarga Andi & Sari, November 2026.
   Semua angka Rupiah. State tersimpan di localStorage, bisa direset. */
(function (global) {
  "use strict";

  var STORE_KEY = "rumah-hemat-v1";

  var CATEGORIES = [
    { id: "belanja",   name: "Belanja Harian", color: "#ea580c", soft: "#ffedd5", icon: "i-belanja" },
    { id: "makan",     name: "Makan & Jajan",  color: "#16a34a", soft: "#dcfce7", icon: "i-makan" },
    { id: "listrik",   name: "Listrik & Air",  color: "#ca8a04", soft: "#fef9c3", icon: "i-listrik" },
    { id: "transport", name: "Transport",      color: "#0d9488", soft: "#ccfbf1", icon: "i-transport" },
    { id: "sekolah",   name: "Sekolah Anak",   color: "#2563eb", soft: "#dbeafe", icon: "i-sekolah" },
    { id: "kesehatan", name: "Kesehatan",      color: "#db2777", soft: "#fce7f3", icon: "i-sehat" },
    { id: "hiburan",   name: "Hiburan",        color: "#9333ea", soft: "#ede9fe", icon: "i-hiburan" },
    { id: "rumah",     name: "Rumah Tangga",   color: "#92400e", soft: "#fef3c7", icon: "i-rumah" },
    { id: "lainnya",   name: "Lainnya",        color: "#64748b", soft: "#f1f5f9", icon: "i-dompet" }
  ];

  function cat(id) {
    for (var i = 0; i < CATEGORIES.length; i++) if (CATEGORIES[i].id === id) return CATEGORIES[i];
    return CATEGORIES[CATEGORIES.length - 1];
  }

  var BUDGETS = {
    belanja: 2000000, makan: 400000, listrik: 800000, transport: 1200000,
    sekolah: 1400000, kesehatan: 800000, hiburan: 300000, rumah: 300000, lainnya: 200000
  };

  var MONTHLY = [
    { key: "2026-06", label: "Jun", income: 12100000, expense: 6050000 },
    { key: "2026-07", label: "Jul", income: 12450000, expense: 6420000 },
    { key: "2026-08", label: "Agu", income: 12300000, expense: 5980000 },
    { key: "2026-09", label: "Sep", income: 12600000, expense: 6720000 },
    { key: "2026-10", label: "Okt", income: 12450000, expense: 6150000 },
    { key: "2026-11", label: "Nov", income: 13700000, expense: 6313000 }
  ];

  var GOALS_SEED = [
    { id: "g1", name: "Dana Darurat", note: "6x pengeluaran bulanan, jaga-jaga kalau ada yang sakit atau motor rusak.", target: 20000000, saved: 12400000, monthly: 1000000, color: "#0d9488" },
    { id: "g2", name: "Liburan Keluarga", note: "Liburan ke Yogyakarta akhir tahun — tiket, hotel, dan jajan di Malioboro.", target: 8000000, saved: 3200000, monthly: 500000, color: "#db2777" },
    { id: "g3", name: "DP Rumah", note: "Cicilan pertama rumah sendiri di pinggiran kota, target 2 tahun lagi.", target: 50000000, saved: 18750000, monthly: 1500000, color: "#2563eb" },
    { id: "g4", name: "Pendidikan Anak", note: "Biaya masuk SMP Dimas dan kuliah Nadia kelak — dicicil dari sekarang.", target: 30000000, saved: 9600000, monthly: 750000, color: "#9333ea" }
  ];

  var BILLS_SEED = [
    { id: "b1", name: "SPP Sekolah Dimas", amount: 450000, due: "2026-11-05", paid: true },
    { id: "b2", name: "Internet IndiHome", amount: 299000, due: "2026-11-10", paid: true },
    { id: "b3", name: "BPJS Kesehatan", amount: 300000, due: "2026-11-10", paid: true },
    { id: "b4", name: "PDAM", amount: 175000, due: "2026-11-15", paid: true },
    { id: "b5", name: "Token Listrik", amount: 250000, due: "2026-11-20", paid: true },
    { id: "b6", name: "Langganan Streaming", amount: 54000, due: "2026-11-28", paid: false },
    { id: "b7", name: "Cicilan Motor", amount: 850000, due: "2026-11-28", paid: false },
    { id: "b8", name: "Iuran RT", amount: 50000, due: "2026-11-30", paid: false }
  ];

  function seedTransactions() {
    var rows = [
      ["2026-10-05", "Bensin motor", "transport", 55000, "keluar"],
      ["2026-10-10", "Makan keluarga di luar", "makan", 180000, "keluar"],
      ["2026-10-15", "SPP sekolah Dimas", "sekolah", 450000, "keluar"],
      ["2026-10-20", "Token listrik", "listrik", 240000, "keluar"],
      ["2026-10-25", "Gaji Andi", "lainnya", 8500000, "masuk"],
      ["2026-10-28", "Belanja mingguan", "belanja", 390000, "keluar"],
      ["2026-11-01", "Gaji Andi", "lainnya", 8500000, "masuk"],
      ["2026-11-01", "Belanja pasar minggu 1", "belanja", 385000, "keluar"],
      ["2026-11-02", "Token listrik", "listrik", 250000, "keluar"],
      ["2026-11-02", "BPJS Kesehatan", "kesehatan", 300000, "keluar"],
      ["2026-11-03", "Gaji Sari (freelance)", "lainnya", 3200000, "masuk"],
      ["2026-11-03", "Bensin motor", "transport", 60000, "keluar"],
      ["2026-11-04", "SPP sekolah Dimas", "sekolah", 450000, "keluar"],
      ["2026-11-05", "Makan siang keluarga", "makan", 125000, "keluar"],
      ["2026-11-05", "Cicilan motor", "transport", 850000, "keluar"],
      ["2026-11-06", "Air galon + gas", "rumah", 95000, "keluar"],
      ["2026-11-07", "Belanja mingguan", "belanja", 420000, "keluar"],
      ["2026-11-08", "Internet bulanan", "listrik", 299000, "keluar"],
      ["2026-11-09", "Ojek online", "transport", 48000, "keluar"],
      ["2026-11-10", "Les piano Nadia", "sekolah", 300000, "keluar"],
      ["2026-11-10", "Usaha sampingan (jualan kue)", "lainnya", 750000, "masuk"],
      ["2026-11-11", "Jajan anak", "makan", 35000, "keluar"],
      ["2026-11-12", "Obat & vitamin", "kesehatan", 185000, "keluar"],
      ["2026-11-13", "Belanja pasar", "belanja", 360000, "keluar"],
      ["2026-11-14", "Nonton bioskop", "hiburan", 150000, "keluar"],
      ["2026-11-15", "Bayar PDAM", "listrik", 175000, "keluar"],
      ["2026-11-15", "Bonus proyek Andi", "lainnya", 1250000, "masuk"],
      ["2026-11-16", "Bensin + parkir", "transport", 75000, "keluar"],
      ["2026-11-17", "Buku & alat tulis", "sekolah", 120000, "keluar"],
      ["2026-11-18", "Makan malam di luar", "makan", 210000, "keluar"],
      ["2026-11-19", "Sabun & deterjen", "rumah", 110000, "keluar"],
      ["2026-11-20", "Belanja mingguan", "belanja", 445000, "keluar"],
      ["2026-11-21", "Periksa gigi Nadia", "kesehatan", 250000, "keluar"],
      ["2026-11-22", "Langganan streaming", "hiburan", 54000, "keluar"],
      ["2026-11-23", "Sayur & buah", "belanja", 180000, "keluar"],
      ["2026-11-24", "Ojek + tol", "transport", 62000, "keluar"],
      ["2026-11-25", "Beli sepatu Dimas", "sekolah", 275000, "keluar"],
      ["2026-11-26", "Kopi & camilan", "makan", 45000, "keluar"]
    ];
    return rows.map(function (r, i) {
      return { id: "t" + (i + 1), date: r[0], note: r[1], category: r[2], amount: r[3], type: r[4] };
    });
  }

  function seed() {
    return {
      transactions: seedTransactions(),
      goals: JSON.parse(JSON.stringify(GOALS_SEED)),
      bills: JSON.parse(JSON.stringify(BILLS_SEED)),
      nextId: 100
    };
  }

  function load() {
    try {
      var raw = global.localStorage.getItem(STORE_KEY);
      if (!raw) return seed();
      var s = JSON.parse(raw);
      if (!s || !Array.isArray(s.transactions) || !Array.isArray(s.goals)) return seed();
      return s;
    } catch (e) {
      return seed();
    }
  }

  var state = load();

  function save() {
    try { global.localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* storage penuh: abaikan */ }
  }

  function reset() {
    // Mutate the existing state object in place so RH.state keeps
    // pointing at the live state after a reset.
    var fresh = seed();
    state.transactions = fresh.transactions;
    state.goals = fresh.goals;
    state.bills = fresh.bills;
    state.nextId = fresh.nextId;
    save();
    return state;
  }

  /* ---------- helpers ---------- */
  function fmt(n) {
    return "Rp" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  function fmtShort(n) {
    if (n >= 1000000) return "Rp" + (Math.round(n / 100000) / 10).toString().replace(".", ",") + " jt";
    if (n >= 1000) return "Rp" + Math.round(n / 1000) + " rb";
    return fmt(n);
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function monthKey(dateStr) { return String(dateStr).slice(0, 7); }
  function monthLabel(key) {
    var names = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    var p = key.split("-");
    return names[parseInt(p[1], 10) - 1] + " " + p[0];
  }
  function dateLabel(dateStr) {
    var p = dateStr.split("-");
    return parseInt(p[2], 10) + " " + ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"][parseInt(p[1], 10) - 1] + " " + p[0];
  }
  function monthTotals(key) {
    var inc = 0, out = 0;
    state.transactions.forEach(function (t) {
      if (monthKey(t.date) !== key) return;
      if (t.type === "masuk") inc += t.amount; else out += t.amount;
    });
    return { income: inc, expense: out, left: inc - out };
  }
  function categoryTotals(key) {
    var out = {};
    CATEGORIES.forEach(function (c) { out[c.id] = 0; });
    state.transactions.forEach(function (t) {
      if (t.type !== "keluar" || monthKey(t.date) !== key) return;
      out[t.category] = (out[t.category] || 0) + t.amount;
    });
    return out;
  }
  function availableMonths() {
    var seen = {}, list = [];
    state.transactions.forEach(function (t) {
      var k = monthKey(t.date);
      if (!seen[k]) { seen[k] = true; list.push(k); }
    });
    list.sort().reverse();
    return list;
  }
  function goalMonthlyTotal() {
    return state.goals.reduce(function (a, g) { return a + (g.monthly || 0); }, 0);
  }

  global.RH = {
    state: state, save: save, reset: reset,
    CATEGORIES: CATEGORIES, cat: cat, BUDGETS: BUDGETS, MONTHLY: MONTHLY,
    fmt: fmt, fmtShort: fmtShort, esc: esc,
    monthKey: monthKey, monthLabel: monthLabel, dateLabel: dateLabel,
    monthTotals: monthTotals, categoryTotals: categoryTotals,
    availableMonths: availableMonths, goalMonthlyTotal: goalMonthlyTotal
  };
})(window);
