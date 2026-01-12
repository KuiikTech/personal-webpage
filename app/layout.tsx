import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Efrain Rodriguez | Webpage",
    description: "Lecturer & Researcher in Mechatronics",
    icons: {
        icon: [{ url: "/favicon.ico" }],
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const year = new Date().getFullYear();

    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
              try {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('blue');
              } catch (e) {}
            `,
                    }}
                />
            </head>

            <body className={`${inter.className} min-h-screen flex flex-col`}>
                {/* Content */}
                <main className="flex-1">{children}</main>

                {/* Global footer (always at bottom, never overlaps) */}
                <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
                    <p>Efraín Rodríguez © {year}. All rights reserved.</p>
                </footer>
            </body>
        </html>
    );
}
