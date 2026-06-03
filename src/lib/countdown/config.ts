/** Prelaunch countdown configuration. */

/** Event launch datetime (Asia/Saigon, +07:00). The countdown counts down to this. */
export const COUNTDOWN_TARGET_ISO = "2026-06-04T15:00:00+07:00";

export const COUNTDOWN_TARGET_DATE = new Date(COUNTDOWN_TARGET_ISO);

/** Where visitors are sent once the countdown reaches zero. */
export const COUNTDOWN_REDIRECT_PATH = "/login";
