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
            Effective Date: December 31, 2025
          </p>

          <h2>1. Introduction</h2>
          <p>
            These Terms &amp; Conditions ("Terms") govern your access to and use
            of the plop.email service (the "Service"), operated by Comonad
            Limited (company number: 15713725). By using the Service, you agree
            to these Terms. If you do not agree, do not use the Service.
          </p>

          <h2>2. The Service</h2>
          <p>
            plop.email provides inbox automation for teams, including inbound
            email routing, storage, indexing, APIs, and related tooling. We may
            update or modify features over time.
          </p>

          <h2>3. Accounts &amp; Responsibilities</h2>
          <p>
            You are responsible for maintaining the confidentiality of your
            account credentials and for all activities under your account. You
            agree to provide accurate information and to notify us promptly of
            any unauthorized access or security incident.
          </p>

          <h2>4. Acceptable Use</h2>
          <p>
            You agree not to misuse the Service. Prohibited activities include
            sending unlawful content, violating third-party rights, distributing
            malware, attempting to access data you are not authorized to access,
            or using the Service for spam or phishing.
          </p>

          <h2>5. Customer Content</h2>
          <p>
            You retain ownership of the email content you send to the Service.
            You grant Plop a limited license to host, process, store, and
            display that content solely to provide the Service. You represent
            that you have the rights and permissions necessary to provide the
            content to us.
          </p>

          <h2>6. Fees &amp; Billing</h2>
          <p>
            Some features may require payment. If you purchase a paid plan, you
            agree to the pricing and payment terms presented at checkout. Fees
            are non-refundable except as required by law or as stated in
            writing.
          </p>

          <h2>7. Privacy</h2>
          <p>
            Our use of personal data is described in our Privacy Policy. By
            using the Service, you consent to the collection and use of
            information as described there.
          </p>

          <h2>8. Intellectual Property</h2>
          <p>
            The Service and related software, branding, and documentation are
            owned by Plop or its licensors. You receive a limited,
            non-transferable license to use the Service according to these
            Terms.
          </p>

          <h2>9. Disclaimer of Warranties</h2>
          <p>
            The Service is provided on an "as is" and "as available" basis. We
            disclaim all warranties, express or implied, including implied
            warranties of merchantability, fitness for a particular purpose, and
            non-infringement.
          </p>

          <h2>10. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Plop will not be liable for
            indirect, incidental, special, consequential, or punitive damages,
            or any loss of profits, data, or goodwill, arising from your use of
            the Service. Our total liability for any claim arising out of or
            relating to the Service will not exceed the amounts paid by you for
            the Service in the twelve months preceding the event giving rise to
            the claim.
          </p>

          <h2>11. Termination</h2>
          <p>
            We may suspend or terminate access to the Service at any time for
            violation of these Terms or for security, legal, or operational
            reasons. You may stop using the Service at any time. Sections that
            by their nature should survive termination will survive.
          </p>

          <h2>12. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the jurisdiction in which
            Plop is established, without regard to conflict of law principles.
          </p>

          <div className="mt-8 border-t border-white/12 pt-8">
            <p>
              Questions about these Terms? Contact us at{" "}
              <a href="mailto:legal@plop.email">legal@plop.email</a>.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}
