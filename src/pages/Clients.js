import { useMemo, useState } from "react";
import { Badge, Button, Card, Col, Form, Modal, Row, Table } from "react-bootstrap";

function uid() {
  try {
    // eslint-disable-next-line no-undef
    return crypto.randomUUID();
  } catch {
    return String(Date.now());
  }
}

const badgeForStatus = (status) => {
  const map = {
    ACTIVE: { bg: "success", text: "Active" },
    PROSPECT: { bg: "warning", text: "Prospect" },
    INACTIVE: { bg: "secondary", text: "Inactive" },
    DO_NOT_USE: { bg: "danger", text: "Do Not Use" },
  };
  const s = map[status] ?? { bg: "secondary", text: status };
  return <Badge bg={s.bg}>{s.text}</Badge>;
};

export default function Clients() {
  const [clients, setClients] = useState([
    {
      id: "c1",
      company: "Acme Exec Travel",
      contactName: "Sarah Jacobs",
      phone: "(404) 555-0199",
      email: "sarah@acme.com",
      billingAddress: "123 Peachtree St, Atlanta, GA 30303",
      paymentTerms: "Net 7",
      status: "ACTIVE", // ACTIVE | PROSPECT | INACTIVE | DO_NOT_USE
      preferredAircraft: "Hawker",
      cateringPrefs: "Sparkling water, fruit tray",
      notes: "Prefers early morning departures. VIP client.",
    },
    {
      id: "c2",
      company: "Blue Ridge Partners",
      contactName: "Evan Brooks",
      phone: "(678) 555-0123",
      email: "evan@blueridgepartners.com",
      billingAddress: "88 Lakeview Dr, Gainesville, GA 30501",
      paymentTerms: "Prepay",
      status: "PROSPECT",
      preferredAircraft: "Citation X",
      cateringPrefs: "Coffee + sandwiches",
      notes: "Still negotiating contract.",
    },
  ]);

  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const selected = useMemo(
    () => clients.find((c) => c.id === selectedId) ?? null,
    [clients, selectedId]
  );

  const [draft, setDraft] = useState({
    company: "",
    contactName: "",
    phone: "",
    email: "",
    billingAddress: "",
    paymentTerms: "Net 7",
    status: "ACTIVE",
    preferredAircraft: "Hawker",
    cateringPrefs: "",
    notes: "",
  });

  const openCreate = () => {
    setDraft({
      company: "",
      contactName: "",
      phone: "",
      email: "",
      billingAddress: "",
      paymentTerms: "Net 7",
      status: "ACTIVE",
      preferredAircraft: "Hawker",
      cateringPrefs: "",
      notes: "",
    });
    setShowCreate(true);
  };

  const openDetail = (id) => {
    setSelectedId(id);
    setShowDetail(true);
  };

  const updateClient = (id, patch) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const deleteClient = (id) => {
    // no confirm() to avoid ESLint no-restricted-globals
    setClients((prev) => prev.filter((c) => c.id !== id));
    setShowDetail(false);
    setSelectedId(null);
  };

  const stats = useMemo(() => {
    const total = clients.length;
    const active = clients.filter((c) => c.status === "ACTIVE").length;
    const prospects = clients.filter((c) => c.status === "PROSPECT").length;
    return { total, active, prospects };
  }, [clients]);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-1">Clients</h3>
          <div className="text-muted">Manage client contacts, billing, and preferences.</div>
        </div>
        <Button onClick={openCreate}>Add Client</Button>
      </div>

      <Row className="g-3 mb-3">
        <Col md={6} xl={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="text-muted">Total Clients</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{stats.total}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} xl={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="text-muted">Active</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{stats.active}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} xl={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="text-muted">Prospects</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{stats.prospects}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3">
        {clients.map((c) => (
          <Col key={c.id} md={6} xl={4}>
            <Card className="shadow-sm h-100" style={{ cursor: "pointer" }} onClick={() => openDetail(c.id)}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 16 }}>{c.company}</div>
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      {c.contactName || "No contact"} • {c.phone || "No phone"}
                    </div>
                  </div>
                  <div>{badgeForStatus(c.status)}</div>
                </div>

                <hr className="my-2" />

                <div className="text-muted" style={{ fontSize: 12 }}>
                  Email
                </div>
                <div style={{ fontSize: 13 }}>{c.email || <span className="text-muted">None</span>}</div>

                <div className="mt-2 d-flex gap-2 flex-wrap">
                  <Badge bg="info">Preferred: {c.preferredAircraft || "N/A"}</Badge>
                  <Badge bg="secondary">Terms: {c.paymentTerms || "N/A"}</Badge>
                </div>

                {c.notes && (
                  <div className="mt-2 text-muted" style={{ fontSize: 12 }}>
                    Notes: {c.notes}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Create Modal */}
      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add Client</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={8}>
              <Form.Label>Company / Client Name *</Form.Label>
              <Form.Control
                value={draft.company}
                onChange={(e) => setDraft((d) => ({ ...d, company: e.target.value }))}
                placeholder="e.g. Acme Exec Travel"
              />
            </Col>
            <Col md={4}>
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={draft.status}
                onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
              >
                <option value="ACTIVE">Active</option>
                <option value="PROSPECT">Prospect</option>
                <option value="INACTIVE">Inactive</option>
                <option value="DO_NOT_USE">Do Not Use</option>
              </Form.Select>
            </Col>

            <Col md={6}>
              <Form.Label>Contact Name</Form.Label>
              <Form.Control
                value={draft.contactName}
                onChange={(e) => setDraft((d) => ({ ...d, contactName: e.target.value }))}
                placeholder="Primary contact"
              />
            </Col>
            <Col md={3}>
              <Form.Label>Phone</Form.Label>
              <Form.Control
                value={draft.phone}
                onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                placeholder="(xxx) xxx-xxxx"
              />
            </Col>
            <Col md={3}>
              <Form.Label>Email</Form.Label>
              <Form.Control
                value={draft.email}
                onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                placeholder="name@company.com"
              />
            </Col>

            <Col md={8}>
              <Form.Label>Billing Address</Form.Label>
              <Form.Control
                value={draft.billingAddress}
                onChange={(e) => setDraft((d) => ({ ...d, billingAddress: e.target.value }))}
                placeholder="Street, City, State, Zip"
              />
            </Col>
            <Col md={4}>
              <Form.Label>Payment Terms</Form.Label>
              <Form.Select
                value={draft.paymentTerms}
                onChange={(e) => setDraft((d) => ({ ...d, paymentTerms: e.target.value }))}
              >
                <option value="Prepay">Prepay</option>
                <option value="Net 7">Net 7</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
              </Form.Select>
            </Col>

            <Col md={6}>
              <Form.Label>Preferred Aircraft</Form.Label>
              <Form.Select
                value={draft.preferredAircraft}
                onChange={(e) => setDraft((d) => ({ ...d, preferredAircraft: e.target.value }))}
              >
                <option value="Hawker">Hawker</option>
                <option value="Citation X">Citation X</option>
                <option value="Any">Any</option>
              </Form.Select>
            </Col>
            <Col md={6}>
              <Form.Label>Catering Preferences</Form.Label>
              <Form.Control
                value={draft.cateringPrefs}
                onChange={(e) => setDraft((d) => ({ ...d, cateringPrefs: e.target.value }))}
                placeholder="Coffee, snacks, dietary restrictions..."
              />
            </Col>

            <Col md={12}>
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={draft.notes}
                onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
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
              if (!draft.company.trim()) return alert("Company / client name is required.");
              setClients((prev) => [{ id: uid(), ...draft, company: draft.company.trim() }, ...prev]);
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
          <Modal.Title>Client Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!selected ? (
            <div className="text-muted">No client selected.</div>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div style={{ fontWeight: 900, fontSize: 18 }}>{selected.company}</div>
                  <div className="text-muted">{selected.contactName || "No contact"} • {selected.phone || "No phone"}</div>
                </div>
                <div>{badgeForStatus(selected.status)}</div>
              </div>

              <Table responsive className="mb-0">
                <tbody>
                  <tr>
                    <td className="text-muted" style={{ width: 180 }}>Email</td>
                    <td>{selected.email || <span className="text-muted">None</span>}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Billing Address</td>
                    <td>{selected.billingAddress || <span className="text-muted">None</span>}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Payment Terms</td>
                    <td>{selected.paymentTerms || <span className="text-muted">None</span>}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Preferred Aircraft</td>
                    <td>{selected.preferredAircraft || <span className="text-muted">None</span>}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Catering</td>
                    <td>{selected.cateringPrefs || <span className="text-muted">None</span>}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Notes</td>
                    <td>{selected.notes || <span className="text-muted">None</span>}</td>
                  </tr>
                </tbody>
              </Table>

              <hr />

              <Row className="g-3">
                <Col md={8}>
                  <Form.Label>Company</Form.Label>
                  <Form.Control
                    value={selected.company}
                    onChange={(e) => updateClient(selected.id, { company: e.target.value })}
                  />
                </Col>
                <Col md={4}>
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={selected.status}
                    onChange={(e) => updateClient(selected.id, { status: e.target.value })}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="PROSPECT">Prospect</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="DO_NOT_USE">Do Not Use</option>
                  </Form.Select>
                </Col>

                <Col md={6}>
                  <Form.Label>Contact Name</Form.Label>
                  <Form.Control
                    value={selected.contactName || ""}
                    onChange={(e) => updateClient(selected.id, { contactName: e.target.value })}
                  />
                </Col>
                <Col md={3}>
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    value={selected.phone || ""}
                    onChange={(e) => updateClient(selected.id, { phone: e.target.value })}
                  />
                </Col>
                <Col md={3}>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    value={selected.email || ""}
                    onChange={(e) => updateClient(selected.id, { email: e.target.value })}
                  />
                </Col>

                <Col md={8}>
                  <Form.Label>Billing Address</Form.Label>
                  <Form.Control
                    value={selected.billingAddress || ""}
                    onChange={(e) => updateClient(selected.id, { billingAddress: e.target.value })}
                  />
                </Col>
                <Col md={4}>
                  <Form.Label>Payment Terms</Form.Label>
                  <Form.Select
                    value={selected.paymentTerms || "Net 7"}
                    onChange={(e) => updateClient(selected.id, { paymentTerms: e.target.value })}
                  >
                    <option value="Prepay">Prepay</option>
                    <option value="Net 7">Net 7</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                  </Form.Select>
                </Col>

                <Col md={6}>
                  <Form.Label>Preferred Aircraft</Form.Label>
                  <Form.Select
                    value={selected.preferredAircraft || "Any"}
                    onChange={(e) => updateClient(selected.id, { preferredAircraft: e.target.value })}
                  >
                    <option value="Hawker">Hawker</option>
                    <option value="Citation X">Citation X</option>
                    <option value="Any">Any</option>
                  </Form.Select>
                </Col>
                <Col md={6}>
                  <Form.Label>Catering Preferences</Form.Label>
                  <Form.Control
                    value={selected.cateringPrefs || ""}
                    onChange={(e) => updateClient(selected.id, { cateringPrefs: e.target.value })}
                  />
                </Col>

                <Col md={12}>
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={selected.notes || ""}
                    onChange={(e) => updateClient(selected.id, { notes: e.target.value })}
                  />
                </Col>
              </Row>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <Button variant="outline-danger" onClick={() => selected && deleteClient(selected.id)}>
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
