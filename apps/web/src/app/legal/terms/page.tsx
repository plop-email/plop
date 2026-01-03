import { Section } from "@/components/section";
import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "Terms & Conditions | plop.email",
  description: "Terms & Conditions for the plop.email service.",
  path: "/legal/terms",
  noIndex: true,
});

export default function TermsPage() {
  return (
    <div className="flex justify-center py-16">
      <Section id="terms">
        <div className="legal-content p-8">
          <h1>Terms &amp; Conditions</h1>
          <p className="text-sm text-white/60">
            Effective Date: January 3, 2026
          </p>

          <h2>1. Introduction</h2>
          <p>
            These Terms &amp; Conditions (&quot;Terms&quot;) govern your access
            to and use of the plop.email service (the &quot;Service&quot;),
            operated by Comonad Limited, a company registered in England and
            Wales (company number: 15713725). By using the Service, you agree to
            these Terms. If you do not agree, do not use the Service.
          </p>

          <h2>2. The Service</h2>
          <p>
            plop.email provides email testing infrastructure for development and
            QA teams, including inbound email routing, storage, indexing, APIs,
            and related tooling. The Service is designed for{" "}
            <strong>test and development purposes only</strong>. You should not
            use the Service to receive production emails containing real user
            data unless you have appropriate data processing agreements in
            place. We may update or modify features over time.
          </p>

          <h2>3. Accounts &amp; Responsibilities</h2>
          <p>
            You are responsible for maintaining the confidentiality of your
            account credentials and API keys, and for all activities under your
            account. You agree to provide accurate information and to notify us
            promptly of any unauthorized access or security incident. You must
            be at least 18 years old to create an account.
          </p>

          <h2>4. Free Trials</h2>
          <p>
            We may offer a free trial period for new accounts. During the trial,
            you have access to the features of your selected plan. At the end of
            the trial period, you must subscribe to a paid plan to continue
            using the Service. We reserve the right to modify or discontinue
            trial offers at any time. Trial accounts that do not convert to paid
            plans may have their data deleted after a reasonable notice period.
          </p>

          <h2>5. Acceptable Use</h2>
          <p>
            You agree not to misuse the Service. Prohibited activities include:
          </p>
          <ul>
            <li>
              Sending, receiving, or storing unlawful, harmful, or offensive
              content
            </li>
            <li>
              Violating third-party intellectual property or privacy rights
            </li>
            <li>Distributing malware, viruses, or malicious code</li>
            <li>
              Attempting to access data, systems, or accounts you are not
              authorized to access
            </li>
            <li>
              Using the Service for spam, phishing, or fraudulent purposes
            </li>
            <li>
              Interfering with or disrupting the Service or its infrastructure
            </li>
            <li>
              Circumventing usage limits, rate limits, or security measures
            </li>
            <li>
              Reselling or redistributing the Service without authorization
            </li>
            <li>
              Using the Service in violation of applicable laws or regulations
            </li>
          </ul>

          <h2>6. API Usage &amp; Rate Limits</h2>
          <p>
            Access to the API is subject to rate limits and fair use policies as
            documented. Excessive or abusive API usage may result in temporary
            or permanent suspension of access. We reserve the right to modify
            rate limits with reasonable notice.
          </p>

          <h2>7. Customer Content</h2>
          <p>
            You retain ownership of the email content you route to the Service.
            You grant Plop a limited license to host, process, store, and
            display that content solely to provide the Service. You represent
            and warrant that:
          </p>
          <ul>
            <li>
              You have the rights and permissions necessary to provide the
              content to us
            </li>
            <li>
              The content does not violate any applicable laws or third-party
              rights
            </li>
            <li>
              If the content contains personal data of third parties, you have
              the appropriate legal basis to process and transfer that data
            </li>
          </ul>
          <p>
            <strong>Accidental production data:</strong> If you accidentally
            route production emails containing real user data to the Service,
            you should delete them promptly and notify us if you require
            assistance. You remain responsible for any such data.
          </p>

          <h2>8. Data Retention</h2>
          <p>
            We retain received emails according to your plan: Starter retains
            messages for 14 days, Pro retains messages for 90 days, and
            Enterprise retention is defined by agreement. After the retention
            window, message content is automatically deleted. Backups may be
            retained for a limited additional period for disaster recovery
            purposes.
          </p>

          <h2>9. Fees &amp; Billing</h2>
          <p>
            Paid plans require payment in advance. By subscribing, you agree to
            the pricing and payment terms presented at checkout. Fees are
            non-refundable except as required by law or as stated in writing. We
            may change pricing with 30 days&apos; notice. Failure to pay may
            result in suspension or termination of access.
          </p>

          <h2>10. Privacy</h2>
          <p>
            Our use of personal data is described in our{" "}
            <a href="/legal/privacy">Privacy Policy</a>. By using the Service,
            you acknowledge and agree to the collection and use of information
            as described there.
          </p>

          <h2>11. Intellectual Property</h2>
          <p>
            The Service and related software, branding, and documentation are
            owned by Plop or its licensors. You receive a limited,
            non-exclusive, non-transferable license to use the Service in
            accordance with these Terms. You may not copy, modify, distribute,
            sell, or lease any part of the Service without our written consent.
          </p>

          <h2>12. Indemnification</h2>
          <p>
            You agree to indemnify, defend, and hold harmless Plop and its
            officers, directors, employees, and agents from and against any
            claims, liabilities, damages, losses, and expenses (including
            reasonable legal fees) arising out of or in any way connected with:
          </p>
          <ul>
            <li>Your access to or use of the Service</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any third-party rights</li>
            <li>
              Content you provide to the Service, including any personal data of
              third parties
            </li>
          </ul>

          <h2>13. Disclaimer of Warranties</h2>
          <p>
            The Service is provided on an &quot;as is&quot; and &quot;as
            available&quot; basis. To the maximum extent permitted by applicable
            law, we disclaim all warranties, express or implied, including
            implied warranties of merchantability, fitness for a particular
            purpose, and non-infringement. We do not warrant that the Service
            will be uninterrupted, error-free, or completely secure.
          </p>

          <h2>14. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Plop will not be liable for
            indirect, incidental, special, consequential, or punitive damages,
            or any loss of profits, revenue, data, or goodwill, arising from
            your use of the Service. Our total aggregate liability for any claim
            arising out of or relating to the Service will not exceed the
            greater of (a) the amounts paid by you for the Service in the twelve
            months preceding the event giving rise to the claim, or (b) one
            hundred pounds sterling (GBP 100).
          </p>
          <p>
            Nothing in these Terms excludes or limits our liability for death or
            personal injury caused by our negligence, fraud or fraudulent
            misrepresentation, or any other liability that cannot be excluded or
            limited by law.
          </p>

          <h2>15. Force Majeure</h2>
          <p>
            We will not be liable for any failure or delay in performance due to
            circumstances beyond our reasonable control, including but not
            limited to acts of God, natural disasters, war, terrorism, riots,
            embargoes, acts of civil or military authorities, fire, floods,
            accidents, pandemics, strikes, or shortages of transportation,
            facilities, fuel, energy, labor, or materials.
          </p>

          <h2>16. Termination</h2>
          <p>
            We may suspend or terminate your access to the Service immediately
            for violation of these Terms, non-payment, or for security, legal,
            or operational reasons. You may terminate your account at any time
            through your account settings or by contacting us.
          </p>
          <p>
            <strong>Effect of termination:</strong> Upon termination, your right
            to use the Service ceases immediately. We will delete your data in
            accordance with our data retention practices, typically within 30
            days of termination. You may request an export of your data before
            termination. Sections that by their nature should survive
            termination will survive, including indemnification, limitation of
            liability, and governing law.
          </p>

          <h2>17. Modifications to Terms</h2>
          <p>
            We may modify these Terms from time to time. We will provide notice
            of material changes by posting the updated Terms with a new
            effective date. Your continued use of the Service after such changes
            constitutes acceptance of the modified Terms.
          </p>

          <h2>18. Governing Law &amp; Jurisdiction</h2>
          <p>
            These Terms are governed by and construed in accordance with the
            laws of England and Wales, without regard to conflict of law
            principles. Any disputes arising out of or relating to these Terms
            or the Service shall be subject to the exclusive jurisdiction of the
            courts of England and Wales.
          </p>

          <h2>19. Dispute Resolution</h2>
          <p>
            Before initiating any formal legal proceedings, you agree to first
            contact us at{" "}
            <a href="mailto:legal@comonad.co.uk">legal@comonad.co.uk</a> to
            attempt to resolve the dispute informally. We will attempt to
            resolve disputes through good-faith negotiation within 30 days.
          </p>

          <h2>20. General Provisions</h2>
          <ul>
            <li>
              <strong>Entire Agreement:</strong> These Terms, together with our
              Privacy Policy and Cookie Policy, constitute the entire agreement
              between you and Plop regarding the Service.
            </li>
            <li>
              <strong>Severability:</strong> If any provision of these Terms is
              found invalid or unenforceable, the remaining provisions will
              remain in effect.
            </li>
            <li>
              <strong>Waiver:</strong> Our failure to enforce any right or
              provision of these Terms will not be deemed a waiver of such right
              or provision.
            </li>
            <li>
              <strong>Assignment:</strong> You may not assign or transfer these
              Terms without our prior written consent. We may assign our rights
              and obligations without restriction.
            </li>
          </ul>

          <div className="mt-8 border-t border-white/12 pt-8">
            <p>
              Questions about these Terms? Contact us at{" "}
              <a href="mailto:legal@comonad.co.uk">legal@comonad.co.uk</a>.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}
