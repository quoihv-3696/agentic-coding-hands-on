import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth callback. Exchanges the authorization code for a session (sets cookies),
 * then — because login runs in a popup — notifies the opener and closes itself.
 * Falls back to a normal redirect when there is no opener (direct navigation).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const oauthError = searchParams.get("error");

  let status: "success" | "error" = "error";

  if (code && !oauthError) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) status = "success";
    } catch {
      // Network error / Supabase down — status stays "error" so the popup
      // still posts a message back to the opener instead of hanging open.
    }
  }

  // `origin` comes from the request Host header. Behind a reverse proxy ensure
  // X-Forwarded-Host is trusted so the popup's postMessage targetOrigin is correct.
  const fallbackPath = status === "success" ? "/" : "/login";
  const html = `<!doctype html>
<html>
  <head><meta charset="utf-8" /><title>Signing in…</title></head>
  <body>
    <script>
      (function () {
        var message = ${JSON.stringify(`saa-auth:${status}`)};
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(message, ${JSON.stringify(origin)});
          window.close();
        } else {
          window.location.replace(${JSON.stringify(fallbackPath)});
        }
      })();
    </script>
  </body>
</html>`;

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
