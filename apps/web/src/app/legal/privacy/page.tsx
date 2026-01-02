import { Section } from "@/components/section";
import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "Privacy Policy | plop.email",
  description: "Privacy policy for the plop.email service.",
  path: "/legal/privacy",
  noIndex: true,
});

export default function PrivacyPage() {
  return (
    <div className="flex justify-center py-16">
      <Section id="privacy">
        <div className="legal-content p-8">
          <h1>Privacy Policy</h1>
          <p className="text-sm text-white/60">
            Effective Date: December 31, 2025
          </p>

          <p>
            plop.email ("Plop," "we," "us," or "our") is operated by Comonad
            Limited (company number: 15713725). We respect your privacy and are
            committed to protecting the personal data we process when you use
            the plop.email service (the "Service"). This Privacy Policy explains
            how we collect, use, store, and protect your personal data, and the
            choices you have about your information.
          </p>

          <h2>1. Data We Collect</h2>
          <p>
            When you use the Service, we may collect and process the following
            categories of information:
          </p>
          <ul>
            <li>
              <strong>Account information:</strong> Name, email address,
              organization details, authentication data, and billing metadata.
            </li>
            <li>
              <strong>Inbox content:</strong> Email messages, headers, metadata,
              and attachments that you route to Plop inboxes for storage and
              processing.
            </li>
            <li>
              <strong>Usage data:</strong> Log data about how you interact with
              the Service, including IP addresses, device and browser data, API
              request metadata, and feature usage.
            </li>
            <li>
              <strong>Configuration data:</strong> Settings you provide such as
              mailbox names, tags, routing preferences, and webhook targets.
            </li>
            <li>
              <strong>Support communications:</strong> Information you share
              when contacting support or collaborating with us.
            </li>
          </ul>

          <h2>2. How We Use Your Data</h2>
          <p>We use your data to:</p>
          <ul>
            <li>Provide, operate, and maintain the Service.</li>
            <li>
              Store, index, and deliver inbox content per your instructions.
            </li>
            <li>Improve reliability, performance, and security.</li>
            <li>Communicate about product updates, support, and billing.</li>
            <li>Comply with legal obligations and enforce our Terms.</li>
          </ul>

          <h2>3. Legal Bases for Processing</h2>
          <p>
            We process personal data based on contractual necessity, legitimate
            interests, compliance with legal obligations, and consent where
            required (for example, marketing communications or non-essential
            cookies).
          </p>

          <h2>4. Data Sharing &amp; Disclosure</h2>
          <p>We may share data with:</p>
          <ul>
            <li>
              <strong>Service providers:</strong> Infrastructure, analytics,
              email delivery, and payment processors that help us run the
              Service.
            </li>
            <li>
              <strong>Legal authorities:</strong> When required by law or to
              protect the rights, safety, and security of Plop and our users.
            </li>
            <li>
              <strong>Business transfers:</strong> If we undergo a merger,
              acquisition, or asset sale.
            </li>
          </ul>
          <p>We do not sell your personal data.</p>

          <h2>5. International Transfers</h2>
          <p>
            We may process data in countries where our providers operate. When
            transferring data internationally, we apply appropriate safeguards
            consistent with applicable law.
          </p>

          <h2>6. Data Retention</h2>
          <p>
            We retain data for as long as needed to provide the Service and
            comply with legal obligations. Inbox content is retained according
            to your settings or until you delete it. Usage data may be retained
            for analytics and security purposes.
          </p>

          <h2>7. Your Rights</h2>
          <p>
            Depending on your location, you may have rights to access, correct,
            delete, or export your personal data, and to object to or restrict
            certain processing. To exercise these rights, contact us at the
            address below.
          </p>

          <h2>8. Security</h2>
          <p>
            We use administrative, technical, and physical safeguards designed
            to protect your data. No system is completely secure, and you are
            responsible for maintaining the security of your account
            credentials.
          </p>

          <h2>9. Children&apos;s Privacy</h2>
          <p>
            The Service is not intended for individuals under 18, and we do not
            knowingly collect personal data from children.
          </p>

          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will post
            the updated policy with a new effective date.
          </p>

          <div className="mt-8 border-t border-white/12 pt-8">
            <h2>Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or want to
              exercise your rights, contact us at{" "}
              <a href="mailto:privacy@comonad.co.uk">privacy@comonad.co.uk</a>.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}
