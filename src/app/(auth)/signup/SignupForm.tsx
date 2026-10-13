"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { LockIcon, MailIcon, UserIcon } from "@/components/ui/icons";

type Errors = { username?: string; email?: string; password?: string };

export function SignupForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formMessage, setFormMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormMessage("");

    const found: Errors = {};
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username.trim())) {
      found.username = "3 to 20 characters: letters, numbers and underscores only";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      found.email = "Enter a valid email address";
    }
    if (password.length < 8) {
      found.password = "Use at least 8 characters";
    }
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // TODO: replace this with a real fetch to the sign up endpoint once the backend exists.
    setFormMessage("The server is not connected yet.");
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <TextField
        id="username"
        label="Username"
        icon={<UserIcon />}
        placeholder="Pick a username"
        autoComplete="username"
        value={username}
        onChange={setUsername}
        error={errors.username}
      />
      <TextField
        id="email"
        label="Email"
        type="email"
        icon={<MailIcon />}
        placeholder="Enter your email"
        autoComplete="email"
        value={email}
        onChange={setEmail}
        error={errors.email}
      />
      <TextField
        id="password"
        label="Password"
        type="password"
        icon={<LockIcon />}
        placeholder="Create a password"
        autoComplete="new-password"
        value={password}
        onChange={setPassword}
        error={errors.password}
      />
      <Button type="submit" className="mx-auto mt-6 w-full max-w-[300px]">
        Sign Up
      </Button>
      {formMessage && (
        <p role="status" className="mt-4 text-center text-sm text-volt">
          {formMessage}
        </p>
      )}
    </form>
  );
}
