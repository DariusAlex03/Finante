// ============================================================
//  BaniBine — componente UI reutilizabile
// ============================================================
const { useState, useEffect, useRef, useMemo } = React;

// ---- Iconițe (linie simplă, stil minimal) ----
const ICON_PATHS = {
  food: "M5 3v8M8 3v8M6.5 11v10M5 6h3M16 3c-1.5 0-2 2-2 5s.5 4 2 4v9",
  home: "M3 11l9-7 9 7M5 10v10h14V10",
  car: "M4 13l1.5-5h13L20 13M4 13h16v5H4zM7 18v2M17 18v2M7 13.5h.01M17 13.5h.01",
  play: "M8 5v14l11-7z",
  bag: "M5 7h14l-1 14H6L5 7zM9 7a3 3 0 0 1 6 0",
  bolt: "M13 2L4 14h7l-1 8 9-12h-7z",
  heart: "M12 21C5 15 3 11 3 8a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 3-2 7-7 13z",
  repeat: "M17 2l3 3-3 3M3 11V9a4 4 0 0 1 4-4h13M7 22l-3-3 3-3M21 13v2a4 4 0 0 1-4 4H4",
  dots: "M5 12h.01M12 12h.01M19 12h.01",
  wallet: "M3 7h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7zM3 7l2-3h12M17 13h.01",
  laptop: "M4 5h16v11H4zM2 19h20l-2-3H4z",
  gift: "M20 12v9H4v-9M2 8h20v4H2zM12 8v13M12 8S10 4 7 4a2 2 0 0 0 0 4h5zM12 8s2-4 5-4a2 2 0 0 1 0 4h-5z",
  // nav
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  target: "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0",
  calc: "M5 2h14v20H5zM8 6h8M8 10h2M14 10h2M8 14h2M14 14h2M8 18h2M14 18h2",
  chart: "M3 3v18h18M7 14l3-4 3 3 5-6",
  // ui
  plus: "M12 5v14M5 12h14",
  trash: "M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 14h10l1-14",
  x: "M6 6l12 12M18 6L6 18",
  arrowUp: "M12 19V5M5 12l7-7 7 7",
  arrowDown: "M12 5v14M5 12l7 7 7-7",
  chevL: "M15 6l-6 6 6 6",
  chevR: "M9 6l6 6-6 6",
  check: "M5 13l4 4L19 7",
  edit: "M4 20h4L18 10l-4-4L4 16v4zM14 6l4 4",
  coins: "M9 9m-6 0a6 3 0 1 0 12 0a6 3 0 1 0-12 0M3 9v5c0 1.7 2.7 3 6 3M21 12v5c0 1.7-2.7 3-6 3M15 6m-6 0a6 3 0 1 0 12 0a6 3 0 1 0-12 0",
  flag: "M5 21V4M5 4c3-2 7 2 10 0v9c-3 2-7-2-10 0",
  trend: "M3 17l6-6 4 4 8-8M21 7h-5M21 7v5",
};

function Icon({ name, size = 18, stroke = 2, color = "currentColor", style }) {
  const filled = name === "play";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : "none"}
         stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
         style={{ flexShrink: 0, ...style }}>
      <path d={ICON_PATHS[name] || ICON_PATHS.dots} />
    </svg>
  );
}

// ---- Badge categorie (cerc colorat cu iconiță) ----
function CatBadge({ cat, size = 40 }) {
  const c = typeof cat === "string" ? catById(cat) : cat;
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.32,
      background: c.color + "22", color: c.color,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <Icon name={c.icon} size={size * 0.5} stroke={2} color={c.color} />
    </div>
  );
}

// ---- Donut chart (SVG, segmente prin stroke-dasharray) ----
function Donut({ data, size = 200, thickness = 26, centerLabel, centerSub }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#efeae3" strokeWidth={thickness} />
        {data.map((d, i) => {
          const frac = d.value / total;
          const len = frac * c;
          const el = (
            <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={d.color} strokeWidth={thickness}
              strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset}
              strokeLinecap="butt" style={{ transition: "stroke-dasharray .5s ease" }} />
          );
          offset += len;
          return el;
        })}
      </svg>
      {centerLabel !== undefined && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", textAlign: "center",
        }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: size * 0.13, fontWeight: 700, color: "var(--ink)", lineHeight: 1 }}>{centerLabel}</div>
          {centerSub && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{centerSub}</div>}
        </div>
      )}
    </div>
  );
}

// ---- Bar chart venituri vs cheltuieli (lunar) ----
function MonthlyBars({ series, height = 180 }) {
  const max = Math.max(...series.flatMap((s) => [s.income, s.expense]), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 0, height: height + 24, width: "100%" }}>
      {series.map((s, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height, width: "100%", justifyContent: "center" }}>
            <div title={`Venit: ${fmtEUR(s.income)}`} style={{
              width: "32%", maxWidth: 16, height: `${(s.income / max) * 100}%`, minHeight: 3,
              background: "var(--income)", borderRadius: "4px 4px 0 0", transition: "height .5s ease",
            }} />
            <div title={`Cheltuieli: ${fmtEUR(s.expense)}`} style={{
              width: "32%", maxWidth: 16, height: `${(s.expense / max) * 100}%`, minHeight: 3,
              background: "var(--expense)", borderRadius: "4px 4px 0 0", transition: "height .5s ease",
            }} />
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ---- Area chart (evoluție economii) ----
function AreaChart({ points, width = 600, height = 160, color = "var(--accent)" }) {
  const max = Math.max(...points.map((p) => p.value), 1);
  const min = Math.min(...points.map((p) => p.value), 0);
  const range = max - min || 1;
  const stepX = width / (points.length - 1 || 1);
  const coords = points.map((p, i) => [i * stepX, height - ((p.value - min) / range) * (height - 20) - 10]);
  const line = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c[0].toFixed(1)},${c[1].toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  const id = "grad" + Math.round(Math.random() * 1e6);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      {coords.map((c, i) => (
        <circle key={i} cx={c[0]} cy={c[1]} r="3" fill="#fff" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}

// ---- Progress bar ----
function Progress({ value, max, color = "var(--accent)", height = 8, bg = "#efeae3" }) {
  const pct = Math.min(100, (value / (max || 1)) * 100);
  return (
    <div style={{ width: "100%", height, background: bg, borderRadius: 99, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99, transition: "width .5s ease" }} />
    </div>
  );
}

// ---- Card container ----
function Card({ children, style, pad = 22, onClick, hover }) {
  const [h, setH] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: "var(--surface)", borderRadius: 18, padding: pad,
        border: "1px solid var(--border)",
        boxShadow: h && hover ? "0 8px 28px rgba(40,30,20,.08)" : "0 1px 2px rgba(40,30,20,.04)",
        transition: "box-shadow .2s ease, transform .2s ease",
        transform: h && hover ? "translateY(-2px)" : "none",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}>
      {children}
    </div>
  );
}

// ---- Modal ----
function Modal({ open, onClose, children, title, width = 460 }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(30,22,15,.38)", backdropFilter: "blur(3px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20,
      animation: "fadeIn .15s ease",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "var(--surface)", borderRadius: 22, width: "100%", maxWidth: width,
        boxShadow: "0 24px 60px rgba(30,22,15,.28)", animation: "popIn .2s ease", maxHeight: "90vh", overflowY: "auto",
      }}>
        {title && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 0" }}>
            <h3 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: "var(--ink)" }}>{title}</h3>
            <button onClick={onClose} className="icon-btn" style={{ border: "none", background: "var(--bg)", width: 34, height: 34, borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
              <Icon name="x" size={18} />
            </button>
          </div>
        )}
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

// ---- Buton principal ----
function Btn({ children, onClick, variant = "primary", size = "md", style, type = "button", disabled }) {
  const [h, setH] = useState(false);
  const base = {
    border: "none", borderRadius: 12, cursor: disabled ? "not-allowed" : "pointer", fontWeight: 600,
    fontFamily: "inherit", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    transition: "all .15s ease", opacity: disabled ? 0.5 : 1,
    padding: size === "sm" ? "8px 14px" : "11px 20px", fontSize: size === "sm" ? 13 : 14.5,
  };
  const variants = {
    primary: { background: h ? "var(--accent-dark)" : "var(--accent)", color: "#fff" },
    ghost: { background: h ? "var(--bg)" : "transparent", color: "var(--ink)", border: "1px solid var(--border)" },
    soft: { background: h ? "#efeae3" : "var(--bg)", color: "var(--ink)" },
    danger: { background: h ? "#c9534c" : "transparent", color: h ? "#fff" : "var(--expense)", border: "1px solid " + (h ? "#c9534c" : "#e6d3d0") },
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

Object.assign(window, { Icon, CatBadge, Donut, MonthlyBars, AreaChart, Progress, Card, Modal, Btn });
