"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { ExternalLink, Filter } from "lucide-react";

type Journal = {
    id: string;
    name: string;
    abbreviation: string;
    issn: string;
    website: string;
    publisher: string;
    publisherIcon?: string;
    categories: string[];
    coverImage?: string;
    scimagoSid?: string;
    scimagoHtml?: string;
};

type Review = {
    journalId: string;
    reviewsSince: number;
    reviewCount: number;
};

type JournalsData = { journals: Journal[] };
type ReviewsData = { reviews: Review[] };

type CardItem = Journal & Review;

export default function ReviewerPage() {
    const [journalsData, setJournalsData] = useState<JournalsData | null>(null);
    const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null);

    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [selectedPublisher, setSelectedPublisher] = useState<string>("All");

    useEffect(() => {
        fetch("/data/journals.json")
            .then((res) => res.json())
            .then((data) => setJournalsData(data));

        fetch("/data/reviews.json")
            .then((res) => res.json())
            .then((data) => setReviewsData(data));
    }, []);

    const items: CardItem[] = useMemo(() => {
        if (!journalsData || !reviewsData) return [];

        const journalById = new Map<string, Journal>(
            journalsData.journals.map((j) => [j.id, j]),
        );

        const joined: CardItem[] = reviewsData.reviews
            .map((r) => {
                const j = journalById.get(r.journalId);
                if (!j) return null;
                return { ...j, ...r };
            })
            .filter(Boolean) as CardItem[];

        return joined;
    }, [journalsData, reviewsData]);

    // ✅ categorías únicas
    const categories = useMemo(() => {
        const cats = Array.from(
            new Set(items.flatMap((j) => j.categories ?? [])),
        );
        cats.sort((a, b) => a.localeCompare(b));
        return ["All", ...cats];
    }, [items]);

    // ✅ publishers únicos
    const publishers = useMemo(() => {
        const pubs = Array.from(
            new Set(items.map((j) => j.publisher).filter(Boolean)),
        );
        pubs.sort((a, b) => a.localeCompare(b));
        return ["All", ...pubs];
    }, [items]);

    const filteredItems = useMemo(() => {
        return items.filter((j) => {
            const passCategory =
                selectedCategory === "All" ||
                (j.categories ?? []).includes(selectedCategory);

            const passPublisher =
                selectedPublisher === "All" ||
                j.publisher === selectedPublisher;

            return passCategory && passPublisher;
        });
    }, [items, selectedCategory, selectedPublisher]);

    if (!journalsData || !reviewsData) return null;

    return (
        <main className="min-h-screen bg-background">
            <PageHeader
                title="Peer Review"
                description="Journals where I serve as academic reviewer"
            />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Filters (responsive) */}
                <div className="mb-8 rounded-lg border border-border p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <Filter size={16} className="text-muted-foreground" />
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                            Filters
                        </p>
                        {/* Count */}
                        <p className="text-xs text-muted-foreground">
                            Showing{" "}
                            <span className="font-semibold text-foreground">
                                {filteredItems.length}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-foreground">
                                {items.length}
                            </span>
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                        {/* Category dropdown */}
                        <div className="w-full sm:w-64">
                            <label className="block text-xs font-medium text-muted-foreground mb-1">
                                Category
                            </label>
                            <select
                                value={selectedCategory}
                                onChange={(e) =>
                                    setSelectedCategory(e.target.value)
                                }
                                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
                            >
                                {categories.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Publisher dropdown */}
                        <div className="w-full sm:w-64">
                            <label className="block text-xs font-medium text-muted-foreground mb-1">
                                Publisher
                            </label>
                            <select
                                value={selectedPublisher}
                                onChange={(e) =>
                                    setSelectedPublisher(e.target.value)
                                }
                                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
                            >
                                {publishers.map((p) => (
                                    <option key={p} value={p}>
                                        {p}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Journals Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-fr">
                    {filteredItems.length > 0 ? (
                        filteredItems.map((journal) => (
                            <div
                                key={journal.id}
                                className="border border-border rounded-lg p-4 hover:bg-secondary/40 transition-colors flex flex-col"
                            >
                                <div className="space-y-3">
                                    {/* Header row with cover */}
                                    <div className="flex gap-3">
                                        {/* Cover */}
                                        <div className="w-[72px] h-24 rounded-md overflow-hidden border border-border bg-secondary/40 flex-shrink-0 flex items-center justify-center">
                                            {journal.coverImage ? (
                                                <img
                                                    src={journal.coverImage}
                                                    alt={`${journal.name} cover`}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <span className="text-[10px] font-semibold text-muted-foreground text-center px-1 leading-tight">
                                                    {journal.abbreviation}
                                                </span>
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-base font-bold leading-snug line-clamp-2">
                                                {journal.name}
                                            </h3>

                                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                <span
                                                    className="inline-flex items-center gap-1.5 max-w-full px-2.5 py-1 border border-border rounded-full text-[11px] text-muted-foreground"
                                                    title={journal.publisher}
                                                >
                                                    <span className="truncate">
                                                        {journal.publisher}
                                                    </span>
                                                </span>
                                                <span className="truncate">
                                                    ISSN {journal.issn}
                                                </span>
                                            </div>

                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                {(journal.categories ?? []).map(
                                                    (cat) => (
                                                        <span
                                                            key={`${journal.id}-${cat}`}
                                                            className="inline-flex items-center px-2.5 py-1 bg-secondary rounded-full text-[11px] font-medium"
                                                        >
                                                            {cat}
                                                        </span>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Review metrics */}
                                    <div className="grid grid-cols-2 gap-3 rounded-md border border-border bg-secondary/30 p-3">
                                        <div>
                                            <p className="text-[11px] font-semibold text-muted-foreground">
                                                Reviewer Since
                                            </p>
                                            <p className="text-sm font-bold tabular-nums">
                                                {journal.reviewsSince}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-semibold text-muted-foreground">
                                                Reviews Completed
                                            </p>
                                            <p className="text-sm font-bold tabular-nums">
                                                {journal.reviewCount}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <a
                                    href={journal.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-auto pt-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                                >
                                    Visit Journal <ExternalLink size={14} />
                                </a>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <p className="text-muted-foreground">
                                No journals found
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
