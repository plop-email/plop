import { WelcomeEmail } from "@plop/emails/welcome";
import React from "react";
import { render } from "react-email/components";
import { Resend } from "resend";
import { Webhook } from "standardwebhooks";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);
const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET") as string;

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("not allowed", { status: 400 });
  }

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);
  const wh = new Webhook(hookSecret);

  const {
    user,
    email_data: { email_action_type },
  } = wh.verify(payload, headers) as {
    user: {
      email: string;
    };
    email_data: {
      email_action_type: string;
    };
  };

  switch (email_action_type) {
    case "signup": {
      const html = await render(React.createElement(WelcomeEmail));

      await resend.emails.send({
        from: "Plop <onboarding@plop.email>",
        to: [user.email],
        subject: "Welcome to Plop",
        html,
      });

      break;
    }

    // Add other email actions here
    // case 'reset_password':
    // case 'magic_link':
    default:
      throw new Error("Invalid email action type");
  }

  const responseHeaders = new Headers();
  responseHeaders.set("Content-Type", "application/json");

  return new Response(JSON.stringify({}), {
    status: 200,
    headers: responseHeaders,
  });
});
