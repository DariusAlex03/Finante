// ============================================================
//  BaniBine — formular adăugare + Panou + Tranzacții
// ============================================================
const { useState: useStateV, useMemo: useMemoV } = React;

// ---------- Formular adăugare tranzacție ----------
function TxForm({ onSubmit, onCancel, initial }) {
  const [type, setType] = useStateV(initial?.type || "expense");
  const [amount, setAmount] = useStateV(initial?.amount ? String(initial.amount) : "");
  const [category, setCategory] = useStateV(initial?.category || "mancare");
  const [description, setDescription] = useStateV(initial?.description || "");
  const [date, setDate] = useStateV(initial ? initial.date.slice(0, 10) : new Date(2026, 5, 11).toISOString().slice(0, 10));

  const cats = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  React.useEffect(() => {
    if (!cats.find((c) => c.id === category)) setCategory(cats[0].id);
  }, [type]);

  const submit = () => {
    const a = parseFloat(String(amount).replace(",", "."));
    if (!a || a <= 0) return;
    onSubmit({ id: initial?.id || uid(), type, amount: a, category, description: description.trim() || catById(category).name, date: new Date(date).toISOString() });
  };

  const lbl = { fontSize: 12.5, fontWeight: 600, color: "var(--muted)", marginBottom: 7, display: "block" };
  const inp = { width: "100%", padding: "11px 13px", borderRadius: 11, border: "1px solid var(--border)", fontSize: 15, fontFamily: "inherit", background: "var(--bg)", color: "var(--ink)", boxSizing: "border-box", outline: "none" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* tip */}
      <div style={{ display: "flex", gap: 8, background: "var(--bg)", padding: 4, borderRadius: 13 }}>
        {[["expense", "Cheltuială"], ["income", "Venit"]].map(([v, l]) => (
          <button key={v} onClick={() => setType(v)} style={{
            flex: 1, padding: "10px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14, fontFamily: "inherit",
            background: type === v ? "var(--surface)" : "transparent",
            color: type === v ? (v === "income" ? "var(--income)" : "var(--expense)") : "var(--muted)",
            boxShadow: type === v ? "0 1px 3px rgba(0,0,0,.08)" : "none", transition: "all .15s",
          }}>{l}</button>
        ))}
      </div>

      {/* sumă */}
      <div>
        <label style={lbl}>Sumă (€)</label>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 18 }}>€</span>
          <input autoFocus value={amount} onChange={(e) => setAmount(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="0" inputMode="decimal"
            style={{ ...inp, paddingLeft: 32, fontFamily: "var(--mono)", fontSize: 22, fontWeight: 700 }} />
        </div>
      </div>

      {/* categorie */}
      <div>
        <label style={lbl}>Categorie</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {cats.map((c) => (
            <button key={c.id} onClick={() => setCategory(c.id)} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "10px 4px",
              borderRadius: 12, cursor: "pointer", fontFamily: "inherit",
              border: "1.5px solid " + (category === c.id ? c.color : "var(--border)"),
              background: category === c.id ? c.color + "14" : "var(--surface)", transition: "all .15s",
            }}>
              <CatBadge cat={c} size={30} />
              <span style={{ fontSize: 10.5, fontWeight: 600, color: "var(--ink)", textAlign: "center", lineHeight: 1.1 }}>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* descriere + dată */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 12 }}>
        <div>
          <label style={lbl}>Descriere</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Opțional" style={inp} />
        </div>
        <div>
          <label style={lbl}>Dată</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inp} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <Btn variant="ghost" onClick={onCancel} style={{ flex: 1 }}>Anulează</Btn>
        <Btn variant="primary" onClick={submit} style={{ flex: 1.4 }}>
          <Icon name="check" size={17} /> Salvează
        </Btn>
      </div>
    </div>
  );
}

// ---------- Stat card ----------
function StatCard({ label, value, sub, trend, accent, icon }) {
  return (
    <Card pad={20}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>{label}</span>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: (accent || "var(--accent)") + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name={icon} size={17} color={accent || "var(--accent)"} />
        </div>
      </div>
      <div style={{ fontFamily: "var(--mono)", fontSize: 27, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.5px" }}>{value}</div>
      {sub && (
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 7, fontSize: 12.5, color: trend === undefined ? "var(--muted)" : trend >= 0 ? "var(--income)" : "var(--expense)", fontWeight: 600 }}>
          {trend !== undefined && <Icon name={trend >= 0 ? "arrowUp" : "arrowDown"} size={13} />}
          {sub}
        </div>
      )}
    </Card>
  );
}

// ---------- PANOU (Dashboard) ----------
function Dashboard({ state, monthKeyView, setMonthKeyView, openAdd, goTo }) {
  const series = useMemoV(() => monthlySeries(state.transactions, 6), [state.transactions]);
  const cur = useMemoV(() => series.find((s) => s.key === monthKeyView) || series[series.length - 1], [series, monthKeyView]);
  const prev = series[series.indexOf(cur) - 1];

  const catMap = useMemoV(() => expensesByCategory(state.transactions, monthKeyView), [state.transactions, monthKeyView]);
  const donutData = EXPENSE_CATEGORIES.map((c) => ({ ...c, value: catMap[c.id] || 0 })).filter((d) => d.value > 0).sort((a, b) => b.value - a.value);
  const totalExp = donutData.reduce((s, d) => s + d.value, 0);

  const recent = useMemoV(() => txForMonth(state.transactions, monthKeyView).slice(0, 6), [state.transactions, monthKeyView]);

  // serie sold cumulat (pt area chart) — pe baza tuturor tranzacțiilor
  const balanceSeries = useMemoV(() => {
    const all6 = monthlySeries(state.transactions, 6);
    let running = (state.startingBalance || 0);
    // sold la începutul ferestrei = balanță minus net-urile din fereastră
    const totalNetWindow = all6.reduce((s, m) => s + m.net, 0);
    const fullBalance = totalBalance(state);
    running = fullBalance - totalNetWindow;
    return all6.map((m) => { running += m.net; return { label: m.label, value: running }; });
  }, [state]);

  const balance = totalBalance(state);
  const incTrend = prev ? cur.income - prev.income : 0;
  const expTrend = prev ? cur.expense - prev.expense : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHead title="Panou" subtitle={`${cur.monthName} ${cur.year}`} monthNav={{ series, monthKeyView, setMonthKeyView }} openAdd={openAdd} />

      {/* stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <StatCard label="Sold total" value={fmtEUR(balance)} sub="economiile tale" accent="var(--ink)" icon="wallet" />
        <StatCard label="Venituri (luna)" value={fmtEUR(cur.income)} sub={prev ? `${incTrend >= 0 ? "+" : ""}${fmtEUR(incTrend)} vs luna trecută` : "—"} trend={incTrend} accent="var(--income)" icon="arrowDown" />
        <StatCard label="Cheltuieli (luna)" value={fmtEUR(cur.expense)} sub={prev ? `${expTrend >= 0 ? "+" : ""}${fmtEUR(expTrend)} vs luna trecută` : "—"} trend={-expTrend} accent="var(--expense)" icon="arrowUp" />
        <StatCard label="Economisit (luna)" value={fmtEUR(cur.net)} sub={cur.income ? `${Math.round((cur.net / cur.income) * 100)}% din venit` : "—"} trend={cur.net} accent="var(--accent)" icon="coins" />
      </div>

      {/* charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>Venituri vs Cheltuieli</h3>
            <Legend items={[["Venituri", "var(--income)"], ["Cheltuieli", "var(--expense)"]]} />
          </div>
          <MonthlyBars series={series} />
          <div style={{ borderTop: "1px solid var(--border)", marginTop: 18, paddingTop: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", marginBottom: 4 }}>Evoluția soldului</div>
            <AreaChart points={balanceSeries} height={120} />
          </div>
        </Card>

        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>Pe ce cheltui</h3>
          </div>
          {donutData.length ? (
            <>
              <div style={{ display: "flex", justifyContent: "center", margin: "10px 0 18px" }}>
                <Donut data={donutData} size={180} thickness={24} centerLabel={fmtEUR(totalExp)} centerSub="total luna" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {donutData.slice(0, 5).map((d) => (
                  <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 3, background: d.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13.5, color: "var(--ink)", flex: 1 }}>{d.name}</span>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>{Math.round((d.value / totalExp) * 100)}%</span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 600, color: "var(--ink)", width: 64, textAlign: "right" }}>{fmtEUR(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <Empty text="Nicio cheltuială luna aceasta" />}
        </Card>
      </div>

      {/* recent + goals */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>Tranzacții recente</h3>
            <button onClick={() => goTo("tranzactii")} className="link-btn">Vezi toate <Icon name="chevR" size={14} /></button>
          </div>
          {recent.length ? <TxList items={recent} compact /> : <Empty text="Nicio tranzacție luna aceasta" />}
        </Card>

        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>Obiective</h3>
            <button onClick={() => goTo("obiective")} className="link-btn">Toate <Icon name="chevR" size={14} /></button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {state.goals.slice(0, 3).map((g) => (
              <div key={g.id}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, fontSize: 13.5 }}>
                  <span style={{ fontWeight: 600, color: "var(--ink)" }}>{g.name}</span>
                  <span style={{ fontFamily: "var(--mono)", color: "var(--muted)", fontSize: 12.5 }}>{fmtEUR(g.saved)} / {fmtEUR(g.target)}</span>
                </div>
                <Progress value={g.saved} max={g.target} color={g.color} />
              </div>
            ))}
            {!state.goals.length && <Empty text="Niciun obiectiv" />}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ---------- Listă tranzacții (component) ----------
function TxList({ items, onDelete, compact }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {items.map((t, i) => {
        const c = catById(t.category);
        return (
          <div key={t.id} className="tx-row" style={{
            display: "flex", alignItems: "center", gap: 14, padding: "12px 8px",
            borderBottom: i < items.length - 1 ? "1px solid var(--border)" : "none",
          }}>
            <CatBadge cat={c} size={42} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.description}</div>
              <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>{c.name} · {fmtDate(t.date)}</div>
            </div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 15, fontWeight: 700, color: t.type === "income" ? "var(--income)" : "var(--ink)", whiteSpace: "nowrap" }}>
              {t.type === "income" ? "+" : "−"}{fmtEUR(t.amount)}
            </div>
            {onDelete && (
              <button onClick={() => onDelete(t.id)} className="del-btn" title="Șterge"
                style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--muted)", width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="trash" size={16} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------- TRANZACȚII (view complet) ----------
function Transactions({ state, openAdd, onDelete }) {
  const [filter, setFilter] = useStateV("toate");
  const [cat, setCat] = useStateV("toate");
  const [q, setQ] = useStateV("");

  const filtered = useMemoV(() => {
    return state.transactions.filter((t) => {
      if (filter !== "toate" && t.type !== filter) return false;
      if (cat !== "toate" && t.category !== cat) return false;
      if (q && !t.description.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [state.transactions, filter, cat, q]);

  // grupare pe lună
  const groups = useMemoV(() => {
    const g = {};
    filtered.forEach((t) => { const k = monthKey(t.date); (g[k] = g[k] || []).push(t); });
    return Object.entries(g).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const totalInc = sumBy(filtered, "income");
  const totalExp = sumBy(filtered, "expense");

  const chip = (active) => ({
    padding: "8px 15px", borderRadius: 99, border: "1px solid " + (active ? "var(--accent)" : "var(--border)"),
    background: active ? "var(--accent)" : "var(--surface)", color: active ? "#fff" : "var(--ink)",
    fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", transition: "all .15s",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHead title="Tranzacții" subtitle={`${filtered.length} înregistrări`} openAdd={openAdd} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        <StatCard label="Total venituri" value={fmtEUR(totalInc)} accent="var(--income)" icon="arrowDown" />
        <StatCard label="Total cheltuieli" value={fmtEUR(totalExp)} accent="var(--expense)" icon="arrowUp" />
        <StatCard label="Net" value={fmtEUR(totalInc - totalExp)} accent="var(--accent)" icon="coins" />
      </div>

      <Card pad={16}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 200px" }}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Caută..." style={{ width: "100%", padding: "9px 13px", borderRadius: 10, border: "1px solid var(--border)", fontSize: 14, fontFamily: "inherit", background: "var(--bg)", color: "var(--ink)", boxSizing: "border-box", outline: "none" }} />
          </div>
          <div style={{ display: "flex", gap: 7 }}>
            {[["toate", "Toate"], ["income", "Venituri"], ["expense", "Cheltuieli"]].map(([v, l]) => (
              <button key={v} onClick={() => setFilter(v)} style={chip(filter === v)}>{l}</button>
            ))}
          </div>
          <select value={cat} onChange={(e) => setCat(e.target.value)} style={{ padding: "9px 13px", borderRadius: 10, border: "1px solid var(--border)", fontSize: 13.5, fontFamily: "inherit", background: "var(--bg)", color: "var(--ink)", cursor: "pointer", fontWeight: 600, outline: "none" }}>
            <option value="toate">Toate categoriile</option>
            {ALL_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </Card>

      {groups.length ? groups.map(([k, items]) => {
        const d = new Date(k + "-01");
        return (
          <div key={k}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "4px 6px 10px" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{MONTHS_RO_FULL[d.getMonth()]} {d.getFullYear()}</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 12.5, color: "var(--muted)" }}>net {fmtEUR(sumBy(items, "income") - sumBy(items, "expense"))}</span>
            </div>
            <Card pad={10}><TxList items={items} onDelete={onDelete} /></Card>
          </div>
        );
      }) : <Card><Empty text="Nicio tranzacție găsită" /></Card>}
    </div>
  );
}

// ---------- Helpers UI partajate ----------
function PageHead({ title, subtitle, monthNav, openAdd }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.5px" }}>{title}</h1>
        {subtitle && <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 3 }}>{subtitle}</div>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {monthNav && <MonthNav {...monthNav} />}
        {openAdd && <Btn variant="primary" onClick={openAdd}><Icon name="plus" size={17} /> Adaugă</Btn>}
      </div>
    </div>
  );
}

function MonthNav({ series, monthKeyView, setMonthKeyView }) {
  const idx = series.findIndex((s) => s.key === monthKeyView);
  const go = (d) => { const ni = idx + d; if (ni >= 0 && ni < series.length) setMonthKeyView(series[ni].key); };
  const cur = series[idx] || series[series.length - 1];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 4 }}>
      <button onClick={() => go(-1)} disabled={idx <= 0} className="icon-btn" style={navBtn(idx <= 0)}><Icon name="chevL" size={17} /></button>
      <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)", minWidth: 92, textAlign: "center" }}>{cur.monthName} {cur.year}</span>
      <button onClick={() => go(1)} disabled={idx >= series.length - 1} className="icon-btn" style={navBtn(idx >= series.length - 1)}><Icon name="chevR" size={17} /></button>
    </div>
  );
}
const navBtn = (dis) => ({ border: "none", background: "transparent", cursor: dis ? "not-allowed" : "pointer", color: dis ? "var(--border)" : "var(--muted)", width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" });

function Legend({ items }) {
  return (
    <div style={{ display: "flex", gap: 16 }}>
      {items.map(([l, c]) => (
        <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 9, height: 9, borderRadius: 3, background: c }} />
          <span style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600 }}>{l}</span>
        </div>
      ))}
    </div>
  );
}

function Empty({ text }) {
  return <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--muted)", fontSize: 14 }}>{text}</div>;
}

Object.assign(window, { TxForm, StatCard, Dashboard, TxList, Transactions, PageHead, MonthNav, Legend, Empty });
