import type { Metadata } from "next";
import "./investo.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: {
    default: "Investo",
    template: "%s | Investo",
  },
  description: "Private investment intelligence and capital allocation system.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function InvestoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
