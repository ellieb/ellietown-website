"use client";

import dynamic from "next/dynamic";

const Home = dynamic(() => import("pages/Home"), { ssr: false });

export function ClientOnly() {
  return <Home />;
}
