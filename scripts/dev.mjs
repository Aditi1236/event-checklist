// Runs the API server and the Vite dev server together with a single command,
// so the app has a working backend (persistence + cross-device sharing) in dev.
import { spawn } from "node:child_process";

function start(name, command, args, color) {
  const child = spawn(command, args, {
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "pipe"],
    shell: true,
  });

  const tag = `\x1b[${color}m[${name}]\x1b[0m`;
  const pipe = (stream, out) => {
    stream.setEncoding("utf8");
    stream.on("data", (chunk) => {
      for (const line of chunk.split("\n")) {
        if (line.trim()) out.write(`${tag} ${line}\n`);
      }
    });
  };
  pipe(child.stdout, process.stdout);
  pipe(child.stderr, process.stderr);

  child.on("exit", (code) => {
    process.stdout.write(`${tag} exited (${code})\n`);
  });
  return child;
}

const procs = [
  start("server", "node", ["server/index.js"], "35"), // yellow
  start("vite", "npx", ["vite", "--host"], "36"), // magenta
];

function shutdown() {
  for (const p of procs) {
    try {
      p.kill();
    } catch {
      /* ignore */
    }
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
