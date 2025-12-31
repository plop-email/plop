const fs = require("node:fs");
const path = require("node:path");

const reactEmailDir = path.join(process.cwd(), ".react-email");

const removeDir = (target) => {
  fs.rmSync(target, {
    recursive: true,
    force: true,
    maxRetries: 3,
    retryDelay: 100,
  });
};

if (fs.existsSync(reactEmailDir)) {
  try {
    removeDir(reactEmailDir);
  } catch {
    try {
      const fallback = `${reactEmailDir}-${Date.now()}`;
      fs.renameSync(reactEmailDir, fallback);
      removeDir(fallback);
    } catch {
      // Ignore cleanup errors; build will recreate as needed.
    }
  }
}
