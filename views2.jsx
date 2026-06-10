// ============================================================
//  BaniBine — Buget, Obiective, Calculator
// ============================================================
const { useState: useS2, useMemo: useM2 } = React;

// ---------- BUGET ----------
function Budget({ state, setState, monthKeyView, setMonthKeyView }) {
  const series = useM2(() => monthlySeries(state.transactions, 6), [state.transactions]);
  const cur = series.find((s) => s.key === monthKeyView) || series[series.length - 1];
  const spent = useM2(() => expensesByCategory(state.transactions, monthKeyView), [state.transactions, monthKeyView]);
  const [editing, setEditing] = useS2(null);
  const [tmp, setTmp] = useS2("");

  const budgeted = EXPENSE_CATEGORIES.filter((c) => state.budgets[c.id] != null);
  const totalBudget = budgeted.reduce((s, c) => s + (state.budgets[c.id] || 0), 0);
  const totalSpent = budgeted.reduce((s, c) => s + (spent[c.id] || 0), 0);

  const setBudget = (id, val) => {
    const v = parseFloat(String(val).replace(",", "."));
    setState((s) => ({ ...s, budgets: { ...s.budgets, [id]: isNaN(v) ? 0 : v } }));
  };
  const removeBudget = (id) => setState((s) => { const b = { ...s.budgets }; delete b[id]; return { ...s, budgets: b }; });

  const unbudgeted = EXPENSE_CATEGORIES.filter((c) => state.budgets[c.id] == null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHead title="Buget lunar" subtitle={`${cur.monthName} ${cur.year}`} monthNav={{ series, monthKeyView, setMonthKeyView }} />

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", gap: 16 }}>
        <Card pad={20}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>Buget rămas</span>
          <div style={{ fontFamily: "var(--mono)", fontSize: 27, fontWeight: 700, color: totalBudget - totalSpent >= 0 ? "var(--income)" : "var(--expense)", marginTop: 8 }}>{fmtEUR(totalBudget - totalSpent)}</div>
          <div style={{ marginTop: 14 }}><Progress value={totalSpent} max={totalBudget} color={totalSpent > totalBudget ? "var(--expense)" : "var(--accent)"} height={10} /></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12.5, color: "var(--muted)", fontFamily: "var(--mono)" }}>
            <span>Cheltuit {fmtEUR(totalSpent)}</span><span>din {fmtEUR(totalBudget)}</span>
          </div>
        </Card>
        <StatCard label="Buget total" value={fmtEUR(totalBudget)} accent="var(--ink)" icon="target" />
        <StatCard label="Cheltuit" value={fmtEUR(totalSpent)} sub={totalBudget ? `${Math.round((totalSpent / totalBudget) * 100)}% folosit` : "—"} accent="var(--expense)" icon="arrowUp" />
      </div>

      <Card>
        <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>Pe categorie</h3>
        <p style={{ margin: "0 0 18px", fontSize: 13, color: "var(--muted)" }}>Apasă pe sumă pentru a modifica bugetul.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {budgeted.map((c) => {
            const sp = spent[c.id] || 0;
            const bg = state.budgets[c.id] || 0;
            const pct = Math.min(100, (sp / (bg || 1)) * 100);
            const over = sp > bg;
            return (
              <div key={c.id}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 9 }}>
                  <CatBadge cat={c} size={36} />
                  <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: "var(--ink)" }}>{c.name}</span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 13.5, color: over ? "var(--expense)" : "var(--muted)", fontWeight: 600 }}>{fmtEUR(sp)}</span>
                  <span style={{ color: "var(--border)" }}>/</span>
                  {editing === c.id ? (
                    <input autoFocus defaultValue={bg} onBlur={(e) => { setBudget(c.id, e.target.value); setEditing(null); }}
                      onKeyDown={(e) => { if (e.key === "Enter") { setBudget(c.id, e.target.value); setEditing(null); } }}
                      style={{ width: 70, padding: "5px 8px", borderRadius: 8, border: "1.5px solid var(--accent)", fontFamily: "var(--mono)", fontSize: 13.5, fontWeight: 700, outline: "none", textAlign: "right" }} />
                  ) : (
                    <button onClick={() => setEditing(c.id)} style={{ fontFamily: "var(--mono)", fontSize: 13.5, fontWeight: 700, color: "var(--ink)", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "5px 10px", cursor: "pointer" }}>{fmtEUR(bg)}</button>
                  )}
                  <button onClick={() => removeBudget(c.id)} className="del-btn" style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--muted)", width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="x" size={15} /></button>
                </div>
                <Progress value={sp} max={bg} color={over ? "var(--expense)" : pct > 80 ? "#d9a456" : c.color} height={8} />
                {over && <div style={{ fontSize: 12, color: "var(--expense)", marginTop: 6, fontWeight: 600 }}>Depășit cu {fmtEUR(sp - bg)}</div>}
              </div>
            );
          })}
        </div>

        {unbudgeted.length > 0 && (
          <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--border)" }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--muted)", marginBottom: 10 }}>Adaugă buget pentru:</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {unbudgeted.map((c) => (
                <button key={c.id} onClick={() => setBudget(c.id, 100)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 13px", borderRadius: 99, border: "1px dashed " + c.color, background: c.color + "10", color: "var(--ink)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  <Icon name="plus" size={14} color={c.color} /> {c.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

// ---------- OBIECTIVE ----------
function Goals({ state, setState }) {
  const [modal, setModal] = useS2(null); // {goal} pt edit/add
  const [contrib, setContrib] = useS2(null); // goal pt contribuție

  const save = (g) => {
    setState((s) => {
      const exists = s.goals.find((x) => x.id === g.id);
      return { ...s, goals: exists ? s.goals.map((x) => x.id === g.id ? g : x) : [...s.goals, g] };
    });
    setModal(null);
  };
  const del = (id) => setState((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== id) }));
  const addContrib = (id, amount) => {
    const a = parseFloat(String(amount).replace(",", "."));
    if (!a) return;
    setState((s) => ({ ...s, goals: s.goals.map((g) => g.id === id ? { ...g, saved: Math.max(0, g.saved + a) } : g) }));
    setContrib(null);
  };

  const totalTarget = state.goals.reduce((s, g) => s + g.target, 0);
  const totalSaved = state.goals.reduce((s, g) => s + g.saved, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHead title="Obiective de economisire" subtitle={`${state.goals.length} obiective active`}
        openAdd={() => setModal({ goal: { id: uid(), name: "", target: 1000, saved: 0, color: "#d97757", deadline: "2026-12-31" }, isNew: true })} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        <StatCard label="Total strâns" value={fmtEUR(totalSaved)} accent="var(--income)" icon="coins" />
        <StatCard label="Țintă totală" value={fmtEUR(totalTarget)} accent="var(--ink)" icon="target" />
        <StatCard label="Progres" value={`${Math.round((totalSaved / (totalTarget || 1)) * 100)}%`} accent="var(--accent)" icon="trend" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {state.goals.map((g) => {
          const pct = Math.min(100, (g.saved / g.target) * 100);
          const left = g.target - g.saved;
          const months = monthsUntil(g.deadline);
          const perMonth = months > 0 ? left / months : left;
          const done = g.saved >= g.target;
          return (
            <Card key={g.id} hover>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 18 }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: g.color + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name={done ? "check" : "flag"} size={22} color={g.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>{g.name}</div>
                  <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>
                    {done ? "Obiectiv atins! 🎉" : `Termen: ${fmtDate(g.deadline)}`}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 2 }}>
                  <button onClick={() => setModal({ goal: g })} className="del-btn" style={iconMini}><Icon name="edit" size={15} /></button>
                  <button onClick={() => del(g.id)} className="del-btn" style={iconMini}><Icon name="trash" size={15} /></button>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 9 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 22, fontWeight: 700, color: "var(--ink)" }}>{fmtEUR(g.saved)}</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 13.5, color: "var(--muted)" }}>din {fmtEUR(g.target)}</span>
              </div>
              <Progress value={g.saved} max={g.target} color={g.color} height={10} />
              <div style={{ display: "flex", justifycontent: "space-between", marginTop: 8, fontSize: 12.5, color: "var(--muted)" }}>
                <span style={{ fontWeight: 700, color: g.color }}>{Math.round(pct)}%</span>
                <span style={{ marginLeft: "auto" }}>{done ? "Complet" : `mai sunt ${fmtEUR(left)}`}</span>
              </div>

              {!done && months > 0 && (
                <div style={{ marginTop: 14, padding: "11px 13px", background: "var(--bg)", borderRadius: 12, fontSize: 12.5, color: "var(--muted)", display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name="calc" size={15} color={g.color} />
                  <span>Pune <b style={{ color: "var(--ink)", fontFamily: "var(--mono)" }}>{fmtEUR(perMonth)}</b>/lună ca să-l atingi în {months} {months === 1 ? "lună" : "luni"}</span>
                </div>
              )}

              <div style={{ marginTop: 14 }}>
                <Btn variant="soft" size="sm" onClick={() => setContrib(g)} style={{ width: "100%" }}><Icon name="plus" size={15} /> Adaugă bani</Btn>
              </div>
            </Card>
          );
        })}
        {!state.goals.length && <Card><Empty text="Niciun obiectiv încă. Adaugă unul!" /></Card>}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.isNew ? "Obiectiv nou" : "Editează obiectiv"}>
        {modal && <GoalForm goal={modal.goal} onSave={save} onCancel={() => setModal(null)} />}
      </Modal>

      <Modal open={!!contrib} onClose={() => setContrib(null)} title={`Adaugă bani · ${contrib?.name || ""}`} width={400}>
        {contrib && <ContribForm goal={contrib} onAdd={addContrib} onCancel={() => setContrib(null)} />}
      </Modal>
    </div>
  );
}
const iconMini = { border: "none", background: "transparent", cursor: "pointer", color: "var(--muted)", width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" };

function GoalForm({ goal, onSave, onCancel }) {
  const [name, setName] = useS2(goal.name);
  const [target, setTarget] = useS2(String(goal.target));
  const [saved, setSaved] = useS2(String(goal.saved));
  const [deadline, setDeadline] = useS2(goal.deadline);
  const [color, setColor] = useS2(goal.color);
  const colors = ["#d97757", "#2f9e6b", "#6a8cae", "#b57bb0", "#d9a456", "#5fa88f", "#c87b8a"];
  const lbl = { fontSize: 12.5, fontWeight: 600, color: "var(--muted)", marginBottom: 7, display: "block" };
  const inp = { width: "100%", padding: "11px 13px", borderRadius: 11, border: "1px solid var(--border)", fontSize: 15, fontFamily: "inherit", background: "var(--bg)", color: "var(--ink)", boxSizing: "border-box", outline: "none" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div><label style={lbl}>Nume obiectiv</label><input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="ex. Vacanță, Mașină..." style={inp} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div><label style={lbl}>Țintă (€)</label><input value={target} onChange={(e) => setTarget(e.target.value)} inputMode="decimal" style={{ ...inp, fontFamily: "var(--mono)" }} /></div>
        <div><label style={lbl}>Strâns deja (€)</label><input value={saved} onChange={(e) => setSaved(e.target.value)} inputMode="decimal" style={{ ...inp, fontFamily: "var(--mono)" }} /></div>
      </div>
      <div><label style={lbl}>Termen limită</label><input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} style={inp} /></div>
      <div>
        <label style={lbl}>Culoare</label>
        <div style={{ display: "flex", gap: 9 }}>
          {colors.map((c) => (
            <button key={c} onClick={() => setColor(c)} style={{ width: 32, height: 32, borderRadius: 9, background: c, border: color === c ? "3px solid var(--ink)" : "3px solid transparent", cursor: "pointer" }} />
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <Btn variant="ghost" onClick={onCancel} style={{ flex: 1 }}>Anulează</Btn>
        <Btn variant="primary" onClick={() => name.trim() && onSave({ ...goal, name: name.trim(), target: parseFloat(target.replace(",", ".")) || 0, saved: parseFloat(saved.replace(",", ".")) || 0, deadline, color })} style={{ flex: 1.4 }}><Icon name="check" size={17} /> Salvează</Btn>
      </div>
    </div>
  );
}

function ContribForm({ goal, onAdd, onCancel }) {
  const [amt, setAmt] = useS2("");
  const quick = [25, 50, 100, 200];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 18 }}>€</span>
        <input autoFocus value={amt} onChange={(e) => setAmt(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onAdd(goal.id, amt)} placeholder="0" inputMode="decimal"
          style={{ width: "100%", padding: "13px 13px 13px 32px", borderRadius: 12, border: "1px solid var(--border)", fontFamily: "var(--mono)", fontSize: 24, fontWeight: 700, background: "var(--bg)", boxSizing: "border-box", outline: "none" }} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {quick.map((q) => <button key={q} onClick={() => setAmt(String(q))} style={{ flex: 1, padding: "9px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)", fontFamily: "var(--mono)", fontWeight: 700, fontSize: 14, cursor: "pointer", color: "var(--ink)" }}>{q}€</button>)}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <Btn variant="ghost" onClick={onCancel} style={{ flex: 1 }}>Anulează</Btn>
        <Btn variant="primary" onClick={() => onAdd(goal.id, amt)} style={{ flex: 1.4 }}><Icon name="plus" size={16} /> Adaugă la obiectiv</Btn>
      </div>
    </div>
  );
}

function monthsUntil(deadline) {
  const now = new Date(2026, 5, 11);
  const d = new Date(deadline);
  return Math.max(0, (d.getFullYear() - now.getFullYear()) * 12 + (d.getMonth() - now.getMonth()));
}

Object.assign(window, { Budget, Goals, GoalForm, ContribForm, monthsUntil });
