"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import {
    Filter,
    ExternalLink,
    Github,
    Calendar,
    MapPin,
    BadgeCheck,
    Users,
    User,
} from "lucide-react";

type ProjectStatus = "ongoing" | "completed" | "planned" | string;

type Project = {
    id: string;
    title: string;
    status: ProjectStatus;

    start?: string; // YYYY | YYYY-MM
    end?: string; // YYYY | YYYY-MM | Present

    country?: string;
    institution?: string;
    fundedBy?: string;
    leader?: string;
    members?: string[];

    abstract?: string;
    description?: string;

    coverImage?: string;

    technologies?: string[];
    githubUrl?: string;
    url?: string;
};

function formatMonthYear(isoLike?: string) {
    if (!isoLike) return "";
    const lower = isoLike.toLowerCase();
    if (lower === "present" || lower === "current") return "Present";

    const parts = isoLike.split("-");
    const year = parts[0];
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

function StatusChip({ status }: { status: string }) {
    const s = status.toLowerCase();
    const cls =
        s === "ongoing" || s === "in progress"
            ? "bg-secondary text-foreground"
            : "border border-border text-muted-foreground";

    return (
        <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium capitalize ${cls}`}
        >
            {status}
        </span>
    );
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string | "all">("all");

    useEffect(() => {
        fetch("/data/projects.json")
            .then((res) => res.json())
            .then((data) => setProjects(data));
    }, []);

    const statuses = useMemo(() => {
        const s = new Set<string>();
        projects.forEach((p) => p.status && s.add(p.status));
        return Array.from(s).sort();
    }, [projects]);

    const countsByStatus = useMemo(() => {
        const c: Record<string, number> = { all: projects.length };
        statuses.forEach((s) => (c[s] = 0));
        projects.forEach((p) => (c[p.status] = (c[p.status] ?? 0) + 1));
        return c;
    }, [projects, statuses]);

    const filtered = useMemo(() => {
        return selectedStatus === "all"
            ? projects
            : projects.filter((p) => p.status === selectedStatus);
    }, [projects, selectedStatus]);

    const sorted = useMemo(() => {
        return [...filtered].sort((a, b) =>
            (b.start ?? "").localeCompare(a.start ?? ""),
        );
    }, [filtered]);

    if (!projects.length) return null;

    return (
        <main className="min-h-screen bg-background">
            <PageHeader
                title="Projects"
                description="Research and development initiatives"
            />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Filters */}
                <div className="mb-8 rounded-lg border border-border p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Filter size={16} className="text-muted-foreground" />
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                            Filter
                        </p>
                        <p className="ml-auto text-xs text-muted-foreground">
                            Showing{" "}
                            <span className="font-semibold text-foreground">
                                {sorted.length}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-foreground">
                                {projects.length}
                            </span>
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <FilterChip
                            active={selectedStatus === "all"}
                            label="All"
                            count={countsByStatus.all}
                            onClick={() => setSelectedStatus("all")}
                        />
                        {statuses.map((s) => (
                            <FilterChip
                                key={s}
                                active={selectedStatus === s}
                                label={s}
                                count={countsByStatus[s]}
                                onClick={() => setSelectedStatus(s)}
                            />
                        ))}
                    </div>
                </div>

                {/* List */}
                <div className="space-y-4">
                    {sorted.map((p) => (
                        <ProjectCard key={p.id} project={p} />
                    ))}
                </div>
            </div>
        </main>
    );
}

function FilterChip({
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
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition-colors capitalize ${
                active
                    ? "border-foreground/20 bg-secondary text-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
            }`}
        >
            <span className="font-medium">{label}</span>
            <span className="tabular-nums text-[11px] opacity-80">
                ({count})
            </span>
        </button>
    );
}

function ProjectCard({ project }: { project: Project }) {
    const dateLabel =
        project.start || project.end
            ? `${formatMonthYear(project.start)} — ${
                  project.end ? formatMonthYear(project.end) : "Present"
              }`
            : "";

    const hasCover = !!project.coverImage;

    return (
        <article className="rounded-lg border border-border bg-background p-4 sm:p-5 hover:bg-secondary/30 hover:border-border/60 transition-colors">
            <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4">
                {/* Cover */}
                {hasCover && (
                    <div className="w-full sm:w-[140px]">
                        <div className="aspect-[16/10] rounded-md overflow-hidden border border-border bg-secondary/40">
                            <img
                                src={project.coverImage!}
                                alt={`${project.title} cover`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold leading-snug">
                        {project.title}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <StatusChip status={project.status} />

                        {dateLabel && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 border border-border rounded-full text-[11px] text-muted-foreground">
                                <Calendar size={12} />
                                {dateLabel}
                            </span>
                        )}

                        {project.country && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 border border-border rounded-full text-[11px] text-muted-foreground">
                                <MapPin size={12} />
                                {project.country}
                            </span>
                        )}
                    </div>

                    {project.abstract && (
                        <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                            {project.abstract}
                        </p>
                    )}

                    {(project.fundedBy ||
                        project.leader ||
                        project.members?.length) && (
                        <div className="mt-3 pt-3 border-t border-border space-y-2 text-sm text-muted-foreground">
                            {project.fundedBy && (
                                <div className="flex items-start gap-2">
                                    <BadgeCheck size={16} />
                                    <span>
                                        Funded by{" "}
                                        <span className="text-foreground">
                                            {project.fundedBy}
                                        </span>
                                    </span>
                                </div>
                            )}

                            {project.leader && (
                                <div className="flex items-start gap-2">
                                    <User size={16} />
                                    <span>
                                        Lead:{" "}
                                        <span className="text-foreground">
                                            {project.leader}
                                        </span>
                                    </span>
                                </div>
                            )}

                            {project.members && project.members.length > 0 && (
                                <div className="flex items-start gap-2">
                                    <Users size={16} />
                                    <span className="line-clamp-2">
                                        Team:{" "}
                                        <span className="text-foreground/90">
                                            {project.members.join(", ")}
                                        </span>
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {(project.githubUrl || project.url) && (
                        <div className="mt-3 flex items-center gap-3 text-sm">
                            {project.githubUrl && (
                                <a
                                    href={project.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                                >
                                    <Github size={14} /> Code
                                </a>
                            )}
                            {project.url && (
                                <a
                                    href={project.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                                >
                                    <ExternalLink size={14} /> Project
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}
