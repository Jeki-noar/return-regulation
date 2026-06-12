import { useState } from "react";

// ─── APPROVAL CONFIG ────────────────────────────────────────────────────────
const APPROVERS = {
  salesLeads: [
    { name: "Nurwahid",    role: "FMCG/PRINCIPLE(KOPI KENANGAN, MAMASUKA)",  avatar: "NW" },
    { name: "Wilona",      role: "PRINCIPLE(BELFOOD)",  avatar: "WL" },
    { name: "Fajar Sidiq", role: "FRESH",  avatar: "FS" },
  ],
  opsLeads: [
    { name: "Stainly", role: "Ops Lead", avatar: "ST" },
  ],
  bi: [
    { name: "Jeki", role: "BI", avatar: "JK" },
  ],
};

// ─── FLOW STEPS ─────────────────────────────────────────────────────────────
const STEPS = {
  start: {
    id: "start", type: "start",
    title: "Return Request",
    subtitle: "Sales/Admin submits a return request",
    next: "submit",
  },
  submit: {
    id: "submit", type: "approval",
    color: "blue",
    title: "Level 1 — Sales/Admin Request",
    subtitle: "Sales/Admin fills & submits the regulation form",
    link: "https://bit.ly/Pengajuankendala",
    approvers: [],
    role: "Admin",
    next: "approvalSales",
  },
  approvalSales: {
    id: "approvalSales", type: "approval",
    color: "indigo",
    title: "Level 2 — Sales Lead Approval",
    subtitle: "Needs approval from Sales Leads",
    approvers: APPROVERS.salesLeads,
    next: "approvalOps",
  },
  approvalOps: {
    id: "approvalOps", type: "approval",
    color: "purple",
    title: "Level 3 — Ops Lead Approval",
    subtitle: "Needs approval from Ops Lead",
    approvers: APPROVERS.opsLeads,
    next: "dayCheck",
  },
  dayCheck: {
    id: "dayCheck", type: "decision",
    title: "Days since delivery?",
    subtitle: "Count from delivery date",
    yes: { label: "≤ +1 days", next: "logisticsCheck" },
    no:  { label: "> +1 days", next: "productCheck" },
  },
  productCheck: {
    id: "productCheck", type: "decision",
    title: "Is the product Indomie?",
    subtitle: "Check product type",
    yes: { label: "Yes — Indomie", next: "indomieEligible" },
    no:  { label: "No — other product", next: "rejected" },
  },
  indomieEligible: {
    id: "indomieEligible", type: "action", color: "teal",
    title: "Eligible (swap only)",
    subtitle: "Indomie: replace with new product",
    next: "exceedCheck",
  },
  rejected: {
    id: "rejected", type: "end", color: "red",
    title: "Return Rejected",
    subtitle: "Non-Indomie products not eligible after 1 days",
  },
  logisticsCheck: {
    id: "logisticsCheck", type: "decision",
    title: "New purchase from this store?",
    subtitle: "Logistics can only process if a new order exists",
    yes: { label: "Yes — new purchase exists", next: "exceedCheck" },
    no:  { label: "No — no recent purchase",   next: "onHold" },
  },
  onHold: {
    id: "onHold", type: "end", color: "amber",
    title: "On Hold",
    subtitle: "Await new purchase from store, then resubmit",
  },
  exceedCheck: {
    id: "exceedCheck", type: "decision",
    title: "Return exceeds requirements?",
    subtitle: "Quantity, value, or frequency beyond policy limits",
    yes: { label: "Yes — exceeds limits", next: "approvalBI" },
    no:  { label: "No — within limits",   next: "processed" },
  },
  approvalBI: {
    id: "approvalBI", type: "approval",
    color: "rose",
    title: "Level 4 — BI Approval",
    subtitle: "Required when return exceeds policy requirements",
    approvers: APPROVERS.bi,
    next: "processed",
  },
  processed: {
    id: "processed", type: "end", color: "green",
    title: "Return Processed",
    subtitle: "Logistics handles pickup or product swap",
  },
};

// ─── COLORS ──────────────────────────────────────────────────────────────────
const COLOR_MAP = {
  blue:   { bg: "#EBF4FF", border: "#93C5FD", text: "#1E40AF", sub: "#3B82F6", badge: "#DBEAFE" },
  indigo: { bg: "#EEF2FF", border: "#A5B4FC", text: "#3730A3", sub: "#6366F1", badge: "#E0E7FF" },
  purple: { bg: "#F5F3FF", border: "#C4B5FD", text: "#4C1D95", sub: "#7C3AED", badge: "#EDE9FE" },
  rose:   { bg: "#FFF1F2", border: "#FDA4AF", text: "#9F1239", sub: "#E11D48", badge: "#FFE4E6" },
  teal:   { bg: "#ECFDF5", border: "#6EE7B7", text: "#065F46", sub: "#059669", badge: "#D1FAE5" },
  red:    { bg: "#FEF2F2", border: "#FCA5A5", text: "#991B1B", sub: "#EF4444", badge: "#FEE2E2" },
  amber:  { bg: "#FFFBEB", border: "#FCD34D", text: "#92400E", sub: "#D97706", badge: "#FEF3C7" },
  green:  { bg: "#F0FDF4", border: "#86EFAC", text: "#14532D", sub: "#16A34A", badge: "#DCFCE7" },
  gray:   { bg: "#F9FAFB", border: "#D1D5DB", text: "#374151", sub: "#6B7280", badge: "#F3F4F6" },
};

function getColor(step) {
  if (step.color) return COLOR_MAP[step.color] || COLOR_MAP.gray;
  if (step.type === "start")    return COLOR_MAP.gray;
  if (step.type === "decision") return COLOR_MAP.purple;
  if (step.type === "approval") return COLOR_MAP.indigo;
  return COLOR_MAP.blue;
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
function ArrowDown() {
  return (
    <div style={{ display: "flex", justifyContent: "center", margin: "4px 0" }}>
      <svg width="20" height="24" viewBox="0 0 20 24">
        <line x1="10" y1="0" x2="10" y2="18" stroke="#9CA3AF" strokeWidth="1.5"/>
        <path d="M4 13 L10 20 L16 13" fill="none" stroke="#9CA3AF" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

function Avatar({ initials, color }) {
  return (
    <div style={{
      width: 32, height: 32, borderRadius: "50%",
      background: color.sub, color: "#fff",
      fontSize: 11, fontWeight: 700,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, letterSpacing: "0.03em",
    }}>
      {initials}
    </div>
  );
}

function ApprovalCard({ step, onApprove }) {
  const c = getColor(step);
  const [approved, setApproved] = useState({});

  const approvers = step.approvers || [];
  const allApproved = approvers.length === 0 || approvers.every(a => approved[a.name]);

  function toggle(name) {
    setApproved(prev => ({ ...prev, [name]: !prev[name] }));
  }

  return (
    <div style={{
      background: c.bg, border: `1.5px solid ${c.border}`,
      borderRadius: 12, padding: "14px 16px",
      maxWidth: 340, margin: "0 auto", width: "100%",
      boxSizing: "border-box",
      boxShadow: `0 0 0 3px ${c.border}44`,
    }}>
      {/* Level badge */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        background: c.badge, color: c.text,
        fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
        padding: "3px 10px", borderRadius: 99, marginBottom: 10,
        textTransform: "uppercase",
      }}>
        <span>✦</span> {step.title}
      </div>

      <div style={{ fontSize: 12, color: c.sub, marginBottom: approvers.length ? 12 : 0 }}>
        {step.link
          ? <>{step.subtitle} — <a href={step.link} target="_blank" rel="noreferrer"
              style={{ color: c.sub }}>Open form ↗</a></>
          : step.subtitle}
      </div>

      {/* Approver list */}
      {approvers.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          {approvers.map(a => (
            <div key={a.name}
              onClick={() => toggle(a.name)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px",
                background: approved[a.name] ? c.bg : "#fff",
                border: `1.5px solid ${approved[a.name] ? c.border : "#E5E7EB"}`,
                borderRadius: 8, cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <Avatar initials={a.avatar} color={c} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{a.name}</div>
                <div style={{ fontSize: 11, color: "#6B7280" }}>{a.role}</div>
              </div>
              <div style={{
                width: 22, height: 22, borderRadius: "50%",
                background: approved[a.name] ? c.sub : "#F3F4F6",
                border: `1.5px solid ${approved[a.name] ? c.sub : "#D1D5DB"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, color: "#fff", fontWeight: 700,
                transition: "all 0.15s",
              }}>
                {approved[a.name] ? "✓" : ""}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onApprove}
        disabled={!allApproved}
        style={{
          width: "100%", padding: "10px",
          background: allApproved ? c.sub : "#E5E7EB",
          color: allApproved ? "#fff" : "#9CA3AF",
          border: "none", borderRadius: 8,
          fontSize: 13, fontWeight: 600,
          cursor: allApproved ? "pointer" : "not-allowed",
          transition: "all 0.2s",
        }}
      >
        {approvers.length > 0 && !allApproved
          ? `Waiting for approval (${Object.values(approved).filter(Boolean).length}/${approvers.length})`
          : "Approved — Continue →"}
      </button>
    </div>
  );
}

function DecisionBranch({ step, onChoose }) {
  return (
    <div style={{ width: "100%", maxWidth: 340, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
        <button
          onClick={() => onChoose(step.yes.next)}
          style={{
            flex: 1, padding: "9px 12px",
            background: "#ECFDF5", border: "1.5px solid #6EE7B7",
            borderRadius: 8, cursor: "pointer",
            fontSize: 12, fontWeight: 600, color: "#065F46",
          }}
          onMouseOver={e => e.currentTarget.style.background = "#D1FAE5"}
          onMouseOut={e => e.currentTarget.style.background = "#ECFDF5"}
        >
          ✓ {step.yes.label}
        </button>
        <button
          onClick={() => onChoose(step.no.next)}
          style={{
            flex: 1, padding: "9px 12px",
            background: "#FEF2F2", border: "1.5px solid #FCA5A5",
            borderRadius: 8, cursor: "pointer",
            fontSize: 12, fontWeight: 600, color: "#991B1B",
          }}
          onMouseOver={e => e.currentTarget.style.background = "#FEE2E2"}
          onMouseOut={e => e.currentTarget.style.background = "#FEF2F2"}
        >
          ✗ {step.no.label}
        </button>
      </div>
    </div>
  );
}

function StepNode({ step, isActive }) {
  const c = getColor(step);
  const isTerminal = step.type === "end" || step.type === "start";
  const isDecision = step.type === "decision";
  return (
    <div style={{
      background: isActive ? c.bg : "#fff",
      border: `1.5px solid ${isActive ? c.border : "#E5E7EB"}`,
      borderRadius: isTerminal ? 999 : isDecision ? 12 : 10,
      padding: "12px 20px",
      boxShadow: isActive ? `0 0 0 3px ${c.border}55` : "none",
      maxWidth: 340, margin: "0 auto", width: "100%",
      boxSizing: "border-box", textAlign: "center",
    }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: c.text }}>{step.title}</div>
      {step.subtitle && <div style={{ fontSize: 12, color: c.sub, marginTop: 3 }}>{step.subtitle}</div>}
    </div>
  );
}

function ProgressBar({ history }) {
  const total = Object.keys(STEPS).length;
  const pct = Math.min((history.length / total) * 100, 100);
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9CA3AF", marginBottom: 4 }}>
        <span>Progress</span><span>Step {history.length} of ~{total}</span>
      </div>
      <div style={{ height: 4, background: "#F3F4F6", borderRadius: 99 }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: "linear-gradient(90deg, #6366F1, #059669)",
          borderRadius: 99, transition: "width 0.3s",
        }}/>
      </div>
    </div>
  );
}

function Breadcrumb({ history, onJump }) {
  if (history.length <= 1) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 16, alignItems: "center" }}>
      {history.map((id, i) => {
        const s = STEPS[id];
        const c = getColor(s);
        const isLast = i === history.length - 1;
        return (
          <span key={id + i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span
              onClick={() => !isLast && onJump(i)}
              style={{
                fontSize: 10, padding: "2px 7px",
                background: isLast ? c.bg : "#F9FAFB",
                color: isLast ? c.text : "#6B7280",
                border: `1px solid ${isLast ? c.border : "#E5E7EB"}`,
                borderRadius: 99, cursor: isLast ? "default" : "pointer",
                fontWeight: isLast ? 700 : 400,
              }}
            >{s.title}</span>
            {!isLast && <span style={{ color: "#D1D5DB", fontSize: 10 }}>›</span>}
          </span>
        );
      })}
    </div>
  );
}

// Approval level tracker sidebar
function ApprovalLevels({ history }) {
  const levels = [
    { id: "submit",       label: "L1 Sales/Admin",      color: COLOR_MAP.blue },
    { id: "approvalSales",label: "L2 Sales Lead",  color: COLOR_MAP.indigo },
    { id: "approvalOps",  label: "L3 Ops Lead",    color: COLOR_MAP.purple },
    { id: "approvalBI",   label: "L4 BI",          color: COLOR_MAP.rose },
  ];
  return (
    <div style={{
      display: "flex", gap: 6, marginBottom: 20,
      justifyContent: "center", flexWrap: "wrap",
    }}>
      {levels.map(l => {
        const done = history.includes(l.id);
        const active = history[history.length - 1] === l.id;
        return (
          <div key={l.id} style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "4px 10px",
            background: done ? l.color.bg : "#F9FAFB",
            border: `1px solid ${done ? l.color.border : "#E5E7EB"}`,
            borderRadius: 99, fontSize: 11, fontWeight: active ? 700 : 500,
            color: done ? l.color.text : "#9CA3AF",
            boxShadow: active ? `0 0 0 2px ${l.color.border}` : "none",
          }}>
            <span>{done ? "✓" : "○"}</span>
            {l.label}
          </div>
        );
      })}
    </div>
  );
}

// ─── BACK BUTTON ─────────────────────────────────────────────────────────────
function BackButton({ onBack }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ maxWidth: 340, margin: "12px auto 0", width: "100%" }}>
      <button
        onClick={onBack}
        onMouseOver={() => setHovered(true)}
        onMouseOut={() => setHovered(false)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px 14px",
          background: hovered ? "#F3F4F6" : "#fff",
          border: "1.5px solid #E5E7EB",
          borderRadius: 8, cursor: "pointer",
          fontSize: 12, fontWeight: 600, color: "#6B7280",
          transition: "all 0.15s",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2L4 7L9 12" stroke="#6B7280" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back
      </button>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function ReturnRegulationApp() {
  const [history, setHistory] = useState(["start"]);
  const currentId = history[history.length - 1];
  const current = STEPS[currentId];

  function advance(nextId) { setHistory(h => [...h, nextId]); }
  function jumpTo(i)       { setHistory(h => h.slice(0, i + 1)); }
  function goBack()        { setHistory(h => h.length > 1 ? h.slice(0, -1) : h); }
  function reset()         { setHistory(["start"]); }

  const isDone  = current.type === "end";
  const isStart = current.type === "start";
  const canGoBack = history.length > 1;

  const endMeta = {
    green: { icon: "✓", iconBg: "#16A34A" },
    red:   { icon: "✗", iconBg: "#EF4444" },
    amber: { icon: "⏸", iconBg: "#D97706" },
  };

  return (
    <div style={{
      fontFamily: "'Inter','Segoe UI',sans-serif",
      maxWidth: 420, margin: "0 auto",
      padding: "24px 16px", minHeight: 400,
    }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#6366F1", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
          Treedots
        </div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827" }}>
          Return Item Regulation
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6B7280" }}>
          4-level approval flow
        </p>
      </div>

      <ApprovalLevels history={history} />
      <ProgressBar history={history} />
      <Breadcrumb history={history} onJump={jumpTo} />

      {/* Current step rendering */}
      {current.type === "approval" && (
        <>
          <ApprovalCard step={current} onApprove={() => advance(current.next)} />
          {canGoBack && <BackButton onBack={goBack} />}
        </>
      )}

      {current.type === "decision" && (
        <>
          <StepNode step={current} isActive />
          <ArrowDown />
          <DecisionBranch step={current} onChoose={advance} />
          {canGoBack && <BackButton onBack={goBack} />}
        </>
      )}

      {current.type === "action" && (
        <>
          <StepNode step={current} isActive />
          <ArrowDown />
          <button onClick={() => advance(current.next)} style={{
            display: "block", width: "100%", maxWidth: 340, margin: "0 auto",
            padding: "11px 20px", background: "#059669", color: "#fff",
            border: "none", borderRadius: 8, cursor: "pointer",
            fontSize: 13, fontWeight: 600,
          }}>Continue →</button>
          {canGoBack && <BackButton onBack={goBack} />}
        </>
      )}

      {isStart && (
        <>
          <StepNode step={current} isActive />
          <ArrowDown />
          <button onClick={() => advance(STEPS.start.next)} style={{
            display: "block", width: "100%", maxWidth: 340, margin: "0 auto",
            padding: "11px 20px", background: "#111827", color: "#fff",
            border: "none", borderRadius: 8, cursor: "pointer",
            fontSize: 13, fontWeight: 600,
          }}>Start process →</button>
        </>
      )}

      {isDone && (() => {
        const c = getColor(current);
        const m = endMeta[current.color] || { icon: "✓", iconBg: "#6B7280" };
        return (
          <>
            <div style={{
              marginTop: 8, padding: "20px", textAlign: "center",
              background: c.bg, border: `1.5px solid ${c.border}`, borderRadius: 12,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: m.iconBg, color: "#fff",
                fontSize: 20, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 12px",
              }}>{m.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 4 }}>{current.title}</div>
              <div style={{ fontSize: 13, color: "#6B7280" }}>{current.subtitle}</div>
            </div>
            {canGoBack && <BackButton onBack={goBack} />}
          </>
        );
      })()}

      {history.length > 1 && (
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button onClick={reset} style={{
            background: "none", border: "none",
            color: "#9CA3AF", fontSize: 12, cursor: "pointer", textDecoration: "underline",
          }}>← Start over</button>
        </div>
      )}

      {/* Legend */}
      <div style={{
        marginTop: 28, padding: "14px 16px",
        background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 10,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Approval levels
        </div>
        {[
          { color: COLOR_MAP.blue,   label: "L1 Admin",     desc: "Submit via bit.ly/Pengajuankendala" },
          { color: COLOR_MAP.indigo, label: "L2 Sales Lead", desc: "Nurwahid · Wilona · Fajar Sidiq" },
          { color: COLOR_MAP.purple, label: "L3 Ops Lead",   desc: "Stainly" },
          { color: COLOR_MAP.rose,   label: "L4 BI",         desc: "Jeki — only if return exceeds requirements" },
        ].map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 7 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: r.color.sub, marginTop: 4, flexShrink: 0 }}/>
            <div>
              <span style={{ fontSize: 12, fontWeight: 600, color: r.color.text }}>{r.label} </span>
              <span style={{ fontSize: 12, color: "#6B7280" }}>{r.desc}</span>
            </div>
          </div>
        ))}

        {/* Divider */}
        <div style={{ borderTop: "1px solid #E5E7EB", margin: "12px 0" }} />

        {/* Note section */}
        <div style={{
          background: "#FFFBEB",
          border: "1px solid #FCD34D",
          borderLeft: "4px solid #F59E0B",
          borderRadius: 8,
          padding: "12px 14px",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            marginBottom: 8,
          }}>
            <span style={{ fontSize: 14 }}>📋</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#92400E", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Important Note
            </span>
          </div>

          {/* Note item 1 */}
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "#D97706", flexShrink: 0, marginTop: 1 }}>①</span>
            <p style={{ margin: 0, fontSize: 12, color: "#78350F", lineHeight: 1.6 }}>
              Return service may process a maximum of <strong>3 days</strong>. If the customer does not make a new purchase, the sales representative must collect the items the customer wishes to return and send them directly back to the warehouse.
            </p>
          </div>

          {/* Note item 2 */}
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#D97706", flexShrink: 0, marginTop: 1 }}>②</span>
            <p style={{ margin: 0, fontSize: 12, color: "#78350F", lineHeight: 1.6 }}>
              All information is available in the Google Chat channel titled{" "}
              <strong style={{ color: "#92400E" }}>"Escalation Issue"</strong>,
              including approval and issue resolution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}