import type { Metadata } from "next";
import "./globals.css";
import "@fontsource-variable/nunito-sans"; // Variable font for better performance
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorSuppressor } from "@/components/ErrorSuppressor";
import { Toaster } from 'sonner';

// Nunito Sans is now loaded via Fontsource imports above

export const metadata: Metadata = {
  title: "New People - CV Builder and Portfolio Builder",
  description: "AI-powered CV builder and portfolio creation platform for professionals",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorSuppressor />
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
