import Link from "next/link";
import { signOut } from "@/app/v2/actions";

const navigation = [
  {
    href: "/v2",
    label: "Command Center",
  },
  {
    href: "/v2/portfolio",
    label: "Portfolio",
  },
  {
    href: "/v2/opportunities",
    label: "Opportunities",
  },
  {
    href: "/v2/research",
    label: "Research",
  },
  {
    href: "/v2/risk",
    label: "Protection",
  },
  {
    href: "/v2/decisions",
    label: "Decisions",
  },
];

type PrivateShellProps = {
  children: React.ReactNode;
  userEmail: string;
};

export function InvestoPrivateShell({
  children,
  userEmail,
}: PrivateShellProps) {
  return (
    <div className="investo-private-shell">
      <aside className="investo-sidebar">
        <Link className="investo-sidebar-brand" href="/v2">
          <span className="investo-logo-mark">I</span>

          <span>
            <strong>Investo</strong>
            <small>Private Investment Office</small>
          </span>
        </Link>

        <nav aria-label="Investo navigation">
          {navigation.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="investo-sidebar-footer">
          <div>
            <span>Signed in</span>
            <strong>{userEmail}</strong>
          </div>

          <form action={signOut}>
            <button type="submit">Sign out</button>
          </form>
        </div>
      </aside>

      <div className="investo-private-workspace">
        <header className="investo-private-header">
          <div>
            <span>Investo V2</span>
            <strong>Human-approved investment intelligence</strong>
          </div>

          <div className="investo-system-status">
            <span />
            Private system
          </div>
        </header>

        <main className="investo-private-content">{children}</main>
      </div>
    </div>
  );
}
