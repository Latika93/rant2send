import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Professional Message Translator",
  description: "Convert emotionally written workplace messages into professional corporate communication.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
