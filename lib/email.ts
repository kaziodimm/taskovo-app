type TaskovoEmail = {
  to: string[];
  subject: string;
  heading: string;
  body: string[];
  ctaHref?: string;
  ctaLabel?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function appUrl(path: string) {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  const baseUrl = envUrl ? (envUrl.startsWith("http") ? envUrl : `https://${envUrl}`) : "https://taskovo.cz";
  return new URL(path, baseUrl).toString();
}

export function extractEmail(value?: string | null) {
  if (!value) return null;
  const direct = value.trim().toLowerCase();
  if (emailPattern.test(direct)) return direct;
  const match = direct.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
  return match?.[0]?.toLowerCase() || null;
}

function uniqueEmails(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map((value) => extractEmail(value)).filter(Boolean))) as string[];
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderEmail({ heading, body, ctaHref, ctaLabel }: Omit<TaskovoEmail, "to" | "subject">) {
  const paragraphs = body.map((line) => `<p style="margin:0 0 14px;color:#415a77;font-size:15px;line-height:1.6;">${escapeHtml(line)}</p>`).join("");
  const cta = ctaHref && ctaLabel
    ? `<a href="${escapeHtml(ctaHref)}" style="display:inline-block;margin-top:10px;padding:12px 18px;border-radius:8px;background:#ff6b35;color:#ffffff;font-weight:800;text-decoration:none;">${escapeHtml(ctaLabel)}</a>`
    : "";

  return `<!doctype html>
<html lang="cs">
  <body style="margin:0;background:#f7f9fb;font-family:Arial,sans-serif;color:#0d1b2a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f9fb;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #dbe3ec;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:22px 24px;background:#0d1b2a;color:#ffffff;">
                <strong style="font-size:22px;letter-spacing:.2px;">Taskovo</strong>
                <div style="margin-top:4px;color:#f5c542;font-size:13px;font-weight:700;">Pomoc. Rychle. Spolehlivě.</div>
              </td>
            </tr>
            <tr>
              <td style="padding:26px 24px;">
                <h1 style="margin:0 0 16px;color:#0d1b2a;font-size:24px;line-height:1.25;">${escapeHtml(heading)}</h1>
                ${paragraphs}
                ${cta}
                <hr style="margin:26px 0;border:0;border-top:1px solid #dbe3ec;" />
                <p style="margin:0;color:#6d859e;font-size:13px;line-height:1.55;">Taskovo je zprostředkovatelská platforma. Tasker je nezávislý OSVČ nebo firma a klient si taskera vybírá samostatně.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendTaskovoEmail(email: TaskovoEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  const recipients = uniqueEmails(email.to);
  if (!apiKey || recipients.length === 0) return { skipped: true };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || "Taskovo <info@taskovo.cz>",
      to: recipients,
      subject: email.subject,
      html: renderEmail(email),
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    console.error("Resend email failed", response.status, message);
    return { skipped: false, error: message };
  }

  return { skipped: false };
}
