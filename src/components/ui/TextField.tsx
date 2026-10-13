"use client";

import { useState, type ReactNode } from "react";
import { EyeIcon, EyeOffIcon } from "./icons";

type TextFieldProps = {
  id: string;
  label: string;
  icon: ReactNode;
  type?: "text" | "email" | "password";
  placeholder?: string;
  autoComplete?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function TextField({
  id,
  label,
  icon,
  type = "text",
  placeholder,
  autoComplete,
  value,
  onChange,
  error,
}: TextFieldProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && visible ? "text" : type;

  return (
    <div className="mb-6">
      <label htmlFor={id} className="mb-3 block text-[15px] text-snow/90">
        {label}
      </label>
      <div
        className={`flex min-h-[62px] items-center gap-3.5 rounded-2xl border bg-[#0b0b0e] px-4 focus-within:border-volt focus-within:ring-2 focus-within:ring-volt/20 ${
          error ? "border-danger" : "border-line"
        }`}
      >
        <span className="h-[22px] w-[22px] shrink-0 text-mute">{icon}</span>
        <input
          id={id}
          name={id}
          type={inputType}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="w-full min-w-0 bg-transparent py-4 text-[15px] text-snow outline-none placeholder:text-mute/60"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="p-1.5 text-mute"
          >
            {visible ? (
              <EyeIcon className="h-[22px] w-[22px]" />
            ) : (
              <EyeOffIcon className="h-[22px] w-[22px]" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
