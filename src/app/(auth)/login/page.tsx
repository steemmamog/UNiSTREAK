import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Log In | UNiSTREAK" };

export default function LoginPage() {
  return (
    <>
      <h1 className="text-center text-[38px] font-extrabold leading-tight tracking-tight">
        Log In
      </h1>
      <p className="mb-10 mt-3 text-center text-[17px] text-mute">
        to continue to UNiSTREAK
      </p>
      <LoginForm />
      <p className="mt-auto pt-10 text-center text-[15px] text-mute">
        New To UNiSTREAK?{" "}
        <Link href="/signup" className="ml-1 font-bold text-volt hover:underline">
          Sign Up
        </Link>
      </p>
    </>
  );
}