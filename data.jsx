// ============================================================
//  BaniBine — model de date, categorii, helpers, demo data
// ============================================================

// ---- Categorii de cheltuieli ----
const EXPENSE_CATEGORIES = [
  { id: "mancare",     name: "Mâncare",      color: "#d97757", icon: "food" },
  { id: "chirie",      name: "Chirie",       color: "#6a8cae", icon: "home" },
  { id: "transport",   name: "Transport",    color: "#5fa88f", icon: "car" },
  { id: "distractie",  name: "Distracție",   color: "#b57bb0", icon: "play" },
  { id: "cumparaturi", name: "Cumpărături",  color: "#d9a456", icon: "bag" },
  { id: "utilitati",   name: "Utilități",    color: "#7b86c4", icon: "bolt" },
  { id: "sanatate",    name: "Sănătate",     color: "#c87b8a", icon: "heart" },
  { id: "abonamente",  name: "Abonamente",   color: "#88a35e", icon: "repeat" },
  { id: "altele",      name: "Altele",       color: "#9a948b", icon: "dots" },
];

// ---- Categorii de venit ----
const INCOME_CATEGORIES = [
  { id: "salariu",   name: "Salariu",   color: "#2f9e6b", icon: "wallet" },
  { id: "freelance", name: "Freelance", color: "#3f9ec4", icon: "laptop" },
  { id: "bonus",     name: "Bonus / Cadou", color: "#d9a456", icon: "gift" },
  { id: "alt_venit", name: "Alte venituri", color: "#9a948b", icon: "dots" },
];

const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
const catById = (id) => ALL_CATEGORIES.find((c) => c.id === id) || { id, name: id, color: "#9a948b", icon: "dots" };

// ---- Format monedă (EUR, locale RO) ----
function fmtEUR(n, decimals = 0) {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n || 0);
}
function fmtNum(n, decimals = 0) {
  return new Intl.NumberFormat("ro-RO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n || 0);
}

const MONTHS_RO = ["Ian", "Feb", "Mar", "Apr", "Mai", "Iun", "Iul", "Aug", "Sep", "Oct", "Noi", "Dec"];
const MONTHS_RO_FULL = ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"];

function monthKey(d) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
}
function fmtDate(d) {
  const dt = new Date(d);
  return `${dt.getDate()} ${MONTHS_RO[dt.getMonth()]} ${dt.getFullYear()}`;
}
function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

// ============================================================
//  Demo data — tranzacții realiste pe ultimele 7 luni
// ============================================================
function generateDemoTransactions() {
  const tx = [];
  const today = new Date(2026, 5, 11); // 11 Iunie 2026
  const add = (year, month, day, type, category, amount, description) => {
    tx.push({ id: uid(), type, category, amount, description, date: new Date(year, month, day).toISOString() });
  };

  // model lunar repetat pe lunile trecute + curentă (Dec 2025 .. Iun 2026)
  const monthsBack = [
    { y: 2025, m: 11 }, { y: 2026, m: 0 }, { y: 2026, m: 1 },
    { y: 2026, m: 2 }, { y: 2026, m: 3 }, { y: 2026, m: 4 }, { y: 2026, m: 5 },
  ];

  monthsBack.forEach(({ y, m }, idx) => {
    const isCurrent = y === today.getFullYear() && m === today.getMonth();
    const maxDay = isCurrent ? today.getDate() : 28;
    const wob = (base, pct) => Math.round(base * (1 + (Math.random() - 0.5) * pct));

    // Venituri
    add(y, m, 2, "income", "salariu", wob(2850, 0.04), "Salariu lunar");
    if (idx % 2 === 0) add(y, m, 18, "income", "freelance", wob(620, 0.3), "Proiect freelance");
    if (idx === 2) add(y, m, 12, "income", "bonus", 300, "Cadou aniversare");

    // Cheltuieli fixe
    add(y, m, 1, "expense", "chirie", 680, "Chirie apartament");
    add(y, m, 5, "expense", "utilitati", wob(140, 0.25), "Curent + gaz");
    add(y, m, 6, "expense", "utilitati", 45, "Internet & telefon");
    add(y, m, 8, "expense", "abonamente", 12, "Spotify");
    add(y, m, 8, "expense", "abonamente", 14, "Netflix");
    add(y, m, 10, "expense", "abonamente", 11, "Sală fitness");

    // Mâncare — câteva pe lună
    const foodDays = [3, 7, 11, 15, 19, 23, 26].filter((d) => d <= maxDay);
    foodDays.forEach((d, i) => {
      const opts = ["Cumpărături Lidl", "Kaufland", "Piață legume", "Mega Image", "Restaurant", "Cafea & brunch", "Comandă mâncare"];
      add(y, m, d, "expense", "mancare", wob(55 + i * 6, 0.3), opts[i % opts.length]);
    });

    // Transport
    [4, 14, 24].filter((d) => d <= maxDay).forEach((d) => {
      add(y, m, d, "expense", "transport", wob(38, 0.4), Math.random() > 0.5 ? "Benzină" : "Abonament STB");
    });

    // Distracție / cumpărături / sănătate — variabil
    if (9 <= maxDay) add(y, m, 9, "expense", "distractie", wob(45, 0.5), "Cinema & ieșire");
    if (16 <= maxDay && Math.random() > 0.3) add(y, m, 16, "expense", "cumparaturi", wob(85, 0.6), "Haine / online");
    if (21 <= maxDay && Math.random() > 0.5) add(y, m, 21, "expense", "sanatate", wob(60, 0.5), "Farmacie / dentist");
    if (27 <= maxDay && Math.random() > 0.4) add(y, m, 27, "expense", "distractie", wob(35, 0.5), "Bar cu prietenii");
  });

  return tx.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// ---- Obiective demo ----
function demoGoals() {
  return [
    { id: uid(), name: "Fond de urgență", target: 6000, saved: 3200, color: "#2f9e6b", deadline: "2026-12-31" },
    { id: uid(), name: "Vacanță Italia", target: 1800, saved: 740, color: "#d97757", deadline: "2026-08-15" },
    { id: uid(), name: "Laptop nou", target: 1400, saved: 950, color: "#6a8cae", deadline: "2026-09-30" },
  ];
}

// ---- Împrumuturi demo (bani dați altora) ----
function demoLoans() {
  return [
    { id: uid(), person: "Andrei", amount: 500, repaid: 200, date: new Date(2026, 3, 14).toISOString(), note: "Reparație mașină", history: [{ id: uid(), amount: 200, date: new Date(2026, 4, 20).toISOString() }] },
    { id: uid(), person: "Maria", amount: 150, repaid: 150, date: new Date(2026, 2, 3).toISOString(), note: "Bilete concert", history: [{ id: uid(), amount: 150, date: new Date(2026, 3, 1).toISOString() }] },
    { id: uid(), person: "Radu", amount: 300, repaid: 0, date: new Date(2026, 5, 2).toISOString(), note: "Până la salariu", history: [] },
  ];
}

// ---- Bugete demo (lunar, pe categorie) ----
function demoBudgets() {
  return {
    mancare: 450,
    chirie: 680,
    transport: 130,
    distractie: 150,
    cumparaturi: 120,
    utilitati: 200,
    sanatate: 80,
    abonamente: 60,
  };
}

// ============================================================
//  Store — persistă în localStorage
// ============================================================
const STORE_KEY = "banibine_v1";

function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.loans) parsed.loans = demoLoans(); // migrare versiune veche
      return parsed;
    }
  } catch (e) {}
  return {
    transactions: generateDemoTransactions(),
    goals: demoGoals(),
    budgets: demoBudgets(),
    loans: demoLoans(),
    startingBalance: 1200, // economii existente la început
  };
}

function saveStore(state) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch (e) {}
}

// ============================================================
//  Selectori / calcule
// ============================================================
function txForMonth(transactions, mKey) {
  return transactions.filter((t) => monthKey(t.date) === mKey);
}
function sumBy(list, type) {
  return list.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0);
}
function totalBalance(state) {
  const inc = sumBy(state.transactions, "income");
  const exp = sumBy(state.transactions, "expense");
  return (state.startingBalance || 0) + inc - exp;
}
// economii pe categorie pentru o lună
function expensesByCategory(transactions, mKey) {
  const map = {};
  txForMonth(transactions, mKey)
    .filter((t) => t.type === "expense")
    .forEach((t) => { map[t.category] = (map[t.category] || 0) + t.amount; });
  return map;
}
// serie pe ultimele N luni: {key, label, income, expense, net}
function monthlySeries(transactions, n, refDate) {
  const ref = refDate ? new Date(refDate) : new Date(2026, 5, 11);
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(ref.getFullYear(), ref.getMonth() - i, 1);
    const key = monthKey(d);
    const list = txForMonth(transactions, key);
    out.push({
      key,
      label: MONTHS_RO[d.getMonth()],
      monthName: MONTHS_RO_FULL[d.getMonth()],
      year: d.getFullYear(),
      income: sumBy(list, "income"),
      expense: sumBy(list, "expense"),
      net: sumBy(list, "income") - sumBy(list, "expense"),
    });
  }
  return out;
}

Object.assign(window, {
  EXPENSE_CATEGORIES, INCOME_CATEGORIES, ALL_CATEGORIES, catById,
  fmtEUR, fmtNum, MONTHS_RO, MONTHS_RO_FULL, monthKey, fmtDate, uid,
  loadStore, saveStore, txForMonth, sumBy, totalBalance,
  expensesByCategory, monthlySeries, demoGoals, demoBudgets, demoLoans, generateDemoTransactions,
});
