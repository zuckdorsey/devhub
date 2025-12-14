import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevHub - Developer Dashboard",
  description: "Personal developer project management hub",
};

import { getProjects } from "@/lib/projects";
import { auth } from "@/auth";
import { getSetting } from "@/lib/settings";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const projects = await getProjects();
  const recentProjects = projects.slice(0, 5).map(p => ({ id: p.id, name: p.name }));

  const session = await auth();
  const userName = await getSetting("user_name") || session?.user?.name || "Admin";
  const userAvatar = await getSetting("user_avatar") || session?.user?.image || "";
  const userEmail = session?.user?.email || "admin@example.com";

  const user = {
    name: userName,
    email: userEmail,
    avatar: userAvatar,
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <LayoutWrapper projects={recentProjects} user={user}>
            {children}
          </LayoutWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
