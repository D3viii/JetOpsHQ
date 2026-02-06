import { useState, useEffect } from "react";
import { Card, Button, Row, Col, Form, Badge } from "react-bootstrap";
import { useAuth } from "../auth/AuthContext";

const ROLES = ["Admin", "Dispatcher", "Pilot", "Viewer"];

export default function Users() {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "Viewer"
  });

  // Load users from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("johq_users");
    if (saved) {
      setUsers(JSON.parse(saved));
    } else {
      const defaultUsers = [
        { id: "1", username: "admin", password: "admin123", role: "Admin" },
        { id: "2", username: "dispatch", password: "dispatch123", role: "Dispatcher" },
        { id: "3", username: "pilot", password: "pilot123", role: "Pilot" },
        { id: "4", username: "viewer", password: "viewer123", role: "Viewer" }
      ];
      setUsers(defaultUsers);
      localStorage.setItem("johq_users", JSON.stringify(defaultUsers));
    }
  }, []);

  const saveUsers = (updated) => {
    setUsers(updated);
    localStorage.setItem("johq_users", JSON.stringify(updated));
  };

  const addUser = () => {
    if (!newUser.username.trim() || !newUser.password.trim()) return;

    const id = crypto?.randomUUID?.() ?? String(Date.now());

    const updated = [
      ...users,
      { id, ...newUser }
    ];

    saveUsers(updated);

    setNewUser({
      username: "",
      password: "",
      role: "Viewer"
    });
  };

  const updateRole = (id, role) => {
    const updated = users.map(u =>
      u.id === id ? { ...u, role } : u
    );
    saveUsers(updated);
  };

  const deleteUser = (id) => {
    const updated = users.filter(u => u.id !== id);
    saveUsers(updated);
  };

  if (user?.role !== "Admin") {
    return <div>You do not have permission to view this page.</div>;
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">User Management</h3>
        <Badge bg="dark">Admin Only</Badge>
      </div>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h5>Add New User</h5>

          <Row className="g-2">
            <Col md={4}>
              <Form.Control
                placeholder="Username"
                value={newUser.username}
                onChange={(e) =>
                  setNewUser(prev => ({ ...prev, username: e.target.value }))
                }
              />
            </Col>

            <Col md={4}>
              <Form.Control
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser(prev => ({ ...prev, password: e.target.value }))
                }
              />
            </Col>

            <Col md={3}>
              <Form.Select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser(prev => ({ ...prev, role: e.target.value }))
                }
              >
                {ROLES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </Form.Select>
            </Col>

            <Col md={1}>
              <Button onClick={addUser}>Add</Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row className="g-3">
        {users.map(u => (
          <Col md={6} xl={4} key={u.id}>
            <Card className="shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div style={{ fontWeight: 800 }}>{u.username}</div>
                  <Badge bg="secondary">{u.role}</Badge>
                </div>

                <div className="mb-2">
                  <Form.Select
                    value={u.role}
                    onChange={(e) => updateRole(u.id, e.target.value)}
                  >
                    {ROLES.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </Form.Select>
                </div>

                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => deleteUser(u.id)}
                  disabled={u.username === "admin"}
                >
                  Delete
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
}
