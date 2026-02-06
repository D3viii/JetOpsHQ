import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Form } from "react-bootstrap";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    setErr("");
    const res = login(username.trim(), password);
    if (!res.ok) return setErr(res.error);
    nav("/", { replace: true });
  };

  return (
    <div style={{ minHeight: "100vh" }} className="d-flex align-items-center justify-content-center p-3">
      <Card style={{ width: 420 }} className="shadow-sm">
        <Card.Body>
          <h3 className="mb-3">JetOpsHQ Login</h3>

          <Form onSubmit={onSubmit} className="d-grid gap-2">
            <Form.Group>
              <Form.Label>Username</Form.Label>
              <Form.Control value={username} onChange={(e) => setUsername(e.target.value)} />
            </Form.Group>

            <Form.Group>
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Form.Group>

            {err && <div className="text-danger">{err}</div>}

            <Button type="submit">Login</Button>

            <div className="text-muted" style={{ fontSize: 12 }}>
              Demo users: admin/admin123, dispatch/dispatch123, pilot/pilot123, viewer/viewer123
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
