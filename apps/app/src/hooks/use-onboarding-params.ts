import { useQueryStates } from "nuqs";
import { createLoader, parseAsStringLiteral } from "nuqs/server";

export const onboardingSteps = [
  "profile",
  "team",
  "plan",
  "starter",
  "mailbox",
  "invite",
] as const;

export const onboardingPlanOptions = ["starter", "pro"] as const;

export const onboardingParamsSchema = {
  step: parseAsStringLiteral(onboardingSteps),
  plan: parseAsStringLiteral(onboardingPlanOptions),
};

export function useOnboardingParams() {
  const [params, setParams] = useQueryStates(onboardingParamsSchema, {
    clearOnDefault: true,
  });

  return { params, setParams };
}

export const loadOnboardingParams = createLoader(onboardingParamsSchema);
