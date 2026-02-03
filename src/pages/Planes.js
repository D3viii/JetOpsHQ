import { Button, Card, Row, Col } from "react-bootstrap";

export default function Planes() {
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Planes</h3>
        <Button>Add Plane</Button>
      </div>

      <Row className="g-3">
        {["Plane 1", "Plane 2", "Plane 3", "Plane 4"].map((name) => (
          <Col key={name} md={6} xl={3}>
            <Card className="shadow-sm">
              <Card.Body>
                <div style={{ fontWeight: 800 }}>{name}</div>
                <div className="text-muted">Click for details</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
}