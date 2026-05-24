import Link from "next/link";
import type { ReactNode } from "react";

type AuthFrameProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthFrame({ title, subtitle, children }: AuthFrameProps) {
  return (
    <div className="auth-layout">
      <section className="auth-hero">
        <p className="eyebrow">AI Foundry as a Service</p>
        <h1>{title}</h1>
        <p className="hero-copy">{subtitle}</p>
        <div className="auth-badges">
          <span className="status-pill success">Multi-tenant</span>
          <span className="status-pill pending">RBAC ready</span>
          <span className="status-pill neutral">Entra-friendly</span>
        </div>
      </section>
      <section className="surface-card auth-card">
        {children}
        <div className="auth-links">
          <Link href="/login">Sign in</Link>
          <Link href="/signup">Sign up</Link>
          <Link href="/forgot-password">Forgot password</Link>
          <Link href="/profile">Profile</Link>
        </div>
      </section>
    </div>
  );
}