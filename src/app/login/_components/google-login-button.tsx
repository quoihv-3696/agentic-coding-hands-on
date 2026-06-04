"use client";

import { GoogleIcon } from "@/components/icons";

export interface GoogleLoginButtonProps {
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
}

export function GoogleLoginButton({
  onClick,
  loading = false,
  disabled = false,
  label = "",
}: GoogleLoginButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="flex items-center gap-3 rounded-lg bg-[#EDE8C8] px-8 py-4 text-base font-bold tracking-wide text-[#1a1a1a] shadow-md transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg hover:brightness-105 active:translate-y-0 active:shadow-md disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EDE8C8]/60"
    >
      {loading ? (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#1a1a1a]/30 border-t-[#1a1a1a]" />
      ) : null}
      <span>{label}</span>
      {!loading ? <GoogleIcon className="h-5 w-5 shrink-0" /> : null}
    </button>
  );
}
