import { Button, Card, Row, Col } from "react-bootstrap";

export default function Crew() {
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Crew</h3>
        <Button>Add Crew</Button>
      </div>

      <Row className="g-3">
        {["Rod", "John", "Dan", "Kyle"].map((name) => (
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
