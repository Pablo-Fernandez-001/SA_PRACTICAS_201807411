import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export default function App() {
  const [form, setForm] = useState({ title: "", description: "", requester: "" });
  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadData() {
    const [ticketsRes, eventsRes] = await Promise.all([
      fetch(`${API_BASE}/tickets`),
      fetch(`${API_BASE}/processed-events`),
    ]);
    const ticketsJson = await ticketsRes.json();
    const eventsJson = await eventsRes.json();
    setTickets(ticketsJson.data || []);
    setEvents(eventsJson.data || []);
  }

  useEffect(() => {
    loadData().catch(() => {});
    const id = setInterval(() => loadData().catch(() => {}), 3000);
    return () => clearInterval(id);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        const body = await response.json();
        alert(body.message || "Error creando ticket");
        return;
      }
      setForm({ title: "", description: "", requester: "" });
      await loadData();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <header>
        <h1>Practica 9 - Event Driven Helpdesk</h1>
        <p>Flujo: crear ticket -> evento RabbitMQ -> procesamiento</p>
      </header>

      <section className="grid">
        <article className="card">
          <h2>Crear Ticket</h2>
          <form onSubmit={handleSubmit}>
            <input
              placeholder="Titulo"
              value={form.title}
              onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
              required
            />
            <textarea
              placeholder="Descripcion"
              value={form.description}
              onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              required
            />
            <input
              placeholder="Solicitante"
              value={form.requester}
              onChange={(e) => setForm((s) => ({ ...s, requester: e.target.value }))}
              required
            />
            <button disabled={loading}>{loading ? "Enviando..." : "Crear ticket"}</button>
          </form>
        </article>

        <article className="card">
          <h2>Tickets</h2>
          <ul>
            {tickets.map((ticket) => (
              <li key={ticket.id}>
                <strong>{ticket.code}</strong> - {ticket.title} ({ticket.status})
              </li>
            ))}
          </ul>
        </article>

        <article className="card">
          <h2>Eventos Procesados</h2>
          <ul>
            {events.map((evt) => (
              <li key={evt.id}>
                {evt.event} - {evt.ticket_code} - {evt.processed_at}
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
