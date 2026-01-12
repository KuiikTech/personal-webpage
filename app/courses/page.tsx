"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { BookOpen, Building2, Calendar, Layers, Clock } from "lucide-react";

type CourseStatus = "current" | "past";
type CourseLevel = "undergraduate" | "graduate" | "short-course" | string;
type CourseType = "course" | "short-course" | "workshop" | string;

type Course = {
    id: string;
    name: string;
    code?: string;
    institution?: string;

    level: CourseLevel;
    type?: CourseType;
    status?: CourseStatus;

    start?: string; // "YYYY-MM" or "YYYY-MM-DD"
    end?: string; // "YYYY-MM" or "YYYY-MM-DD" or "Present"
    semester?: string;

    description?: string;

    weeklyHours?: number | null; // keep only this metric
    topics?: string[]; // optional, compact display (no footer tags)
};

function formatMonthYear(isoLike?: string) {
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

function LevelChip({
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
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition-colors capitalize",
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

function isCurrentCourse(c: Course) {
    if (c.status === "current") return true;
    if (c.status === "past") return false;

    const end = (c.end ?? "").toLowerCase().trim();
    if (end === "present") return true;

    // If status missing and end missing/empty -> default to PAST
    return false;
}

function sortByStartDesc(a: Course, b: Course) {
    return (b.start ?? "").localeCompare(a.start ?? "");
}

function sortPast(a: Course, b: Course) {
    const endA = a.end ?? "";
    const endB = b.end ?? "";
    const byEnd = endB.localeCompare(endA);
    if (byEnd !== 0) return byEnd;
    return (b.start ?? "").localeCompare(a.start ?? "");
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedLevel, setSelectedLevel] = useState<CourseLevel | "all">(
        "all",
    );

    useEffect(() => {
        fetch("/data/courses.json")
            .then((res) => res.json())
            .then((data) => setCourses(data));
    }, []);

    const levels = useMemo(() => {
        const set = new Set<string>();
        for (const c of courses) if (c.level) set.add(c.level);
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [courses]);

    const countsByLevel = useMemo(() => {
        const counts: Record<string, number> = { all: courses.length };
        for (const l of levels) counts[l] = 0;
        for (const c of courses) counts[c.level] = (counts[c.level] ?? 0) + 1;
        return counts;
    }, [courses, levels]);

    const levelFiltered = useMemo(() => {
        if (selectedLevel === "all") return courses;
        return courses.filter((c) => c.level === selectedLevel);
    }, [courses, selectedLevel]);

    const currentCourses = useMemo(() => {
        return [...levelFiltered].filter(isCurrentCourse).sort(sortByStartDesc);
    }, [levelFiltered]);

    const pastCourses = useMemo(() => {
        return [...levelFiltered]
            .filter((c) => !isCurrentCourse(c))
            .sort(sortPast);
    }, [levelFiltered]);

    if (courses.length === 0) return null;

    return (
        <main className="min-h-screen bg-background">
            <PageHeader
                title="Courses"
                description="Courses, disciplines, and short trainings taught"
            />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Filters */}
                <div className="mb-8 rounded-lg border border-border p-4 sm:p-5">
                    <p className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                        Filter by level
                    </p>

                    <div className="flex flex-wrap gap-2">
                        <LevelChip
                            active={selectedLevel === "all"}
                            label="All"
                            count={countsByLevel.all}
                            onClick={() => setSelectedLevel("all")}
                        />
                        {levels.map((l) => (
                            <LevelChip
                                key={l}
                                active={selectedLevel === l}
                                label={l}
                                count={countsByLevel[l] ?? 0}
                                onClick={() => setSelectedLevel(l)}
                            />
                        ))}
                    </div>
                </div>

                {/* Currently teaching */}
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg sm:text-xl font-bold">
                            Currently teaching
                        </h2>
                        <span className="text-xs text-muted-foreground tabular-nums">
                            {currentCourses.length} course
                            {currentCourses.length === 1 ? "" : "s"}
                        </span>
                    </div>

                    {currentCourses.length ? (
                        <div className="space-y-4">
                            {currentCourses.map((course) => (
                                <CourseCard key={course.id} course={course} />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg border border-border p-6 text-center text-muted-foreground">
                            No current courses found for this filter.
                        </div>
                    )}
                </section>

                {/* Previously taught */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg sm:text-xl font-bold">
                            Previously taught
                        </h2>
                        <span className="text-xs text-muted-foreground tabular-nums">
                            {pastCourses.length} course
                            {pastCourses.length === 1 ? "" : "s"}
                        </span>
                    </div>

                    {pastCourses.length ? (
                        <div className="space-y-4">
                            {pastCourses.map((course) => (
                                <CourseCard key={course.id} course={course} />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg border border-border p-6 text-center text-muted-foreground">
                            No past courses found for this filter.
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

function CourseCard({ course }: { course: Course }) {
    const dateLabel =
        course.start || course.end
            ? `${formatMonthYear(course.start)} — ${
                  course.end ? formatMonthYear(course.end) : "Present"
              }`
            : (course.semester ?? "");

    return (
        <article
            className="
        border border-border rounded-lg p-4 sm:p-5
        hover:bg-secondary/30 hover:border-border/60
        transition-colors
      "
        >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-start gap-2">
                        <BookOpen
                            size={18}
                            className="mt-0.5 text-muted-foreground flex-shrink-0"
                        />
                        <div className="min-w-0">
                            <h3 className="text-lg font-bold leading-snug">
                                {course.name}
                            </h3>
                        </div>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                        {course.institution ? (
                            <span className="inline-flex gap-1.5">
                                <Building2 size={16} />
                                <span className="truncate">
                                    {course.institution}
                                </span>
                            </span>
                        ) : null}
                    </div>

                    {course.description ? (
                        <p className="mt-3 text-sm text-foreground/90 leading-relaxed">
                            {course.description}
                        </p>
                    ) : null}

                    {/* Optional: compact topics row (NOT footer tags) */}
                    {course.topics && course.topics.length > 0 ? (
                        <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                            <Layers
                                size={16}
                                className="mt-0.5 flex-shrink-0"
                            />
                            <span className="leading-snug line-clamp-2">
                                {course.topics.join(" • ")}
                            </span>
                        </div>
                    ) : null}
                </div>

                {/* Right meta (compact, space-saving) */}
                <div className="flex flex-wrap gap-2 sm:justify-end sm:text-right">
                    {course.level ? (
                        <span className="px-3 py-1 bg-secondary rounded-full text-xs font-medium capitalize">
                            {course.level}
                        </span>
                    ) : null}

                    {course.type ? (
                        <span className="px-3 py-1 border border-border rounded-full text-xs text-muted-foreground capitalize">
                            {course.type}
                        </span>
                    ) : null}

                    {dateLabel ? (
                        <span className="inline-flex items-center gap-2 px-3 py-1 border border-border rounded-full text-xs text-muted-foreground tabular-nums">
                            <Calendar size={14} />
                            {dateLabel}
                        </span>
                    ) : null}

                    {/* Weekly hours (single metric, compact chip) */}
                    <span
                        className="inline-flex items-center gap-2 px-3 py-1 border border-border rounded-full text-xs text-muted-foreground tabular-nums"
                        title="Weekly hours"
                    >
                        <Clock size={14} />
                        {course.weeklyHours ?? "—"} h/week
                    </span>
                </div>
            </div>
        </article>
    );
}
