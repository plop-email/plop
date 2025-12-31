import { z } from "zod";

const envSchema = z.object({
  DATABASE_PRIMARY_URL: z.string().url(),
  DATABASE_LHR_URL: z.string().url(),
  DATABASE_SESSION_POOLER: z.string().url(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  FLY_REGION: z.string().optional(),
});

const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .filter((issue) => issue.code === "too_small" && issue.minimum === 1)
        .map((issue) => issue.path.join("."));

      const invalidVars = error.issues
        .filter((issue) => issue.code !== "too_small")
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`);

      let errorMessage = "Environment validation failed:\n";

      if (missingVars.length > 0) {
        errorMessage += `  Missing required variables: ${missingVars.join(", ")}\n`;
      }

      if (invalidVars.length > 0) {
        errorMessage += `  Invalid variables:\n    ${invalidVars.join("\n    ")}`;
      }

      throw new Error(errorMessage);
    }
    throw error;
  }
};

export const env = parseEnv();

export type Env = z.infer<typeof envSchema>;
