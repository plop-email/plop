import { Section } from "@/components/section";
import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "Cookie Policy | plop.email",
  description: "Cookie policy for the plop.email website and service.",
  path: "/legal/cookies",
  noIndex: true,
});

export default function CookiesPage() {
  return (
    <div className="flex justify-center py-16">
      <Section id="cookies">
        <div className="legal-content p-8">
          <h1>Cookie Policy</h1>
          <p className="text-sm text-white/60">
            Effective Date: December 31, 2025
          </p>

          <p>
            plop.email ("Plop," "we," "us," or "our") is operated by Comonad
            Limited (company number: 15713725). We use cookies and similar
            technologies on our website and Service to provide functionality,
            improve performance, and understand usage. This Cookie Policy
            explains what cookies are and how we use them.
          </p>

          <h2>1. What Are Cookies?</h2>
          <p>
            Cookies are small text files stored on your device when you visit a
            website. They help remember your preferences and improve your
            experience.
          </p>

          <h2>2. Types of Cookies We Use</h2>
          <ul>
            <li>
              <strong>Strictly necessary:</strong> Required for core
              functionality such as authentication and security.
            </li>
            <li>
              <strong>Performance &amp; analytics:</strong> Help us understand
              how the Service is used and where we can improve.
            </li>
            <li>
              <strong>Functionality:</strong> Remember your choices and
              preferences to personalize the experience.
            </li>
          </ul>

          <h2>3. Third-Party Cookies</h2>
          <p>
            We may allow trusted third parties to place cookies on our site for
            analytics, payments, or other service operations. These providers
            have their own privacy and cookie policies.
          </p>

          <h2>4. Managing Your Preferences</h2>
          <p>
            You can manage cookies through your browser settings. Disabling
            certain cookies may impact the functionality of the Service.
          </p>

          <h2>5. Changes to This Policy</h2>
          <p>
            We may update this Cookie Policy from time to time. We will post the
            updated policy with a new effective date.
          </p>

          <div className="mt-8 border-t border-white/12 pt-8">
            <h2>Contact Us</h2>
            <p>
              Questions about cookies? Email{" "}
              <a href="mailto:privacy@plop.email">privacy@plop.email</a>.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}
