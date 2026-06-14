import React from "react";
import GlassSurface from "../components/GlassSurface";

export default function PlaceholderPage({ title, subtitle }) {
    return (
        <div className="py-5 space-y-2">
            <h1 className="text-2xl font-normal text-white tracking-tight">{title}</h1>
            <p className="text-sm text-[#7d8187]">{subtitle}</p>
            <GlassSurface className="p-5 mt-4 text-sm text-[#7d8187]">Content for {title} will appear here.</GlassSurface>
        </div>
    );
}
