"use client";

import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";

interface ViewSwitcherProps {
    view: "board" | "table";
    onViewChange: (view: "board" | "table") => void;
}

export function ViewSwitcher({ view, onViewChange }: ViewSwitcherProps) {
    return (
        <div className="flex items-center bg-muted p-1 rounded-lg border">
            <Button
                variant={view === "board" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={() => onViewChange("board")}
            >
                <LayoutGrid className="mr-2 h-3.5 w-3.5" />
                Board
            </Button>
            <Button
                variant={view === "table" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={() => onViewChange("table")}
            >
                <List className="mr-2 h-3.5 w-3.5" />
                Table
            </Button>
        </div>
    );
}
