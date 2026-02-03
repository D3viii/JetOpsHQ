import { useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

function toYMD(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addDays(d, n) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() + n);
  return x;
}

function generateSchedule({ startDate, days, pilots, tails }) {
  const start = new Date(startDate + "T00:00:00");
  const tailsList = tails.map(t => t.tailNumber).filter(Boolean);

  // Each tail can have exactly ONE pair (2 pilots) per day
  const MAX_PAIRS_PER_TAIL_PER_DAY = 1;

  // key: `${date}__${tail}` -> pairs used (0/1)
  const dailyTailPairsUsed = new Map();
  const getPairsUsed = (date, tail) => dailyTailPairsUsed.get(`${date}__${tail}`) ?? 0;

  const incPairsUsed = (date, tail) => {
    const key = `${date}__${tail}`;
    const next = (dailyTailPairsUsed.get(key) ?? 0) + 1;
    dailyTailPairsUsed.set(key, next);
    return next;
  };

  let rr = 0;

  const pickTailForPair = (date, p1Pref, p2Pref) => {
    const canUse = (tail) =>
      tailsList.includes(tail) && getPairsUsed(date, tail) < MAX_PAIRS_PER_TAIL_PER_DAY;

    if (p1Pref && p2Pref && p1Pref === p2Pref && canUse(p1Pref)) {
      incPairsUsed(date, p1Pref);
      return p1Pref;
    }
    if (p1Pref && canUse(p1Pref)) {
      incPairsUsed(date, p1Pref);
      return p1Pref;
    }
    if (p2Pref && canUse(p2Pref)) {
      incPairsUsed(date, p2Pref);
      return p2Pref;
    }

    const attempts = tailsList.length;
    for (let i = 0; i < attempts; i++) {
      const tail = tailsList[(rr + i) % tailsList.length];
      if (canUse(tail)) {
        rr = (rr + i + 1) % tailsList.length;
        incPairsUsed(date, tail);
        return tail;
      }
    }

    return "EXTRA";
  };

  const assignments = [];

  const statusByPilotByDay = pilots.map(pilot => {
    const cycle = Math.max(1, (pilot.onDays ?? 0) + (pilot.offDays ?? 0));
    const status = Array.from({ length: days }, (_, i) => {
      const pos = i % cycle;
      return pos < (pilot.onDays ?? 0) ? "ON" : "OFF";
    });
    return { pilot, status };
  });

  for (let dayIndex = 0; dayIndex < days; dayIndex++) {
    const date = toYMD(addDays(start, dayIndex));

    const onPilots = statusByPilotByDay
      .filter(x => x.status[dayIndex] === "ON")
      .map(x => x.pilot);

    const pairs = [];
    const extras = [];

    for (let i = 0; i < onPilots.length; i += 2) {
      const a = onPilots[i];
      const b = onPilots[i + 1];
      if (!b) extras.push(a);
      else pairs.push([a, b]);
    }

    const tailForPilot = new Map();

    for (const [p1, p2] of pairs) {
      const tail = pickTailForPair(date, p1.preferredTail, p2.preferredTail);

      if (tail === "EXTRA") {
        tailForPilot.set(p1.name, "EXTRA");
        tailForPilot.set(p2.name, "EXTRA");
      } else {
        tailForPilot.set(p1.name, tail);
        tailForPilot.set(p2.name, tail);
      }
    }

    for (const p of extras) tailForPilot.set(p.name, "EXTRA");

    for (const row of statusByPilotByDay) {
      const pilot = row.pilot;
      const status = row.status[dayIndex];
      const tailNumber = status === "ON" ? (tailForPilot.get(pilot.name) ?? "EXTRA") : "";

      assignments.push({
        date,
        pilotName: pilot.name,
        status,
        tailNumber
      });
    }
  }

  return assignments;
}

function TailGridView({ tails, assignments, startDate, days, showOff }) {
  const dayHeaders = useMemo(() => {
    const start = new Date(startDate + "T00:00:00");
    return Array.from({ length: days }, (_, i) => {
      const d = addDays(start, i);
      return { ymd: toYMD(d), label: d.getDate().toString() };
    });
  }, [startDate, days]);

  const cellMap = useMemo(() => {
    const map = new Map();
    for (const a of assignments) {
      if (a.status === "OFF" && !showOff) continue;
      if (a.status === "OFF") continue;
      const key = `${a.date}__${a.tailNumber}`;
      const arr = map.get(key) ?? [];
      arr.push(a.pilotName);
      map.set(key, arr);
    }
    return map;
  }, [assignments, showOff]);

  return (
    <div style={{ overflowX: "auto", border: "1px solid #ddd", borderRadius: 8 }}>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={thStyleSticky}>Tail</th>
            {dayHeaders.map(d => (
              <th key={d.ymd} style={thStyle}>{d.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tails.map(t => (
            <tr key={t.tailNumber}>
              <td style={{ ...tdStyleSticky, borderLeft: `8px solid ${t.colorHex}` }}>
                <div style={{ fontWeight: 700 }}>{t.tailNumber}</div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>{t.colorHex}</div>
              </td>

              {dayHeaders.map(d => {
                const key = `${d.ymd}__${t.tailNumber}`;
                const pilots = cellMap.get(key) ?? [];
                return (
                  <td key={key} style={tdStyle}>
                    {pilots.length > 0 ? pilots.join(", ") : ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  borderBottom: "1px solid #ddd",
  padding: 8,
  minWidth: 42,
  textAlign: "center",
  color: "black",
  background: "#fafafa",
  position: "sticky",
  top: 0,
  zIndex: 1
};

const thStyleSticky = {
  ...thStyle,
  left: 0,
  zIndex: 2,
  textAlign: "left",
  minWidth: 160
};

const tdStyle = {
  borderBottom: "1px solid #eee",
  borderRight: "1px solid #eee",
  padding: "6px 8px",
  verticalAlign: "top",
  color: "black",
  height: 36,
  fontSize: 12,
  whiteSpace: "nowrap"
};

const tdStyleSticky = {
  ...tdStyle,
  position: "sticky",
  left: 0,
  background: "white",
  zIndex: 1,
  minWidth: 160
};

const card = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 12,
  background: "white",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
};

export default function Scheduling() {
  const [view, setView] = useState("calendar");

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return toYMD(d);
  });
  const [days, setDays] = useState(60);
  const [showOff, setShowOff] = useState(false);

  const [tails, setTails] = useState([
    { tailNumber: "118DL", colorHex: "#22c55e" },
    { tailNumber: "808ME", colorHex: "#f97316" }
  ]);

  const [pilots, setPilots] = useState([
    { name: "Rod", onDays: 15, offDays: 10, preferredTail: "118DL" },
    { name: "John", onDays: 15, offDays: 10, preferredTail: "808ME" },
    { name: "Dan", onDays: 10, offDays: 10, preferredTail: "" },
    { name: "Kyle", onDays: 10, offDays: 10, preferredTail: "" },
    { name: "Josh", onDays: 10, offDays: 10, preferredTail: "" },
    { name: "Jerry", onDays: 10, offDays: 10, preferredTail: "" },
  ]);

  const [assignments, setAssignments] = useState([]);
  const [trips, setTrips] = useState([]);

  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [tripDraft, setTripDraft] = useState({
    clientName: "",
    departure: "",
    destination: "",
    date: startDate,
    passengers: 1,
    legs: "ONE_LEG",
    planeType: "Hawker"
  });

  const tailColor = useMemo(() => {
    const m = new Map();
    for (const t of tails) m.set(t.tailNumber, t.colorHex);
    return m;
  }, [tails]);

  const fcEvents = useMemo(() => {
    const assignmentEvents = assignments
      .filter(a => showOff || a.status !== "OFF")
      .map(a => {
        const title =
          a.status === "OFF"
            ? `${a.pilotName} (OFF)`
            : `${a.tailNumber} — ${a.pilotName}`;

        const color =
          a.status === "OFF"
            ? "#9ca3af"
            : a.tailNumber === "EXTRA"
              ? "#64748b"
              : (tailColor.get(a.tailNumber) ?? undefined);

        return {
          id: `asg_${a.pilotName}_${a.date}_${a.tailNumber}_${a.status}`,
          title,
          start: a.date,
          allDay: true,
          backgroundColor: color,
          borderColor: color
        };
      });

    const tripEvents = trips.map(t => ({
      id: `trip_${t.id}`,
      title: `TRIP: ${t.clientName} • ${t.departure} → ${t.destination} • ${t.planeType} • PAX ${t.passengers}`,
      start: t.date,
      allDay: true,
      backgroundColor: "#0ea5e9",
      borderColor: "#0ea5e9"
    }));

    return [...assignmentEvents, ...tripEvents];
  }, [assignments, showOff, tailColor, trips]);

  const generate = () => {
    const cleanPilots = pilots
      .map(p => ({ ...p, name: (p.name ?? "").trim() }))
      .filter(p => p.name.length > 0);

    const cleanTails = tails
      .map(t => ({ ...t, tailNumber: (t.tailNumber ?? "").trim() }))
      .filter(t => t.tailNumber.length > 0);

    const a = generateSchedule({
      startDate,
      days: Math.max(7, Math.min(365, Number(days) || 60)),
      pilots: cleanPilots,
      tails: cleanTails
    });

    setAssignments(a);
  };

  const updatePilot = (idx, patch) => {
    setPilots(prev => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  };

  const updateTail = (idx, patch) => {
    setTails(prev => prev.map((t, i) => (i === idx ? { ...t, ...patch } : t)));
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h3 className="mb-0">Scheduling</h3>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={() => setView("calendar")}>
            Calendar View
          </button>
          <button className="btn btn-outline-secondary" onClick={() => setView("grid")}>
            Tail Grid View
          </button>
        </div>
      </div>

      <div className="d-flex gap-2 flex-wrap align-items-end mb-3">
        <label className="d-grid gap-1">
          <span style={{ fontSize: 12, opacity: 0.7 }}>Start date</span>
          <input className="form-control" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </label>

        <label className="d-grid gap-1">
          <span style={{ fontSize: 12, opacity: 0.7 }}>Days</span>
          <input className="form-control" type="number" value={days} min={7} max={365} onChange={e => setDays(e.target.value)} style={{ width: 120 }} />
        </label>

        <label className="d-flex align-items-center gap-2 mb-1">
          <input type="checkbox" checked={showOff} onChange={e => setShowOff(e.target.checked)} />
          <span>Show OFF days</span>
        </label>

        <button className="btn btn-primary" onClick={generate}>Generate Schedule</button>

        <button
          className="btn btn-outline-primary"
          onClick={() => {
            setTripDraft(d => ({ ...d, date: startDate }));
            setIsTripModalOpen(true);
          }}
        >
          Build Trip
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h5 style={{ margin: 0 }}>Tails</h5>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setTails(prev => [...prev, { tailNumber: "", colorHex: "#3b82f6" }])}>
              + Tail
            </button>
          </div>

          {tails.map((t, idx) => (
            <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 160px 44px", gap: 8, marginTop: 8 }}>
              <input className="form-control" placeholder="Tail (e.g. 118DL)" value={t.tailNumber} onChange={e => updateTail(idx, { tailNumber: e.target.value })} />
              <input className="form-control" placeholder="#22c55e" value={t.colorHex} onChange={e => updateTail(idx, { colorHex: e.target.value })} />
              <div style={{ width: 36, height: 32, borderRadius: 6, background: t.colorHex, border: "1px solid #ddd" }} />
            </div>
          ))}
        </div>

        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h5 style={{ margin: 0 }}>Pilots</h5>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setPilots(prev => [...prev, { name: "", onDays: 7, offDays: 5, preferredTail: "" }])}>
              + Pilot
            </button>
          </div>

          {pilots.map((p, idx) => (
            <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 90px 90px 1fr", gap: 8, marginTop: 8 }}>
              <input className="form-control" placeholder="Name" value={p.name} onChange={e => updatePilot(idx, { name: e.target.value })} />
              <input className="form-control" type="number" min={0} placeholder="On" value={p.onDays} onChange={e => updatePilot(idx, { onDays: Number(e.target.value) })} />
              <input className="form-control" type="number" min={0} placeholder="Off" value={p.offDays} onChange={e => updatePilot(idx, { offDays: Number(e.target.value) })} />
              <input className="form-control" placeholder="Preferred tail (optional)" value={p.preferredTail ?? ""} onChange={e => updatePilot(idx, { preferredTail: e.target.value })} />
            </div>
          ))}

          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
            Rotation is per pilot: ON for onDays, then OFF for offDays, repeating from the start date.
          </div>
        </div>
      </div>

      {view === "calendar" ? (
        <div style={card}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay"
            }}
            events={fcEvents}
            eventClick={(info) => alert(info.event.title)}
            height="auto"
          />
        </div>
      ) : (
        <div style={card}>
          <TailGridView
            tails={tails.filter(t => (t.tailNumber ?? "").trim().length > 0)}
            assignments={assignments}
            startDate={startDate}
            days={Number(days) || 60}
            showOff={showOff}
          />
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
            Each cell shows pilots assigned to that tail on that day (ON days). OFF days are not placed in a tail row.
          </div>
        </div>
      )}

      {isTripModalOpen && (
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
          onClick={() => setIsTripModalOpen(false)}
        >
          <div
            style={{
              width: "min(720px, 100%)",
              background: "white",
              borderRadius: 12,
              padding: 16,
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 style={{ margin: 0 }}>Build Trip</h4>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setIsTripModalOpen(false)}>✕</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
              <label className="d-grid gap-1">
                <span>Client Name</span>
                <input className="form-control" value={tripDraft.clientName} onChange={(e) => setTripDraft(d => ({ ...d, clientName: e.target.value }))} />
              </label>

              <label className="d-grid gap-1">
                <span>Date</span>
                <input className="form-control" type="date" value={tripDraft.date} onChange={(e) => setTripDraft(d => ({ ...d, date: e.target.value }))} />
              </label>

              <label className="d-grid gap-1">
                <span>Departure Airport</span>
                <input className="form-control" value={tripDraft.departure} onChange={(e) => setTripDraft(d => ({ ...d, departure: e.target.value.toUpperCase() }))} placeholder="ATL" />
              </label>

              <label className="d-grid gap-1">
                <span>Destination Airport</span>
                <input className="form-control" value={tripDraft.destination} onChange={(e) => setTripDraft(d => ({ ...d, destination: e.target.value.toUpperCase() }))} placeholder="TEB" />
              </label>

              <label className="d-grid gap-1">
                <span>Passengers</span>
                <input className="form-control" type="number" min={1} value={tripDraft.passengers} onChange={(e) => setTripDraft(d => ({ ...d, passengers: Number(e.target.value) }))} />
              </label>

              <label className="d-grid gap-1">
                <span>One leg / Multi leg</span>
                <select className="form-select" value={tripDraft.legs} onChange={(e) => setTripDraft(d => ({ ...d, legs: e.target.value }))}>
                  <option value="ONE_LEG">One leg</option>
                  <option value="MULTI_LEG">Multi leg</option>
                </select>
              </label>

              <label className="d-grid gap-1">
                <span>Plane Type</span>
                <select className="form-select" value={tripDraft.planeType} onChange={(e) => setTripDraft(d => ({ ...d, planeType: e.target.value }))}>
                  <option value="Hawker">Hawker</option>
                  <option value="Citation X">Citation X</option>
                </select>
              </label>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-3">
              <button className="btn btn-outline-secondary" onClick={() => setIsTripModalOpen(false)}>Cancel</button>
              <button
                className="btn btn-dark"
                onClick={() => {
                  if (!tripDraft.clientName.trim()) return alert("Client name is required");
                  if (!tripDraft.departure.trim()) return alert("Departure airport is required");
                  if (!tripDraft.destination.trim()) return alert("Destination airport is required");
                  if (!tripDraft.date) return alert("Date is required");

                  const id = (crypto?.randomUUID?.() ?? String(Date.now()));

                  setTrips(prev => [
                    ...prev,
                    {
                      id,
                      clientName: tripDraft.clientName.trim(),
                      departure: tripDraft.departure.trim().toUpperCase(),
                      destination: tripDraft.destination.trim().toUpperCase(),
                      date: tripDraft.date,
                      passengers: Math.max(1, Number(tripDraft.passengers) || 1),
                      legs: tripDraft.legs,
                      planeType: tripDraft.planeType
                    }
                  ]);

                  setIsTripModalOpen(false);
                  setTripDraft(d => ({
                    ...d,
                    clientName: "",
                    departure: "",
                    destination: "",
                    passengers: 1,
                    legs: "ONE_LEG",
                    planeType: "Hawker"
                  }));
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
