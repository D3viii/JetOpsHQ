import { useMemo, useState } from "react";
import { Button, Card, Row, Col, Form, Badge } from "react-bootstrap";

const TYPES = ["Laptop", "iPad", "Phone", "Hotspot", "Headset", "Other"];
const STATUSES = ["In service", "In repair", "Retired", "Lost"];

export default function ITAssets() {
  const [assets, setAssets] = useState([
    { id: "A-1001", type: "Laptop", model: "Dell XPS 13", serial: "DX13-001", assignedTo: "Rod", status: "In service", location: "Office" },
    { id: "A-1002", type: "Hotspot", model: "Verizon M2100", serial: "VZ-7781", assignedTo: "Unassigned", status: "In service", location: "Hangar" },
  ]);

  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter(a =>
      [a.id, a.type, a.model, a.serial, a.assignedTo, a.status, a.location]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [assets, query]);

  const stats = useMemo(() => {
    const total = assets.length;
    const assigned = assets.filter(a => a.assignedTo !== "Unassigned").length;
    const needsAttention = assets.filter(a => a.status !== "In service").length;
    return { total, assigned, needsAttention };
  }, [assets]);

  const addAsset = () => {
    const id = `A-${Math.floor(1000 + Math.random() * 9000)}`;
    setAssets(prev => [
      ...prev,
      { id, type: "Laptop", model: "", serial: "", assignedTo: "Unassigned", status: "In service", location: "" }
    ]);
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-1">IT Asset Management</h3>
          <div className="text-muted">Track devices, assignments, and status</div>
        </div>
        <Button onClick={addAsset}>Add Asset</Button>
      </div>

      <div className="d-flex gap-2 align-items-center mb-3 flex-wrap">
        <Form.Control
          style={{ maxWidth: 420 }}
          placeholder="Search assets…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Badge bg="secondary">Total: {stats.total}</Badge>
        <Badge bg="primary">Assigned: {stats.assigned}</Badge>
        <Badge bg={stats.needsAttention ? "warning" : "success"}>
          Needs attention: {stats.needsAttention}
        </Badge>
      </div>

      <Row className="g-3">
        {filtered.map(a => (
          <Col key={a.id} md={6} xl={4}>
            <Card className="shadow-sm h-100">
              <Card.Body className="d-grid gap-2">
                <div className="d-flex justify-content-between">
                  <div style={{ fontWeight: 800 }}>{a.id}</div>
                  <Badge bg={a.status === "In service" ? "success" : "warning"}>{a.status}</Badge>
                </div>

                <div className="text-muted">{a.type} • {a.model || "Model TBD"}</div>

                <div style={{ fontSize: 13 }}>
                  <div><b>Serial:</b> {a.serial || "—"}</div>
                  <div><b>Assigned:</b> {a.assignedTo}</div>
                  <div><b>Location:</b> {a.location || "—"}</div>
                </div>

                <div className="d-grid gap-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  <Form.Select
                    value={a.type}
                    onChange={(e) => setAssets(prev => prev.map(x => x.id === a.id ? { ...x, type: e.target.value } : x))}
                  >
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </Form.Select>

                  <Form.Select
                    value={a.status}
                    onChange={(e) => setAssets(prev => prev.map(x => x.id === a.id ? { ...x, status: e.target.value } : x))}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </Form.Select>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
}
