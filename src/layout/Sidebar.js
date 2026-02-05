import { NavLink } from "react-router-dom";

const linkBase = {
  padding: "10px 12px",
  borderRadius: 10,
  marginBottom: 6,
  textDecoration: "none",
  display: "block",
  color: "white",
};

export default function Sidebar() {
  return (
    <aside style={{ width: 260, background: "#0b1220", color: "white", padding: 16 }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>JetOpsHQ</div>
        <div style={{ opacity: 0.7, fontSize: 12 }}></div>
      </div>

      {[
        ["/", "Dashboard"],
        ["/crew", "Crew"],
        ["/trips", "Trips"],
        ["/planes", "Planes"],
        ["/scheduling", "Scheduling"],
        ["/dispatch", "Dispatch"],
        ["/accommodations", "Accommodations"],
      ].map(([to, label]) => (
        <NavLink
          key={to}
          to={to}
          style={({ isActive }) => ({
            ...linkBase,
            background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
          })}
        >
          {label}
        </NavLink>
      ))}
    </aside>
  );
}
