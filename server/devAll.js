import { spawn } from "node:child_process";

const isWindows = process.platform === "win32";
const npmExecPath = process.env.npm_execpath;
const npmCommand = npmExecPath ? process.execPath : isWindows ? "npm.cmd" : "npm";

function npmArgs(scriptName) {
  return npmExecPath ? [npmExecPath, "run", scriptName] : ["run", scriptName];
}

function start(name, command, args) {
  const child = spawn(command, args, {
    stdio: "inherit",
    shell: false,
  });

  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`${name} exited with code ${code}`);
    }
  });

  return child;
}

const server = start("server", npmCommand, npmArgs("server"));
const dev = start("dev", npmCommand, npmArgs("dev"));

function shutdown() {
  server.kill();
  dev.kill();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
