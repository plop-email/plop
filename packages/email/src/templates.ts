import { render } from "@react-email/components";
import type { JSX } from "react";
import ConfirmEmail from "../emails/ConfirmEmail";
import MagicLinkEmail from "../emails/MagicLink";
import ResetPasswordEmail from "../emails/ResetPassword";
import TeamInviteEmail from "../emails/TeamInvite";
import WelcomeEmail from "../emails/Welcome";

export const mailTemplates = {
  confirmEmail: ConfirmEmail,
  magicLink: MagicLinkEmail,
  resetPassword: ResetPasswordEmail,
  teamInvite: TeamInviteEmail,
  welcome: WelcomeEmail,
};

type TemplateWithSubjects<Context> = ((context: Context) => JSX.Element) & {
  subjects?: Record<string, string>;
};

export async function getTemplate<
  TemplateId extends keyof typeof mailTemplates,
>({
  templateId,
  context,
  locale = "en",
}: {
  templateId: TemplateId;
  context: Parameters<(typeof mailTemplates)[TemplateId]>[0];
  locale?: string;
}) {
  const template = mailTemplates[templateId] as TemplateWithSubjects<
    Parameters<(typeof mailTemplates)[TemplateId]>[0]
  >;

  const email = template(context);
  const subject = template.subjects?.[locale] ?? template.subjects?.en ?? "";
  const html = await render(email);
  const text = await render(email, { plainText: true });

  return { html, text, subject };
}
