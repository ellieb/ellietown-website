import type { Metadata } from "next";
import "../index.css";

export const metadata: Metadata = {
  title: "~ellietown~",
  description: "A personal website for Ellie",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Jacquard+12&family=Pirata+One&family=Pixelify+Sans&family=UnifrakturCook:wght@700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body id="root">{children}</body>
    </html>
  );
}
