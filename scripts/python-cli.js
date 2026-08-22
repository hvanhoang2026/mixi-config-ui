const { spawnSync } = require("node:child_process");

const pythonCommand = process.platform === "win32" ? "python" : "python3";
const result = spawnSync(pythonCommand, process.argv.slice(2), {
  stdio: "inherit",
});

if (result.error) {
  console.error(`Unable to run ${pythonCommand}: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
