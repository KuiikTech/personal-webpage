"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import {
    ExternalLink,
    Filter,
    Youtube,
    FileText,
    BookOpen,
    Github,
    Link as LinkIcon,
    Clock,
    Calendar,
    Tag,
} from "lucide-react";

type TutorialLinkType =
    | "youtube"
    | "notion"
    | "github"
    | "article"
    | "pdf"
    | "website"
    | "other";

type TutorialLink = {
    label: string;
    url: string;
    type?: TutorialLinkType;
};

type TutorialKind = "video" | "guide" | "article" | "repo" | string;

type Tutorial = {
    id: string;
    kind: TutorialKind;

    title: string;
    description?: string;

    date?: string; // "YYYY-MM" or "YYYY-MM-DD"
    year?: number;
    level?: "beginner" | "intermediate" | "advanced" | string;
    duration?: string;

    coverImage?: string;
    youtubeId?: string;

    tags?: string[];

    links: TutorialLink[];
};

type TutorialsData = { tutorials: Tutorial[] };

function formatDate(isoLike?: string, yearFallback?: number) {
    if (!isoLike && typeof yearFallback === "number")
        return String(yearFallback);
    if (!isoLike) return "";

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

function getYouTubeIdFromUrl(url: string) {
    try {
        const u = new URL(url);

        if (u.hostname.includes("youtu.be")) {
            const id = u.pathname.replace("/", "").trim();
            return id || null;
        }

        if (u.searchParams.has("v")) {
            const v = u.searchParams.get("v");
            return v ? v.trim() : null;
        }

        const parts = u.pathname.split("/").filter(Boolean);
        const shortsIndex = parts.indexOf("shorts");
        if (shortsIndex >= 0 && parts[shortsIndex + 1]) {
            return parts[shortsIndex + 1];
        }

        const embedIndex = parts.indexOf("embed");
        if (embedIndex >= 0 && parts[embedIndex + 1]) {
            return parts[embedIndex + 1];
        }

        return null;
    } catch {
        return null;
    }
}

function getYouTubeThumbnail(videoId: string) {
    return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

function linkIcon(type?: TutorialLinkType) {
    switch (type) {
        case "youtube":
            return <Youtube size={14} />;
        case "github":
            return <Github size={14} />;
        case "notion":
            return <BookOpen size={14} />;
        case "pdf":
            return <FileText size={14} />;
        case "article":
            return <FileText size={14} />;
        case "website":
            return <LinkIcon size={14} />;
        default:
            return <ExternalLink size={14} />;
    }
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

function kindLabel(kind: string) {
    const k = (kind || "").toLowerCase();
    if (k === "video") return "Video";
    if (k === "guide") return "Guide";
    if (k === "article") return "Article";
    if (k === "repo") return "Repository";
    return kind ? kind[0].toUpperCase() + kind.slice(1) : "Tutorial";
}

function kindBadgeColorClass(kind: string) {
    const k = (kind || "").toLowerCase();
    if (k === "video") return "bg-secondary";
    if (k === "guide") return "bg-secondary";
    if (k === "article") return "bg-secondary";
    if (k === "repo") return "bg-secondary";
    return "bg-secondary";
}

function primaryLink(t: Tutorial): TutorialLink | null {
    // Choose best destination for clicking the media:
    // 1) YouTube for videos
    // 2) Notion for guides
    // 3) Website/article/pdf as fallback
    const byType = (type: TutorialLinkType) =>
        t.links?.find((l) => l.type === type) ?? null;

    const kind = (t.kind || "").toLowerCase();

    if (kind === "video") return byType("youtube") || (t.links?.[0] ?? null);
    if (kind === "guide") return byType("notion") || (t.links?.[0] ?? null);
    if (kind === "article")
        return byType("article") || byType("website") || (t.links?.[0] ?? null);
    if (kind === "repo") return byType("github") || (t.links?.[0] ?? null);

    return t.links?.[0] ?? null;
}

function TutorialMedia({ tutorial }: { tutorial: Tutorial }) {
    const youtubeLink = tutorial.links?.find((l) => l.type === "youtube")?.url;
    const youtubeId =
        tutorial.youtubeId ||
        (youtubeLink ? getYouTubeIdFromUrl(youtubeLink) : null);

    const isVideo = tutorial.kind?.toLowerCase() === "video" && !!youtubeId;

    const cover =
        isVideo && youtubeId
            ? getYouTubeThumbnail(youtubeId)
            : tutorial.coverImage || "";

    const hasImage = !!cover;

    const dest = primaryLink(tutorial);

    const MediaInner = (
        <div className="relative w-full aspect-video sm:aspect-[16/10] rounded-lg overflow-hidden border border-border bg-secondary/20">
            {hasImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={cover}
                    alt={tutorial.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    {tutorial.kind?.toLowerCase() === "guide" ? (
                        <BookOpen className="opacity-60" />
                    ) : tutorial.kind?.toLowerCase() === "article" ? (
                        <FileText className="opacity-60" />
                    ) : tutorial.kind?.toLowerCase() === "repo" ? (
                        <Github className="opacity-60" />
                    ) : (
                        <LinkIcon className="opacity-60" />
                    )}
                </div>
            )}

            {isVideo ? (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full bg-background/80 border border-border px-3 py-2 inline-flex items-center gap-2">
                        <Youtube size={18} />
                        <span className="text-xs font-semibold">YouTube</span>
                    </div>
                </div>
            ) : null}

            {/* Hover affordance */}
            {dest ? (
                <div className="absolute inset-x-0 bottom-0 p-2">
                    <div className="w-fit rounded-md bg-background/80 border border-border px-2 py-1 text-[11px] text-muted-foreground inline-flex items-center gap-1">
                        Open <ExternalLink size={12} />
                    </div>
                </div>
            ) : null}
        </div>
    );

    return (
        <div className="w-full sm:w-[220px] flex-shrink-0">
            {dest ? (
                <a
                    href={dest.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block focus:outline-none focus:ring-2 focus:ring-foreground/20 rounded-lg"
                    aria-label={`Open tutorial: ${tutorial.title}`}
                    title={dest.label}
                >
                    {MediaInner}
                </a>
            ) : (
                MediaInner
            )}
        </div>
    );
}

export default function TutorialsPage() {
    const [data, setData] = useState<TutorialsData | null>(null);
    const [selectedKind, setSelectedKind] = useState<string>("all");

    useEffect(() => {
        fetch("/data/tutorials.json")
            .then((res) => res.json())
            .then((d) => setData(d));
    }, []);

    const tutorials = data?.tutorials ?? [];

    const availableKinds = useMemo(() => {
        const set = new Set<string>();
        for (const t of tutorials) set.add((t.kind || "other").trim());
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [tutorials]);

    const countsByKind = useMemo(() => {
        const counts: Record<string, number> = { all: tutorials.length };
        for (const k of availableKinds) counts[k] = 0;
        for (const t of tutorials) {
            const k = (t.kind || "other").trim();
            counts[k] = (counts[k] ?? 0) + 1;
        }
        return counts;
    }, [tutorials, availableKinds]);

    const filtered = useMemo(() => {
        const base =
            selectedKind === "all"
                ? tutorials
                : tutorials.filter(
                      (t) => (t.kind || "other").trim() === selectedKind,
                  );

        return [...base].sort((a, b) => {
            const da = a.date || (a.year ? `${a.year}` : "");
            const db = b.date || (b.year ? `${b.year}` : "");
            return db.localeCompare(da);
        });
    }, [tutorials, selectedKind]);

    if (!data) return null;

    return (
        <main className="min-h-screen bg-background">
            <PageHeader
                title="Tutorials"
                description="Videos, guides, and hands-on learning resources"
            />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Filters */}
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
                                {tutorials.length}
                            </span>
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-2">
                            Type
                        </label>

                        <div className="flex flex-wrap gap-2">
                            <TypeChip
                                active={selectedKind === "all"}
                                label="All"
                                count={countsByKind.all}
                                onClick={() => setSelectedKind("all")}
                            />
                            {availableKinds.map((k) => (
                                <TypeChip
                                    key={k}
                                    active={selectedKind === k}
                                    label={kindLabel(k)}
                                    count={countsByKind[k] ?? 0}
                                    onClick={() => setSelectedKind(k)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="space-y-4">
                    {filtered.length ? (
                        filtered.map((t) => {
                            const dateLabel = formatDate(t.date, t.year);
                            const hasDate = !!dateLabel;

                            return (
                                <article
                                    key={t.id}
                                    className="rounded-lg border border-border bg-background p-4 sm:p-5"
                                >
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        {/* Media (clickable) */}
                                        <TutorialMedia tutorial={t} />

                                        {/* Content */}
                                        <div className="min-w-0 flex-1">
                                            {/* Top pills */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span
                                                    className={[
                                                        "inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium",
                                                        kindBadgeColorClass(
                                                            t.kind,
                                                        ),
                                                    ].join(" ")}
                                                >
                                                    {kindLabel(t.kind)}
                                                </span>

                                                {t.level ? (
                                                    <span className="inline-flex px-2.5 py-1 border border-border rounded-full text-[11px] text-muted-foreground capitalize">
                                                        {t.level}
                                                    </span>
                                                ) : null}

                                                {hasDate ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 border border-border rounded-full text-[11px] text-muted-foreground tabular-nums">
                                                        <Calendar size={12} />
                                                        {dateLabel}
                                                    </span>
                                                ) : null}

                                                {t.duration ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 border border-border rounded-full text-[11px] text-muted-foreground tabular-nums">
                                                        <Clock size={12} />
                                                        {t.duration}
                                                    </span>
                                                ) : null}
                                            </div>

                                            <h3 className="mt-2 text-base sm:text-lg font-bold leading-snug">
                                                {t.title}
                                            </h3>

                                            {t.description ? (
                                                <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                                    {t.description}
                                                </p>
                                            ) : null}

                                            {/* Tags (technologies) */}
                                            {t.tags?.length ? (
                                                <div className="mt-3 flex items-center gap-2 flex-wrap">
                                                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Tag size={14} />
                                                        Tech
                                                    </span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {t.tags.map((tag) => (
                                                            <span
                                                                key={tag}
                                                                className="text-xs px-2 py-1 bg-secondary rounded-full"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : null}

                                            {/* Links */}
                                            {t.links?.length ? (
                                                <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-3">
                                                    {t.links.map((l) => (
                                                        <a
                                                            key={`${t.id}-${l.url}`}
                                                            href={l.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                                        >
                                                            {linkIcon(l.type)}
                                                            {l.label}
                                                            <ExternalLink
                                                                size={14}
                                                            />
                                                        </a>
                                                    ))}
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                </article>
                            );
                        })
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">
                                No tutorials found
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
