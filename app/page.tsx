"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SocialLinks } from "@/components/SocialLinks";
import {
    BookOpen,
    FileText,
    Microscope,
    Award,
    PlayCircle,
    BarChart3,
    Medal,
    Briefcase,
} from "lucide-react";

const navItems = [
    {
        label: "Education",
        icon: Award,
        href: "/education",
    },
    {
        label: "Publications",
        icon: FileText,
        href: "/publications",
    },
    {
        label: "Reviewer",
        icon: BarChart3,
        href: "/reviewer",
    },
    {
        label: "Experience",
        icon: Briefcase,
        href: "/experience",
    },
    {
        label: "Distinctions",
        icon: Medal,
        href: "/awards",
    },
    {
        label: "Courses",
        icon: BookOpen,
        href: "/courses",
    },
    {
        label: "Tutorials",
        icon: PlayCircle,
        href: "/tutorials",
    },
    {
        label: "Projects",
        icon: Microscope,
        href: "/projects",
    },
];

type SocialLink = {
    name: string;
    url: string;
    icon: string;
    display: "home" | "footer" | "both";
};

type Profile = {
    name: string;
    title: string;
    tagline: string;
    bio: string;
    email: string;
    socialLinks: SocialLink[];
};

export default function Home() {
    const [profile, setProfile] = useState<Profile | null>(null);

    useEffect(() => {
        fetch("/data/profile.json")
            .then((res) => res.json())
            .then((data) => setProfile(data));
    }, []);

    if (!profile) {
        return null;
    }

    return (
        <div className="flex flex-col items-center px-4 py-12">
            {/* Main Hero Content */}
            <div className="w-full max-w-4xl space-y-12 text-center">
                {/* Header */}
                <div className="space-y-4">
                    {/* Profile photo */}
                    <div className="flex justify-center">
                        <div className="w-48 h-48 rounded-full overflow-hidden">
                            <img
                                src="/images/efrain.png"
                                alt={`${profile.name} profile photo`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                        {profile.name}
                    </h1>

                    <p className="text-xl text-muted-foreground">
                        {profile.title}
                    </p>

                    <p className="text-base text-muted-foreground max-w-xl mx-auto">
                        {profile.bio}
                    </p>
                </div>

                {/* Navigation Buttons */}
                <div className="space-y-8">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                            Explore
                        </p>

                        <div className="grid grid-cols-4 sm:grid-cols-4 gap-3">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-secondary hover:border-foreground transition-smooth group"
                                    >
                                        <Icon
                                            size={24}
                                            className="text-foreground group-hover:scale-110 transition-transform"
                                        />
                                        <span className="text-xs font-medium text-center">
                                            {item.label}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="space-y-4">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                            Connect
                        </p>
                        <SocialLinks links={profile.socialLinks} />
                    </div>
                </div>
            </div>
        </div>
    );
}
