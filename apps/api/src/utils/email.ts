import { getTemplate } from "@plop/email";
import { logger } from "@plop/logger";
import { env } from "../env";

const resendEndpoint = "https://api.resend.com/emails";
const fromAddress = env.RESEND_FROM || "Plop <no-reply@mail.plop.email>";

async function sendResendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  if (!env.RESEND_API_KEY) {
    logger.warn("RESEND_API_KEY is not set; skipping email send");
    return;
  }

  const response = await fetch(resendEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: fromAddress,
      to,
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend error: ${response.status} ${body}`);
  }
}

export async function sendTeamInviteEmail({
  to,
  teamName,
  inviteUrl,
  invitedByName,
}: {
  to: string;
  teamName: string;
  inviteUrl: string;
  invitedByName?: string | null;
}) {
  const { html, text, subject } = await getTemplate({
    templateId: "teamInvite",
    context: {
      baseUrl: env.APP_URL,
      url: inviteUrl,
      teamName,
      invitedByName,
      email: to,
    },
    locale: "en",
  });

  if (!subject) {
    logger.warn("Team invite email missing subject");
  }

  await sendResendEmail({
    to,
    subject: subject || "You have been invited to join a team",
    html,
    text,
  });
}
