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
} from "react-bootstrap";

function ymd(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const yyyy = x.getFullYear();
  const mm = String(x.getMonth() + 1).padStart(2, "0");
  const dd = String(x.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const tripsMock = [
  { id: "t1", date: ymd(), clientName: "Acme Exec Travel", from: "ATL", to: "TEB", tail: "118DL" },
  { id: "t2", date: ymd(), clientName: "Blue Ridge Partners", from: "PDK", to: "PBI", tail: "808ME" },
];

const crewMock = [
  { id: "c1", name: "Rod Carr" },
  { id: "c2", name: "John Smith" },
  { id: "c3", name: "Dan Green" },
  { id: "c4", name: "Kyle White" },
];

const badgeForStatus = (status) => {
  const map = {
    DRAFT: { bg: "secondary", text: "Draft" },
    REQUESTED: { bg: "warning", text: "Requested" },
    CONFIRMED: { bg: "success", text: "Confirmed" },
    CANCELLED: { bg: "danger", text: "Cancelled" },
  };
  const s = map[status] ?? { bg: "secondary", text: status };
  return <Badge bg={s.bg}>{s.text}</Badge>;
};

const badgeForType = (type) => {
  const map = {
    HOTEL: { bg: "primary", text: "Hotel" },
    CAR: { bg: "info", text: "Rental Car" },
    FLIGHT: { bg: "dark", text: "Commercial Flight" },
  };
  const s = map[type] ?? { bg: "secondary", text: type };
  return <Badge bg={s.bg}>{s.text}</Badge>;
};

function uid() {
  try {
    // eslint-disable-next-line no-undef
    return crypto.randomUUID();
  } catch {
    return String(Date.now());
  }
}

export default function Accommodations() {
  const [trips] = useState(tripsMock);
  const [crew] = useState(crewMock);

  const [bookings, setBookings] = useState([
    {
      id: "b1",
      type: "HOTEL", // HOTEL | CAR | FLIGHT
      status: "CONFIRMED", // DRAFT | REQUESTED | CONFIRMED | CANCELLED
      tripId: "t1",
      assignedCrewIds: ["c1", "c2"],
      provider: "Marriott",
      location: "TEB area",
      startDate: ymd(),
      endDate: ymd(new Date(Date.now() + 86400000)),
      cost: 480,
      notes: "Late check-in. Two rooms.",
      ref: "H-23991",
    },
    {
      id: "b2",
      type: "CAR",
      status: "REQUESTED",
      tripId: "t2",
      assignedCrewIds: ["c3"],
      provider: "Hertz",
      location: "PBI",
      startDate: ymd(),
      endDate: ymd(new Date(Date.now() + 2 * 86400000)),
      cost: 220,
      notes: "SUV preferred.",
      ref: "",
    },
  ]);

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const [draft, setDraft] = useState({
    type: "HOTEL",
    status: "DRAFT",
    tripId: trips[0]?.id ?? "",
    assignedCrewIds: [],
    provider: "",
    location: "",
    startDate: ymd(),
    endDate: ymd(),
    cost: 0,
    notes: "",
    ref: "",
  });

  const [selectedId, setSelectedId] = useState(null);
  const selected = useMemo(
    () => bookings.find((b) => b.id === selectedId) ?? null,
    [bookings, selectedId]
  );

  const tripById = useMemo(() => new Map(trips.map((t) => [t.id, t])), [trips]);
  const crewById = useMemo(() => new Map(crew.map((c) => [c.id, c])), [crew]);

  const openCreate = () => {
    setDraft({
      type: "HOTEL",
      status: "DRAFT",
      tripId: trips[0]?.id ?? "",
      assignedCrewIds: [],
      provider: "",
      location: "",
      startDate: ymd(),
      endDate: ymd(),
      cost: 0,
      notes: "",
      ref: "",
    });
    setShowCreate(true);
  };

  const openDetail = (id) => {
    setSelectedId(id);
    setShowDetail(true);
  };

  const updateBooking = (id, patch) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const deleteBooking = (id) => {
    // No confirm() to avoid eslint no-restricted-globals
    setBookings((prev) => prev.filter((b) => b.id !== id));
    setShowDetail(false);
    setSelectedId(null);
  };

  const stats = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter((b) => b.status === "CONFIRMED").length;
    const requested = bookings.filter((b) => b.status === "REQUESTED").length;
    const cost = bookings.reduce((sum, b) => sum + (Number(b.cost) || 0), 0);
    return { total, confirmed, requested, cost };
  }, [bookings]);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-1">Accommodations</h3>
          <div className="text-muted">
            Book hotels, rental cars, and commercial flights — assign to trips + crew.
          </div>
        </div>

        <Button onClick={openCreate}>Create Booking</Button>
      </div>

      {/* Top stats */}
      <Row className="g-3 mb-3">
        <Col md={6} xl={3}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="text-muted">Total Bookings</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{stats.total}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} xl={3}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="text-muted">Requested</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{stats.requested}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} xl={3}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="text-muted">Confirmed</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{stats.confirmed}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} xl={3}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="text-muted">Total Est. Cost</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>${stats.cost.toLocaleString()}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Booking cards */}
      <Row className="g-3">
        {bookings.map((b) => {
          const t = tripById.get(b.tripId);
          const crewNames = (b.assignedCrewIds || [])
            .map((id) => crewById.get(id)?.name)
            .filter(Boolean);

          return (
            <Col key={b.id} md={6} xl={4}>
              <Card
                className="shadow-sm h-100"
                style={{ cursor: "pointer" }}
                onClick={() => openDetail(b.id)}
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 16 }}>
                        {badgeForType(b.type)} <span className="ms-2">{badgeForStatus(b.status)}</span>
                      </div>
                      <div className="text-muted" style={{ fontSize: 12, marginTop: 6 }}>
                        {b.provider || "Provider TBD"} • {b.location || "Location TBD"}
                      </div>
                    </div>
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      ${Number(b.cost || 0).toLocaleString()}
                    </div>
                  </div>

                  <hr className="my-2" />

                  <div style={{ fontWeight: 800 }}>
                    {t ? (
                      <>
                        Trip: {t.from} → {t.to} <span className="text-muted">({t.tail})</span>
                      </>
                    ) : (
                      <span className="text-muted">Trip: Unassigned</span>
                    )}
                  </div>

                  <div className="text-muted" style={{ fontSize: 12 }}>
                    {b.startDate} → {b.endDate}
                  </div>

                  <div className="mt-2">
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      Assigned Crew
                    </div>
                    <div style={{ fontSize: 13 }}>
                      {crewNames.length ? crewNames.join(", ") : <span className="text-muted">None</span>}
                    </div>
                  </div>

                  {!!b.ref && (
                    <div className="mt-2 text-muted" style={{ fontSize: 12 }}>
                      Ref: <span style={{ fontWeight: 700 }}>{b.ref}</span>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Create Booking Modal */}
      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create Booking</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Label>Type</Form.Label>
              <Form.Select
                value={draft.type}
                onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))}
              >
                <option value="HOTEL">Hotel</option>
                <option value="CAR">Rental Car</option>
                <option value="FLIGHT">Commercial Flight</option>
              </Form.Select>
            </Col>

            <Col md={6}>
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={draft.status}
                onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
              >
                <option value="DRAFT">Draft</option>
                <option value="REQUESTED">Requested</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CANCELLED">Cancelled</option>
              </Form.Select>
            </Col>

            <Col md={12}>
              <Form.Label>Trip</Form.Label>
              <Form.Select
                value={draft.tripId}
                onChange={(e) => setDraft((d) => ({ ...d, tripId: e.target.value }))}
              >
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.date} • {t.clientName} • {t.from}→{t.to} • {t.tail}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={6}>
              <Form.Label>Provider</Form.Label>
              <Form.Control
                value={draft.provider}
                onChange={(e) => setDraft((d) => ({ ...d, provider: e.target.value }))}
                placeholder="e.g., Marriott / Hertz / Delta"
              />
            </Col>

            <Col md={6}>
              <Form.Label>Location</Form.Label>
              <Form.Control
                value={draft.location}
                onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
                placeholder="e.g., TEB area / PBI / NYC"
              />
            </Col>

            <Col md={6}>
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={draft.startDate}
                onChange={(e) => setDraft((d) => ({ ...d, startDate: e.target.value }))}
              />
            </Col>

            <Col md={6}>
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                value={draft.endDate}
                onChange={(e) => setDraft((d) => ({ ...d, endDate: e.target.value }))}
              />
            </Col>

            <Col md={6}>
              <Form.Label>Estimated Cost</Form.Label>
              <Form.Control
                type="number"
                min={0}
                value={draft.cost}
                onChange={(e) => setDraft((d) => ({ ...d, cost: Number(e.target.value) }))}
              />
            </Col>

            <Col md={6}>
              <Form.Label>Reference # (optional)</Form.Label>
              <Form.Control
                value={draft.ref}
                onChange={(e) => setDraft((d) => ({ ...d, ref: e.target.value }))}
                placeholder="e.g., confirmation number"
              />
            </Col>

            <Col md={12}>
              <Form.Label>Assign Crew</Form.Label>
              <div className="d-grid gap-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
                {crew.map((c) => {
                  const checked = draft.assignedCrewIds.includes(c.id);
                  return (
                    <Form.Check
                      key={c.id}
                      type="checkbox"
                      label={c.name}
                      checked={checked}
                      onChange={() => {
                        setDraft((d) => {
                          const set = new Set(d.assignedCrewIds);
                          if (set.has(c.id)) set.delete(c.id);
                          else set.add(c.id);
                          return { ...d, assignedCrewIds: Array.from(set) };
                        });
                      }}
                    />
                  );
                })}
              </div>
            </Col>

            <Col md={12}>
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={draft.notes}
                onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
                placeholder="Special requests, pickup times, room types, etc."
              />
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreate(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!draft.tripId) return alert("Trip is required");
              const newBooking = {
                id: uid(),
                ...draft,
                cost: Number(draft.cost) || 0,
              };
              setBookings((prev) => [newBooking, ...prev]);
              setShowCreate(false);
            }}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Detail Modal */}
      <Modal show={showDetail} onHide={() => setShowDetail(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Booking Details</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {!selected ? (
            <div className="text-muted">No booking selected.</div>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div style={{ fontWeight: 900, fontSize: 18 }}>
                    {badgeForType(selected.type)} <span className="ms-2">{badgeForStatus(selected.status)}</span>
                  </div>
                  <div className="text-muted">
                    {selected.provider || "Provider TBD"} • {selected.location || "Location TBD"}
                  </div>
                </div>

                <div style={{ fontWeight: 900, fontSize: 18 }}>
                  ${Number(selected.cost || 0).toLocaleString()}
                </div>
              </div>

              <Table responsive className="mb-0">
                <tbody>
                  <tr>
                    <td className="text-muted" style={{ width: 180 }}>Trip</td>
                    <td>
                      {(() => {
                        const t = tripById.get(selected.tripId);
                        if (!t) return <span className="text-muted">Unassigned</span>;
                        return (
                          <>
                            {t.date} • {t.clientName} • {t.from}→{t.to} • {t.tail}
                          </>
                        );
                      })()}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted">Dates</td>
                    <td>{selected.startDate} → {selected.endDate}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Reference</td>
                    <td>{selected.ref || <span className="text-muted">None</span>}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Assigned Crew</td>
                    <td>
                      {(selected.assignedCrewIds || [])
                        .map((id) => crewById.get(id)?.name)
                        .filter(Boolean)
                        .join(", ") || <span className="text-muted">None</span>}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted">Notes</td>
                    <td>{selected.notes || <span className="text-muted">None</span>}</td>
                  </tr>
                </tbody>
              </Table>

              <hr />

              <Row className="g-3">
                <Col md={6}>
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={selected.status}
                    onChange={(e) => updateBooking(selected.id, { status: e.target.value })}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="REQUESTED">Requested</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </Form.Select>
                </Col>

                <Col md={6}>
                  <Form.Label>Reference #</Form.Label>
                  <Form.Control
                    value={selected.ref || ""}
                    onChange={(e) => updateBooking(selected.id, { ref: e.target.value })}
                    placeholder="confirmation number"
                  />
                </Col>

                <Col md={6}>
                  <Form.Label>Provider</Form.Label>
                  <Form.Control
                    value={selected.provider || ""}
                    onChange={(e) => updateBooking(selected.id, { provider: e.target.value })}
                  />
                </Col>

                <Col md={6}>
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    value={selected.location || ""}
                    onChange={(e) => updateBooking(selected.id, { location: e.target.value })}
                  />
                </Col>

                <Col md={6}>
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={selected.startDate}
                    onChange={(e) => updateBooking(selected.id, { startDate: e.target.value })}
                  />
                </Col>

                <Col md={6}>
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={selected.endDate}
                    onChange={(e) => updateBooking(selected.id, { endDate: e.target.value })}
                  />
                </Col>

                <Col md={6}>
                  <Form.Label>Estimated Cost</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    value={selected.cost}
                    onChange={(e) => updateBooking(selected.id, { cost: Number(e.target.value) })}
                  />
                </Col>

                <Col md={12}>
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={selected.notes || ""}
                    onChange={(e) => updateBooking(selected.id, { notes: e.target.value })}
                  />
                </Col>
              </Row>
            </>
          )}
        </Modal.Body>

        <Modal.Footer className="d-flex justify-content-between">
          <Button variant="outline-danger" onClick={() => deleteBooking(selected?.id)}>
            Delete
          </Button>
          <Button variant="secondary" onClick={() => setShowDetail(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
