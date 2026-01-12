"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { MapPin, Building, BookOpen, Languages } from "lucide-react";

type Thesis = {
    title: string;
    language?: string; // e.g., "English", "Spanish"
};

type Education = {
    id: string;
    degree: string;
    field: string;
    institution: string;
    graduationYear: number;
    location: string;
    description?: string;
    advisors?: string[];
    thesis?: Thesis; // ✅ nuevo
};

export default function EducationPage() {
    const [education, setEducation] = useState<Education[]>([]);

    useEffect(() => {
        fetch("/data/education.json")
            .then((res) => res.json())
            .then((data) => setEducation(data));
    }, []);

    if (education.length === 0) return null;

    return (
        <div className="min-h-screen flex flex-col">
            <PageHeader title="Education" description="Academic background" />

            <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
                <div className="space-y-8">
                    {education.map((edu) => (
                        <div key={edu.id} className="relative pl-8 sm:pl-10">
                            {/* Vertical line */}
                            <div className="absolute left-2 sm:left-4 top-0 bottom-0 w-px bg-border" />

                            {/* Timeline dot */}
                            <div className="absolute left-2 sm:left-4 top-2 -translate-x-1/2 w-3.5 h-3.5 bg-foreground rounded-full ring-4 ring-background" />

                            {/* Card/content */}
                            <div className="rounded-lg border border-border p-4 sm:p-5">
                                <div className="space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                        <div>
                                            <h3 className="text-lg sm:text-xl font-bold leading-snug">
                                                {edu.degree}
                                            </h3>
                                            <p className="text-sm sm:text-base font-semibold text-muted-foreground">
                                                {edu.field}
                                            </p>
                                        </div>

                                        <span className="inline-flex px-3 py-1 bg-secondary rounded-full text-sm font-medium w-fit tabular-nums">
                                            {edu.graduationYear}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        {/* Institution */}
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Building
                                                size={16}
                                                className="flex-shrink-0"
                                            />
                                            <span className="leading-snug">
                                                {edu.institution}
                                            </span>
                                        </div>

                                        {/* Location */}
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <MapPin
                                                size={16}
                                                className="flex-shrink-0"
                                            />
                                            <span className="leading-snug">
                                                {edu.location}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Thesis block (optional) */}
                                    {edu.thesis?.title && (
                                        <div className="pt-3 border-t border-border space-y-2">
                                            <p className="text-xs font-semibold text-muted-foreground">
                                                Thesis
                                            </p>

                                            <div className="flex items-start gap-2">
                                                <BookOpen
                                                    size={16}
                                                    className="mt-0.5 flex-shrink-0 text-muted-foreground"
                                                />
                                                <p className="text-sm leading-relaxed">
                                                    <span className="font-semibold">
                                                        Title:
                                                    </span>{" "}
                                                    <span className="italic">
                                                        {edu.thesis.title}
                                                    </span>
                                                </p>
                                            </div>

                                            {edu.thesis.language && (
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Languages
                                                        size={16}
                                                        className="flex-shrink-0"
                                                    />
                                                    <span>
                                                        <span className="font-semibold">
                                                            Language:
                                                        </span>{" "}
                                                        {edu.thesis.language}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {edu.description && (
                                        <p className="text-sm leading-relaxed pt-1">
                                            {edu.description}
                                        </p>
                                    )}

                                    {edu.advisors &&
                                        edu.advisors.length > 0 && (
                                            <div className="pt-3 border-t border-border">
                                                <p className="text-xs font-semibold text-muted-foreground mb-2">
                                                    Advisors
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {edu.advisors.map(
                                                        (advisor) => (
                                                            <span
                                                                key={advisor}
                                                                className="text-xs sm:text-sm bg-secondary px-2 py-1 rounded"
                                                            >
                                                                {advisor}
                                                            </span>
                                                        ),
                                                    )}
                                                </div>
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
