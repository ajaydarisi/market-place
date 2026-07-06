import { createAdminClient } from "@/lib/supabase/admin";
import type { Notification } from "@shared/schema";

// Transactional email via Resend (B3). Fail-open: if the provider isn't
// configured, or a send fails, we log and move on — in-app notifications are
// still the source of truth. Configure with RESEND_API_KEY + EMAIL_FROM, and
// NEXT_PUBLIC_APP_URL so links resolve.
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

export function emailEnabled(): boolean {
  return Boolean(RESEND_API_KEY && EMAIL_FROM);
}

const SUBJECT_BY_TYPE: Record<Notification["type"], string> = {
  proposal_received: "You received a new proposal",
  proposal_accepted: "Your proposal was accepted",
  proposal_rejected: "Update on your proposal",
  proposal_withdrawn: "A proposal was withdrawn",
  completion_requested: "Work marked ready for sign-off",
  project_completed: "A project was marked complete",
  project_cancelled: "A project was cancelled",
  message_received: "You have a new message",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: EMAIL_FROM, to, subject, html }),
  });
  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${await res.text()}`);
  }
}

// ponytail: sends inline in the request path. Fine at current volume; move to
// a queue (Vercel Queues) if notification bursts add noticeable latency.
export async function sendNotificationEmail(
  notification: Pick<Notification, "userId" | "type" | "projectId" | "content">,
): Promise<void> {
  if (!emailEnabled()) return;
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("users")
      .select("email")
      .eq("id", notification.userId)
      .single();

    const to = data?.email;
    if (!to) return;

    // notification.content is user-controlled (project titles, message text), so
    // escape it before interpolating into HTML to prevent injection/phishing.
    const link = APP_URL ? `${APP_URL}/projects/${notification.projectId}` : "";
    const html = [
      `<p>${escapeHtml(notification.content)}</p>`,
      link ? `<p><a href="${escapeHtml(link)}">View on SkillPilot</a></p>` : "",
    ].join("");

    await sendEmail(to, SUBJECT_BY_TYPE[notification.type], html);
  } catch (error) {
    console.error("Failed to send notification email:", error);
  }
}
