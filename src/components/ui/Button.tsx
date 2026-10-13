import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "outline";

const base =
    "flex min-h-[58px] items-center justify-center rounded-full px-8 text-[17px] font-bold transition active:scale-[0.98] disabled:opacity-60";

const variants: Record<Variant, string> = {
    primary: "bg-volt text-ink",
    outline: "border border-line bg-[#111114] text-snow",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
    return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

type ButtonLinkProps = {
    href: string;
    children: ReactNode;
    variant?: Variant;
    className?: string;
};

export function ButtonLink({
    href,
    children,
    variant = "primary",
    className = "",
}: ButtonLinkProps) {
    return (
        <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
            {children}
        </Link>
    );
}
