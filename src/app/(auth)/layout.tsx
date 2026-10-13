import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-[460px] flex-col px-6 pb-8 pt-10">
      <div className="mb-10 mt-4 flex justify-center">
        <Logo />
      </div>
      {children}
    </main>
  );
}