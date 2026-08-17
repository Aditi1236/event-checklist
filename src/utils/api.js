const BASE = "/api";

async function request(method, url, body) {
  const res = await fetch(BASE + url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new Error(`API ${method} ${url} failed (${res.status})`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const apiClient = {
  listEvents: () => request("GET", "/events"),
  createEvent: (event) => request("POST", "/events", event),
  getEvent: (id) => request("GET", `/events/${id}`),
  updateEvent: (id, patch) => request("PUT", `/events/${id}`, patch),
  deleteEvent: (id) => request("DELETE", `/events/${id}`),
  addTask: (id, task) => request("POST", `/events/${id}/tasks`, task),
  updateTask: (id, taskId, patch) => request("PUT", `/events/${id}/tasks/${taskId}`, patch),
  deleteTask: (id, taskId) => request("DELETE", `/events/${id}/tasks/${taskId}`),
};

export default apiClient;
