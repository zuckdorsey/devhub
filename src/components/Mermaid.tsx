"use client";

import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

mermaid.initialize({
    startOnLoad: false,
    theme: "default",
    securityLevel: "loose",
});

interface MermaidProps {
    chart: string;
}

export function Mermaid({ chart }: MermaidProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (chart && ref.current) {
            const renderChart = async () => {
                try {
                    setError(null);
                    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                    const { svg } = await mermaid.render(id, chart);
                    setSvg(svg);
                } catch (err) {
                    console.error("Mermaid render error:", err);
                    setError("Failed to render diagram. Please check syntax.");
                }
            };
            renderChart();
        }
    }, [chart]);

    if (error) {
        return <div className="text-red-500 text-xs p-2 bg-red-50 rounded">{error}</div>;
    }

    return (
        <div
            ref={ref}
            className="mermaid-container w-full overflow-x-auto flex justify-center p-4 bg-white dark:bg-neutral-900 rounded-md"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}
