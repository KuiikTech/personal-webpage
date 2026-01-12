"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
    title: string;
    description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
    return (
        <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-4">
                <Link
                    href="/"
                    className="p-2 hover:bg-secondary rounded-lg transition-smooth flex-shrink-0"
                    title="Back to home"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight truncate">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-sm text-muted-foreground mt-1">
                            {description}
                        </p>
                    )}
                </div>
            </div>
        </header>
    );
}
