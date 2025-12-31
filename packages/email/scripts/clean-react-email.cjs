const fs = require("node:fs");
const path = require("node:path");

const reactEmailDir = path.join(process.cwd(), ".react-email");

try {
  fs.rmSync(reactEmailDir, { recursive: true, force: true });
} catch {
  // Ignore cleanup errors; build will recreate as needed.
}
