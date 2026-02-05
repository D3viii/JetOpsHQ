import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  Modal,
  Row,
  Table,
  ProgressBar,
} from "react-bootstrap";

function ymd(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const yyyy = x.getFullYear();
  const mm = String(x.getMonth() + 1).padStart(2, "0");
  const dd = String(x.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const crewInitial = [
  { id: "c1", name: "Rod Carr", role: "Captain", phone: "678-227-8429", status: "AVAILABLE", dutyHrs7: 18 },
  { id: "c2", name: "John Smith", role: "First Officer", phone: "555-111-2222", status: "ON_TRIP", dutyHrs7: 22 },
  { id: "c3", name: "Dan Green", role: "Captain", phone: "555-333-4444", status: "REST", dutyHrs7: 12 },
  { id: "c4", name: "Kyle White", role: "First Officer", phone: "555-555-6666", status: "AVAILABLE", dutyHrs7: 15 },
];

const planesInitial = [
  { id: "p1", tail: "118DL", type: "Hawker", model: "800XP", seats: 8, status: "AVAILABLE", nextMaint: "2026-02-18", color: "#22c55e" },
  { id: "p2", tail: "808ME", type: "Citation X", model: "750", seats: 9, status: "IN_USE", nextMaint: "2026-02-10", color: "#f97316" },
];

const tripsInitial = [
  {
    id: "t1",
    date: ymd(),
    clientName: "Acme Exec Travel",
    from: "ATL",
    to: "TEB",
    pax: 6,
    catering: "Standard",
    planeId: "p1",
    crewIds: ["c1", "c4"],
    status: "SCHEDULED", // SCHEDULED | ENROUTE | ARRIVED | CANCELLED
    notes: "VIP client. Confirm catering by 10am.",
  },
  {
    id: "t2",
    date: ymd(),
    clientName: "Blue Ridge Partners",
    from: "PDK",
    to: "PBI",
    pax: 4,
    catering: "Light snacks",
    planeId: "p2",
    crewIds: ["c2", "c3"],
    status: "ENROUTE",
    notes: "Fuel stop not expected.",
  },
];

const statusBadge = (status) => {
  const map = {
    SCHEDULED: { bg: "secondary", text: "Scheduled" },
    ENROUTE: { bg: "primary", text: "Enroute" },
    ARRIVED: { bg: "success", text: "Arrived" },
    CANCELLED: { bg: "danger", text: "Cancelled" },
  };
  const s = map[status] ?? { bg: "secondary", text: status };
  return <Badge bg={s.bg}>{s.text}</Badge>;
};

const crewBadge = (status) => {
  const map = {
    AVAILABLE: { bg: "success", text: "Available" },
    ON_TRIP: { bg: "primary", text: "On Trip" },
    REST: { bg: "secondary", text: "Rest" },
    OFF: { bg: "dark", text: "Off" },
  };
  const s = map[status] ?? { bg: "secondary", text: status };
  return <Badge bg={s.bg}>{s.text}</Badge>;
};

export default function Dispatch() {
  const [today, setToday] = useState(ymd());
  const [trips, setTrips] = useState(tripsInitial);
  const [crew, setCrew] = useState(crewInitial);
  const [planes, setPlanes] = useState(planesInitial);

  const [selectedTripId, setSelectedTripId] = useState(null);
  const selectedTrip = useMemo(
    () => trips.find((t) => t.id === selectedTripId) ?? null,
    [trips, selectedTripId]
  );

  const [showTripModal, setShowTripModal] = useState(false);

  const planeById = useMemo(() => new Map(planes.map((p) => [p.id, p])), [planes]);
  const crewById = useMemo(() => new Map(crew.map((c) => [c.id, c])), [crew]);

  const todaysTrips = useMemo(
    () => trips.filter((t) => t.date === today),
    [trips, today]
  );

  const alerts = useMemo(() => {
    const a = [];
    for (const p of planes) {
      // simple “within 7 days” maintenance alert
      const d0 = new Date(today + "T00:00:00");
      const d1 = new Date(p.nextMaint + "T00:00:00");
      const diff = Math.round((d1 - d0) / (1000 * 60 * 60 * 24));
      if (!Number.isNaN(diff) && diff >= 0 && diff <= 7) {
        a.push(`Maintenance due soon for ${p.tail} (${p.nextMaint})`);
      }
    }
    // duty hours soft alert
    for (const c of crew) {
      if (c.dutyHrs7 >= 30) a.push(`Duty hours high for ${c.name} (7-day: ${c.dutyHrs7}h)`);
    }
    return a;
  }, [planes, crew, today]);

  const openTrip = (id) => {
    setSelectedTripId(id);
    setShowTripModal(true);
  };

  const updateTrip = (id, patch) => {
    setTrips((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const updatePlane = (id, patch) => {
    setPlanes((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const updateCrew = (id, patch) => {
    setCrew((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const utilization = useMemo(() => {
    const inUse = planes.filter((p) => p.status === "IN_USE").length;
    const pct = planes.length ? Math.round((inUse / planes.length) * 100) : 0;
    return { inUse, total: planes.length, pct };
  }, [planes]);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-1">Dispatch</h3>
          <div className="text-muted">Operational board (POC)</div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Badge bg="dark">Today</Badge>
          <Form.Control
            type="date"
            value={today}
            onChange={(e) => setToday(e.target.value)}
            style={{ width: 170 }}
          />
        </div>
      </div>

      <Row className="g-3">
        <Col md={6} xl={3}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="text-muted">Trips Today</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{todaysTrips.length}</div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={3}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="text-muted">Active Crew</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>
                {crew.filter((c) => c.status === "ON_TRIP" || c.status === "AVAILABLE").length}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={3}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="text-muted">Tails In Use</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{utilization.inUse}</div>
              <div className="mt-2">
                <ProgressBar now={utilization.pct} label={`${utilization.pct}%`} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={3}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="text-muted">Alerts</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{alerts.length}</div>
              <div className="text-muted" style={{ fontSize: 12 }}>
                Maint + duty soft checks
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="mb-0">Trips</h5>
                <div className="text-muted" style={{ fontSize: 12 }}>
                  Click a trip to dispatch/update status
                </div>
              </div>

              {todaysTrips.length === 0 ? (
                <div className="text-muted">No trips scheduled for this date.</div>
              ) : (
                <Table responsive hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Route</th>
                      <th>PAX</th>
                      <th>Aircraft</th>
                      <th>Crew</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todaysTrips.map((t) => {
                      const p = planeById.get(t.planeId);
                      const c = t.crewIds.map((id) => crewById.get(id)?.name).filter(Boolean);
                      return (
                        <tr key={t.id} style={{ cursor: "pointer" }} onClick={() => openTrip(t.id)}>
                          <td style={{ fontWeight: 700 }}>{t.clientName}</td>
                          <td>
                            <Badge bg="light" text="dark">
                              {t.from}
                            </Badge>{" "}
                            →{" "}
                            <Badge bg="light" text="dark">
                              {t.to}
                            </Badge>
                          </td>
                          <td>{t.pax}</td>
                          <td>
                            {p ? (
                              <span>
                                <span
                                  style={{
                                    display: "inline-block",
                                    width: 10,
                                    height: 10,
                                    borderRadius: 99,
                                    background: p.color,
                                    marginRight: 6,
                                  }}
                                />
                                {p.tail} ({p.type})
                              </span>
                            ) : (
                              <span className="text-muted">Unassigned</span>
                            )}
                          </td>
                          <td>{c.join(", ")}</td>
                          <td>{statusBadge(t.status)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xl={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-2">Alerts & Notes</h5>

              {alerts.length === 0 ? (
                <div className="text-muted">No alerts for the selected date.</div>
              ) : (
                <div className="d-grid gap-2">
                  {alerts.map((a, idx) => (
                    <div
                      key={idx}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 10,
                        padding: 10,
                        background: "#fff",
                      }}
                    >
                      <Badge bg="warning" text="dark" className="me-2">
                        Alert
                      </Badge>
                      {a}
                    </div>
                  ))}
                </div>
              )}

              <hr />

              <h6 className="mb-2">Fleet Snapshot</h6>
              <div className="d-grid gap-2">
                {planes.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      border: "1px solid #e5e7eb",
                      borderRadius: 10,
                      padding: 10,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800 }}>
                        <span
                          style={{
                            display: "inline-block",
                            width: 10,
                            height: 10,
                            borderRadius: 99,
                            background: p.color,
                            marginRight: 6,
                          }}
                        />
                        {p.tail} <span className="text-muted">({p.type})</span>
                      </div>
                      <div className="text-muted" style={{ fontSize: 12 }}>
                        Next maint: {p.nextMaint}
                      </div>
                    </div>

                    <Form.Select
                      size="sm"
                      value={p.status}
                      onChange={(e) => updatePlane(p.id, { status: e.target.value })}
                      style={{ width: 130 }}
                    >
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="IN_USE">IN_USE</option>
                      <option value="MAINT">MAINT</option>
                    </Form.Select>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={12}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-2">Crew Status</h5>
              <Row className="g-3">
                {crew.map((c) => (
                  <Col key={c.id} md={6} xl={3}>
                    <Card className="h-100">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <div style={{ fontWeight: 800 }}>{c.name}</div>
                            <div className="text-muted" style={{ fontSize: 12 }}>
                              {c.role}
                            </div>
                          </div>
                          {crewBadge(c.status)}
                        </div>

                        <div className="mt-2 text-muted" style={{ fontSize: 12 }}>
                          Phone: {c.phone}
                        </div>

                        <div className="mt-2">
                          <div className="text-muted" style={{ fontSize: 12 }}>
                            Duty (7-day)
                          </div>
                          <ProgressBar now={Math.min(100, (c.dutyHrs7 / 60) * 100)} label={`${c.dutyHrs7}h`} />
                        </div>

                        <div className="mt-3">
                          <Form.Select
                            size="sm"
                            value={c.status}
                            onChange={(e) => updateCrew(c.id, { status: e.target.value })}
                          >
                            <option value="AVAILABLE">AVAILABLE</option>
                            <option value="ON_TRIP">ON_TRIP</option>
                            <option value="REST">REST</option>
                            <option value="OFF">OFF</option>
                          </Form.Select>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Trip Modal */}
      <Modal show={showTripModal} onHide={() => setShowTripModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Dispatch Trip</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {!selectedTrip ? (
            <div className="text-muted">No trip selected.</div>
          ) : (
            <>
              <Row className="g-3">
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Body>
                      <div className="text-muted">Client</div>
                      <div style={{ fontSize: 18, fontWeight: 900 }}>{selectedTrip.clientName}</div>

                      <div className="mt-2">
                        <Badge bg="light" text="dark">
                          {selectedTrip.from}
                        </Badge>{" "}
                        →{" "}
                        <Badge bg="light" text="dark">
                          {selectedTrip.to}
                        </Badge>
                      </div>

                      <div className="mt-2 text-muted">
                        Date: <span style={{ fontWeight: 700 }}>{selectedTrip.date}</span>
                      </div>

                      <div className="mt-2">PAX: <b>{selectedTrip.pax}</b></div>
                      <div className="mt-2">Catering: <b>{selectedTrip.catering}</b></div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="text-muted">Status</div>
                          <div className="mt-1">{statusBadge(selectedTrip.status)}</div>
                        </div>

                        <Form.Select
                          value={selectedTrip.status}
                          onChange={(e) => updateTrip(selectedTrip.id, { status: e.target.value })}
                          style={{ width: 180 }}
                        >
                          <option value="SCHEDULED">SCHEDULED</option>
                          <option value="ENROUTE">ENROUTE</option>
                          <option value="ARRIVED">ARRIVED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </Form.Select>
                      </div>

                      <hr />

                      <div className="text-muted">Aircraft</div>
                      <Form.Select
                        className="mt-1"
                        value={selectedTrip.planeId}
                        onChange={(e) => updateTrip(selectedTrip.id, { planeId: e.target.value })}
                      >
                        {planes.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.tail} ({p.type})
                          </option>
                        ))}
                      </Form.Select>

                      <div className="mt-3 text-muted">Crew (2 pilots)</div>
                      <div className="text-muted" style={{ fontSize: 12 }}>
                        POC: you can change assignments here (no quals check yet)
                      </div>

                      <Row className="g-2 mt-1">
                        <Col>
                          <Form.Select
                            value={selectedTrip.crewIds[0] ?? ""}
                            onChange={(e) => {
                              const a = [...selectedTrip.crewIds];
                              a[0] = e.target.value;
                              updateTrip(selectedTrip.id, { crewIds: a });
                            }}
                          >
                            <option value="">Unassigned</option>
                            {crew.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name} ({c.role})
                              </option>
                            ))}
                          </Form.Select>
                        </Col>
                        <Col>
                          <Form.Select
                            value={selectedTrip.crewIds[1] ?? ""}
                            onChange={(e) => {
                              const a = [...selectedTrip.crewIds];
                              a[1] = e.target.value;
                              updateTrip(selectedTrip.id, { crewIds: a });
                            }}
                          >
                            <option value="">Unassigned</option>
                            {crew.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name} ({c.role})
                              </option>
                            ))}
                          </Form.Select>
                        </Col>
                      </Row>

                      <div className="mt-3 text-muted">Notes</div>
                      <Form.Control
                        className="mt-1"
                        as="textarea"
                        rows={3}
                        value={selectedTrip.notes}
                        onChange={(e) => updateTrip(selectedTrip.id, { notes: e.target.value })}
                        placeholder="Dispatch notes..."
                      />
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTripModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
