import { ClerkProvider, SignedIn, SignedOut } from "@clerk/nextjs";
import "./globals.css";
import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Intellipage",
  description: "Think. Write. Sync. ✨",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="">
          <Navbar />
          <div className="flex min-h-screen">
            <main className="flex-1 overflow-y-auto scrollbar-hide">
              <SignedIn>{children}</SignedIn>
              <SignedOut>{children}</SignedOut>
            </main>
          </div>
          <Toaster position="top-center" />
        </body>
      </html>
    </ClerkProvider>
  );
}
