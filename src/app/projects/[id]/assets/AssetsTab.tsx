"use client";

import { Asset } from "@/lib/assets";
import { AssetCard } from "./AssetCard";
import { AddAssetDialog } from "./AddAssetDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

interface AssetsTabProps {
    assets: Asset[];
    projectId: string;
}

export function AssetsTab({ assets, projectId }: AssetsTabProps) {
    const [filter, setFilter] = useState<string>("all");

    const filteredAssets = filter === "all"
        ? assets
        : assets.filter(a => a.type === filter);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Tabs value={filter} onValueChange={setFilter} className="w-[400px]">
                    <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="env">Env</TabsTrigger>
                        <TabsTrigger value="diagram">Diagrams</TabsTrigger>
                        <TabsTrigger value="link">Links</TabsTrigger>
                        <TabsTrigger value="note">Notes</TabsTrigger>
                        <TabsTrigger value="file">Files</TabsTrigger>
                    </TabsList>
                </Tabs>
                <AddAssetDialog projectId={projectId} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAssets.map((asset) => (
                    <AssetCard key={asset.id} asset={asset} />
                ))}
                {filteredAssets.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground border border-dashed rounded-lg">
                        No assets found. Create one to get started.
                    </div>
                )}
            </div>
        </div>
    );
}
