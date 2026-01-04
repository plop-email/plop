/**
 * Keys for onboarding-related localStorage items
 */
export const WELCOME_DISMISSED_KEY = "plop_welcome_dismissed";

/**
 * Clears all onboarding-related state from localStorage and cookies.
 * Call this when a new user signs up to ensure they get a fresh onboarding experience.
 */
export function clearOnboardingState() {
  if (typeof window === "undefined") return;

  // Clear localStorage items
  localStorage.removeItem(WELCOME_DISMISSED_KEY);
}
