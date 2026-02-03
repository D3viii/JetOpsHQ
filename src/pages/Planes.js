import { useMemo, useState } from "react";
import {
  Button,
  Card,
  Row,
  Col,
  Modal,
  Badge,
  Form,
  Table
} from "react-bootstrap";

/**
 * POC Planes Page
 * - Clickable plane cards
 * - Plane details modal
 * - Add plane modal
 *
 * Later: wire to global state/context or API.
 */

const PLANE_TYPES = ["Hawker", "Citation X"];

// Seed data (replace later)
const INITIAL_PLANES = [
  {
    id: "p1",
    tail: "118DL",
    type: "Hawker",
    model: "Hawker 800XP",
    seats: 8,
    base: "ATL",
    status: "Available", // Available | In Use | Maintenance
    scheduledUse: "Light",
    nextMaintenanceDate: "2026-02-20",
    maintenanceType: "A-Check",
    hoursUntilDue: 42,
    notes: "Wi-Fi installed. De-ice OK."
  },
  {
    id: "p2",
    tail: "808ME",
    type: "Citation X",
    model: "Cessna Citation X",
    seats: 9,
    base: "TEB",
    status: "In Use",
    scheduledUse: "Heavy",
    nextMaintenanceDate: "2026-03-05",
    maintenanceType: "Phase Inspection",
    hoursUntilDue: 18,
    notes: "Exterior wash scheduled next week."
  }
];

// If you later store trips with a "tail" field, this will show scheduled use.
// For now it’s a placeholder list to demonstrate the UI.
const SAMPLE_UPCOMING = [
  { id: "t1", date: "2026-02-05", route: "ATL → TEB", tail: "118DL", pax: 6 },
  { id: "t2", date: "2026-02-07", route: "TEB → PBI", tail: "808ME", pax: 4 },
  { id: "t3", date: "2026-02-10", route: "ATL → MIA", tail: "118DL", pax: 7 }
];

function badgeVariantForStatus(status) {
  if (status === "Available") return "success";
  if (status === "In Use") return "primary";
  if (status === "Maintenance") return "warning";
  return "secondary";
}

export default function Planes() {
  const [planes, setPlanes] = useState(INITIAL_PLANES);

  const [selected, setSelected] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState({
    tail: "",
    type: "Hawker",
    model: "",
    seats: 8,
    base: "",
    status: "Available",
    scheduledUse: "Light",
    nextMaintenanceDate: "",
    maintenanceType: "",
    hoursUntilDue: 0,
    notes: ""
  });

  const openDetails = (plane) => {
    setSelected(plane);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelected(null);
  };

  const resetDraft = () =>
    setDraft({
      tail: "",
      type: "Hawker",
      model: "",
      seats: 8,
      base: "",
      status: "Available",
      scheduledUse: "Light",
      nextMaintenanceDate: "",
      maintenanceType: "",
      hoursUntilDue: 0,
      notes: ""
    });

  const upcomingForSelected = useMemo(() => {
    if (!selected) return [];
    return SAMPLE_UPCOMING.filter((t) => t.tail === selected.tail).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }, [selected]);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Planes</h3>
        <Button
          onClick={() => {
            resetDraft();
            setShowAdd(true);
          }}
        >
          Add Plane
        </Button>
      </div>

      <Row className="g-3">
        {planes.map((p) => (
          <Col key={p.id} md={6} xl={3}>
            <Card
              className="shadow-sm h-100"
              role="button"
              onClick={() => openDetails(p)}
              style={{ cursor: "pointer" }}
            >
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 16 }}>{p.tail}</div>
                    <div className="text-muted" style={{ fontSize: 13 }}>
                      {p.type} • {p.model}
                    </div>
                  </div>
                  <Badge bg={badgeVariantForStatus(p.status)}>{p.status}</Badge>
                </div>

                <div className="mt-2" style={{ fontSize: 13 }}>
                  <div>
                    <b>Seats:</b> {p.seats}
                  </div>
                  <div>
                    <b>Base:</b> {p.base || "—"}
                  </div>
                  <div>
                    <b>Use:</b> {p.scheduledUse || "—"}
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-muted" style={{ fontSize: 12 }}>
                    Next maint:{" "}
                    <b className="text-dark">{p.nextMaintenanceDate || "—"}</b>
                  </div>
                  {typeof p.hoursUntilDue === "number" && p.hoursUntilDue > 0 && (
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      Hours until due:{" "}
                      <b className="text-dark">{p.hoursUntilDue}</b>
                    </div>
                  )}
                </div>

                <div className="mt-2 text-muted" style={{ fontSize: 12 }}>
                  Click for details
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* DETAILS MODAL */}
      <Modal show={showDetails} onHide={closeDetails} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {selected ? `${selected.tail} — Aircraft Details` : "Aircraft Details"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {!selected ? null : (
            <>
              <Row className="g-3 mb-3">
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <div style={{ fontWeight: 900, fontSize: 18 }}>
                            {selected.tail}
                          </div>
                          <div className="text-muted">
                            {selected.type} • {selected.model}
                          </div>
                        </div>
                        <Badge bg={badgeVariantForStatus(selected.status)}>
                          {selected.status}
                        </Badge>
                      </div>

                      <div className="mt-3" style={{ lineHeight: 1.8 }}>
                        <div>
                          <b>Seats:</b> {selected.seats}
                        </div>
                        <div>
                          <b>Base:</b> {selected.base || "—"}
                        </div>
                        <div>
                          <b>Scheduled Use:</b> {selected.scheduledUse || "—"}
                        </div>
                        <div>
                          <b>Notes:</b> {selected.notes || "—"}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="h-100">
                    <Card.Body>
                      <div style={{ fontWeight: 900, marginBottom: 8 }}>
                        Maintenance
                      </div>
                      <div style={{ lineHeight: 1.8 }}>
                        <div>
                          <b>Next Maintenance Date:</b>{" "}
                          {selected.nextMaintenanceDate || "—"}
                        </div>
                        <div>
                          <b>Maintenance Type:</b>{" "}
                          {selected.maintenanceType || "—"}
                        </div>
                        <div>
                          <b>Hours Until Due:</b>{" "}
                          {typeof selected.hoursUntilDue === "number"
                            ? selected.hoursUntilDue
                            : "—"}
                        </div>
                      </div>

                      <div className="mt-3">
                        <Badge bg="secondary" className="me-2">
                          POC
                        </Badge>
                        <span className="text-muted" style={{ fontSize: 12 }}>
                          Later we’ll calculate this from flight hours / cycles.
                        </span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Card>
                <Card.Body>
                  <div style={{ fontWeight: 900, marginBottom: 10 }}>
                    Scheduled Use (Upcoming Trips)
                  </div>

                  {upcomingForSelected.length === 0 ? (
                    <div className="text-muted">No trips scheduled for this aircraft.</div>
                  ) : (
                    <Table responsive hover size="sm" className="mb-0">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Route</th>
                          <th>PAX</th>
                        </tr>
                      </thead>
                      <tbody>
                        {upcomingForSelected.map((t) => (
                          <tr key={t.id}>
                            <td>{t.date}</td>
                            <td>{t.route}</td>
                            <td>{t.pax}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={closeDetails}>
            Close
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              // If your eslint blocks confirm like before, remove this and use a modal.
              const ok = window.confirm("Delete this plane?");
              if (!ok || !selected) return;
              setPlanes((prev) => prev.filter((x) => x.id !== selected.id));
              closeDetails();
            }}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ADD PLANE MODAL */}
      <Modal show={showAdd} onHide={() => setShowAdd(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Plane</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Label>Tail</Form.Label>
              <Form.Control
                value={draft.tail}
                onChange={(e) => setDraft((d) => ({ ...d, tail: e.target.value.toUpperCase() }))}
                placeholder="e.g. 118DL"
              />
            </Col>

            <Col md={4}>
              <Form.Label>Plane Type</Form.Label>
              <Form.Select
                value={draft.type}
                onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))}
              >
                {PLANE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Form.Select>
            </Col>

            <Col md={4}>
              <Form.Label>Seats</Form.Label>
              <Form.Control
                type="number"
                min={1}
                value={draft.seats}
                onChange={(e) => setDraft((d) => ({ ...d, seats: Number(e.target.value) }))}
              />
            </Col>

            <Col md={6}>
              <Form.Label>Model</Form.Label>
              <Form.Control
                value={draft.model}
                onChange={(e) => setDraft((d) => ({ ...d, model: e.target.value }))}
                placeholder="e.g. Hawker 800XP"
              />
            </Col>

            <Col md={6}>
              <Form.Label>Base</Form.Label>
              <Form.Control
                value={draft.base}
                onChange={(e) => setDraft((d) => ({ ...d, base: e.target.value.toUpperCase() }))}
                placeholder="e.g. ATL"
              />
            </Col>

            <Col md={6}>
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={draft.status}
                onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
              >
                <option value="Available">Available</option>
                <option value="In Use">In Use</option>
                <option value="Maintenance">Maintenance</option>
              </Form.Select>
            </Col>

            <Col md={6}>
              <Form.Label>Scheduled Use</Form.Label>
              <Form.Select
                value={draft.scheduledUse}
                onChange={(e) => setDraft((d) => ({ ...d, scheduledUse: e.target.value }))}
              >
                <option value="Light">Light</option>
                <option value="Moderate">Moderate</option>
                <option value="Heavy">Heavy</option>
              </Form.Select>
            </Col>

            <Col md={6}>
              <Form.Label>Next Maintenance Date</Form.Label>
              <Form.Control
                type="date"
                value={draft.nextMaintenanceDate}
                onChange={(e) => setDraft((d) => ({ ...d, nextMaintenanceDate: e.target.value }))}
              />
            </Col>

            <Col md={6}>
              <Form.Label>Maintenance Type</Form.Label>
              <Form.Control
                value={draft.maintenanceType}
                onChange={(e) => setDraft((d) => ({ ...d, maintenanceType: e.target.value }))}
                placeholder="e.g. A-Check / Phase / Engine"
              />
            </Col>

            <Col md={6}>
              <Form.Label>Hours Until Due (POC)</Form.Label>
              <Form.Control
                type="number"
                min={0}
                value={draft.hoursUntilDue}
                onChange={(e) => setDraft((d) => ({ ...d, hoursUntilDue: Number(e.target.value) }))}
              />
            </Col>

            <Col md={12}>
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={draft.notes}
                onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
                placeholder="Anything ops should know (Wi-Fi, special equipment, limitations, etc.)"
              />
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAdd(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (!draft.tail.trim()) return alert("Tail is required");
              if (!draft.model.trim()) return alert("Model is required");

              const id =
                typeof crypto !== "undefined" && "randomUUID" in crypto
                  ? crypto.randomUUID()
                  : String(Date.now());

              setPlanes((prev) => [
                ...prev,
                {
                  id,
                  tail: draft.tail.trim(),
                  type: draft.type,
                  model: draft.model.trim(),
                  seats: Number(draft.seats) || 1,
                  base: draft.base.trim(),
                  status: draft.status,
                  scheduledUse: draft.scheduledUse,
                  nextMaintenanceDate: draft.nextMaintenanceDate,
                  maintenanceType: draft.maintenanceType.trim(),
                  hoursUntilDue: Number(draft.hoursUntilDue) || 0,
                  notes: draft.notes
                }
              ]);

              setShowAdd(false);
            }}
          >
            Save Plane
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
