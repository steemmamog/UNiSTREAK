import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";

export default function WelcomePage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-[560px] flex-col px-6 pb-10 pt-10">
      <div className="flex flex-1 items-center justify-center">
        <Logo size="lg" />
      </div>
      <div className="mx-auto grid w-full max-w-[430px] grid-cols-2 gap-3.5">
        <ButtonLink href="/login" variant="outline">
          Log In
        </ButtonLink>
        <ButtonLink href="/signup">Sign Up</ButtonLink>
      </div>
    </main>
  );
}