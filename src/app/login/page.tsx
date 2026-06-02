import { LoginHeader } from "./_components/login-header";
import { LoginHero } from "./_components/login-hero";
import { LoginFooter } from "./_components/login-footer";

/**
 * Login page. Full-bleed background artwork (the clean Key Visual layer) with a
 * left-weighted dark gradient so the hero text stays legible over the artwork.
 */
export default function LoginPage() {
  return (
    <div
      className="relative flex min-h-screen flex-col overflow-hidden"
      style={{ backgroundColor: "#00101A" }}
    >
      {/* Full-viewport background artwork */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/login/bg.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
      />

      {/* Two cover layers from the design, stacked:
         1) "Rectangle 57" — horizontal: dark #00101A (left) → transparent (right)
         2) "Cover"       — vertical: transparent (top) → dark navy #001320 (bottom)
         Together they keep the left column + bottom legible while the top-right
         artwork stays vivid. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            "linear-gradient(to right, #00101A 0%, rgba(0,16,26,0.6) 30%, rgba(0,16,26,0) 75%)",
            "linear-gradient(to bottom, rgba(0,19,32,0) 13%, rgba(0,19,32,0.55) 60%, #001320 100%)",
          ].join(", "),
        }}
      />

      {/* Page content */}
      <LoginHeader />
      <LoginHero />
      <LoginFooter />
    </div>
  );
}
