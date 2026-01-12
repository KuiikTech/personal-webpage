"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import {
    ExternalLink,
    Filter,
    ExternalLink as ExternalLinkIcon,
} from "lucide-react";

type PublicationType = "article" | "conference" | "chapter";

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
    scimagoHtml?: string; // <a><img .../></a>
};

type Publication = {
    id: string;
    type: PublicationType;
    title: string;
    authors: string[];
    year: number;
    month?: number;

    abstract?: string;
    url?: string;
    doi?: string;

    citations?: number; // Google Scholar citations

    journalId?: string;
    volume?: string;
    issue?: string;
    pages?: string;

    conference?: string;
    location?: string;

    book?: string;
    chapter?: string;
    publisher?: string;
};

type PublicationsData = { publications: Publication[] };
type JournalsData = { journals: Journal[] };

type PubWithJournal = Publication & { journal?: Journal | null };

const TYPE_LABEL: Record<PublicationType, string> = {
    article: "Journal Article",
    conference: "Conference Paper",
    chapter: "Book Chapter",
};

function formatType(type: PublicationType) {
    return TYPE_LABEL[type] ?? type;
}

function JournalCover({ journal }: { journal?: Journal | null }) {
    return (
        <div className="w-[72px] h-[108px] sm:w-[72px] sm:h-[108px] rounded-md overflow-hidden border border-border bg-secondary/40 flex items-center justify-center flex-shrink-0">
            {journal?.coverImage ? (
                <img
                    src={journal.coverImage}
                    alt={`${journal.name} cover`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            ) : (
                <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground text-center px-1 leading-tight">
                    {journal?.abbreviation ?? "Journal"}
                </span>
            )}
        </div>
    );
}

function ScimagoInlineBadge({ html }: { html: string }) {
    return (
        <div
            className="
        w-full
        [&_a]:block
        [&_a]:max-w-full
        [&_img]:block
        [&_img]:h-auto
        [&_img]:max-w-full
      "
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

const GOOGLE_SCHOLAR_PROFILE_URL =
    "https://scholar.google.es/citations?user=m9_TKMQAAAAJ";

function TypeBadge({
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
            className={[
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition-colors",
                active
                    ? "border-foreground/20 bg-secondary text-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-secondary/40",
            ].join(" ")}
            aria-pressed={active}
        >
            <span className="font-medium">{label}</span>
            <span className="tabular-nums text-[11px] opacity-80">
                ({count})
            </span>
        </button>
    );
}

/** Rich venue line:
 * - Journal name: highlighted + clickable
 * - Meta: regular muted text
 */
function VenueLineRich({ pub }: { pub: PubWithJournal }) {
    if (pub.type === "article") {
        const j = pub.journal;
        const journalName = j?.name ?? "";

        const meta = [
            pub.volume ? `Vol. ${pub.volume}` : null,
            pub.issue ? `No. ${pub.issue}` : null,
            pub.pages ? `p. ${pub.pages}` : null,
        ]
            .filter(Boolean)
            .join(", ");

        if (!journalName) {
            return meta ? (
                <p className="mt-2 text-sm text-foreground/85 leading-relaxed">
                    {meta}
                </p>
            ) : null;
        }

        return (
            <p className="mt-2 text-sm leading-relaxed">
                {j?.website ? (
                    <a
                        href={j.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
              inline-flex items-center gap-1
              font-semibold
              text-foreground
              rounded-md
              px-1.5 py-0.5
              -mx-1.5
              bg-secondary/40
              hover:bg-secondary/60
              transition-colors
            "
                        title="Open journal website"
                    >
                        {journalName}
                        <ExternalLinkIcon size={14} className="opacity-70" />
                    </a>
                ) : (
                    <span
                        className="
              inline-flex items-center
              font-semibold
              text-foreground
              rounded-md
              px-1.5 py-0.5
              -mx-1.5
              bg-secondary/40
            "
                    >
                        {journalName}
                    </span>
                )}

                {meta ? (
                    <span className="text-muted-foreground">
                        {" "}
                        <span className="mx-1.5">•</span>
                        {meta}
                    </span>
                ) : null}
            </p>
        );
    }

    if (pub.type === "conference") {
        const line = [pub.conference, pub.location].filter(Boolean).join(" • ");
        return line ? (
            <p className="mt-2 text-sm text-foreground/85 leading-relaxed">
                {line}
            </p>
        ) : null;
    }

    const ch = pub.chapter ? `Chapter ${pub.chapter}` : "";
    const line = [pub.book, pub.publisher, ch].filter(Boolean).join(" • ");
    return line ? (
        <p className="mt-2 text-sm text-foreground/85 leading-relaxed">
            {line}
        </p>
    ) : null;
}

export default function PublicationsPage() {
    const [pubData, setPubData] = useState<PublicationsData | null>(null);
    const [journalsData, setJournalsData] = useState<JournalsData | null>(null);

    const [selectedType, setSelectedType] = useState<PublicationType | "all">(
        "article",
    );
    const [selectedYear, setSelectedYear] = useState<number | "all">("all");

    useEffect(() => {
        fetch("/data/publications.json")
            .then((res) => res.json())
            .then((d) => setPubData(d));

        fetch("/data/journals.json")
            .then((res) => res.json())
            .then((d) => setJournalsData(d));
    }, []);

    const publications = pubData?.publications ?? [];

    const journalById = useMemo(() => {
        const m = new Map<string, Journal>();
        for (const j of journalsData?.journals ?? []) m.set(j.id, j);
        return m;
    }, [journalsData]);

    const pubs = useMemo<PubWithJournal[]>(() => {
        return publications.map((p) => {
            if (p.type === "article" && p.journalId) {
                return { ...p, journal: journalById.get(p.journalId) ?? null };
            }
            return { ...p, journal: null };
        });
    }, [publications, journalById]);

    const availableTypes = useMemo(() => {
        const set = new Set<PublicationType>();
        for (const p of pubs) set.add(p.type);
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [pubs]);

    const availableYears = useMemo(() => {
        const years = Array.from(new Set(pubs.map((p) => p.year)));
        years.sort((a, b) => b - a);
        return years;
    }, [pubs]);

    const countsByType = useMemo(() => {
        const counts: Record<string, number> = { all: pubs.length };
        for (const t of availableTypes) counts[t] = 0;
        for (const p of pubs) counts[p.type] = (counts[p.type] ?? 0) + 1;
        return counts;
    }, [pubs, availableTypes]);

    const filtered = useMemo(() => {
        return pubs.filter((p) => {
            if (selectedType !== "all" && p.type !== selectedType) return false;
            if (selectedYear !== "all" && p.year !== selectedYear) return false;
            return true;
        });
    }, [pubs, selectedType, selectedYear]);

    const sorted = useMemo(() => {
        return [...filtered].sort((a, b) => {
            if (b.year !== a.year) return b.year - a.year;
            return (a.month ?? 0) - (b.month ?? 0);
        });
    }, [filtered]);

    if (!pubData || !journalsData) return null;

    return (
        <main className="min-h-screen bg-background">
            <PageHeader
                title="Publications"
                description="Academic production"
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
                                {sorted.length}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-foreground">
                                {pubs.length}
                            </span>
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Type badges */}
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-2">
                                Type
                            </label>

                            <div className="flex flex-wrap gap-2">
                                {availableTypes.map((t) => (
                                    <TypeBadge
                                        key={t}
                                        active={selectedType === t}
                                        label={formatType(t)}
                                        count={countsByType[t] ?? 0}
                                        onClick={() => setSelectedType(t)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Year select */}
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">
                                Year
                            </label>
                            <select
                                value={String(selectedYear)}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setSelectedYear(
                                        v === "all" ? "all" : Number(v),
                                    );
                                }}
                                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
                            >
                                <option value="all">All years</option>
                                {availableYears.map((y) => (
                                    <option key={y} value={String(y)}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="space-y-4">
                    {sorted.length ? (
                        sorted.map((pub) => {
                            const hasJournal =
                                pub.type === "article" && !!pub.journal;
                            const hasScimago =
                                hasJournal && !!pub.journal?.scimagoHtml;

                            return (
                                <article
                                    key={pub.id}
                                    className="rounded-lg border border-border bg-background p-4 sm:p-5"
                                >
                                    {/* Header pills */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="inline-flex px-2.5 py-1 bg-secondary rounded-full text-[11px] font-medium">
                                            {formatType(pub.type)}
                                        </span>

                                        <span className="inline-flex px-2.5 py-1 border border-border rounded-full text-[11px] text-muted-foreground tabular-nums">
                                            {pub.year}
                                        </span>

                                        {/* Citations chip */}
                                        {typeof pub.citations === "number" ? (
                                            <a
                                                href={
                                                    GOOGLE_SCHOLAR_PROFILE_URL
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 px-2.5 py-1 border border-border rounded-full text-[11px] text-muted-foreground tabular-nums hover:text-foreground hover:bg-secondary/40 transition-colors"
                                                title="Open Google Scholar profile"
                                            >
                                                Citations:{" "}
                                                <span className="ml-1 font-semibold text-foreground">
                                                    {pub.citations}
                                                </span>
                                                <ExternalLinkIcon
                                                    size={12}
                                                    className="opacity-70"
                                                />
                                            </a>
                                        ) : null}
                                    </div>

                                    {/* Main body */}
                                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-[1fr_260px] gap-4">
                                        {/* Left */}
                                        <div className="min-w-0">
                                            {/* NEW: Title links to publication URL */}
                                            {pub.url ? (
                                                <a
                                                    href={pub.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group inline-flex items-start gap-2 max-w-full"
                                                    title="Open publication"
                                                >
                                                    <h3 className="text-base sm:text-lg font-bold leading-snug group-hover:underline underline-offset-4">
                                                        {pub.title}
                                                    </h3>
                                                    <ExternalLinkIcon
                                                        size={16}
                                                        className="mt-1 text-muted-foreground opacity-80 group-hover:text-foreground transition-colors flex-shrink-0"
                                                    />
                                                </a>
                                            ) : (
                                                <h3 className="text-base sm:text-lg font-bold leading-snug">
                                                    {pub.title}
                                                </h3>
                                            )}

                                            {pub.authors?.length ? (
                                                <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                                    {pub.authors.join(", ")}
                                                </p>
                                            ) : null}

                                            <VenueLineRich pub={pub} />

                                            {pub.doi ? (
                                                <div className="mt-2 text-xs text-muted-foreground inline-flex items-center gap-1 max-w-full">
                                                    <span className="font-medium">
                                                        DOI
                                                    </span>
                                                    <span className="truncate">
                                                        {pub.doi}
                                                    </span>
                                                </div>
                                            ) : null}
                                        </div>

                                        {/* Right */}
                                        {hasJournal ? (
                                            <aside className="w-full sm:w-[260px] sm:justify-self-end">
                                                <div className="rounded-lg border border-border bg-secondary/10 p-3">
                                                    <div className="flex flex-row sm:items-start gap-3">
                                                        <div className="flex items-start gap-3 flex-col sm:gap-2 sm:items-start">
                                                            <JournalCover
                                                                journal={
                                                                    pub.journal
                                                                }
                                                            />

                                                            <span
                                                                className="
                                  inline-flex items-center gap-1.5
                                  max-w-full
                                  px-2.5 py-1
                                  border border-border rounded-full
                                  text-[11px] text-muted-foreground
                                "
                                                                title={
                                                                    pub.journal!
                                                                        .publisher
                                                                }
                                                            >
                                                                <span className="truncate">
                                                                    {
                                                                        pub
                                                                            .journal!
                                                                            .publisher
                                                                    }
                                                                </span>
                                                            </span>
                                                        </div>

                                                        {hasScimago ? (
                                                            <div className="min-w-0 flex-1">
                                                                <div className="rounded-md border border-border bg-background/60 px-3 py-2">
                                                                    <div className="flex items-center justify-between gap-2">
                                                                        <span className="text-[11px] font-semibold text-muted-foreground">
                                                                            SCImago
                                                                        </span>
                                                                    </div>

                                                                    <div className="mt-2 justify-center">
                                                                        <ScimagoInlineBadge
                                                                            html={
                                                                                pub
                                                                                    .journal!
                                                                                    .scimagoHtml!
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </aside>
                                        ) : null}
                                    </div>
                                </article>
                            );
                        })
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">
                                No publications found
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
