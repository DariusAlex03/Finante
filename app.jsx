// ============================================================
//  BaniBine — App shell (sidebar + routing + state)
// ============================================================
const { useState: useA, useEffect: useEffA } = React;

function useStore() {
  const [state, setState] = useA(loadStore);
  useEffA(() => { saveStore(state); }, [state]);
  return [state, setState];
}

const NAV = [
  { id: "panou", label: "Panou", icon: "grid" },
  { id: "tranzactii", label: "Tranzacții", icon: "list" },
  { id: "buget", label: "Buget", icon: "target" },
  { id: "obiective", label: "Obiective", icon: "flag" },
  { id: "imprumuturi", label: "Împrumuturi", icon: "coins" },
  { id: "calculator", label: "Calculator", icon: "calc" },
];

function App() {
  const [state, setState] = useStore();
  const [user, setUser] = useA(undefined); // undefined = se verifică sesiunea
  const [view, setView] = useA(() => localStorage.getItem("banibine_view") || "panou");
  const [monthKeyView, setMonthKeyView] = useA("2026-06");
  const [adding, setAdding] = useA(false);

  // gard de autentificare
  useEffA(() => {
    window.BBAuth.getUser().then((u) => {
      if (!u) { location.href = "Autentificare.html"; return; }
      setUser(u);
    });
  }, []);

  const logout = async () => {
    await window.BBAuth.signOut();
    location.href = "Autentificare.html";
  };

  useEffA(() => { localStorage.setItem("banibine_view", view); }, [view]);

  const addTx = (tx) => { setState((s) => ({ ...s, transactions: [tx, ...s.transactions].sort((a, b) => new Date(b.date) - new Date(a.date)) })); setAdding(false); };
  const delTx = (id) => setState((s) => ({ ...s, transactions: s.transactions.filter((t) => t.id !== id) }));

  const resetData = () => {
    if (!confirm("Resetezi toate datele la valorile demo?")) return;
    localStorage.removeItem("banibine_v1");
    setState(loadStore());
  };

  const balance = totalBalance(state);

  if (user === undefined) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg)", color: "var(--muted)", fontSize: 14, fontWeight: 600 }}>
        Se verifică sesiunea…
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      {/* Sidebar */}
      <aside style={{ width: 244, flexShrink: 0, background: "var(--surface)", borderRight: "1px solid var(--border)", padding: "26px 16px", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "0 10px 26px" }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="coins" size={21} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.3px", lineHeight: 1 }}>BaniBine</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>finanțele tale</div>
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV.map((n) => {
            const active = view === n.id;
            return (
              <button key={n.id} onClick={() => setView(n.id)} className="nav-item" style={{
                display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 11,
                border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14.5, fontWeight: 600, textAlign: "left",
                background: active ? "var(--accent)" : "transparent",
                color: active ? "#fff" : "var(--muted)", transition: "all .15s",
              }}>
                <Icon name={n.icon} size={19} stroke={active ? 2.2 : 2} />
                {n.label}
              </button>
            );
          })}
        </nav>

        <div style={{ marginTop: "auto" }}>
          <div style={{ padding: "16px", background: "var(--bg)", borderRadius: 15, marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, marginBottom: 5 }}>Sold total</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 22, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.5px" }}>{fmtEUR(balance)}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 11, background: "var(--bg)", marginBottom: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
              {(user.email || "?")[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</div>
              <div style={{ fontSize: 10.5, color: "var(--muted)" }}>{user.mode === "demo" ? "mod demo" : "cont Supabase"}</div>
            </div>
            <button onClick={logout} title="Deconectare" className="del-btn" style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--muted)", width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name="x" size={16} />
            </button>
          </div>
          <button onClick={resetData} className="nav-item" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, color: "var(--muted)", background: "transparent", width: "100%" }}>
            <Icon name="repeat" size={15} /> Resetează datele demo
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: "30px 38px", maxWidth: 1180, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        {view === "panou" && <Dashboard state={state} monthKeyView={monthKeyView} setMonthKeyView={setMonthKeyView} openAdd={() => setAdding(true)} goTo={setView} />}
        {view === "tranzactii" && <Transactions state={state} openAdd={() => setAdding(true)} onDelete={delTx} />}
        {view === "buget" && <Budget state={state} setState={setState} monthKeyView={monthKeyView} setMonthKeyView={setMonthKeyView} />}
        {view === "obiective" && <Goals state={state} setState={setState} />}
        {view === "imprumuturi" && <Loans state={state} setState={setState} />}
        {view === "calculator" && <Calculator />}
      </main>

      <Modal open={adding} onClose={() => setAdding(false)} title="Tranzacție nouă">
        <TxForm onSubmit={addTx} onCancel={() => setAdding(false)} />
      </Modal>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
