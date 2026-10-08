import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "sonner";

import AuthProvider from "@/components/providers/AuthProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";

export const metadata: Metadata = {
    title: "StressCare",
    description: "Stress Assessment System",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="th">
            <body>
                <AuthProvider>
                    <ThemeProvider>
                        {children}
                    </ThemeProvider>
                </AuthProvider>

                <Toaster
                    position="top-right"
                    duration={4000}
                />
            </body>
        </html>
    );
}