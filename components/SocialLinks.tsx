"use client";

import {
    Github,
    Linkedin,
    ExternalLink,
    BookMarked,
    Award,
} from "lucide-react";

type SocialLink = {
    name: string;
    url: string;
    display: "home" | "footer" | "both";

    iconType?: "lucide" | "svg";
    icon?: string;
    iconSvg?: string;
};

interface SocialLinksProps {
    links: SocialLink[];
}

const iconMap: Record<string, any> = {
    linkedin: Linkedin,
    github: Github,
    googleScholar: BookMarked,
    researchGate: Award,
    orcid: ExternalLink,
    cvlac: ExternalLink,
    scopus: ExternalLink,
    webOfScience: ExternalLink,
    twitter: ExternalLink,
};

function isLikelySafeSvg(svg?: string) {
    if (!svg) return false;
    const s = svg.toLowerCase();

    // Basic blocks (avoid scripts/event handlers)
    if (s.includes("<script")) return false;
    if (
        s.includes("onload=") ||
        s.includes("onclick=") ||
        s.includes("onerror=")
    )
        return false;
    if (s.includes("javascript:")) return false;

    // Must contain <svg
    if (!s.includes("<svg")) return false;

    return true;
}

/**
 * iOS/WebKit can be picky with inline SVG injected via innerHTML:
 * - color inheritance may fail
 * - width/height may be missing or odd
 * - fill/stroke may be hard-coded
 *
 * This normalizes the SVG so it consistently uses currentColor and a predictable size.
 */
function normalizeSvg(svg: string, size = 24) {
    let out = svg.trim();

    // Ensure the root is <svg ...>
    // Add width/height if missing
    if (!/width\s*=/.test(out)) {
        out = out.replace("<svg", `<svg width="${size}"`);
    }
    if (!/height\s*=/.test(out)) {
        out = out.replace("<svg", `<svg height="${size}"`);
    }

    // If viewBox missing, we won't invent it blindly. (Better to have it in source SVG.)
    // But many fontawesome svgs have viewBox; if not, they still render with width/height.

    // Force root to have fill/stroke currentColor if neither exists
    const hasRootFill = /<svg[^>]*\sfill\s*=/.test(out);
    const hasRootStroke = /<svg[^>]*\sstroke\s*=/.test(out);

    if (!hasRootFill && !hasRootStroke) {
        out = out.replace("<svg", `<svg fill="currentColor"`);
    }

    // Replace hardcoded fills/strokes to currentColor (common culprit on iOS)
    // - Keep fill="none" (often used for outline icons)
    out = out.replace(/fill="(?!none)[^"]*"/gi, `fill="currentColor"`);
    out = out.replace(/stroke="[^"]*"/gi, `stroke="currentColor"`);

    // Make sure it behaves like an icon (no extra inline whitespace issues)
    // Add style display:block to reduce baseline alignment glitches
    if (!/style=/.test(out)) {
        out = out.replace("<svg", `<svg style="display:block"`);
    } else {
        // If style exists, append display:block
        out = out.replace(/style="([^"]*)"/i, (m, g1) => {
            const next = g1.includes("display")
                ? g1
                : `${g1.trim().replace(/;?$/, ";")}display:block;`;
            return `style="${next}"`;
        });
    }

    return out;
}

export function SocialLinks({ links }: SocialLinksProps) {
    return (
        <div className="flex flex-wrap justify-center gap-2">
            {links.map((link) => {
                const useSvg =
                    link.iconType === "svg" && isLikelySafeSvg(link.iconSvg);
                const Icon = iconMap[link.icon ?? ""] || ExternalLink;

                const svg = useSvg ? normalizeSvg(link.iconSvg!, 24) : null;

                return (
                    <a
                        key={link.name}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={link.name}
                        aria-label={link.name}
                        className="
                          inline-flex items-center justify-center
                          w-10 h-10 rounded-full
                          border border-border
                          hover:bg-secondary hover:border-foreground
                          transition-transform hover:scale-110
                          text-foreground
                        "
                    >
                        {useSvg ? (
                            <span
                                // Force color inheritance path->currentColor + ensure svg fits box
                                className="
                                  inline-flex items-center justify-center
                                  w-6 h-6
                                  text-foreground
                                  [&_svg]:w-6 [&_svg]:h-6
                                  [&_svg]:block
                                  [&_path]:fill-current [&_path]:stroke-current
                                  [&_circle]:stroke-current
                                  [&_rect]:stroke-current
                                "
                                // color is the key for currentColor in some WebKit cases
                                style={{ color: "currentColor" }}
                                dangerouslySetInnerHTML={{ __html: svg! }}
                            />
                        ) : (
                            <Icon size={18} className="text-foreground" />
                        )}
                    </a>
                );
            })}
        </div>
    );
}
