"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { LockIcon, UserIcon } from "@/components/ui/icons";

type Errors = { identity?: string; password?: string };

export function LoginForm() {
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formMessage, setFormMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormMessage("");

    const found: Errors = {};
    if (identity.trim() === "") found.identity = "Enter your username or email";
    if (password === "") found.password = "Enter your password";
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // TODO: replace this with a real fetch to the login endpoint once the backend exists.
    setFormMessage("The server is not connected yet.");
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <TextField
        id="identity"
        label="Username or Email"
        icon={<UserIcon />}
        placeholder="Enter your username or email"
        autoComplete="username"
        value={identity}
        onChange={setIdentity}
        error={errors.identity}
      />
      <TextField
        id="password"
        label="Password"
        type="password"
        icon={<LockIcon />}
        placeholder="Enter your password"
        autoComplete="current-password"
        value={password}
        onChange={setPassword}
        error={errors.password}
      />
      <button
        type="button"
        className="-mt-3 block w-full text-right text-[15px] text-snow/90 hover:underline"
      >
        Forgot Password?
      </button>
      <Button type="submit" className="mx-auto mt-10 w-full max-w-[300px]">
        Log In
      </Button>
      {formMessage && (
        <p role="status" className="mt-4 text-center text-sm text-volt">
          {formMessage}
        </p>
      )}
    </form>
  );
}