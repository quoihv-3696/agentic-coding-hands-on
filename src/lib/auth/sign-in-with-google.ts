import { createClient } from "@/lib/supabase/client";

const POPUP_MESSAGE_PREFIX = "saa-auth:";

/** Stable error codes thrown by signInWithGoogle — map to `login.errors.<code>` i18n keys. */
export const SIGN_IN_ERROR_CODES = [
  "startFailed",
  "popupBlocked",
  "failed",
  "cancelled",
] as const;

/**
 * Starts Google OAuth in a popup window (per spec: "new tab or popup").
 * Resolves when the /auth/callback route posts a success message and the
 * session cookie is set; rejects on error or if the user closes the popup.
 */
export async function signInWithGoogle(): Promise<void> {
  const supabase = createClient();
  const redirectTo = `${window.location.origin}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { skipBrowserRedirect: true, redirectTo },
  });

  if (error || !data?.url) {
    console.error("Google OAuth start failed", error);
    throw new Error("startFailed");
  }

  const popup = window.open(
    data.url,
    "saa-google-login",
    "width=500,height=650,menubar=no,toolbar=no,location=no,status=no",
  );

  if (!popup) {
    throw new Error("popupBlocked");
  }

  return new Promise<void>((resolve, reject) => {
    let settled = false;

    const cleanup = () => {
      settled = true;
      window.removeEventListener("message", onMessage);
      clearInterval(closedTimer);
    };

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (
        typeof event.data !== "string" ||
        !event.data.startsWith(POPUP_MESSAGE_PREFIX)
      ) {
        return;
      }
      cleanup();
      if (event.data === `${POPUP_MESSAGE_PREFIX}success`) {
        resolve();
      } else {
        reject(new Error("failed"));
      }
    };

    window.addEventListener("message", onMessage);

    // Reject if the popup is closed before authentication completes.
    const closedTimer = setInterval(() => {
      if (popup.closed && !settled) {
        cleanup();
        reject(new Error("cancelled"));
      }
    }, 500);
  });
}
