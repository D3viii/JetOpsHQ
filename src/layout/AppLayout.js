import { Outlet } from "react-router-dom";
import { Container } from "react-bootstrap";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <Sidebar />
      <main className="flex-grow-1" style={{ background: "#f6f7fb" }}>
        <Container fluid className="py-3">
          <Outlet />
        </Container>
      </main>
    </div>
  );
}
