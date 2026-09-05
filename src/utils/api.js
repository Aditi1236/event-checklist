const BASE = "/api";
const TOKEN_KEY = "nexasoul.token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(method, url, body, { auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(BASE + url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const err = new Error((data && data.error) || `API ${method} ${url} failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const apiClient = {
  /* events */
  listEvents: () => request("GET", "/events", null, { auth: false }),
  createEvent: (event) => request("POST", "/events", event),
  getEvent: (id) => request("GET", `/events/${id}`, null, { auth: false }),
  updateEvent: (id, patch) => request("PUT", `/events/${id}`, patch),
  deleteEvent: (id) => request("DELETE", `/events/${id}`),
  addTask: (id, task) => request("POST", `/events/${id}/tasks`, task),
  updateTask: (id, taskId, patch) => request("PUT", `/events/${id}/tasks/${taskId}`, patch),
  deleteTask: (id, taskId) => request("DELETE", `/events/${id}/tasks/${taskId}`),

  /* auth */
  login: (email, password) => request("POST", "/auth/login", { email, password }, { auth: false }),
  me: () => request("GET", "/auth/me"),
  logout: () => request("POST", "/auth/logout", null),
  listMyTasks: () => request("GET", "/my/tasks"),

  /* users (admin) */
  listUsers: () => request("GET", "/users"),
  createUser: (user) => request("POST", "/users", user),
  updateUser: (id, patch) => request("PUT", `/users/${id}`, patch),
  deleteUser: (id) => request("DELETE", `/users/${id}`),

  /* tasks + summary (admin) */
  listTasks: (params = {}) => {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return request("GET", `/tasks${q ? `?${q}` : ""}`);
  },
  getAdminSummary: () => request("GET", "/admin/summary"),
};

export default apiClient;
