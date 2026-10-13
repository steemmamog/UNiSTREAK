import Link from "next/link";
import { SignupForm } from "./SignupForm";

export const metadata = { title: "Sign Up | UNiSTREAK" };

export default function SignupPage() {
  return (
    <>
      <h1 className="text-center text-[38px] font-extrabold leading-tight tracking-tight">
        Sign Up
      </h1>
      <p className="mb-10 mt-3 text-center text-[17px] text-mute">
        to start your streak
      </p>
      <SignupForm />
      <p className="mt-auto pt-10 text-center text-[15px] text-mute">
        Already have an account?{" "}
        <Link href="/login" className="ml-1 font-bold text-volt hover:underline">
          Log In
        </Link>
      </p>
    </>
  );
}