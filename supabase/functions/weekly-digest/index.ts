// WEEKLY DESK DIGEST (r277, task #26) — fired by pg_cron every Monday 13:00 UTC.
// Dormant until two secrets exist on the project:
//   DIGEST_CRON_SECRET — shared with the cron job (vault: digest_cron_secret)
//   RESEND_API_KEY     — from resend.com, once the hotkey.gg domain is verified
// Recipients come from digest_payloads() (desk members, real emails, not opted out).
import { createClient } from "npm:@supabase/supabase-js@2";

type Payload = {
  user_id: string; email: string; handle: string;
  desk_name: string; desk_slug: string; desk_rank: number; desk_count: number;
  quests: { challenge: string; target_ms: number | null; note: string | null; expires_at: string }[];
  my_runs_7d: number; desk_runs_7d: number;
};

const esc = (s: string) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

function render(p: Payload): string {
  const quests = (p.quests || []).map((q) =>
    `<li><b>${esc(q.challenge)}</b>${q.target_ms ? ` — under ${(q.target_ms / 1000).toFixed(0)}s` : ""}${q.note ? ` · <i>${esc(q.note)}</i>` : ""}</li>`).join("");
  return `
  <div style="font-family:ui-monospace,Menlo,monospace;max-width:560px;margin:0 auto;color:#1a1c1e">
    <p style="font-size:15px;font-weight:700">hotkey<span style="color:#2ea36f">.gg</span> — your desk this week</p>
    <p>Hey ${esc(p.handle)} — <b>${esc(p.desk_name)}</b> sits <b>#${p.desk_rank} of ${p.desk_count}</b> on the desk standings.
    The desk put up <b>${p.desk_runs_7d}</b> clean runs last week${p.my_runs_7d ? ` (<b>${p.my_runs_7d}</b> of them yours)` : " — none of them yours yet"}.</p>
    ${quests ? `<p><b>Live quests:</b></p><ul>${quests}</ul>` : "<p>No quests pinned this week — nudge your staffer.</p>"}
    <p><a href="https://www.hotkey.gg/desks.html" style="color:#2ea36f">Open the hall →</a></p>
    <p style="font-size:11px;color:#888">You get this because you're on a desk.
    <a href="https://www.hotkey.gg/index.html?digest=off" style="color:#888">Unsubscribe</a> ·
    <a href="https://www.hotkey.gg/contact.html" style="color:#888">contact</a></p>
  </div>`;
}

Deno.serve(async (req) => {
  const secret = Deno.env.get("DIGEST_CRON_SECRET") || "";
  if (!secret || req.headers.get("x-digest-secret") !== secret) {
    return new Response("forbidden", { status: 403 });
  }
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) {
    return new Response(JSON.stringify({ sent: 0, note: "RESEND_API_KEY not set — digest dormant" }),
      { status: 200, headers: { "content-type": "application/json" } });
  }
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data, error } = await sb.rpc("digest_payloads");
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  const rows = (data || []) as Payload[];
  let sent = 0, failed = 0;
  // Resend batch endpoint takes up to 100 messages per call
  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100).map((p) => ({
      from: "hotkey.gg <no-reply@hotkey.gg>",
      to: [p.email],
      subject: `${p.desk_name} is #${p.desk_rank} — your desk this week`,
      html: render(p),
    }));
    const res = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(batch),
    });
    if (res.ok) sent += batch.length; else failed += batch.length;
  }
  return new Response(JSON.stringify({ sent, failed, recipients: rows.length }),
    { status: 200, headers: { "content-type": "application/json" } });
});
