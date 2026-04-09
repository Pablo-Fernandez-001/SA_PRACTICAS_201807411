import { useEffect, useMemo, useState } from "react";
import {
  createAssignment,
  createTicket,
  createUser,
  getAssignments,
  getTicketHistory,
  getTickets,
  getUsers,
  loginUser,
  releaseAssignmentsByTicket,
  updateTicket,
} from "./api";

const ticketStatuses = ["OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"];

const PREDEFINED_USERS = [
  { email: "admin@helpdesk.local", password: "admin123!", role: "admin", name: "Administrador" },
  { email: "agent1@helpdesk.local", password: "agent123!", role: "agent", name: "Agente 1" },
  { email: "requester@helpdesk.local", password: "user123!", role: "requester", name: "Solicitante" },
];

const initialUser = { name: "", email: "", role: "requester" };
const initialTicket = {
  requester_id: "",
  title: "",
  description: "",
  priority: "MEDIUM",
  category: "General",
};
const initialAssignment = { ticket_id: "", agent_id: "", assigned_by: "", reason: "" };

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authTab, setAuthTab] = useState("login"); // "login" o "register"
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState("");

  // Estado para registro
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerRole, setRegisterRole] = useState("requester");
  const [registerMessage, setRegisterMessage] = useState("");

  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [ticketHistory, setTicketHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [userForm, setUserForm] = useState(initialUser);
  const [ticketForm, setTicketForm] = useState(initialTicket);
  const [assignmentForm, setAssignmentForm] = useState(initialAssignment);

  const agents = useMemo(() => users.filter((user) => user.role === "agent" && user.is_active), [users]);
  const assigners = useMemo(() => users.filter((user) => ["admin", "agent"].includes(user.role)), [users]);
  const requesters = useMemo(
    () => users.filter((user) => ["requester", "admin"].includes(user.role) && user.is_active),
    [users]
  );
  const currentUserRecord = useMemo(() => {
    if (!currentUser?.email) return null;
    return users.find((user) => user.email?.toLowerCase() === currentUser.email.toLowerCase()) || null;
  }, [users, currentUser]);
  const effectiveRole = currentUserRecord?.role || currentUser?.role || "requester";
  const canManageUsers = effectiveRole === "admin";
  const canCreateTickets = ["admin", "requester"].includes(effectiveRole);
  const canAssignTickets = ["admin", "agent"].includes(effectiveRole);

  const visibleUsers = useMemo(() => {
    if (canManageUsers) return users;
    if (!currentUser?.email) return [];
    return users.filter((user) => user.email?.toLowerCase() === currentUser.email.toLowerCase());
  }, [users, canManageUsers, currentUser]);

  const visibleTickets = useMemo(() => {
    if (canManageUsers) return tickets;
    if (!currentUserRecord) return [];

    if (effectiveRole === "agent") {
      const assignedTicketIds = new Set(
        assignments
          .filter((assignment) => assignment.agent_id === currentUserRecord.id)
          .map((assignment) => assignment.ticket_id)
      );
      return tickets.filter((ticket) => assignedTicketIds.has(ticket.id));
    }

    return tickets.filter((ticket) => ticket.requester_id === currentUserRecord.id);
  }, [tickets, assignments, canManageUsers, currentUserRecord, effectiveRole]);

  const visibleAssignments = useMemo(() => {
    if (canManageUsers) return assignments;
    if (!currentUserRecord) return [];
    if (effectiveRole === "agent") {
      return assignments.filter((assignment) => assignment.agent_id === currentUserRecord.id);
    }

    const ownTicketIds = new Set(tickets.filter((ticket) => ticket.requester_id === currentUserRecord.id).map((ticket) => ticket.id));
    return assignments.filter((assignment) => ownTicketIds.has(assignment.ticket_id));
  }, [assignments, tickets, canManageUsers, currentUserRecord, effectiveRole]);

  // Cargar usuario del localStorage al iniciar
  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored) {
      const user = JSON.parse(stored);
      setCurrentUser(user);
      setIsLoggedIn(true);
    }
  }, []);

  // Cargar datos cuando se loguea
  useEffect(() => {
    if (isLoggedIn) {
      loadAll();
    }
  }, [isLoggedIn]);

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const loggedUser = await loginUser({ email: loginEmail, password: loginPassword });
      localStorage.setItem("currentUser", JSON.stringify(loggedUser));
      setCurrentUser(loggedUser);
      setIsLoggedIn(true);
      setLoginEmail("");
      setLoginPassword("");
      setLoginMessage("");
    } catch (error) {
      setLoginMessage(`❌ ${error.message || "Email o contraseña incorrectos"}`);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (!registerName || !registerEmail || !registerPassword) {
      setRegisterMessage("❌ Completa todos los campos");
      return;
    }

    try {
      // Crear el usuario directamente en el backend
      await createUser({
        name: registerName,
        email: registerEmail,
        role: registerRole,
        password: registerPassword,
      });
      
      setRegisterMessage("✅ Usuario registrado. Ahora puedes iniciar sesión.");
      // Limpiar formulario
      setRegisterName("");
      setRegisterEmail("");
      setRegisterPassword("");
      setRegisterRole("requester");
      
      // Cambiar a tab de login después de 2s
      setTimeout(() => {
        setAuthTab("login");
        setLoginEmail(registerEmail);
        setRegisterMessage("");
      }, 2000);
    } catch (error) {
      setRegisterMessage(`❌ Error: ${error.message}`);
    }
  }

  function handleLogout() {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setIsLoggedIn(false);
    setLoginEmail("");
    setLoginPassword("");
    setLoginMessage("");
    setUsers([]);
    setTickets([]);
    setAssignments([]);
  }

  async function quickLogin(email, password) {
    setLoginEmail(email);
    setLoginPassword(password);
    try {
      const loggedUser = await loginUser({ email, password });
      localStorage.setItem("currentUser", JSON.stringify(loggedUser));
      setCurrentUser(loggedUser);
      setIsLoggedIn(true);
      setLoginEmail("");
      setLoginPassword("");
      setLoginMessage("");
    } catch (error) {
      setLoginMessage(`❌ ${error.message || "No se pudo iniciar sesión"}`);
    }
  }

  async function loadAll() {
    try {
      setLoading(true);
      const [usersResult, ticketsResult, assignmentsResult] = await Promise.allSettled([
        getUsers(),
        getTickets(),
        getAssignments(),
      ]);

      const errors = [];

      if (usersResult.status === "fulfilled") {
        setUsers(usersResult.value);
      } else {
        errors.push("Users API (3101)");
      }

      if (ticketsResult.status === "fulfilled") {
        setTickets(ticketsResult.value);
      } else {
        errors.push("Tickets API (3102)");
      }

      if (assignmentsResult.status === "fulfilled") {
        setAssignments(assignmentsResult.value);
      } else {
        errors.push("Assignments API (3103)");
      }

      if (errors.length > 0) {
        setMessage(`No se pudo cargar: ${errors.join(", ")}. Verifica contenedores y CORS.`);
      } else {
        setMessage("");
      }
    } catch (error) {
      setMessage(`Error inesperado: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser(event) {
    event.preventDefault();
    try {
      await createUser(userForm);
      setUserForm(initialUser);
      await loadAll();
      setMessage("Usuario creado correctamente");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleCreateTicket(event) {
    event.preventDefault();
    try {
      const requesterId =
        effectiveRole === "requester"
          ? currentUserRecord?.id
          : Number(ticketForm.requester_id);

      if (!requesterId) {
        setMessage("No se pudo determinar requester_id. Inicia sesión con un usuario existente.");
        return;
      }

      await createTicket({
        ...ticketForm,
        requester_id: requesterId,
      });
      setTicketForm(initialTicket);
      await loadAll();
      setMessage("Ticket creado correctamente");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleCreateAssignment(event) {
    event.preventDefault();
    try {
      await createAssignment({
        ...assignmentForm,
        ticket_id: Number(assignmentForm.ticket_id),
        agent_id: Number(assignmentForm.agent_id),
        assigned_by: Number(assignmentForm.assigned_by),
      });
      setAssignmentForm(initialAssignment);
      await loadAll();
      setMessage("Asignacion creada correctamente");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleStatusChange(ticketId, status) {
    try {
      await updateTicket(ticketId, { status });

      if (["RESOLVED", "CLOSED"].includes(status)) {
        await releaseAssignmentsByTicket(ticketId);
      }

      await loadAll();
      setMessage(`Ticket ${ticketId} actualizado a ${status}`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleReleaseAssignment(ticketId) {
    try {
      const result = await releaseAssignmentsByTicket(ticketId);
      await loadAll();
      setMessage(`Ticket ${ticketId}: ${result.message}`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleHistoryLoad(ticketId) {
    try {
      const history = await getTicketHistory(ticketId);
      setSelectedTicketId(String(ticketId));
      setTicketHistory(history);
    } catch (error) {
      setMessage(error.message);
    }
  }

  // PANTALLA DE LOGIN
  if (!isLoggedIn) {
    return (
      <main className="page">
        <header className="hero">
          <div>
            <p className="eyebrow">Practica 8 · Desarrollo Core</p>
            <h1>Helpdesk Management System</h1>
            <p>Sistema de soporte técnico con microservicios, RabbitMQ y persistencia en MySQL</p>
          </div>
        </header>

        <section className="grid grid-login">
          <article className="card login-card">
            <h2>🔐 Iniciar Sesión</h2>
            {loginMessage && <div className="banner banner-error">{loginMessage}</div>}
            
            <form onSubmit={handleLogin} className="form">
              <input
                type="email"
                placeholder="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
              <button type="submit">Entrar</button>
            </form>

            <div className="divider">O usa un usuario de prueba:</div>
          </article>

          <article className="card credentials-card">
            {/* TABS */}
            <div className="auth-tabs">
              <button
                className={`tab-btn ${authTab === "login" ? "active" : ""}`}
                onClick={() => setAuthTab("login")}
              >
                🔐 Inicia Sesión
              </button>
              <button
                className={`tab-btn ${authTab === "register" ? "active" : ""}`}
                onClick={() => setAuthTab("register")}
              >
                ✍️ Registrate
              </button>
            </div>

            {/* TAB: USUARIOS DE PRUEBA */}
            {authTab === "login" && (
              <div>
                <h2>👥 Usuarios de Prueba</h2>
                <div className="credentials-list">
                  {PREDEFINED_USERS.map((user) => (
                    <div key={user.email} className="credential-item">
                      <div className="cred-header">
                        <strong>{user.name}</strong>
                        <span className={`tag tag-${user.role}`}>{user.role}</span>
                      </div>
                      <div className="cred-body">
                        <p>📧 {user.email}</p>
                        <p>🔑 {user.password}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => quickLogin(user.email, user.password)}
                        className="quick-login-btn"
                      >
                        Entrar como {user.name}
                      </button>
                    </div>
                  ))}
                </div>
                <p>
                  También puedes iniciar sesión con cualquier usuario nuevo registrado en el sistema.
                </p>
              </div>
            )}

            {/* TAB: REGISTRO */}
            {authTab === "register" && (
              <div>
                <h2>✍️ Crear Cuenta Nueva</h2>
                {registerMessage && <div className="banner banner-error">{registerMessage}</div>}
                
                <form onSubmit={handleRegister} className="form">
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                  />
                  <select
                    value={registerRole}
                    onChange={(e) => setRegisterRole(e.target.value)}
                  >
                    <option value="requester">Usuario (Requester)</option>
                    <option value="agent">Agente (Agent)</option>
                    <option value="admin">Administrador (Admin)</option>
                  </select>
                  <button type="submit">Registrarse</button>
                </form>
              </div>
            )}
          </article>
        </section>

        <section className="card" style={{ maxWidth: "1000px", margin: "40px auto" }}>
          <h3>🔗 Enlaces de Servicios (Abre en nueva pestaña)</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
            <button
              type="button"
              onClick={() => window.open("http://localhost:15672", "_blank")}
              style={{ background: "linear-gradient(135deg, #FF6B35, #E74C3C)", padding: "12px", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
            >
              🐰 RabbitMQ Management
            </button>
            <button
              type="button"
              onClick={() => window.open("http://localhost:3101/api/health/deep", "_blank")}
              style={{ background: "linear-gradient(135deg, #3498DB, #2980B9)", padding: "12px", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
            >
              💚 Users Service Health
            </button>
            <button
              type="button"
              onClick={() => window.open("http://localhost:3102/api/health/deep", "_blank")}
              style={{ background: "linear-gradient(135deg, #3498DB, #2980B9)", padding: "12px", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
            >
              🎫 Tickets Service Health
            </button>
            <button
              type="button"
              onClick={() => window.open("http://localhost:3103/api/health/deep", "_blank")}
              style={{ background: "linear-gradient(135deg, #3498DB, #2980B9)", padding: "12px", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
            >
              👥 Assignments Service Health
            </button>
            <button
              type="button"
              onClick={() => window.open("http://localhost:3104/api/events", "_blank")}
              style={{ background: "linear-gradient(135deg, #9B59B6, #8E44AD)", padding: "12px", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
            >
              📋 Audit Events
            </button>
          </div>
        </section>
        <section className="card" style={{ maxWidth: "900px", margin: "40px auto" }}>
          <h3>ℹ️ Información</h3>
          <ul style={{ lineHeight: "1.8", color: "#666" }}>
            <li><strong>Backend:</strong> 4 microservicios (Node.js/Express) en puertos 3101-3104</li>
            <li><strong>Base de datos:</strong> MySQL 8.0 - 3 bases de datos (users, tickets, assignments)</li>
            <li><strong>Eventos:</strong> RabbitMQ 3.13 para comunicación asincrónica</li>
            <li><strong>Frontend:</strong> React 18 + Vite - Sin autenticación JWT (para desarrollo)</li>
            <li><strong>Auditoría:</strong> Todos los eventos registrados en audit-service</li>
          </ul>
        </section>
      </main>
    );
  }

  // DASHBOARD (después del login)
  return (
    <main className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Practica 8 · Desarrollo Core</p>
          <h1>Helpdesk Event-Ready Control Panel</h1>
          <p>
            Gestiona usuarios, tickets y asignaciones sobre los microservicios reales. Sin mocks,
            con persistencia en MySQL y eventos en RabbitMQ.
          </p>
          <p style={{ fontSize: "0.9em", color: "#666", marginTop: "8px" }}>
            👤 Conectado como: <strong>{currentUser.name}</strong> ({effectiveRole})
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button type="button" onClick={loadAll} disabled={loading}>
            {loading ? "Actualizando..." : "Recargar datos"}
          </button>
          <button type="button" onClick={handleLogout} style={{ background: "#e74c3c" }}>
            Salir
          </button>
        </div>
      </header>

      {message ? <div className="banner">{message}</div> : null}

      {!currentUserRecord ? (
        <section className="card">
          <h2>Perfil no sincronizado</h2>
          <p>
            Este usuario no existe en la tabla de users-service. Para evitar errores de datos,
            usa una cuenta existente o registra primero el usuario en backend.
          </p>
        </section>
      ) : null}

      <section className="grid">
        {canManageUsers ? (
        <article className="card">
          <h2>Crear Usuario</h2>
          <form onSubmit={handleCreateUser} className="form">
            <input
              placeholder="Nombre"
              value={userForm.name}
              onChange={(event) => setUserForm({ ...userForm, name: event.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Correo"
              value={userForm.email}
              onChange={(event) => setUserForm({ ...userForm, email: event.target.value })}
              required
            />
            <select
              value={userForm.role}
              onChange={(event) => setUserForm({ ...userForm, role: event.target.value })}
            >
              <option value="requester">Requester</option>
              <option value="agent">Agent</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit">Guardar usuario</button>
          </form>
        </article>
        ) : null}

        {canCreateTickets ? (
        <article className="card">
          <h2>Crear Ticket</h2>
          <form onSubmit={handleCreateTicket} className="form">
            {effectiveRole === "requester" && currentUserRecord ? (
              <div className="tag">Requester fijo: {currentUserRecord.name} ({currentUserRecord.id})</div>
            ) : (
              <select
                value={ticketForm.requester_id}
                onChange={(event) => setTicketForm({ ...ticketForm, requester_id: event.target.value })}
                required
              >
                <option value="">Requester</option>
                {requesters.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.id})
                  </option>
                ))}
              </select>
            )}
            <input
              placeholder="Titulo"
              value={ticketForm.title}
              onChange={(event) => setTicketForm({ ...ticketForm, title: event.target.value })}
              required
            />
            <textarea
              placeholder="Descripcion"
              value={ticketForm.description}
              onChange={(event) => setTicketForm({ ...ticketForm, description: event.target.value })}
              required
            />
            <div className="row">
              <select
                value={ticketForm.priority}
                onChange={(event) => setTicketForm({ ...ticketForm, priority: event.target.value })}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
              <input
                placeholder="Categoria"
                value={ticketForm.category}
                onChange={(event) => setTicketForm({ ...ticketForm, category: event.target.value })}
                required
              />
            </div>
            <button type="submit">Guardar ticket</button>
          </form>
        </article>
        ) : null}

        {canAssignTickets ? (
        <article className="card">
          <h2>Asignar Ticket</h2>
          <form onSubmit={handleCreateAssignment} className="form">
            <select
              value={assignmentForm.ticket_id}
              onChange={(event) => setAssignmentForm({ ...assignmentForm, ticket_id: event.target.value })}
              required
            >
              <option value="">Ticket</option>
              {tickets
                .filter((ticket) => !["RESOLVED", "CLOSED"].includes(ticket.status))
                .map((ticket) => (
                  <option key={ticket.id} value={ticket.id}>
                    #{ticket.id} {ticket.title}
                  </option>
                ))}
            </select>
            <select
              value={assignmentForm.agent_id}
              onChange={(event) => setAssignmentForm({ ...assignmentForm, agent_id: event.target.value })}
              required
            >
              <option value="">Agente</option>
              {agents.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.id})
                </option>
              ))}
            </select>
            <select
              value={assignmentForm.assigned_by}
              onChange={(event) => setAssignmentForm({ ...assignmentForm, assigned_by: event.target.value })}
              required
            >
              <option value="">Asignado por</option>
              {assigners.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
            <input
              placeholder="Motivo"
              value={assignmentForm.reason}
              onChange={(event) => setAssignmentForm({ ...assignmentForm, reason: event.target.value })}
            />
            <button type="submit">Crear asignacion</button>
          </form>
        </article>
        ) : null}
      </section>

      <section className="grid grid-wide">
        <article className="card">
          <h2>Usuarios ({visibleUsers.length})</h2>
          <ul className="list">
            {visibleUsers.map((user) => (
              <li key={user.id}>
                <strong>{user.name}</strong>
                <span>{user.email}</span>
                <span className="tag">{user.role}</span>
                <span className={user.is_active ? "ok" : "warn"}>{user.is_active ? "activo" : "inactivo"}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="card">
          <h2>Tickets ({visibleTickets.length})</h2>
          <ul className="list">
            {visibleTickets.map((ticket) => (
              <li key={ticket.id}>
                <strong>{ticket.title}</strong>
                <span>#{ticket.id} · {ticket.code}</span>
                <span>{ticket.priority} · {ticket.category}</span>
                <div className="inline-actions">
                  <span className="tag">{ticket.status}</span>
                  <button type="button" onClick={() => handleHistoryLoad(ticket.id)}>
                    Historial
                  </button>
                  {canAssignTickets ? (
                    <button type="button" onClick={() => handleReleaseAssignment(ticket.id)}>
                      Liberar agente
                    </button>
                  ) : null}
                  {canAssignTickets ? (
                    <select
                      value={ticket.status}
                      onChange={(event) => handleStatusChange(ticket.id, event.target.value)}
                    >
                      {ticketStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="card">
          <h2>Asignaciones ({visibleAssignments.length})</h2>
          <ul className="list">
            {visibleAssignments.map((assignment) => (
              <li key={assignment.id}>
                <strong>Asignacion #{assignment.id}</strong>
                <span>ticket_id: {assignment.ticket_id}</span>
                <span>agent_id: {assignment.agent_id}</span>
                <span>{assignment.reason || "Sin motivo"}</span>
                <span className={assignment.is_active ? "ok" : "warn"}>
                  {assignment.is_active ? "activa" : "inactiva"}
                </span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="card">
        <h2>Historial de Ticket {selectedTicketId ? `#${selectedTicketId}` : ""}</h2>
        {ticketHistory.length === 0 ? (
          <p>Selecciona un ticket y presiona Historial para ver trazabilidad de estados.</p>
        ) : (
          <ul className="history-list">
            {ticketHistory.map((item) => (
              <li key={item.id}>
                <span className="tag">{item.status}</span>
                <p>{item.message}</p>
                <small>{new Date(item.created_at).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default App;
