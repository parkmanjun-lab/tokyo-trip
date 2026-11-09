import {writeFileSync} from "node:fs";
import {randomUUID} from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { readExecutionProfile } from "./execution-profile.mjs";

const [command, ...args] = process.argv.slice(2);
if (!["dev", "build"].includes(command)) throw new Error("Expected dev or build.");
if(command==='build')writeFileSync(new URL('../lib/build-version.ts',import.meta.url),`// Generated once per build; shared by the client and version endpoint.\nexport const APP_BUILD_VERSION='tokyo-${Date.now().toString(36)}-${randomUUID().slice(0,8)}';\n`);
// Build the offline UI graph only after the framework output is complete.
if(command==='build')process.on('exit',code=>{if(code!==0)return;const result=spawnSync(process.execPath,[fileURLToPath(new URL('./build-startup-cache.mjs',import.meta.url))],{stdio:'inherit'});if(result.status!==0||result.error)process.exitCode=1;});
const managedLinux = readExecutionProfile() === "managed-linux";

if (managedLinux && command === "build") {
  const result = spawnSync("bash", [
    fileURLToPath(new URL("./build-verified.sh", import.meta.url)), ...args,
  ], { stdio: "inherit" });
  if (result.error) throw result.error;
  process.exit(result.status ?? 1);
}

// Import in this process so the preview owner retains its PID and signals.
const cli = new URL(managedLinux
  ? "../node_modules/vite/bin/vite.js"
  : "../node_modules/vinext/dist/cli.js", import.meta.url);
process.argv = [process.execPath, fileURLToPath(cli), command,
  ...(!managedLinux && command === "dev" ? ["--port", "5173"] : []), ...args];
await import(cli.href);
