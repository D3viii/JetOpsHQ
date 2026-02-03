import { Card, Row, Col, Badge } from "react-bootstrap";

export default function Dashboard() {
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Dashboard</h3>
        <Badge bg="secondary">Today</Badge>
      </div>

      <Row className="g-3">
        <Col md={6} xl={3}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="text-muted">Trips Today</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>3</div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={3}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="text-muted">Active Crew</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>4</div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={3}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="text-muted">Tails in Use</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>2</div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={3}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="text-muted">Alerts</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>1</div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-2">Trips Today</h5>
              <div className="text-muted">Next: ATL → TEB (Hawker) • Client: Acme</div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-2">Weather Snapshot</h5>
              <div className="text-muted">Hook later to NOAA / Open-Meteo</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}
