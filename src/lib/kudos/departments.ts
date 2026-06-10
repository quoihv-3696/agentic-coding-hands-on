/**
 * Canonical departments (divisions) for the Live Board "Phòng ban" filter.
 * A FIXED set (not user-authored) — mirrors the constant shape of `hashtags.ts`.
 *
 * This is DISTINCT from `profiles.dept_code` (e.g. "CEVC10"), which is the finer
 * team code shown on cards. The filter operates on `profiles.department`, which
 * holds one of these values. Keep this list in sync with the DB check constraint
 * in the `*_add_profile_department.sql` migration.
 */
export const DEPARTMENTS = [
  "CEVC1",
  "CEVC2",
  "CEVC3",
  "CEVC4",
  "OPD",
  "Infra",
] as const;

export type Department = (typeof DEPARTMENTS)[number];
