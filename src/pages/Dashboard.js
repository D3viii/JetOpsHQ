import { useMemo, useState } from "react";
import {
  Card,
  Row,
  Col,
  Badge,
  Modal,
  Button,
  Table,
  ListGroup
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

/**
 * WORKING CLICKABLE DASHBOARD (POC)
 * - Uses local sample data for now
 * - Drill-down modals for Trips, Crew, Planes, Alerts, Weather
 * - "Go to page" buttons navigate to your existing routes
 *
 * Later: replace SAMPLE_* arrays with data from Context or API.
 */

const TODAY_YMD = (() => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
})();

const SAMPLE_TRIPS = [
  {
    id: "t1",
    client: "Acme",
    date: TODAY_YMD,
    from: "ATL",
    to: "TEB",
    planeType: "Hawker",
    tail: "118DL",
    passengers: 6,
    catering: "Standard snacks + water",
    pilots: ["Rod", "Dan"]
  },
  {
    id: "t2",
    client: "Peachtree Capital",
    date: TODAY_YMD,
    from: "TEB",
    to: "PBI",
    planeType: "Citation X",
    tail: "808ME",
    passengers: 4,
    catering: "Sandwich tray",
    pilots: ["John", "Kyle"]
  },
  {
    id: "t3",
    client: "North GA Holdings",
    date: "2099-01-01", // future sample
    from: "ATL",
    to: "MIA",
    planeType: "Hawker",
    tail: "118DL",
    passengers: 7,
    catering: "Fruit + coffee",
    pilots: ["Rod", "Dan"]
  }
];

const SAMPLE_CREW = [
  { name: "Rod", role: "Captain", status: "Active", hoursToday: 5.2, nextTripId: "t1" },
  { name: "Dan", role: "First Officer", status: "Active", hoursToday: 5.2, nextTripId: "t1" },
  { name: "John", role: "Captain", status: "Active", hoursToday: 3.1, nextTripId: "t2" },
  { name: "Kyle", role: "First Officer", status: "Active", hoursToday: 3.1, nextTripId: "t2" },
  { name: "Josh", role: "Reserve", status: "Extra", hoursToday: 0, nextTripId: null }
];

const SAMPLE_PLANES = [
  {
    id: "p1",
    tail: "118DL",
    type: "Hawker",
    model: "Hawker 800XP",
    seats: 8,
    base: "ATL",
    status: "In Use",
    nextMaintenanceDate: "2026-02-20",
    hoursUntilDue: 42
  },
  {
    id: "p2",
    tail: "808ME",
    type: "Citation X",
    model: "Cessna Citation X",
    seats: 9,
    base: "TEB",
    status: "In Use",
    nextMaintenanceDate: "2026-03-05",
    hoursUntilDue: 18
  },
  {
    id: "p3",
    tail: "55JT",
    type: "Hawker",
    model: "Hawker 900XP",
    seats: 8,
    base: "ATL",
    status: "Available",
    nextMaintenanceDate: "2026-04-10",
    hoursUntilDue: 110
  }
];

function isToday(trip) {
  return trip.date === TODAY_YMD;
}

function badgeForPlaneStatus(status) {
  if (status === "Available") return "success";
  if (status === "In Use") return "primary";
  if (status === "Maintenance") return "warning";
  return "secondary";
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [panel, setPanel] = useState(null); // "trips" | "crew" | "planes" | "alerts" | "weather"
  const closePanel = () => setPanel(null);

  const tripsToday = useMemo(() => SAMPLE_TRIPS.filter(isToday), []);
  const activeCrew = useMemo(
    () => SAMPLE_CREW.filter((c) => c.status === "Active"),
    []
  );
  const tailsInUse = useMemo(
    () => SAMPLE_PLANES.filter((p) => p.status === "In Use"),
    []
  );

  const alerts = useMemo(() => {
    const list = [];

    // Example alert rules (POC)
    const maintSoon = SAMPLE_PLANES.filter((p) => (p.hoursUntilDue ?? 999) <= 25);
    if (maintSoon.length) {
      list.push({
        id: "a1",
        level: "warning",
        title: "Maintenance due soon",
        detail: maintSoon.map((p) => `${p.tail} (${p.hoursUntilDue} hrs)`).join(", ")
      });
    }

    const unassigned = tripsToday.filter((t) => !t.pilots || t.pilots.length < 2);
    if (unassigned.length) {
      list.push({
        id: "a2",
        level: "danger",
        title: "Trip missing crew",
        detail: unassigned.map((t) => `${t.from}→${t.to} (${t.client})`).join(", ")
      });
    }

    // Always show at least 1 “sample” so the UI isn’t empty
    if (list.length === 0) {
      list.push({
        id: "a0",
        level: "secondary",
        title: "No critical alerts",
        detail: "All clear for today (POC)."
      });
    }

    return list;
  }, [tripsToday]);

  const nextTrip = useMemo(() => {
    // POC: choose the first trip today; later sort by time
    return tripsToday[0] ?? null;
  }, [tripsToday]);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Dashboard</h3>
        <Badge bg="secondary">Today • {TODAY_YMD}</Badge>
      </div>

      <Row className="g-3">
        {/* STATS */}
        <Col md={6} xl={3}>
          <Card
            className="shadow-sm h-100"
            role="button"
            style={{ cursor: "pointer" }}
            onClick={() => setPanel("trips")}
          >
            <Card.Body>
              <div className="text-muted">Trips Today</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{tripsToday.length}</div>
              <div className="text-muted" style={{ fontSize: 12 }}>
                Click to view
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={3}>
          <Card
            className="shadow-sm h-100"
            role="button"
            style={{ cursor: "pointer" }}
            onClick={() => setPanel("crew")}
          >
            <Card.Body>
              <div className="text-muted">Active Crew</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{activeCrew.length}</div>
              <div className="text-muted" style={{ fontSize: 12 }}>
                Click to view
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={3}>
          <Card
            className="shadow-sm h-100"
            role="button"
            style={{ cursor: "pointer" }}
            onClick={() => setPanel("planes")}
          >
            <Card.Body>
              <div className="text-muted">Tails in Use</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{tailsInUse.length}</div>
              <div className="text-muted" style={{ fontSize: 12 }}>
                Click to view
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={3}>
          <Card
            className="shadow-sm h-100"
            role="button"
            style={{ cursor: "pointer" }}
            onClick={() => setPanel("alerts")}
          >
            <Card.Body>
              <div className="text-muted">Alerts</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{alerts.length}</div>
              <div className="text-muted" style={{ fontSize: 12 }}>
                Click to view
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* TRIPS TODAY WIDGET */}
        <Col xl={8}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Trips Today</h5>
                <div className="d-flex gap-2">
                  <Button size="sm" variant="outline-secondary" onClick={() => setPanel("trips")}>
                    View list
                  </Button>
                  <Button size="sm" onClick={() => navigate("/trips")}>
                    Go to Trips
                  </Button>
                </div>
              </div>

              <div className="mt-2">
                {!nextTrip ? (
                  <div className="text-muted">No trips scheduled for today.</div>
                ) : (
                  <Card className="mt-2 border-0" style={{ background: "#f8fafc" }}>
                    <Card.Body>
                      <div style={{ fontWeight: 900 }}>
                        {nextTrip.from} → {nextTrip.to} • {nextTrip.planeType} • Tail {nextTrip.tail}
                      </div>
                      <div className="text-muted" style={{ fontSize: 13 }}>
                        Client: {nextTrip.client} • PAX {nextTrip.passengers}
                      </div>
                      <div className="text-muted" style={{ fontSize: 13 }}>
                        Crew: {nextTrip.pilots?.join(", ") || "—"}
                      </div>
                      <div className="text-muted" style={{ fontSize: 13 }}>
                        Catering: {nextTrip.catering || "—"}
                      </div>
                    </Card.Body>
                  </Card>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* WEATHER WIDGET */}
        <Col xl={4}>
          <Card
            className="shadow-sm h-100"
            role="button"
            style={{ cursor: "pointer" }}
            onClick={() => setPanel("weather")}
          >
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Weather Snapshot</h5>
                <Badge bg="info">POC</Badge>
              </div>

              <div className="text-muted mt-2" style={{ fontSize: 13 }}>
                Hook later to Open-Meteo / NOAA (per airport)
              </div>

              <div className="mt-3" style={{ fontSize: 13 }}>
                <div><b>ATL:</b> —</div>
                <div><b>TEB:</b> —</div>
                <div><b>PBI:</b> —</div>
              </div>

              <div className="text-muted mt-2" style={{ fontSize: 12 }}>
                Click to view plan
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* DRILL-DOWN MODAL */}
      <Modal show={!!panel} onHide={closePanel} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {panel === "trips" && "Trips Today"}
            {panel === "crew" && "Active Crew"}
            {panel === "planes" && "Fleet Snapshot"}
            {panel === "alerts" && "Alerts"}
            {panel === "weather" && "Weather Snapshot (POC)"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {panel === "trips" && (
            <>
              {tripsToday.length === 0 ? (
                <div className="text-muted">No trips scheduled for today.</div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Route</th>
                      <th>Client</th>
                      <th>Aircraft</th>
                      <th>PAX</th>
                      <th>Crew</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tripsToday.map((t) => (
                      <tr key={t.id}>
                        <td>{t.date}</td>
                        <td style={{ fontWeight: 800 }}>
                          {t.from} → {t.to}
                        </td>
                        <td>{t.client}</td>
                        <td>
                          {t.planeType} • {t.tail}
                        </td>
                        <td>{t.passengers}</td>
                        <td>{t.pilots?.join(", ") || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </>
          )}

          {panel === "crew" && (
            <ListGroup>
              {activeCrew.map((c) => (
                <ListGroup.Item key={c.name} className="d-flex justify-content-between align-items-center">
                  <div>
                    <div style={{ fontWeight: 900 }}>{c.name}</div>
                    <div className="text-muted" style={{ fontSize: 13 }}>
                      {c.role} • Hours today: {c.hoursToday}
                    </div>
                  </div>
                  <Badge bg="success">{c.status}</Badge>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}

          {panel === "planes" && (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Tail</th>
                  <th>Type</th>
                  <th>Model</th>
                  <th>Seats</th>
                  <th>Status</th>
                  <th>Next Maint</th>
                  <th>Hrs Due</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE_PLANES.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 900 }}>{p.tail}</td>
                    <td>{p.type}</td>
                    <td>{p.model}</td>
                    <td>{p.seats}</td>
                    <td>
                      <Badge bg={badgeForPlaneStatus(p.status)}>{p.status}</Badge>
                    </td>
                    <td>{p.nextMaintenanceDate || "—"}</td>
                    <td>{p.hoursUntilDue ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {panel === "alerts" && (
            <ListGroup>
              {alerts.map((a) => (
                <ListGroup.Item key={a.id}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div style={{ fontWeight: 900 }}>{a.title}</div>
                      <div className="text-muted" style={{ fontSize: 13 }}>
                        {a.detail}
                      </div>
                    </div>
                    <Badge bg={a.level}>{a.level}</Badge>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}

          {panel === "weather" && (
            <div className="text-muted">
              POC plan:
              <ul className="mt-2">
                <li>Pick airports from today’s trips (ATL, TEB, etc.)</li>
                <li>Call Open-Meteo (no key) using lat/long lookup per airport</li>
                <li>Show wind, visibility proxy, precip, temp</li>
              </ul>
              When you’re ready, I’ll wire the fetch + airport lookup.
            </div>
          )}
        </Modal.Body>

        <Modal.Footer className="d-flex justify-content-between">
          <Button variant="outline-secondary" onClick={closePanel}>
            Close
          </Button>

          <div className="d-flex gap-2">
            {panel === "trips" && (
              <Button onClick={() => navigate("/trips")}>Go to Trips</Button>
            )}
            {panel === "crew" && (
              <Button onClick={() => navigate("/crew")}>Go to Crew</Button>
            )}
            {panel === "planes" && (
              <Button onClick={() => navigate("/planes")}>Go to Planes</Button>
            )}
            {panel === "alerts" && (
              <Button variant="primary" onClick={() => navigate("/dispatch")}>
                Go to Dispatch
              </Button>
            )}
            {panel === "weather" && (
              <Button onClick={() => navigate("/dispatch")}>Go to Dispatch</Button>
            )}
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}
