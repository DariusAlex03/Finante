// ============================================================
//  BaniBine — Calculator de economii
// ============================================================
const { useState: useC, useMemo: useMC } = React;

function Calculator() {
  const [monthly, setMonthly] = useC(400);
  const [years, setYears] = useC(1);
  const [start, setStart] = useC(0);
  const [rate, setRate] = useC(2.5); // dobândă anuală %

  const result = useMC(() => {
    const months = Math.round(years * 12);
    const r = rate / 100 / 12;
    const series = [{ label: "0", deposited: start, value: start }];
    let bal = start, dep = start;
    for (let m = 1; m <= months; m++) {
      bal = bal * (1 + r) + monthly;
      dep += monthly;
      if (m % Math.max(1, Math.round(months / 24)) === 0 || m === months) {
        series.push({ label: (m / 12).toFixed(1), deposited: dep, value: bal });
      }
    }
    return { months, final: bal, deposited: dep, interest: bal - dep, series };
  }, [monthly, years, start, rate]);

  const Field = ({ label, children, hint }) => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <label style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{label}</label>
        {hint && <span style={{ fontFamily: "var(--mono)", fontSize: 15, fontWeight: 700, color: "var(--accent)" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );

  const slider = (val, set, min, max, step) => (
    <input type="range" min={min} max={max} step={step} value={val} onChange={(e) => set(parseFloat(e.target.value))} className="slider" style={{ width: "100%" }} />
  );

  // scenarii rapide
  const scenarios = [12, 24, 60].map((m) => {
    const r = rate / 100 / 12; let bal = start;
    for (let i = 0; i < m; i++) bal = bal * (1 + r) + monthly;
    return { months: m, value: bal };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHead title="Calculator de economii" subtitle="Vezi cât strângi dacă pui bani deoparte constant" />

      <div style={{ display: "grid", gridTemplateColumns: "0.85fr 1.15fr", gap: 16, alignItems: "start" }}>
        {/* Controale */}
        <Card pad={26}>
          <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
            <Field label="Cât pui pe lună" hint={fmtEUR(monthly)}>
              {slider(monthly, setMonthly, 0, 2000, 25)}
              <div style={rangeLbl}><span>0 €</span><span>2.000 €</span></div>
            </Field>
            <Field label="Pe ce perioadă" hint={`${years} ${years === 1 ? "an" : "ani"}`}>
              {slider(years, setYears, 0.5, 30, 0.5)}
              <div style={rangeLbl}><span>6 luni</span><span>30 ani</span></div>
            </Field>
            <Field label="Suma de start" hint={fmtEUR(start)}>
              {slider(start, setStart, 0, 20000, 100)}
              <div style={rangeLbl}><span>0 €</span><span>20.000 €</span></div>
            </Field>
            <Field label="Dobândă anuală (opțional)" hint={`${rate.toFixed(1)}%`}>
              {slider(rate, setRate, 0, 10, 0.1)}
              <div style={rangeLbl}><span>0%</span><span>10%</span></div>
              <p style={{ margin: "10px 0 0", fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>Pune 0% pentru economii simple, sau o rată dacă banii stau într-un depozit / investiție.</p>
            </Field>
          </div>
        </Card>

        {/* Rezultat */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card pad={26} style={{ background: "linear-gradient(135deg, var(--accent) 0%, #c8623f 100%)", border: "none", color: "#fff" }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, opacity: 0.9 }}>După {years === 1 ? "1 an" : years < 1 ? `${result.months} luni` : `${years} ani`} vei avea</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 44, fontWeight: 800, letterSpacing: "-1px", margin: "6px 0 18px" }}>{fmtEUR(result.final)}</div>
            <div style={{ display: "flex", gap: 24 }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 3 }}>Bani depuși de tine</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 18, fontWeight: 700 }}>{fmtEUR(result.deposited)}</div>
              </div>
              <div style={{ width: 1, background: "rgba(255,255,255,.3)" }} />
              <div>
                <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 3 }}>Dobândă câștigată</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 18, fontWeight: 700 }}>{fmtEUR(result.interest)}</div>
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>Creșterea în timp</h3>
              <Legend items={[["Total", "var(--accent)"]]} />
            </div>
            <AreaChart points={result.series} height={150} color="var(--accent)" />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11.5, color: "var(--muted)" }}>
              <span>acum</span><span>{years} {years === 1 ? "an" : "ani"}</span>
            </div>
          </Card>

          <Card>
            <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>Cu {fmtEUR(monthly)}/lună ai strânge</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
              {scenarios.map((s) => (
                <div key={s.months} style={{ padding: "14px", background: "var(--bg)", borderRadius: 13, textAlign: "center" }}>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 5, fontWeight: 600 }}>în {s.months / 12 < 1 ? s.months + " luni" : (s.months / 12) + (s.months / 12 === 1 ? " an" : " ani")}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>{fmtEUR(s.value)}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
const rangeLbl = { display: "flex", justifyContent: "space-between", marginTop: 7, fontSize: 11.5, color: "var(--muted)", fontFamily: "var(--mono)" };

window.Calculator = Calculator;
