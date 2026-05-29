import React from "react";
import GlassSurface from "../components/GlassSurface";

export default function PlaceholderPage({ title, subtitle }) {
    return (
        <div className="py-5 space-y-2">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
            <GlassSurface className="p-5 mt-4 text-sm text-muted-foreground">Content for {title} will appear here.</GlassSurface>
        </div>
    );
}
