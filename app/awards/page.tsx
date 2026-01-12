"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Award, Calendar, MapPin, Building2, Tag, Filter } from "lucide-react";

type AwardItem = {
    id: string;
    title: string;
    organization: string;
    event?: string;
    location?: string;
    date: string; // "YYYY-MM" or "YYYY-MM-DD"
    type?: string; // e.g., "Recognition", "Scholarship", "1st Place"
    details?: string;
};

function formatDate(isoLike: string) {
    const parts = isoLike.split("-");
    const year = parts[0];
    if (parts.length === 1) return year;

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

function normalizeType(t?: string) {
    // keep it simple + stable for matching
    return (t ?? "Other").trim();
}

function TypeChip({
    active,
    label,
    count,
    onClick,
}: {
    active: boolean;
    label: string;
    count: number;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={[
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition-colors",
                active
                    ? "border-foreground/20 bg-secondary text-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-secondary/40",
            ].join(" ")}
        >
            <span className="font-medium">{label}</span>
            <span className="tabular-nums text-[11px] opacity-80">
                ({count})
            </span>
        </button>
    );
}

export default function AwardsPage() {
    const [awards, setAwards] = useState<AwardItem[]>([]);
    const [selectedType, setSelectedType] = useState<string>("all");

    useEffect(() => {
        fetch("/data/awards.json")
            .then((res) => res.json())
            .then((data) => setAwards(data));
    }, []);

    const sorted = useMemo(() => {
        return [...awards].sort((a, b) => b.date.localeCompare(a.date));
    }, [awards]);

    const availableTypes = useMemo(() => {
        const set = new Set<string>();
        for (const a of awards) set.add(normalizeType(a.type));
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [awards]);

    const countsByType = useMemo(() => {
        const counts: Record<string, number> = { all: awards.length };
        for (const t of availableTypes) counts[t] = 0;
        for (const a of awards) {
            const t = normalizeType(a.type);
            counts[t] = (counts[t] ?? 0) + 1;
        }
        return counts;
    }, [awards, availableTypes]);

    const filtered = useMemo(() => {
        if (selectedType === "all") return sorted;
        return sorted.filter((a) => normalizeType(a.type) === selectedType);
    }, [sorted, selectedType]);

    if (sorted.length === 0) return null;

    return (
        <div className="min-h-screen flex flex-col">
            <PageHeader
                title="Distinctions"
                description="Recognitions, distinctions, and scholarships"
            />

            <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
                {/* Filters (Type chips) */}
                <div className="mb-8 rounded-lg border border-border p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter size={16} className="text-muted-foreground" />
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                            Filters
                        </p>
                        <p className="ml-auto text-xs text-muted-foreground">
                            Showing{" "}
                            <span className="font-semibold text-foreground">
                                {filtered.length}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-foreground">
                                {sorted.length}
                            </span>
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-2">
                            Type
                        </label>

                        <div className="flex flex-wrap gap-2">
                            <TypeChip
                                active={selectedType === "all"}
                                label="All"
                                count={countsByType.all}
                                onClick={() => setSelectedType("all")}
                            />

                            {availableTypes.map((t) => (
                                <TypeChip
                                    key={t}
                                    active={selectedType === t}
                                    label={t}
                                    count={countsByType[t] ?? 0}
                                    onClick={() => setSelectedType(t)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="space-y-8">
                    {filtered.map((item) => (
                        <div key={item.id} className="relative pl-8 sm:pl-10">
                            {/* Vertical line */}
                            <div className="absolute left-2 sm:left-4 top-0 bottom-0 w-px bg-border" />

                            {/* Timeline dot */}
                            <div className="absolute left-2 sm:left-4 top-2 -translate-x-1/2 w-3.5 h-3.5 bg-foreground rounded-full ring-4 ring-background" />

                            {/* Card */}
                            <div className="rounded-lg border border-border p-4 sm:p-5">
                                <div className="space-y-3">
                                    {/* Header row */}
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                        <div className="flex items-start gap-2">
                                            <Award
                                                size={18}
                                                className="mt-0.5 text-muted-foreground flex-shrink-0"
                                            />
                                            <h3 className="text-lg sm:text-xl font-bold leading-snug">
                                                {item.title}
                                            </h3>
                                        </div>
                                    </div>

                                    <span className="inline-flex px-3 py-1 bg-secondary rounded-full text-sm font-medium w-fit tabular-nums">
                                        {formatDate(item.date)}
                                    </span>

                                    {/* Meta */}
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-start gap-2 text-muted-foreground">
                                            <Building2
                                                size={16}
                                                className="mt-0.5 flex-shrink-0"
                                            />
                                            <span className="leading-snug">
                                                {item.organization}
                                            </span>
                                        </div>

                                        {item.event && (
                                            <div className="flex items-start gap-2 text-muted-foreground">
                                                <Calendar
                                                    size={16}
                                                    className="mt-0.5 flex-shrink-0"
                                                />
                                                <span className="leading-snug">
                                                    {item.event}
                                                </span>
                                            </div>
                                        )}

                                        {item.location && (
                                            <div className="flex items-start gap-2 text-muted-foreground">
                                                <MapPin
                                                    size={16}
                                                    className="mt-0.5 flex-shrink-0"
                                                />
                                                <span className="leading-snug">
                                                    {item.location}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Type badge + optional details */}
                                    {(item.type || item.details) && (
                                        <div className="pt-3 border-t border-border space-y-2">
                                            {item.type && (
                                                <div className="flex items-center gap-2">
                                                    <Tag
                                                        size={16}
                                                        className="text-muted-foreground"
                                                    />
                                                    <span className="inline-flex px-2.5 py-1 rounded-full border border-border text-[11px] text-muted-foreground">
                                                        {item.type}
                                                    </span>
                                                </div>
                                            )}

                                            {item.details && (
                                                <p className="text-sm text-muted-foreground leading-relaxed">
                                                    {item.details}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
