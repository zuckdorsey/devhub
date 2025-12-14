"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";

interface LayoutWrapperProps {
    children: React.ReactNode;
    projects: { id: string; name: string }[];
    user: {
        name: string;
        email: string;
        avatar: string;
    };
}

export function LayoutWrapper({ children, projects, user }: LayoutWrapperProps) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";

    if (isLoginPage) {
        return (
            <>
                <main className="min-h-screen w-full">
                    {children}
                </main>
                <Toaster />
            </>
        );
    }

    return (
        <SidebarProvider>
            <AppSidebar projects={projects} user={user} />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <div className="flex flex-1 items-center justify-between">
                        <h1 className="text-lg font-semibold">Dashboard</h1>
                        <ThemeToggle />
                    </div>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min mt-4">
                        {children}
                    </div>
                </main>
            </SidebarInset>
            <Toaster />
        </SidebarProvider>
    );
}
