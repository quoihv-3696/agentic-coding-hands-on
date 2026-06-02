"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleLoginButton } from "./google-login-button";
import { useTranslations } from "@/lib/i18n/i18n-context";
import { signInWithGoogle } from "@/lib/auth/sign-in-with-google";

export function LoginHero() {
  const { t } = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative z-10 flex flex-1 flex-col justify-center px-8 pb-20 pt-28 sm:px-12 md:px-16 lg:px-24">
      {/* ROOT FURTHER wordmark (brand image asset from the design) */}
      <Image
        src="/login/logo.png"
        alt="ROOT FURTHER"
        width={451}
        height={200}
        priority
        className="mb-10 h-auto w-[clamp(16rem,38vw,28.1875rem)]"
      />

      {/* Welcome text */}
      <div className="mb-8 space-y-1">
        <p className="text-base font-semibold text-white sm:text-lg">
          {t("login.welcomeLine1")}
        </p>
        <p className="text-base font-semibold text-white sm:text-lg">
          {t("login.welcomeLine2")}
        </p>
      </div>

      {/* Google OAuth login */}
      <div>
        <GoogleLoginButton
          onClick={handleLogin}
          loading={loading}
          label={t("login.button")}
        />
        {error ? (
          <p className="mt-3 text-sm font-medium text-red-300" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </main>
  );
}
