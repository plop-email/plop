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
            Effective Date: January 3, 2026
          </p>

          <p>
            plop.email (&quot;Plop,&quot; &quot;we,&quot; &quot;us,&quot; or
            &quot;our&quot;) is operated by Comonad Limited (company number:
            15713725). We use cookies and similar technologies on our website
            and Service to provide functionality, improve performance, and
            understand usage. This Cookie Policy explains what cookies are, how
            we use them, and how you can control them.
          </p>

          <h2>1. What Are Cookies?</h2>
          <p>
            Cookies are small text files stored on your device when you visit a
            website. They help remember your preferences, keep you logged in,
            and improve your experience. Similar technologies include local
            storage, session storage, and tracking pixels.
          </p>

          <h2>2. Types of Cookies We Use</h2>

          <h3>Strictly Necessary Cookies</h3>
          <p>
            These cookies are essential for the Service to function and cannot
            be disabled. They do not require consent under applicable law.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2 border-b border-white/12">
                    Cookie
                  </th>
                  <th className="text-left p-2 border-b border-white/12">
                    Purpose
                  </th>
                  <th className="text-left p-2 border-b border-white/12">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border-b border-white/12">
                    <code>sb-*-auth-token</code>
                  </td>
                  <td className="p-2 border-b border-white/12">
                    Authentication session (Supabase)
                  </td>
                  <td className="p-2 border-b border-white/12">Session</td>
                </tr>
                <tr>
                  <td className="p-2 border-b border-white/12">
                    <code>__cf_bm</code>
                  </td>
                  <td className="p-2 border-b border-white/12">
                    Bot management (Cloudflare)
                  </td>
                  <td className="p-2 border-b border-white/12">30 minutes</td>
                </tr>
                <tr>
                  <td className="p-2 border-b border-white/12">
                    <code>cf_clearance</code>
                  </td>
                  <td className="p-2 border-b border-white/12">
                    Security verification (Cloudflare)
                  </td>
                  <td className="p-2 border-b border-white/12">Up to 1 year</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>Functional Cookies</h3>
          <p>
            These cookies enable enhanced functionality and personalization,
            such as remembering your preferences.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2 border-b border-white/12">
                    Cookie
                  </th>
                  <th className="text-left p-2 border-b border-white/12">
                    Purpose
                  </th>
                  <th className="text-left p-2 border-b border-white/12">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border-b border-white/12">
                    <code>plop_trial_plan</code>
                  </td>
                  <td className="p-2 border-b border-white/12">
                    Stores selected trial plan during signup
                  </td>
                  <td className="p-2 border-b border-white/12">14 days</td>
                </tr>
                <tr>
                  <td className="p-2 border-b border-white/12">
                    <code>theme</code>
                  </td>
                  <td className="p-2 border-b border-white/12">
                    Stores your theme preference (light/dark)
                  </td>
                  <td className="p-2 border-b border-white/12">1 year</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>Analytics Cookies</h3>
          <p>
            These cookies help us understand how visitors interact with the
            Service, allowing us to improve it.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2 border-b border-white/12">
                    Cookie
                  </th>
                  <th className="text-left p-2 border-b border-white/12">
                    Purpose
                  </th>
                  <th className="text-left p-2 border-b border-white/12">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border-b border-white/12">
                    <code>op_*</code>
                  </td>
                  <td className="p-2 border-b border-white/12">
                    Privacy-focused analytics (OpenPanel)
                  </td>
                  <td className="p-2 border-b border-white/12">1 year</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>3. Local Storage</h2>
          <p>
            In addition to cookies, we use browser local storage for certain
            functionality:
          </p>
          <ul>
            <li>
              <strong>plop_welcome_dismissed:</strong> Remembers if you&apos;ve
              dismissed the welcome banner
            </li>
            <li>
              <strong>sidebar_state:</strong> Stores your sidebar
              expanded/collapsed preference
            </li>
          </ul>

          <h2>4. Third-Party Cookies</h2>
          <p>
            We use services from third parties who may set their own cookies:
          </p>
          <ul>
            <li>
              <strong>Supabase:</strong> Authentication and database services
            </li>
            <li>
              <strong>Cloudflare:</strong> Security and performance
            </li>
            <li>
              <strong>Polar:</strong> Payment processing
            </li>
            <li>
              <strong>OpenPanel:</strong> Privacy-focused analytics (does not
              use cross-site tracking)
            </li>
          </ul>
          <p>
            These providers have their own privacy and cookie policies. We
            encourage you to review them.
          </p>

          <h2>5. Your Choices</h2>
          <p>You have several options for managing cookies:</p>
          <ul>
            <li>
              <strong>Browser settings:</strong> Most browsers allow you to
              block or delete cookies. Check your browser&apos;s help section
              for instructions.
            </li>
            <li>
              <strong>Do Not Track:</strong> We respect browser Do Not Track
              signals where technically feasible.
            </li>
            <li>
              <strong>Opt-out links:</strong> Some third-party providers offer
              direct opt-out mechanisms on their websites.
            </li>
          </ul>
          <p>
            <strong>Note:</strong> Disabling strictly necessary cookies may
            prevent you from using the Service, as they are required for
            authentication and security.
          </p>

          <h2>6. Legal Basis</h2>
          <p>
            Under UK GDPR and the Privacy and Electronic Communications
            Regulations (PECR):
          </p>
          <ul>
            <li>
              Strictly necessary cookies do not require consent as they are
              essential for the Service.
            </li>
            <li>
              Analytics and functional cookies are set based on our legitimate
              interests in improving the Service, or with your consent where
              required.
            </li>
          </ul>

          <h2>7. Changes to This Policy</h2>
          <p>
            We may update this Cookie Policy from time to time. We will post the
            updated policy with a new effective date. Material changes will be
            communicated through the Service or by email where appropriate.
          </p>

          <div className="mt-8 border-t border-white/12 pt-8">
            <h2>Contact Us</h2>
            <p>
              Questions about cookies or this policy? Contact us at{" "}
              <a href="mailto:privacy@comonad.co.uk">privacy@comonad.co.uk</a>.
            </p>
            <p className="mt-4 text-sm text-white/60">
              For more information about how we handle your personal data,
              please see our <a href="/legal/privacy">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}
