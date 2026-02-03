import { useMemo, useState } from "react";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 12,
  background: "white",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  cursor: "pointer"
};

const pill = {
  display: "inline-block",
  padding: "2px 8px",
  borderRadius: 999,
  fontSize: 12,
  background: "#f3f4f6",
  color: "#111827"
};

// POC: replace later with shared app state/store
const DEFAULT_PILOTS = ["Rod", "John", "Dan", "Kyle", "Josh", "Jerry"];
const PLANE_TYPES = ["Hawker", "Citation X"];

function todayYMD() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function compareYmd(a, b) {
  // YYYY-MM-DD lexicographic compare works
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function TripCard({ trip, onClick }) {
  return (
    <div style={cardStyle} onClick={onClick}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontWeight: 800, fontSize: 16 }}>{trip.clientName || "Unnamed Client"}</div>
        <span style={pill}>{trip.date}</span>
      </div>

      <div style={{ marginTop: 6, color: "#374151" }}>
        <strong>{trip.departure}</strong> → <strong>{trip.destination}</strong>
      </div>

      <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <span style={pill}>Plane: {trip.planeType}</span>
        <span style={pill}>PAX: {trip.passengers}</span>
        <span style={pill}>Legs: {trip.legs === "ONE_LEG" ? "One leg" : "Multi leg"}</span>
      </div>

      <div style={{ marginTop: 8, fontSize: 13, color: "#6b7280" }}>
        Pilots: {trip.pilots?.length ? trip.pilots.join(", ") : "—"}
      </div>

      <div style={{ marginTop: 4, fontSize: 13, color: "#6b7280" }}>
        Catering: {trip.catering?.trim() ? trip.catering : "—"}
      </div>
    </div>
  );
}

function ModalShell({ title, onClose, children }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 9999
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "min(820px, 100%)",
          background: "white",
          borderRadius: 12,
          padding: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>✕</button>
        </div>

        <div style={{ marginTop: 12 }}>{children}</div>
      </div>
    </div>
  );
}

function TripForm({ draft, setDraft, pilotsList }) {
  const togglePilot = (name) => {
    setDraft(d => {
      const set = new Set(d.pilots || []);
      if (set.has(name)) set.delete(name);
      else set.add(name);
      return { ...d, pilots: Array.from(set) };
    });
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <label className="d-grid gap-1">
        <span>Client Name</span>
        <input className="form-control" value={draft.clientName} onChange={(e) => setDraft(d => ({ ...d, clientName: e.target.value }))} />
      </label>

      <label className="d-grid gap-1">
        <span>Date</span>
        <input className="form-control" type="date" value={draft.date} onChange={(e) => setDraft(d => ({ ...d, date: e.target.value }))} />
      </label>

      <label className="d-grid gap-1">
        <span>Departure Airport</span>
        <input className="form-control" value={draft.departure} onChange={(e) => setDraft(d => ({ ...d, departure: e.target.value.toUpperCase() }))} placeholder="ATL" />
      </label>

      <label className="d-grid gap-1">
        <span>Destination Airport</span>
        <input className="form-control" value={draft.destination} onChange={(e) => setDraft(d => ({ ...d, destination: e.target.value.toUpperCase() }))} placeholder="TEB" />
      </label>

      <label className="d-grid gap-1">
        <span>Passengers</span>
        <input className="form-control" type="number" min={1} value={draft.passengers} onChange={(e) => setDraft(d => ({ ...d, passengers: Number(e.target.value) }))} />
      </label>

      <label className="d-grid gap-1">
        <span>One leg / Multi leg</span>
        <select className="form-select" value={draft.legs} onChange={(e) => setDraft(d => ({ ...d, legs: e.target.value }))}>
          <option value="ONE_LEG">One leg</option>
          <option value="MULTI_LEG">Multi leg</option>
        </select>
      </label>

      <label className="d-grid gap-1">
        <span>Plane Type</span>
        <select className="form-select" value={draft.planeType} onChange={(e) => setDraft(d => ({ ...d, planeType: e.target.value }))}>
          {PLANE_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </label>

      <label className="d-grid gap-1" style={{ gridColumn: "1 / -1" }}>
        <span>Catering (notes)</span>
        <input className="form-control" value={draft.catering} onChange={(e) => setDraft(d => ({ ...d, catering: e.target.value }))} placeholder="e.g., Vegan meal + sparkling water" />
      </label>

      <div style={{ gridColumn: "1 / -1" }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Pilots</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {pilotsList.map((name) => {
            const active = (draft.pilots || []).includes(name);
            return (
              <button
                key={name}
                type="button"
                className={`btn btn-sm ${active ? "btn-dark" : "btn-outline-secondary"}`}
                onClick={() => togglePilot(name)}
              >
                {name}
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
          (POC) Select pilots assigned to this trip.
        </div>
      </div>
    </div>
  );
}

export default function Trips() {
  const [pilotsList] = useState(DEFAULT_PILOTS);

  const [trips, setTrips] = useState([
    {
      id: "t1",
      clientName: "Acme Exec Travel",
      departure: "ATL",
      destination: "TEB",
      date: todayYMD(),
      passengers: 4,
      legs: "ONE_LEG",
      planeType: "Hawker",
      catering: "Snacks + sparkling water",
      pilots: ["Rod", "John"]
    }
  ]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(null);

  const emptyDraft = useMemo(() => ({
    clientName: "",
    departure: "",
    destination: "",
    date: todayYMD(),
    passengers: 1,
    legs: "ONE_LEG",
    planeType: "Hawker",
    catering: "",
    pilots: []
  }), []);

  const [draft, setDraft] = useState(emptyDraft);

  const selectedTrip = useMemo(() => {
    if (!selectedTripId) return null;
    return trips.find(t => t.id === selectedTripId) || null;
  }, [selectedTripId, trips]);

  const grouped = useMemo(() => {
    const today = todayYMD();
    const todays = [];
    const upcoming = [];
    const past = [];

    for (const t of trips) {
      const cmp = compareYmd(t.date, today);
      if (cmp === 0) todays.push(t);
      else if (cmp > 0) upcoming.push(t);
      else past.push(t);
    }

    todays.sort((a,b) => compareYmd(a.date, b.date));
    upcoming.sort((a,b) => compareYmd(a.date, b.date));
    past.sort((a,b) => compareYmd(b.date, a.date)); // most recent first

    return { todays, upcoming, past };
  }, [trips]);

  const openDetails = (id) => {
    setSelectedTripId(id);
    setIsDetailsOpen(true);
  };

  const resetDraft = () => setDraft({ ...emptyDraft, date: todayYMD() });

  const validateDraft = () => {
    if (!draft.clientName.trim()) return "Client name is required";
    if (!draft.departure.trim()) return "Departure airport is required";
    if (!draft.destination.trim()) return "Destination airport is required";
    if (!draft.date) return "Date is required";
    if (!draft.passengers || draft.passengers < 1) return "Passengers must be 1+";
    return null;
  };

  const createTrip = () => {
    const err = validateDraft();
    if (err) return alert(err);

    const id = (crypto?.randomUUID?.() ?? String(Date.now()));

    const newTrip = {
      id,
      clientName: draft.clientName.trim(),
      departure: draft.departure.trim().toUpperCase(),
      destination: draft.destination.trim().toUpperCase(),
      date: draft.date,
      passengers: Math.max(1, Number(draft.passengers) || 1),
      legs: draft.legs,
      planeType: draft.planeType,
      catering: draft.catering || "",
      pilots: draft.pilots || []
    };

    setTrips(prev => [newTrip, ...prev]);
    setIsCreateOpen(false);
    resetDraft();
  };

  const updateTrip = () => {
    if (!selectedTrip) return;
    const err = validateDraft();
    if (err) return alert(err);

    setTrips(prev =>
      prev.map(t => (t.id === selectedTrip.id ? { ...t, ...draft } : t))
    );

    setIsDetailsOpen(false);
    setSelectedTripId(null);
    resetDraft();
  };

  const deleteTrip = () => {
    if (!selectedTrip) return;
    if (!window.confirm("Delete this trip?")) return;
    setTrips(prev => prev.filter(t => t.id !== selectedTrip.id));
    setIsDetailsOpen(false);
    setSelectedTripId(null);
    resetDraft();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Trips</h3>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetDraft();
            setIsCreateOpen(true);
          }}
        >
          Add Trip
        </button>
      </div>

      <Section title="Today" trips={grouped.todays} onOpen={openDetails} />
      <div style={{ height: 12 }} />
      <Section title="Upcoming" trips={grouped.upcoming} onOpen={openDetails} />
      <div style={{ height: 12 }} />
      <Section title="Past" trips={grouped.past} onOpen={openDetails} />

      {isCreateOpen && (
        <ModalShell title="Create Trip" onClose={() => setIsCreateOpen(false)}>
          <TripForm draft={draft} setDraft={setDraft} pilotsList={pilotsList} />
          <div className="d-flex justify-content-end gap-2 mt-3">
            <button className="btn btn-outline-secondary" onClick={() => setIsCreateOpen(false)}>Cancel</button>
            <button className="btn btn-dark" onClick={createTrip}>Create</button>
          </div>
        </ModalShell>
      )}

      {isDetailsOpen && selectedTrip && (
        <ModalShell
          title={`Trip Details — ${selectedTrip.clientName}`}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedTripId(null);
            resetDraft();
          }}
        >
          <TripForm
            draft={draft}
            setDraft={setDraft}
            pilotsList={pilotsList}
          />

          <div className="d-flex justify-content-between align-items-center mt-3">
            <button className="btn btn-outline-danger" onClick={deleteTrip}>Delete</button>

            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setIsDetailsOpen(false);
                  setSelectedTripId(null);
                  resetDraft();
                }}
              >
                Close
              </button>
              <button className="btn btn-dark" onClick={updateTrip}>Save</button>
            </div>
          </div>
        </ModalShell>
      )}
    </div>
  );
}

function Section({ title, trips, onOpen }) {
  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h5 className="mb-0">{title}</h5>
        <span style={{ fontSize: 12, opacity: 0.7 }}>{trips.length} trip(s)</span>
      </div>

      {trips.length === 0 ? (
        <div style={{ padding: 12, border: "1px dashed #d1d5db", borderRadius: 12, color: "#6b7280" }}>
          No trips in this section.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          {trips.map(t => (
            <TripCard key={t.id} trip={t} onClick={() => onOpen(t.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
