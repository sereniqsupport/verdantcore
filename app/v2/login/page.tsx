import type { Metadata } from "next";
import { signIn } from "./actions";

export const metadata: Metadata = {
  title: "Investo Sign In",
  robots: {
    index: false,
    follow: false,
  },
};

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
    configuration?: string;
  }>;
};

export default async function InvestoLoginPage({
  searchParams,
}: LoginPageProps) {
  const params = await searchParams;

  const configurationMissing = params.configuration === "missing";

  return (
    <main className="investo-login-page">
      <section className="investo-login-card">
        <div className="investo-login-brand">
          <span className="investo-logo-mark">I</span>

          <div>
            <strong>Investo</strong>
            <span>Private Capital Allocation System</span>
          </div>
        </div>

        <div className="investo-login-intro">
          <p className="investo-eyebrow">Private Access</p>
          <h1>Investment decisions without market noise.</h1>
          <p>
            Sign in to review your portfolio, prepared research, capital
            protection, and investment decisions.
          </p>
        </div>

        {configurationMissing ? (
          <div className="investo-login-warning">
            Supabase authentication has not been configured yet. Add the
            required values to <code>.env.local</code>, then restart the
            development server.
          </div>
        ) : null}

        {params.error ? (
          <div className="investo-login-error" role="alert">
            {params.error}
          </div>
        ) : null}

        <form action={signIn} className="investo-login-form">
          <input
            name="next"
            type="hidden"
            value={params.next ?? "/v2"}
          />

          <label>
            <span>Email address</span>
            <input
              autoComplete="email"
              name="email"
              placeholder="you@example.com"
              required
              type="email"
            />
          </label>

          <label>
            <span>Password</span>
            <input
              autoComplete="current-password"
              minLength={8}
              name="password"
              required
              type="password"
            />
          </label>

          <button disabled={configurationMissing} type="submit">
            Enter Investo
          </button>
        </form>

        <p className="investo-login-footnote">
          Access is restricted. No public registration is available.
        </p>
      </section>
    </main>
  );
}
