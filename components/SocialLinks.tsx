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

    // ✅ Nuevo: el tipo de icono
    iconType?: "lucide" | "svg";

    // ✅ Para lucide
    icon?: string;

    // ✅ Para svg inline (FontAwesome)
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

    // Bloqueos básicos (evita scripts/event handlers)
    if (s.includes("<script")) return false;
    if (
        s.includes("onload=") ||
        s.includes("onclick=") ||
        s.includes("onerror=")
    )
        return false;
    if (s.includes("javascript:")) return false;

    // Debe contener <svg
    if (!s.includes("<svg")) return false;

    return true;
}

export function SocialLinks({ links }: SocialLinksProps) {
    return (
        <div className="flex flex-wrap justify-center gap-2">
            {links.map((link) => {
                const useSvg =
                    link.iconType === "svg" && isLikelySafeSvg(link.iconSvg);
                const Icon = iconMap[link.icon ?? ""] || ExternalLink;

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
              w-10 h-10
              rounded-full
              border border-border
              hover:bg-secondary hover:border-foreground
              transition-transform
              hover:scale-110
            "
                    >
                        {useSvg ? (
                            <span
                                className="inline-flex items-center justify-center w-[24px] h-[24px] text-foreground"
                                dangerouslySetInnerHTML={{
                                    __html: link.iconSvg!,
                                }}
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
