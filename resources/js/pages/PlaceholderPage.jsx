import React from "react";

export default function PlaceholderPage({ title, subtitle }) {
    return (
        <div className="py-6 space-y-2">
            <h1 className="text-3xl font-semibold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
            <div className="card-surface p-6 mt-6 text-sm text-muted-foreground">
                Content for {title} will appear here.
            </div>
        </div>
    );
}
