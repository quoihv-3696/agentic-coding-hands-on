import Image from "next/image";
import { LanguageSwitcher } from "./language-switcher";

export function LoginHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-20 flex h-20 items-center justify-between bg-[rgba(11,15,18,0.8)] px-8 sm:px-12 md:px-16 lg:px-24">
      {/* Logo */}
      <div className="flex items-center">
        <Image
          src="/saa-logo.svg"
          alt="Sun* Annual Awards 2025"
          width={64}
          height={56}
          priority
          className="h-14 w-auto"
        />
      </div>

      {/* Functional VN/EN language switcher */}
      <LanguageSwitcher />
    </header>
  );
}
