import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  // Replace <your-project-ref> with your project id: https://trigger.dev/docs/trigger-config
  project: "<your-project-ref>",
  logLevel: "log",
  maxDuration: 3600,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
});
