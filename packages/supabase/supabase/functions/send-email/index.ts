import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { render } from "npm:@react-email/components@0.0.22";
import React from "npm:react@18.3.1";
import { Resend } from "npm:resend@4.0.0";
import ConfirmEmail from "./_templates/ConfirmEmail.tsx";
import MagicLinkEmail from "./_templates/MagicLink.tsx";
import ResetPasswordEmail from "./_templates/ResetPassword.tsx";

const resendApiKey = Deno.env.get("RESEND_API_KEY") as string | undefined;
const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET") as string | undefined;
const fromAddress =
  Deno.env.get("EMAIL_FROM") ||
  Deno.env.get("RESEND_FROM") ||
  "Plop <no-reply@mail.plop.email>";

const supabaseUrl =
  Deno.env.get("SUPABASE_URL") ||
  Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ||
  "";

const resend = resendApiKey ? new Resend(resendApiKey) : null;

function buildVerifyUrl({
  tokenHash,
  actionType,
  redirectTo,
}: {
  tokenHash: string;
  actionType: string;
  redirectTo: string;
}) {
  const type =
    actionType === "reset_password" || actionType === "recovery"
      ? "recovery"
      : actionType === "login"
        ? "magiclink"
        : actionType;

  const verifyUrl = new URL(`${supabaseUrl}/auth/v1/verify`);
  verifyUrl.searchParams.set("token", tokenHash);
  verifyUrl.searchParams.set("type", type);
  verifyUrl.searchParams.set("redirect_to", redirectTo);
  return verifyUrl.toString();
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    const headers = new Headers({ Allow: "POST" });
    return new Response("method not allowed", { status: 405, headers });
  }

  if (!resend || !hookSecret || !supabaseUrl) {
    return new Response("missing email configuration", { status: 500 });
  }

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);
  const webhook = new Webhook(hookSecret);
  let verifiedPayload: {
    user: {
      email: string;
      user_metadata?: {
        full_name?: string;
      };
    };
    email_data: {
      token: string;
      redirect_to: string;
      email_action_type: string;
      site_url: string;
      token_hash: string;
      token_new: string;
      token_hash_new: string;
    };
  };

  try {
    verifiedPayload = webhook.verify(
      payload,
      headers,
    ) as typeof verifiedPayload;
  } catch (error) {
    console.error("Webhook verification failed", error);
    return new Response("invalid signature", { status: 401 });
  }

  const {
    user,
    email_data: { token, email_action_type, token_hash, redirect_to, site_url },
  } = verifiedPayload;

  const displayName = user.user_metadata?.full_name || user.email;
  const baseUrl =
    Deno.env.get("APP_URL") || site_url || "http://localhost:3000";
  const redirectTo = redirect_to || `${baseUrl}/api/auth/confirm`;
  const resolvedTokenHash =
    email_action_type === "email_change_new" ? token_hash_new : token_hash;
  const resolvedOtp =
    email_action_type === "email_change_new" ? token_new : token;
  const verifyUrl = buildVerifyUrl({
    tokenHash: resolvedTokenHash,
    actionType: email_action_type,
    redirectTo,
  });

  switch (email_action_type) {
    case "recovery":
    case "reset_password": {
      const html = await render(
        React.createElement(ResetPasswordEmail, {
          baseUrl,
          url: verifyUrl,
          name: displayName,
          otp: resolvedOtp,
        }),
      );
      const text = await render(
        React.createElement(ResetPasswordEmail, {
          baseUrl,
          url: verifyUrl,
          name: displayName,
          otp: resolvedOtp,
        }),
        { plainText: true },
      );

      await resend.emails.send({
        from: fromAddress,
        to: [user.email],
        subject: ResetPasswordEmail.subjects.en,
        html,
        text,
      });
      break;
    }
    case "login":
    case "magiclink": {
      const html = await render(
        React.createElement(MagicLinkEmail, {
          baseUrl,
          url: verifyUrl,
          name: displayName,
          otp: resolvedOtp,
        }),
      );
      const text = await render(
        React.createElement(MagicLinkEmail, {
          baseUrl,
          url: verifyUrl,
          name: displayName,
          otp: resolvedOtp,
        }),
        { plainText: true },
      );

      await resend.emails.send({
        from: fromAddress,
        to: [user.email],
        subject: MagicLinkEmail.subjects.en,
        html,
        text,
      });
      break;
    }
    case "signup":
    case "invite":
    case "email_change":
    case "email_change_new":
    case "email_change_current": {
      const actionLabel =
        email_action_type === "invite"
          ? "Accept invite"
          : email_action_type.startsWith("email_change")
            ? "Confirm email change"
            : "Confirm your email";
      const subject =
        email_action_type === "invite"
          ? "You are invited to Plop"
          : email_action_type.startsWith("email_change")
            ? "Confirm your email change"
            : ConfirmEmail.subjects.en;

      const html = await render(
        React.createElement(ConfirmEmail, {
          baseUrl,
          url: verifyUrl,
          name: displayName,
          otp: resolvedOtp,
          actionLabel,
        }),
      );
      const text = await render(
        React.createElement(ConfirmEmail, {
          baseUrl,
          url: verifyUrl,
          name: displayName,
          otp: resolvedOtp,
          actionLabel,
        }),
        { plainText: true },
      );

      await resend.emails.send({
        from: fromAddress,
        to: [user.email],
        subject,
        html,
        text,
      });
      break;
    }
    default:
      throw new Error(`Invalid email action type: ${email_action_type}`);
  }

  const responseHeaders = new Headers();
  responseHeaders.set("Content-Type", "application/json");

  return new Response(JSON.stringify({}), {
    status: 200,
    headers: responseHeaders,
  });
});
