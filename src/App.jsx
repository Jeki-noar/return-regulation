import { useState } from "react";

const STEPS = {
  start: {
    id: "start",
    type: "start",
    title: "Return Request",
    subtitle: "Customer wants to return an item",
    next: "submit",
  },
  submit: {
    id: "submit",
    type: "action",
    title: "Submit Regulation Form",
    subtitle: "via bit.ly/Pengajuankendal",
    link: "https://bit.ly/Pengajuankendal",
    next: "dayCheck",
  },
  dayCheck: {
    id: "dayCheck",
    type: "decision",
    title: "Days since delivery?",
    subtitle: "Count from delivery date",
    yes: { label: "≤ 3 days", next: "logisticsCheck" },
    no: { label: "> 3 days", next: "productCheck" },
  },
  productCheck: {
    id: "productCheck",
    type: "decision",
    title: "Is the product Indomie?",
    subtitle: "Check product type",
    yes: { label: "Yes — Indomie", next: "indomieEligible" },
    no: { label: "No — other product", next: "rejected" },
  },
  indomieEligible: {
    id: "indomieEligible",
    type: "action",
    color: "teal",
    title: "Eligible (swap only)",
    subtitle: "Indomie: replace with new product",
    next: "logisticsCheck",
  },
  rejected: {
    id: "rejected",
    type: "end",
    color: "red",
    title: "Return Rejected",
    subtitle: "Non-Indomie products not eligible after 3 days",
  },
  logisticsCheck: {
    id: "logisticsCheck",
    type: "decision",
    title: "New purchase from this store?",
    subtitle: "Logistics can only process if a new order exists",
    yes: { label: "Yes — new purchase exists", next: "processed" },
    no: { label: "No — no recent purchase", next: "onHold" },
  },
  onHold: {
    id: "onHold",
    type: "end",
    color: "amber",
    title: "On Hold",
    subtitle: "Await new purchase from store, then resubmit",
  },
  processed: {
    id: "processed",
    type: "end",
    color: "green",
    title: "Return Processed",
    subtitle: "Logistics handles pickup or product swap",
  },
};

const COLOR_MAP = {
  blue:   { bg: "#EBF4FF", border: "#93C5FD", text: "#1E40AF", sub: "#3B82F6" },
  teal:   { bg: "#ECFDF5", border: "#6EE7B7", text: "#065F46", sub: "#059669" },
  red:    { bg: "#FEF2F2", border: "#FCA5A5", text: "#991B1B", sub: "#EF4444" },
  amber:  { bg: "#FFFBEB", border: "#FCD34D", text: "#92400E", sub: "#D97706" },
  green:  { bg: "#F0FDF4", border: "#86EFAC", text: "#14532D", sub: "#16A34A" },
  purple: { bg: "#F5F3FF", border: "#C4B5FD", text: "#4C1D95", sub: "#7C3AED" },
  gray:   { bg: "#F9FAFB", border: "#D1D5DB", text: "#374151", sub: "#6B7280" },
};

function getColor(step) {
  if (step.color) return COLOR_MAP[step.color];
  if (step.type === "start") return COLOR_MAP.gray;
  if (step.type === "decision") return COLOR_MAP.purple;
  if (step.type === "end") return COLOR_MAP.gray;
  return COLOR_MAP.blue;
}

function ArrowDown() {
  return (
    <div style={{ display: "flex", justifyContent: "center", margin: "4px 0" }}>
      <svg width="20" height="24" viewBox="0 0 20 24">
        <line x1="10" y1="0" x2="10" y2="18" stroke="#9CA3AF" strokeWidth="1.5" />
        <path d="M4 13 L10 20 L16 13" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function StepNode({ step, isActive, onClick }) {
  const c = getColor(step);
  const isDecision = step.type === "decision";
  const isTerminal = step.type === "end" || step.type === "start";

  return (
    <div
      onClick={() => !isTerminal && onClick && onClick(step)}
      style={{
        background: isActive ? c.bg : "#fff",
        border: `1.5px solid ${isActive ? c.border : "#E5E7EB"}`,
        borderRadius: isTerminal ? 999 : isDecision ? 12 : 10,
        padding: isDecision ? "14px 20px" : "12px 20px",
        cursor: isTerminal ? "default" : "pointer",
        transition: "all 0.2s",
        boxShadow: isActive ? `0 0 0 3px ${c.border}55` : "none",
        position: "relative",
        width: "100%",
        maxWidth: 340,
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {isDecision && (
        <div style={{
          position: "absolute", top: -1, left: -1,
          width: 8, height: 8, borderRadius: "50%",
          background: c.sub, border: `2px solid ${c.border}`,
        }} />
      )}
      <div style={{
        fontSize: 14, fontWeight: 600,
        color: c.text, lineHeight: 1.4,
        textAlign: "center",
      }}>
        {step.title}
      </div>
      {step.subtitle && (
        <div style={{
          fontSize: 12, color: c.sub,
          textAlign: "center", marginTop: 3,
          lineHeight: 1.3,
        }}>
          {step.link
            ? <a href={step.link} target="_blank" rel="noreferrer" style={{ color: c.sub, textDecoration: "underline" }} onClick={e => e.stopPropagation()}>{step.subtitle}</a>
            : step.subtitle}
        </div>
      )}
    </div>
  );
}

function DecisionBranch({ step, onChoose }) {
  return (
    <div style={{ width: "100%", maxWidth: 340, margin: "0 auto" }}>
      <div style={{
        display: "flex", gap: 10, marginTop: 6,
      }}>
        <button
          onClick={() => onChoose(step.yes.next)}
          style={{
            flex: 1, padding: "9px 12px",
            background: "#ECFDF5", border: "1.5px solid #6EE7B7",
            borderRadius: 8, cursor: "pointer",
            fontSize: 12, fontWeight: 600, color: "#065F46",
            transition: "background 0.15s",
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
            transition: "background 0.15s",
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

function ProgressBar({ history }) {
  const total = 5;
  const pct = Math.min((history.length / total) * 100, 100);
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 11, color: "#9CA3AF" }}>
        <span>Progress</span>
        <span>Step {history.length}</span>
      </div>
      <div style={{ height: 4, background: "#F3F4F6", borderRadius: 99 }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: "linear-gradient(90deg, #7C3AED, #059669)",
          borderRadius: 99, transition: "width 0.3s",
        }} />
      </div>
    </div>
  );
}

function HistoryBreadcrumb({ history, onJump }) {
  if (history.length <= 1) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 16, alignItems: "center" }}>
      {history.map((id, i) => {
        const s = STEPS[id];
        const c = getColor(s);
        const isLast = i === history.length - 1;
        return (
          <span key={id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span
              onClick={() => !isLast && onJump(i)}
              style={{
                fontSize: 11, padding: "2px 8px",
                background: isLast ? c.bg : "#F9FAFB",
                color: isLast ? c.text : "#6B7280",
                border: `1px solid ${isLast ? c.border : "#E5E7EB"}`,
                borderRadius: 99, cursor: isLast ? "default" : "pointer",
                fontWeight: isLast ? 600 : 400,
              }}
            >
              {s.title}
            </span>
            {!isLast && <span style={{ color: "#D1D5DB", fontSize: 11 }}>›</span>}
          </span>
        );
      })}
    </div>
  );
}

export default function ReturnRegulationApp() {
  const [history, setHistory] = useState(["start"]);
  const currentId = history[history.length - 1];
  const current = STEPS[currentId];

  function advance(nextId) {
    setHistory(h => [...h, nextId]);
  }

  function jumpTo(index) {
    setHistory(h => h.slice(0, index + 1));
  }

  function reset() {
    setHistory(["start"]);
  }

  const isDone = current.type === "end";
  const isStart = current.type === "start";

  const endColors = {
    green: { bg: "#F0FDF4", border: "#86EFAC", icon: "✓", iconBg: "#16A34A" },
    red:   { bg: "#FEF2F2", border: "#FCA5A5", icon: "✗", iconBg: "#EF4444" },
    amber: { bg: "#FFFBEB", border: "#FCD34D", icon: "⏸", iconBg: "#D97706" },
  };

  return (
    <div style={{
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      maxWidth: 420,
      margin: "0 auto",
      padding: "24px 16px",
      minHeight: 400,
    }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#7C3AED", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
          Treedots
        </div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827" }}>
          Return Item Regulation
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6B7280" }}>
          Follow the steps to check return eligibility
        </p>
      </div>

      <ProgressBar history={history} />
      <HistoryBreadcrumb history={history} onJump={jumpTo} />

      {/* Current step */}
      <div style={{ marginBottom: 8 }}>
        <StepNode step={current} isActive={true} />
      </div>

      {/* Decision buttons */}
      {current.type === "decision" && (
        <>
          <ArrowDown />
          <DecisionBranch step={current} onChoose={advance} />
        </>
      )}

      {/* Action: auto-advance */}
      {current.type === "action" && current.next && (
        <>
          <ArrowDown />
          <button
            onClick={() => advance(current.next)}
            style={{
              display: "block", width: "100%", maxWidth: 340, margin: "0 auto",
              padding: "11px 20px",
              background: "#7C3AED", color: "#fff",
              border: "none", borderRadius: 8, cursor: "pointer",
              fontSize: 13, fontWeight: 600,
              transition: "background 0.15s",
            }}
            onMouseOver={e => e.currentTarget.style.background = "#6D28D9"}
            onMouseOut={e => e.currentTarget.style.background = "#7C3AED"}
          >
            Continue →
          </button>
        </>
      )}

      {/* Start node */}
      {isStart && (
        <>
          <ArrowDown />
          <button
            onClick={() => advance(STEPS.start.next)}
            style={{
              display: "block", width: "100%", maxWidth: 340, margin: "0 auto",
              padding: "11px 20px",
              background: "#111827", color: "#fff",
              border: "none", borderRadius: 8, cursor: "pointer",
              fontSize: 13, fontWeight: 600,
            }}
          >
            Start process →
          </button>
        </>
      )}

      {/* End state result */}
      {isDone && (
        <div style={{
          marginTop: 20, padding: "16px 20px",
          background: endColors[current.color]?.bg || "#F9FAFB",
          border: `1.5px solid ${endColors[current.color]?.border || "#D1D5DB"}`,
          borderRadius: 12,
          textAlign: "center",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: endColors[current.color]?.iconBg || "#6B7280",
            color: "#fff", fontSize: 18, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 10px",
          }}>
            {endColors[current.color]?.icon}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 4 }}>
            {current.title}
          </div>
          <div style={{ fontSize: 13, color: "#6B7280" }}>{current.subtitle}</div>
        </div>
      )}

      {/* Reset */}
      {history.length > 1 && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button
            onClick={reset}
            style={{
              background: "none", border: "none",
              color: "#9CA3AF", fontSize: 12, cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            ← Start over
          </button>
        </div>
      )}

      {/* Rules legend */}
      <div style={{
        marginTop: 28, padding: "14px 16px",
        background: "#F9FAFB", border: "1px solid #E5E7EB",
        borderRadius: 10,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Regulation summary
        </div>
        {[
          { dot: "#059669", text: "All products: max 3 days from delivery" },
          { dot: "#7C3AED", text: "Indomie: any time, swap for new product only" },
          { dot: "#D97706", text: "Logistics requires a new purchase from the store" },
          { dot: "#cf110b", text: "For approval layer, head of department must approve (e.g., logistic, sales, supply chain, BI)" },
        ].map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: r.dot, marginTop: 4, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.5 }}>{r.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}