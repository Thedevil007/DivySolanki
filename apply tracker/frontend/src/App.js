import React, { useState, useEffect, useCallback } from 'react';

const API = "http://localhost:5000/api";

const STATUSES = ["Applied", "Interview", "Offer", "Rejected"];

const STATUS_META = {
  Applied:   { color: "#3b82f6", bg: "rgba(59,130,246,0.12)",  icon: "📤" },
  Interview: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  icon: "🗓️" },
  Offer:     { color: "#10b981", bg: "rgba(16,185,129,0.12)",  icon: "🎉" },
  Rejected:  { color: "#ef4444", bg: "rgba(239,68,68,0.12)",   icon: "✖" },
};

const EMPTY_FORM = {
  company: "", role: "", location: "", salary: "",
  status: "Applied", date_applied: new Date().toISOString().split("T")[0],
  deadline: "", notes: "", link: "",
};

// ── Styles ───────────────────────────────────────────────
const s = {
  app: {
    minHeight: "100vh",
    background: "#0f0f13",
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "20px 32px",
    borderBottom: "1px solid #2e2e3a",
    background: "#18181f",
    position: "sticky", top: 0, zIndex: 100,
  },
  logo: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 26,
    color: "#e8e8f0",
    letterSpacing: "-0.5px",
  },
  logoAccent: { color: "#6c63ff" },
  headerRight: { display: "flex", gap: 12, alignItems: "center" },
  btnPrimary: {
    background: "#6c63ff",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "9px 18px",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    transition: "background 0.15s",
  },
  btnSecondary: {
    background: "transparent",
    color: "#7a7a92",
    border: "1px solid #2e2e3a",
    borderRadius: 8,
    padding: "9px 16px",
    fontWeight: 500,
    fontSize: 14,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  stats: {
    display: "flex", gap: 16, padding: "20px 32px",
    borderBottom: "1px solid #2e2e3a",
    background: "#18181f",
    flexWrap: "wrap",
  },
  statCard: (color) => ({
    flex: "1 1 120px",
    background: "#22222c",
    border: `1px solid ${color}33`,
    borderRadius: 10,
    padding: "12px 18px",
    minWidth: 100,
  }),
  statNum: (color) => ({ fontSize: 28, fontWeight: 700, color, lineHeight: 1 }),
  statLabel: { fontSize: 12, color: "#7a7a92", marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 },
  board: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 20,
    padding: "24px 32px",
    alignItems: "start",
  },
  column: {
    background: "#18181f",
    border: "1px solid #2e2e3a",
    borderRadius: 12,
    overflow: "hidden",
  },
  colHeader: (color) => ({
    padding: "14px 16px",
    borderBottom: "1px solid #2e2e3a",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    borderTop: `3px solid ${color}`,
  }),
  colTitle: (color) => ({
    fontWeight: 600, fontSize: 13,
    color, textTransform: "uppercase", letterSpacing: 0.8,
    display: "flex", alignItems: "center", gap: 6,
  }),
  colCount: {
    background: "#2e2e3a",
    color: "#7a7a92",
    borderRadius: 12,
    padding: "2px 8px",
    fontSize: 12, fontWeight: 600,
  },
  colBody: { padding: "10px 10px 10px", display: "flex", flexDirection: "column", gap: 8, minHeight: 80 },
  card: {
    background: "#22222c",
    border: "1px solid #2e2e3a",
    borderRadius: 10,
    padding: "14px",
    cursor: "pointer",
    transition: "border-color 0.15s, transform 0.15s",
  },
  cardCompany: { fontWeight: 700, fontSize: 14, color: "#e8e8f0", marginBottom: 2 },
  cardRole: { fontSize: 13, color: "#7a7a92", marginBottom: 8 },
  cardMeta: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" },
  cardTag: (bg, color) => ({
    fontSize: 11, fontWeight: 600,
    background: bg, color,
    borderRadius: 5, padding: "2px 7px",
  }),
  emptyCol: {
    color: "#3a3a4a", fontSize: 13, textAlign: "center",
    padding: "24px 12px",
    fontStyle: "italic",
  },

  // Modal
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 200, padding: 20,
  },
  modal: {
    background: "#18181f",
    border: "1px solid #2e2e3a",
    borderRadius: 16,
    width: "100%", maxWidth: 560,
    padding: "28px 28px 24px",
    maxHeight: "90vh", overflowY: "auto",
  },
  modalTitle: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 22, color: "#e8e8f0",
    marginBottom: 20,
  },
  formGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14,
  },
  formFull: { gridColumn: "1 / -1" },
  label: { display: "block", fontSize: 12, color: "#7a7a92", fontWeight: 600, marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.4 },
  input: {
    width: "100%", background: "#22222c", border: "1px solid #2e2e3a",
    borderRadius: 8, padding: "9px 12px",
    color: "#e8e8f0", fontSize: 14, outline: "none",
    transition: "border-color 0.15s",
  },
  textarea: {
    width: "100%", background: "#22222c", border: "1px solid #2e2e3a",
    borderRadius: 8, padding: "9px 12px",
    color: "#e8e8f0", fontSize: 14, outline: "none",
    resize: "vertical", minHeight: 80,
    transition: "border-color 0.15s",
  },
  select: {
    width: "100%", background: "#22222c", border: "1px solid #2e2e3a",
    borderRadius: 8, padding: "9px 12px",
    color: "#e8e8f0", fontSize: 14, outline: "none",
    appearance: "none",
  },
  modalActions: { display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" },
  btnDanger: {
    background: "rgba(239,68,68,0.12)", color: "#ef4444",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: 8, padding: "9px 16px",
    fontWeight: 600, fontSize: 14, cursor: "pointer",
    marginRight: "auto",
  },
};

// ── Components ────────────────────────────────────────────

function StatBar({ apps }) {
  return (
    <div style={s.stats}>
      {STATUSES.map(st => {
        const count = apps.filter(a => a.status === st).length;
        const meta = STATUS_META[st];
        return (
          <div key={st} style={s.statCard(meta.color)}>
            <div style={s.statNum(meta.color)}>{count}</div>
            <div style={s.statLabel}>{st}</div>
          </div>
        );
      })}
      <div style={s.statCard("#6c63ff")}>
        <div style={s.statNum("#6c63ff")}>{apps.length}</div>
        <div style={s.statLabel}>Total</div>
      </div>
    </div>
  );
}

function AppCard({ app, onClick }) {
  const meta = STATUS_META[app.status];
  return (
    <div
      style={s.card}
      onClick={() => onClick(app)}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "#6c63ff55"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#2e2e3a"; e.currentTarget.style.transform = "none"; }}
    >
      <div style={s.cardCompany}>{app.company}</div>
      <div style={s.cardRole}>{app.role}</div>
      <div style={s.cardMeta}>
        {app.location && <span style={s.cardTag("rgba(108,99,255,0.15)", "#8a83ff")}>📍 {app.location}</span>}
        {app.salary && <span style={s.cardTag("rgba(16,185,129,0.1)", "#10b981")}>💷 {app.salary}</span>}
        <span style={{ fontSize: 11, color: "#4a4a60", marginLeft: "auto" }}>
          {app.date_applied}
        </span>
      </div>
      {app.deadline && (
        <div style={{ marginTop: 8, fontSize: 11, color: "#f59e0b" }}>
          ⏰ Deadline: {app.deadline}
        </div>
      )}
    </div>
  );
}

function KanbanBoard({ apps, onCardClick }) {
  return (
    <div style={s.board}>
      {STATUSES.map(status => {
        const meta = STATUS_META[status];
        const col = apps.filter(a => a.status === status);
        return (
          <div key={status} style={s.column}>
            <div style={s.colHeader(meta.color)}>
              <div style={s.colTitle(meta.color)}>
                <span>{meta.icon}</span> {status}
              </div>
              <span style={s.colCount}>{col.length}</span>
            </div>
            <div style={s.colBody}>
              {col.length === 0
                ? <div style={s.emptyCol}>No applications</div>
                : col.map(app => <AppCard key={app.id} app={app} onClick={onCardClick} />)
              }
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FormField({ label, children, full }) {
  return (
    <div style={full ? s.formFull : {}}>
      <label style={s.label}>{label}</label>
      {children}
    </div>
  );
}

function Modal({ app, onClose, onSave, onDelete }) {
  const isEdit = !!app.id;
  const [form, setForm] = useState({ ...EMPTY_FORM, ...app });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.company.trim() || !form.role.trim()) {
      alert("Company and Role are required.");
      return;
    }
    onSave(form);
  };

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={s.modalTitle}>{isEdit ? "Edit Application" : "Add New Application"}</div>

        <div style={s.formGrid}>
          <FormField label="Company *">
            <input style={s.input} value={form.company} onChange={e => set("company", e.target.value)} placeholder="e.g. Google" />
          </FormField>
          <FormField label="Role *">
            <input style={s.input} value={form.role} onChange={e => set("role", e.target.value)} placeholder="e.g. Junior Developer" />
          </FormField>
          <FormField label="Location">
            <input style={s.input} value={form.location} onChange={e => set("location", e.target.value)} placeholder="e.g. London, UK" />
          </FormField>
          <FormField label="Salary / Range">
            <input style={s.input} value={form.salary} onChange={e => set("salary", e.target.value)} placeholder="e.g. £35,000" />
          </FormField>
          <FormField label="Status">
            <select style={s.select} value={form.status} onChange={e => set("status", e.target.value)}>
              {STATUSES.map(st => <option key={st}>{st}</option>)}
            </select>
          </FormField>
          <FormField label="Date Applied">
            <input type="date" style={s.input} value={form.date_applied} onChange={e => set("date_applied", e.target.value)} />
          </FormField>
          <FormField label="Deadline">
            <input type="date" style={s.input} value={form.deadline} onChange={e => set("deadline", e.target.value)} />
          </FormField>
          <FormField label="Job Link">
            <input style={s.input} value={form.link} onChange={e => set("link", e.target.value)} placeholder="https://..." />
          </FormField>
          <FormField label="Notes" full>
            <textarea style={s.textarea} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Interview notes, contacts, next steps..." />
          </FormField>
        </div>

        <div style={s.modalActions}>
          {isEdit && (
            <button style={s.btnDanger} onClick={() => onDelete(app.id)}>Delete</button>
          )}
          <button style={s.btnSecondary} onClick={onClose}>Cancel</button>
          <button style={s.btnPrimary} onClick={handleSave}>
            {isEdit ? "Save Changes" : "Add Application"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────
export default function App() {
  const [apps, setApps] = useState([]);
  const [modalApp, setModalApp] = useState(null); // null = closed, {} = new, {id,...} = edit
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApps = useCallback(async () => {
    try {
      const res = await fetch(`${API}/applications`);
      if (!res.ok) throw new Error("Failed to fetch");
      setApps(await res.json());
      setError("");
    } catch {
      setError("Cannot connect to backend. Make sure Flask is running on port 5000.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const handleSave = async (form) => {
    const isEdit = !!form.id;
    const url = isEdit ? `${API}/applications/${form.id}` : `${API}/applications`;
    const method = isEdit ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setModalApp(null);
    fetchApps();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this application?")) return;
    await fetch(`${API}/applications/${id}`, { method: "DELETE" });
    setModalApp(null);
    fetchApps();
  };

  const handleExport = () => {
    window.open(`${API}/export`, "_blank");
  };

  return (
    <div style={s.app}>
      <header style={s.header}>
        <div style={s.logo}>
          Apply<span style={s.logoAccent}>Track</span>
        </div>
        <div style={s.headerRight}>
          <button style={s.btnSecondary} onClick={handleExport}>⬇ Export CSV</button>
          <button style={s.btnPrimary} onClick={() => setModalApp({})}>+ Add Application</button>
        </div>
      </header>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", padding: "12px 32px", fontSize: 14 }}>
          ⚠ {error}
        </div>
      )}

      {loading
        ? <div style={{ padding: 40, textAlign: "center", color: "#7a7a92" }}>Loading...</div>
        : <>
            <StatBar apps={apps} />
            <KanbanBoard apps={apps} onCardClick={app => setModalApp(app)} />
          </>
      }

      {modalApp !== null && (
        <Modal
          app={modalApp}
          onClose={() => setModalApp(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
