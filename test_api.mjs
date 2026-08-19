import {
  createEvent, listEvents, getEvent, updateEvent, deleteEvent,
  addTask, updateTask, deleteTask
} from "./api/_lib/operations.js";

const run = async () => {
  const created = await createEvent({ name: "VercelAPITest", date: "2026-12-31", teamMembers: "QA" });
  console.log("CREATE ->", created.id, created.name);

  const listed = await listEvents();
  console.log("LIST count ->", listed.length, "has test:", listed.some(e => e.id === created.id));

  const fetched = await getEvent(created.id);
  console.log("GET ->", fetched.name);

  const task = await addTask(created.id, { title: "do thing", category: "before", priority: "high" });
  console.log("ADD TASK ->", task.id, task.title);

  const upd = await updateTask(created.id, task.id, { completed: true });
  console.log("UPDATE TASK ->", upd.completed);

  const updEvt = await updateEvent(created.id, { location: "Hall B" });
  console.log("UPDATE EVENT ->", updEvt.location);

  await deleteTask(created.id, task.id);
  await deleteEvent(created.id);
  const after = await listEvents();
  console.log("AFTER DELETE has test:", after.some(e => e.id === created.id));
  console.log("OK");
};

run().catch(e => { console.error("FAIL", e); process.exit(1); });
