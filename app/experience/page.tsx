"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Briefcase, Calendar, Building2, Tag } from "lucide-react";

type ExperienceItem = {
    id: string;
    company: string;
    role: string;
    start: string; // "YYYY-MM" or "YYYY-MM-DD"
    end?: string; // "YYYY-MM" or "YYYY-MM-DD" or "Present"
    location?: string;
    description?: string;
    technologies?: string[];
};

function formatMonthYear(isoLike: string) {
    if (!isoLike) return "";
    const lower = isoLike.toLowerCase();
    if (lower === "present") return "Present";

    const parts = isoLike.split("-");
    const year = parts[0];
    if (!year) return isoLike;

    if (parts.length < 2) return year;

    const monthNum = parseInt(parts[1], 10);
    const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];
    const month = monthNames[(monthNum || 1) - 1] ?? "";
    return `${month} ${year}`;
}

export default function ExperiencePage() {
    const [items, setItems] = useState<ExperienceItem[]>([]);

    useEffect(() => {
        fetch("/data/experience.json")
            .then((res) => res.json())
            .then((data) => setItems(data));
    }, []);

    const sorted = useMemo(() => {
        // Sort desc by start date (works for YYYY-MM(-DD) strings)
        return [...items].sort((a, b) =>
            (b.start || "").localeCompare(a.start || ""),
        );
    }, [items]);

    if (sorted.length === 0) return null;

    return (
        <div className="min-h-screen flex flex-col">
            <PageHeader
                title="Experience"
                description="Academic, research, and professional roles"
            />

            <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
                <div className="space-y-8">
                    {sorted.map((exp) => (
                        <div
                            key={exp.id}
                            className="rounded-lg border border-border p-4 sm:p-5"
                        >
                            <div className="space-y-3">
                                {/* Header */}
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                    <div className="space-y-1">
                                        <div className="flex items-start gap-2">
                                            <Briefcase
                                                size={18}
                                                className="mt-0.5 text-muted-foreground flex-shrink-0"
                                            />
                                            <div>
                                                <h3 className="text-lg sm:text-xl font-bold leading-snug">
                                                    {exp.role}
                                                </h3>
                                                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Building2
                                                        size={16}
                                                        className="flex-shrink-0"
                                                    />
                                                    <span className="leading-snug">
                                                        {exp.company}
                                                    </span>
                                                    {exp.location ? (
                                                        <>
                                                            <span aria-hidden>
                                                                •
                                                            </span>
                                                            <span className="leading-snug">
                                                                {exp.location}
                                                            </span>
                                                        </>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dates */}
                                    <span className="inline-flex px-3 py-1 bg-secondary rounded-full text-sm font-medium w-fit tabular-nums">
                                        {formatMonthYear(exp.start)} —{" "}
                                        {exp.end
                                            ? formatMonthYear(exp.end)
                                            : "Present"}
                                    </span>
                                </div>

                                {/* Description */}
                                {exp.description && (
                                    <p className="text-sm leading-relaxed text-foreground/90">
                                        {exp.description}
                                    </p>
                                )}

                                {/* Technologies */}
                                {exp.technologies &&
                                    exp.technologies.length > 0 && (
                                        <div className="pt-3 border-t border-border">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-2">
                                                <Tag
                                                    size={14}
                                                    className="flex-shrink-0"
                                                />
                                                <span>Technologies</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {exp.technologies.map(
                                                    (tech) => (
                                                        <span
                                                            key={`${exp.id}-${tech}`}
                                                            className="text-xs sm:text-sm bg-secondary px-2 py-1 rounded"
                                                        >
                                                            {tech}
                                                        </span>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
