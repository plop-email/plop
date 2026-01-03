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
            Effective Date: January 3, 2026
          </p>

          <p>
            plop.email (&quot;Plop,&quot; &quot;we,&quot; &quot;us,&quot; or
            &quot;our&quot;) is operated by Comonad Limited, a company
            registered in England and Wales (company number: 15713725),
            registered address: 71-75 Shelton Street, Covent Garden, London,
            WC2H 9JQ. We respect your privacy and are committed to protecting
            the personal data we process when you use the plop.email service
            (the &quot;Service&quot;). This Privacy Policy explains how we
            collect, use, store, and protect your personal data under the UK
            General Data Protection Regulation (UK GDPR), the Data Protection
            Act 2018, and other applicable data protection laws.
          </p>

          <h2>1. Data Controller</h2>
          <p>
            Comonad Limited is the data controller responsible for your personal
            data. For any data protection queries, contact us at{" "}
            <a href="mailto:privacy@comonad.co.uk">privacy@comonad.co.uk</a>.
          </p>

          <h2>2. Data We Collect</h2>
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
              processing. This may include personal data of third parties if
              contained in test emails.
            </li>
            <li>
              <strong>Usage data:</strong> Log data about how you interact with
              the Service, including IP addresses, device and browser data, API
              request metadata, timestamps, and feature usage.
            </li>
            <li>
              <strong>Configuration data:</strong> Settings you provide such as
              mailbox names, tags, routing preferences, and webhook targets.
            </li>
            <li>
              <strong>Payment information:</strong> Billing address and payment
              method details (card details are processed directly by our payment
              processor and not stored by us).
            </li>
            <li>
              <strong>Support communications:</strong> Information you share
              when contacting support or collaborating with us.
            </li>
          </ul>

          <h2>3. How We Use Your Data</h2>
          <p>We use your data to:</p>
          <ul>
            <li>Provide, operate, and maintain the Service.</li>
            <li>
              Store, index, and deliver inbox content per your instructions.
            </li>
            <li>Process payments and manage subscriptions.</li>
            <li>Improve reliability, performance, and security.</li>
            <li>
              Communicate about product updates, support, billing, and service
              changes.
            </li>
            <li>Detect and prevent fraud, abuse, and security incidents.</li>
            <li>Comply with legal obligations and enforce our Terms.</li>
          </ul>

          <h2>4. Legal Bases for Processing</h2>
          <p>We process personal data on the following legal bases:</p>
          <ul>
            <li>
              <strong>Contract performance:</strong> Processing necessary to
              provide the Service you have subscribed to (account data, inbox
              content, configuration data).
            </li>
            <li>
              <strong>Legitimate interests:</strong> Processing for security,
              fraud prevention, service improvement, and analytics, where our
              interests do not override your rights.
            </li>
            <li>
              <strong>Legal obligation:</strong> Processing required to comply
              with applicable laws, such as financial record-keeping and
              responding to lawful requests.
            </li>
            <li>
              <strong>Consent:</strong> Where required, such as for marketing
              communications or non-essential cookies. You may withdraw consent
              at any time.
            </li>
          </ul>

          <h2>5. Data Sharing &amp; Sub-processors</h2>
          <p>
            We share data with trusted third-party service providers
            (&quot;sub-processors&quot;) who help us operate the Service:
          </p>
          <ul>
            <li>
              <strong>Supabase Inc.</strong> (United States) — Database hosting
              and authentication
            </li>
            <li>
              <strong>Cloudflare Inc.</strong> (United States) — CDN, DNS, and
              email routing infrastructure
            </li>
            <li>
              <strong>Vercel Inc.</strong> (United States) — Application hosting
            </li>
            <li>
              <strong>Polar.sh</strong> (European Union) — Payment processing
              and subscription management
            </li>
            <li>
              <strong>Resend Inc.</strong> (United States) — Transactional email
              delivery
            </li>
            <li>
              <strong>OpenPanel</strong> (European Union) — Privacy-focused
              analytics
            </li>
          </ul>
          <p>We may also share data with:</p>
          <ul>
            <li>
              <strong>Legal authorities:</strong> When required by law, court
              order, or to protect the rights, safety, and security of Plop and
              our users.
            </li>
            <li>
              <strong>Business transfers:</strong> If we undergo a merger,
              acquisition, or asset sale, your data may be transferred as part
              of that transaction.
            </li>
            <li>
              <strong>Professional advisors:</strong> Lawyers, accountants, and
              auditors as necessary for business operations.
            </li>
          </ul>
          <p>
            We do not sell your personal data. We require all sub-processors to
            process data only on our instructions and maintain appropriate
            security measures.
          </p>

          <h2>6. International Transfers</h2>
          <p>
            Some of our sub-processors are located outside the UK and European
            Economic Area (EEA), primarily in the United States. When we
            transfer personal data internationally, we ensure appropriate
            safeguards are in place:
          </p>
          <ul>
            <li>
              <strong>Standard Contractual Clauses (SCCs):</strong> EU/UK
              Commission-approved clauses for transfers to countries without
              adequacy decisions.
            </li>
            <li>
              <strong>Adequacy decisions:</strong> Where the destination country
              has been deemed to provide adequate protection.
            </li>
            <li>
              <strong>Additional measures:</strong> Technical and organizational
              measures to protect data during transfer and processing.
            </li>
          </ul>
          <p>
            You may request a copy of the safeguards we use by contacting us at
            the address below.
          </p>

          <h2>7. Data Retention</h2>
          <p>We retain data for as long as needed to provide the Service:</p>
          <ul>
            <li>
              <strong>Account data:</strong> Retained while your account is
              active and for up to 6 years thereafter for legal and accounting
              purposes.
            </li>
            <li>
              <strong>Inbox content:</strong> Retained according to your plan
              (Starter: 14 days, Pro: 90 days, Enterprise: as agreed). After the
              retention period, content is automatically deleted.
            </li>
            <li>
              <strong>Usage and log data:</strong> Retained for up to 90 days
              for security and debugging purposes.
            </li>
            <li>
              <strong>Payment records:</strong> Retained for 7 years to comply
              with UK tax and accounting requirements.
            </li>
          </ul>
          <p>
            Backups containing your data may be retained for up to 30 additional
            days for disaster recovery purposes.
          </p>

          <h2>8. Your Rights</h2>
          <p>
            Under UK GDPR and the Data Protection Act 2018, you have the
            following rights:
          </p>
          <ul>
            <li>
              <strong>Access:</strong> Request a copy of the personal data we
              hold about you.
            </li>
            <li>
              <strong>Rectification:</strong> Request correction of inaccurate
              or incomplete data.
            </li>
            <li>
              <strong>Erasure:</strong> Request deletion of your data in certain
              circumstances (&quot;right to be forgotten&quot;).
            </li>
            <li>
              <strong>Restriction:</strong> Request that we limit processing of
              your data in certain circumstances.
            </li>
            <li>
              <strong>Portability:</strong> Request your data in a structured,
              machine-readable format.
            </li>
            <li>
              <strong>Objection:</strong> Object to processing based on
              legitimate interests or for direct marketing.
            </li>
            <li>
              <strong>Withdraw consent:</strong> Where processing is based on
              consent, withdraw it at any time.
            </li>
          </ul>
          <p>
            To exercise these rights, contact us at{" "}
            <a href="mailto:privacy@comonad.co.uk">privacy@comonad.co.uk</a>. We
            will respond within one month. We may need to verify your identity
            before processing your request.
          </p>
          <p>
            <strong>Right to complain:</strong> If you are not satisfied with
            how we handle your data, you have the right to lodge a complaint
            with the UK Information Commissioner&apos;s Office (ICO) at{" "}
            <a
              href="https://ico.org.uk/make-a-complaint/"
              target="_blank"
              rel="noopener noreferrer"
            >
              ico.org.uk/make-a-complaint
            </a>
            .
          </p>

          <h2>9. Security</h2>
          <p>
            We implement appropriate technical and organizational measures to
            protect your data, including:
          </p>
          <ul>
            <li>Encryption of data in transit (TLS) and at rest</li>
            <li>Access controls and authentication requirements</li>
            <li>Regular security assessments and monitoring</li>
            <li>Employee training on data protection</li>
          </ul>
          <p>
            No system is completely secure. You are responsible for maintaining
            the security of your account credentials and API keys. Please notify
            us immediately at{" "}
            <a href="mailto:security@comonad.co.uk">security@comonad.co.uk</a>{" "}
            if you suspect any unauthorized access.
          </p>

          <h2>10. Cookies</h2>
          <p>
            We use cookies and similar technologies to provide functionality and
            improve the Service. For details on the cookies we use and how to
            manage your preferences, please see our{" "}
            <a href="/legal/cookies">Cookie Policy</a>.
          </p>

          <h2>11. Third-Party Personal Data</h2>
          <p>
            If you route emails to Plop that contain personal data of third
            parties (for example, in test emails), you are responsible for
            ensuring you have the appropriate legal basis to process and
            transfer that data to us. The Service is designed for test and
            development purposes; avoid routing production emails containing
            real user data unless you have appropriate data processing
            agreements in place.
          </p>

          <h2>12. Children&apos;s Privacy</h2>
          <p>
            The Service is not intended for individuals under 18, and we do not
            knowingly collect personal data from children. If you believe we
            have collected data from a child, please contact us immediately.
          </p>

          <h2>13. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify
            you of material changes by posting the updated policy with a new
            effective date and, where appropriate, by email. Your continued use
            of the Service after changes take effect constitutes acceptance of
            the updated policy.
          </p>

          <div className="mt-8 border-t border-white/12 pt-8">
            <h2>Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, want to exercise
              your rights, or have concerns about our data practices, contact
              us:
            </p>
            <p className="mt-4">
              <strong>Email:</strong>{" "}
              <a href="mailto:privacy@comonad.co.uk">privacy@comonad.co.uk</a>
              <br />
              <strong>Post:</strong> Comonad Limited, 71-75 Shelton Street,
              Covent Garden, London, WC2H 9JQ
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}
