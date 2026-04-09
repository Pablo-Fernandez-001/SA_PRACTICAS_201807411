const { spawnSync } = require("child_process");
const path = require("path");

const root = path.resolve(__dirname, "..");

const isWindows = process.platform === "win32";
const command = isWindows ? "powershell" : "bash";
const args = isWindows
  ? ["-ExecutionPolicy", "Bypass", "-File", path.join(root, "scripts", "smoke-test.ps1")]
  : [path.join(root, "scripts", "smoke-test.sh")];

const result = spawnSync(command, args, {
  cwd: root,
  stdio: "inherit",
  shell: false,
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);