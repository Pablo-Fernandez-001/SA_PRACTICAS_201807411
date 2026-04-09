const USERS_API = import.meta.env.VITE_USERS_API || "http://localhost:3101/api";
const TICKETS_API = import.meta.env.VITE_TICKETS_API || "http://localhost:3102/api";
const ASSIGNMENTS_API = import.meta.env.VITE_ASSIGNMENTS_API || "http://localhost:3103/api";

async function parseJson(response) {
  const isJson = (response.headers.get("content-type") || "").includes("application/json");
  const body = isJson ? await response.json() : null;

  if (!response.ok) {
    const details = body?.errors?.join(", ") || body?.message || "Request failed";
    throw new Error(details);
  }

  return body;
}

export async function getUsers() {
  const response = await fetch(`${USERS_API}/users`);
  return parseJson(response);
}

export async function createUser(payload) {
  const response = await fetch(`${USERS_API}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson(response);
}

export async function getTickets() {
  const response = await fetch(`${TICKETS_API}/tickets`);
  return parseJson(response);
}

export async function createTicket(payload) {
  const response = await fetch(`${TICKETS_API}/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson(response);
}

export async function updateTicket(ticketId, payload) {
  const response = await fetch(`${TICKETS_API}/tickets/${ticketId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson(response);
}

export async function getAssignments() {
  const response = await fetch(`${ASSIGNMENTS_API}/assignments`);
  return parseJson(response);
}

export async function createAssignment(payload) {
  const response = await fetch(`${ASSIGNMENTS_API}/assignments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson(response);
}

export async function getTicketHistory(ticketId) {
  const response = await fetch(`${TICKETS_API}/tickets/${ticketId}/history`);
  return parseJson(response);
}
