// ============================================================
//  BaniBine — Împrumuturi (bani dați altora)
// ============================================================
const { useState: useL, useMemo: useML } = React;

const LOAN_COLORS = ["#d97757", "#6a8cae", "#5fa88f", "#b57bb0", "#d9a456", "#7b86c4", "#c87b8a", "#88a35e"];
function personColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return LOAN_COLORS[h % LOAN_COLORS.length];
}
function initials(name) {
  return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function Avatar({ name, size = 44 }) {
  const c = personColor(name || "?");
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: c + "22", color: c, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 800, fontSize: size * 0.36, letterSpacing: "0.5px",
    }}>{initials(name || "?")}</div>
  );
}

function Loans({ state, setState }) {
  const [adding, setAdding] = useL(false);
  const [repaying, setRepaying] = useL(null); // loan

  const loans = state.loans || [];
  const active = loans.filter((l) => l.repaid < l.amount).sort((a, b) => new Date(b.date) - new Date(a.date));
  const settled = loans.filter((l) => l.repaid >= l.amount).sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalLent = loans.reduce((s, l) => s + l.amount, 0);
  const totalRepaid = loans.reduce((s, l) => s + Math.min(l.repaid, l.amount), 0);
  const outstanding = totalLent - totalRepaid;

  const addLoan = (l) => { setState((s) => ({ ...s, loans: [l, ...(s.loans || [])] })); setAdding(false); };
  const delLoan = (id) => setState((s) => ({ ...s, loans: s.loans.filter((l) => l.id !== id) }));
  const addRepayment = (id, amount) => {
    const a = parseFloat(String(amount).replace(",", "."));
    if (!a || a <= 0) return;
    setState((s) => ({
      ...s,
      loans: s.loans.map((l) => l.id === id ? {
        ...l,
        repaid: l.repaid + a,
        history: [...(l.history || []), { id: uid(), amount: a, date: new Date(2026, 5, 11).toISOString() }],
      } : l),
    }));
    setRepaying(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHead title="Împrumuturi date" subtitle={`${active.length} active · ${settled.length} achitate`} openAdd={() => setAdding(true)} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        <StatCard label="De recuperat" value={fmtEUR(outstanding)} sub={active.length ? `de la ${[...new Set(active.map((l) => l.person))].join(", ")}` : "totul recuperat"} accent="var(--expense)" icon="arrowUp" />
        <StatCard label="Total împrumutat" value={fmtEUR(totalLent)} accent="var(--ink)" icon="wallet" />
        <StatCard label="Recuperat" value={fmtEUR(totalRepaid)} sub={totalLent ? `${Math.round((totalRepaid / totalLent) * 100)}% din total` : "—"} accent="var(--income)" icon="arrowDown" />
      </div>

      {/* Active */}
      <div>
        <SectionLabel text="Active" />
        {active.length ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: 16 }}>
            {active.map((l) => <LoanCard key={l.id} loan={l} onRepay={() => setRepaying(l)} onDelete={() => delLoan(l.id)} />)}
          </div>
        ) : <Card><Empty text="Nimeni nu-ți datorează bani. Frumos!" /></Card>}
      </div>

      {/* Achitate */}
      {settled.length > 0 && (
        <div>
          <SectionLabel text="Achitate complet" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: 16 }}>
            {settled.map((l) => <LoanCard key={l.id} loan={l} settled onDelete={() => delLoan(l.id)} />)}
          </div>
        </div>
      )}

      <Modal open={adding} onClose={() => setAdding(false)} title="Împrumut nou">
        <LoanForm onSave={addLoan} onCancel={() => setAdding(false)} />
      </Modal>

      <Modal open={!!repaying} onClose={() => setRepaying(null)} title={`${repaying?.person || ""} ți-a dat bani înapoi`} width={400}>
        {repaying && <RepayForm loan={repaying} onAdd={addRepayment} onCancel={() => setRepaying(null)} />}
      </Modal>
    </div>
  );
}

function SectionLabel({ text }) {
  return <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", margin: "4px 6px 12px" }}>{text}</div>;
}

function LoanCard({ loan, onRepay, onDelete, settled }) {
  const left = loan.amount - loan.repaid;
  const c = personColor(loan.person);
  return (
    <Card hover style={settled ? { opacity: 0.75 } : null}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 13, marginBottom: 16 }}>
        <Avatar name={loan.person} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>{loan.person}</div>
          <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>
            {fmtDate(loan.date)}{loan.note ? ` · ${loan.note}` : ""}
          </div>
        </div>
        <button onClick={onDelete} className="del-btn" title="Șterge" style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--muted)", width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="trash" size={15} />
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 9 }}>
        {settled ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "var(--income)", fontWeight: 700, fontSize: 14.5 }}>
            <Icon name="check" size={16} /> Achitat integral
          </span>
        ) : (
          <span style={{ fontFamily: "var(--mono)", fontSize: 22, fontWeight: 700, color: "var(--ink)" }}>{fmtEUR(left)}</span>
        )}
        <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--muted)" }}>
          {settled ? fmtEUR(loan.amount) : `rest din ${fmtEUR(loan.amount)}`}
        </span>
      </div>
      <Progress value={loan.repaid} max={loan.amount} color={settled ? "var(--income)" : c} height={9} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7, fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)" }}>
        <span>returnat {fmtEUR(Math.min(loan.repaid, loan.amount))}</span>
        <span>{Math.min(100, Math.round((loan.repaid / loan.amount) * 100))}%</span>
      </div>

      {(loan.history || []).length > 0 && (
        <div style={{ marginTop: 13, padding: "10px 13px", background: "var(--bg)", borderRadius: 11, display: "flex", flexDirection: "column", gap: 6 }}>
          {loan.history.slice(-3).map((h) => (
            <div key={h.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)" }}>
              <span>Plată · {fmtDate(h.date)}</span>
              <span style={{ fontFamily: "var(--mono)", fontWeight: 700, color: "var(--income)" }}>+{fmtEUR(h.amount)}</span>
            </div>
          ))}
        </div>
      )}

      {!settled && (
        <div style={{ marginTop: 14 }}>
          <Btn variant="soft" size="sm" onClick={onRepay} style={{ width: "100%" }}>
            <Icon name="arrowDown" size={15} color="var(--income)" /> A returnat bani
          </Btn>
        </div>
      )}
    </Card>
  );
}

function LoanForm({ onSave, onCancel }) {
  const [person, setPerson] = useL("");
  const [amount, setAmount] = useL("");
  const [note, setNote] = useL("");
  const [date, setDate] = useL(new Date(2026, 5, 11).toISOString().slice(0, 10));
  const lbl = { fontSize: 12.5, fontWeight: 600, color: "var(--muted)", marginBottom: 7, display: "block" };
  const inp = { width: "100%", padding: "11px 13px", borderRadius: 11, border: "1px solid var(--border)", fontSize: 15, fontFamily: "inherit", background: "var(--bg)", color: "var(--ink)", boxSizing: "border-box", outline: "none" };
  const submit = () => {
    const a = parseFloat(String(amount).replace(",", "."));
    if (!person.trim() || !a || a <= 0) return;
    onSave({ id: uid(), person: person.trim(), amount: a, repaid: 0, note: note.trim(), date: new Date(date).toISOString(), history: [] });
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div><label style={lbl}>Cui ai dat banii</label><input autoFocus value={person} onChange={(e) => setPerson(e.target.value)} placeholder="ex. Andrei" style={inp} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={lbl}>Sumă (€)</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 16 }}>€</span>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="0" inputMode="decimal" style={{ ...inp, paddingLeft: 30, fontFamily: "var(--mono)", fontWeight: 700, fontSize: 18 }} />
          </div>
        </div>
        <div><label style={lbl}>Data</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inp} /></div>
      </div>
      <div><label style={lbl}>Pentru ce (opțional)</label><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="ex. până la salariu" style={inp} /></div>
      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <Btn variant="ghost" onClick={onCancel} style={{ flex: 1 }}>Anulează</Btn>
        <Btn variant="primary" onClick={submit} style={{ flex: 1.4 }}><Icon name="check" size={17} /> Salvează</Btn>
      </div>
    </div>
  );
}

function RepayForm({ loan, onAdd, onCancel }) {
  const [amt, setAmt] = useL("");
  const left = loan.amount - loan.repaid;
  const quick = [25, 50, 100].filter((q) => q < left);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 13.5, color: "var(--muted)" }}>Mai are de returnat <b style={{ color: "var(--ink)", fontFamily: "var(--mono)" }}>{fmtEUR(left)}</b></div>
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 18 }}>€</span>
        <input autoFocus value={amt} onChange={(e) => setAmt(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onAdd(loan.id, amt)} placeholder="0" inputMode="decimal"
          style={{ width: "100%", padding: "13px 13px 13px 32px", borderRadius: 12, border: "1px solid var(--border)", fontFamily: "var(--mono)", fontSize: 24, fontWeight: 700, background: "var(--bg)", boxSizing: "border-box", outline: "none" }} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {quick.map((q) => <button key={q} onClick={() => setAmt(String(q))} style={{ flex: 1, padding: "9px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)", fontFamily: "var(--mono)", fontWeight: 700, fontSize: 14, cursor: "pointer", color: "var(--ink)" }}>{q}€</button>)}
        <button onClick={() => setAmt(String(left))} style={{ flex: 1.3, padding: "9px", borderRadius: 10, border: "1px solid var(--income)", background: "#2f9e6b14", fontWeight: 700, fontSize: 13, cursor: "pointer", color: "var(--income)", fontFamily: "inherit" }}>Tot ({fmtEUR(left)})</button>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <Btn variant="ghost" onClick={onCancel} style={{ flex: 1 }}>Anulează</Btn>
        <Btn variant="primary" onClick={() => onAdd(loan.id, amt)} style={{ flex: 1.4 }}><Icon name="check" size={16} /> Înregistrează plata</Btn>
      </div>
    </div>
  );
}

Object.assign(window, { Loans, LoanCard, LoanForm, RepayForm, Avatar, personColor });
