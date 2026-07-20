import type { Metadata } from "next";
import { signIn, signInWithGoogle } from "./actions";

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

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="investo-google-icon" viewBox="0 0 24 24">
      <path
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.97-.9 6.62-2.36l-3.24-2.54c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.39 13.93A6 6 0 0 1 6.07 12c0-.67.12-1.32.32-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.55l3.35-2.62Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.94c1.47 0 2.79.51 3.83 1.5l2.87-2.88A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default async function InvestoLoginPage({
  searchParams,
}: LoginPageProps) {
  const params = await searchParams;
  const nextPath = params.next ?? "/v2";
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

        <form action={signInWithGoogle} className="investo-google-login-form">
          <input name="next" type="hidden" value={nextPath} />

          <button
            className="investo-google-login-button"
            disabled={configurationMissing}
            type="submit"
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>
        </form>

        <div
          aria-label="Administrator sign in"
          className="investo-login-divider"
          role="separator"
        >
          <span>Administrator sign in</span>
        </div>

        <form action={signIn} className="investo-login-form">
          <input name="next" type="hidden" value={nextPath} />

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
          Access is limited to approved users. No public investment account
          registration is available.
        </p>
      </section>
    </main>
  );
}
