import { useMemo, useState } from "react";
import { Button, Card, Row, Col, Modal, Badge, ListGroup, Table } from "react-bootstrap";

/**
 * POC assumptions:
 * - You can later replace this with real data from your store/API.
 * - Working hours: (ON days in next 30) * DUTY_HOURS_PER_DAY
 * - Upcoming trips: uses a local sample list below. Replace with your trips state later.
 */

const DUTY_HOURS_PER_DAY = 8;

// Sample crew (replace with your real crew state later)
const CREW = [
  { id: "rod", name: "Rod", role: "Captain", base: "ATL", phone: "678-227-8429" },
  { id: "john", name: "John", role: "First Officer", base: "ATL", phone: "555-123-4567" },
  { id: "dan", name: "Dan", role: "Captain", base: "TEB", phone: "555-222-3333" },
  { id: "kyle", name: "Kyle", role: "First Officer", base: "TEB", phone: "555-444-5555" }
];

// Sample trips (replace with Trips page state / context later)
const TRIPS = [
  {
    id: "t1",
    date: "2026-02-05",
    clientName: "Acme Exec Travel",
    departure: "ATL",
    destination: "TEB",
    planeType: "Citation X",
    passengers: 6,
    catering: "Light snacks",
    pilots: ["Rod", "John"]
  },
  {
    id: "t2",
    date: "2026-02-07",
    clientName: "Private Client",
    departure: "TEB",
    destination: "PBI",
    planeType: "Hawker",
    passengers: 4,
    catering: "None",
    pilots: ["Dan", "Kyle"]
  }
];

// Helper: YYYY-MM-DD today
function todayYMD() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Helper: add days
function addDaysYMD(ymd, days) {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function Crew() {
  const [selected, setSelected] = useState(null);
  const [show, setShow] = useState(false);

  const openCrew = (crewMember) => {
    setSelected(crewMember);
    setShow(true);
  };

  const closeCrew = () => {
    setShow(false);
    setSelected(null);
  };

  // Upcoming trips for the selected crew member
  const upcomingTrips = useMemo(() => {
    if (!selected) return [];
    const now = todayYMD();
    return TRIPS
      .filter((t) => t.date >= now)
      .filter((t) => (t.pilots || []).includes(selected.name))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [selected]);

  // POC schedule summary (replace with your real assignments later)
  // Here we fake “ON days” by counting days that have a trip assignment for this pilot.
  const scheduleSummary = useMemo(() => {
    if (!selected) return { next30OnDays: 0, hoursNext30: 0, windowStart: "", windowEnd: "" };

    const start = todayYMD();
    const end = addDaysYMD(start, 30);

    const daysWorked = new Set(
      TRIPS
        .filter((t) => t.date >= start && t.date <= end)
        .filter((t) => (t.pilots || []).includes(selected.name))
        .map((t) => t.date)
    );

    const next30OnDays = daysWorked.size;
    const hoursNext30 = next30OnDays * DUTY_HOURS_PER_DAY;

    return { next30OnDays, hoursNext30, windowStart: start, windowEnd: end };
  }, [selected]);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Crew</h3>
        <Button variant="primary">Add Crew</Button>
      </div>

      <Row className="g-3">
        {CREW.map((c) => (
          <Col key={c.id} md={6} xl={3}>
            <Card
              className="shadow-sm h-100"
              role="button"
              onClick={() => openCrew(c)}
              style={{ cursor: "pointer" }}
            >
              <Card.Body>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{c.name}</div>
                <div className="text-muted" style={{ fontSize: 13 }}>
                  {c.role} • Base {c.base}
                </div>

                <div className="mt-2">
                  <Badge bg="secondary" className="me-2">Profile</Badge>
                  <Badge bg="info">Click for details</Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal show={show} onHide={closeCrew} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{selected ? `${selected.name} — Crew Profile` : "Crew Profile"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {!selected ? null : (
            <>
              {/* Pilot Info */}
              <Row className="g-3 mb-3">
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Body>
                      <div style={{ fontWeight: 800, marginBottom: 6 }}>Pilot Info</div>
                      <div><b>Role:</b> {selected.role}</div>
                      <div><b>Base:</b> {selected.base}</div>
                      <div><b>Phone:</b> {selected.phone}</div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="h-100">
                    <Card.Body>
                      <div style={{ fontWeight: 800, marginBottom: 6 }}>Working Hours (POC)</div>
                      <div className="text-muted" style={{ fontSize: 13 }}>
                        Window: {scheduleSummary.windowStart} → {scheduleSummary.windowEnd}
                      </div>
                      <div className="mt-2">
                        <div><b>Days Working (next 30):</b> {scheduleSummary.next30OnDays}</div>
                        <div><b>Estimated Hours:</b> {scheduleSummary.hoursNext30}</div>
                      </div>
                      <div className="text-muted mt-2" style={{ fontSize: 12 }}>
                        (Using {DUTY_HOURS_PER_DAY} hrs/day assumption for now.)
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Upcoming Trips */}
              <Card>
                <Card.Body>
                  <div style={{ fontWeight: 800, marginBottom: 10 }}>Upcoming Trips</div>

                  {upcomingTrips.length === 0 ? (
                    <div className="text-muted">No upcoming trips assigned.</div>
                  ) : (
                    <Table responsive hover size="sm" className="mb-0">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Route</th>
                          <th>Plane</th>
                          <th>PAX</th>
                          <th>Catering</th>
                        </tr>
                      </thead>
                      <tbody>
                        {upcomingTrips.map((t) => (
                          <tr key={t.id}>
                            <td>{t.date}</td>
                            <td>
                              <Badge bg="dark" className="me-1">{t.departure}</Badge>
                              →{" "}
                              <Badge bg="dark" className="ms-1">{t.destination}</Badge>
                            </td>
                            <td>{t.planeType}</td>
                            <td>{t.passengers}</td>
                            <td>{t.catering || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>

              {/* Schedule Preview (optional placeholder) */}
              <div className="mt-3">
                <Card>
                  <Card.Body>
                    <div style={{ fontWeight: 800, marginBottom: 10 }}>Schedule Preview (POC)</div>
                    <ListGroup>
                      {upcomingTrips.slice(0, 5).map((t) => (
                        <ListGroup.Item key={t.id}>
                          {t.date} — {t.departure} → {t.destination} ({t.planeType})
                        </ListGroup.Item>
                      ))}
                      {upcomingTrips.length === 0 && (
                        <ListGroup.Item className="text-muted">No schedule items to show.</ListGroup.Item>
                      )}
                    </ListGroup>
                  </Card.Body>
                </Card>
              </div>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={closeCrew}>Close</Button>
          <Button variant="primary" onClick={() => alert("Later: edit crew profile")}>
            Edit Crew
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
