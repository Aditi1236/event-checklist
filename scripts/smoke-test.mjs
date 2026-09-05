// End-to-end smoke test: admin + executive member flows.
const BASE = process.env.API_BASE || "http://127.0.0.1:4300";
const log = [];
const out = (s) => log.push(String(s));
let failures = 0;
function check(name, cond, extra = "") {
  out(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? "  (" + extra + ")" : ""}`);
  if (!cond) failures++;
}
async function req(method, path, { token, body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  return { status: res.status, data: text ? JSON.parse(text) : null };
}

const admin = (await req("POST", "/api/auth/login", { body: { email: "admin@nexasoul.com", password: "admin123" } })).data;
check("admin login", !!admin?.token, admin?.user?.email);
const member = (await req("POST", "/api/auth/login", { body: { email: "member@nexasoul.com", password: "member123" } })).data;
check("member login (demo seed)", !!member?.token, member?.user?.email);

// member RBAC: admin-only endpoints blocked
check("member blocked from /api/users", (await req("GET", "/api/users", { token: member.token })).status === 403);
check("member blocked from /api/admin/summary", (await req("GET", "/api/admin/summary", { token: member.token })).status === 403);
check("member blocked from /api/tasks", (await req("GET", "/api/tasks", { token: member.token })).status === 403);
check("member blocked from creating events", (await req("POST", "/api/events", { token: member.token, body: { name: "nope" } })).status === 403);

// admin: find demo member, create event + assigned task
const users = (await req("GET", "/api/users", { token: admin.token })).data;
const demo = users.find((u) => u.email === "member@nexasoul.com");
check("demo member visible to admin", !!demo?.id);
const evt = (await req("POST", "/api/events", { token: admin.token, body: { name: "SmokeTest Event", type: "bootcamp", date: "2026-12-01", endDate: "2026-12-03", location: "CU" } })).data;
check("admin creates event", !!evt?.id, evt?.type);
const task = (await req("POST", `/api/events/${evt.id}/tasks`, { token: admin.token, body: { title: "Prep venue", assigneeId: demo.id, status: "pending", dueDate: "2026-11-20", priority: "high" } })).data;
check("admin assigns task to member", !!task?.id && task.assigneeId === demo.id);

// member: my tasks + status updates
let my = (await req("GET", "/api/my/tasks", { token: member.token })).data;
check("member sees assigned task w/ event info", my.length === 1 && my[0].eventName === "SmokeTest Event", `count=${my.length}`);
let up = await req("PUT", `/api/events/${evt.id}/tasks/${task.id}`, { token: member.token, body: { status: "in_progress" } });
check("member sets in_progress", up.status === 200 && up.data.status === "in_progress");
up = await req("PUT", `/api/events/${evt.id}/tasks/${task.id}`, { token: member.token, body: { status: "completed" } });
check("member sets completed", up.status === 200 && up.data.status === "completed" && up.data.completed === true);
up = await req("PUT", `/api/events/${evt.id}/tasks/${task.id}`, { token: member.token, body: { title: "hacked", assigneeId: admin.user.id } });
check("member cannot edit title/assignee", up.status === 403, `status=${up.status}`);

// second member: demo member must NOT update their task
const second = (await req("POST", "/api/users", { token: admin.token, body: { name: "Second Member", email: "second@test.com", password: "second123", role: "member" } })).data;
const task2 = (await req("POST", `/api/events/${evt.id}/tasks`, { token: admin.token, body: { title: "Other's task", assigneeId: second.id } })).data;
const secLogin = (await req("POST", "/api/auth/login", { body: { email: "second@test.com", password: "second123" } })).data;
check("second member login", !!secLogin?.token);
const cross = await req("PUT", `/api/events/${evt.id}/tasks/${task2.id}`, { token: member.token, body: { status: "completed" } });
check("member cannot update another member's task", cross.status === 403, `status=${cross.status}`);
const own2 = await req("PUT", `/api/events/${evt.id}/tasks/${task2.id}`, { token: secLogin.token, body: { status: "in_progress" } });
check("second member updates own task", own2.status === 200 && own2.data.status === "in_progress");

// admin summary reflects progress
const sum = (await req("GET", "/api/admin/summary", { token: admin.token })).data;
const evProg = sum.eventProgress.find((e) => e.id === evt.id);
check("summary: event progress 1/2 completed", evProg?.done === 1 && evProg?.total === 2, `${evProg?.done}/${evProg?.total}`);
const load = sum.memberLoad.find((m) => m.userId === demo.id);
check("summary: member workload tracked", load?.total === 1 && load?.completed === 1);

// anonymous protections
check("anonymous task update blocked", (await req("PUT", `/api/events/${evt.id}/tasks/${task.id}`, { body: { status: "completed" } })).status === 401);

// cleanup
await req("DELETE", `/api/events/${evt.id}`, { token: admin.token });
await req("DELETE", `/api/users/${second.id}`, { token: admin.token });
out("DONE");
const fs = await import("node:fs");
fs.writeFileSync("smoke-test-results.txt", log.join("\n") + (failures ? `\n${failures} FAILURE(S)` : "\nALL PASSED"));
process.exit(failures ? 1 : 0);
