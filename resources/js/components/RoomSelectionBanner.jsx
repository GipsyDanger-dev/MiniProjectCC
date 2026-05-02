import React from "react";
import RoomTabs from "./RoomTabs";

export default function RoomSelectionBanner({ rooms, activeRoom, onChange }) {
    return (
        <section className="py-5">
            <div className="relative overflow-hidden rounded-[20px] border border-white/15 backdrop-blur-md min-h-[132px] shadow-xl">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "url('https://images.unsplash.com/photo-1617802690992-15d93263d3a9?auto=format&fit=crop&w=1600&q=80')",
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/60 to-black/45" />
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(120%_100%_at_100%_0%,rgba(204,255,0,0.15),transparent_65%)]" />

                <div className="relative p-4 md:p-5 space-y-3">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs text-muted-foreground border border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/15 transition-smooth">
                        Monitoring zone
                    </span>
                    <RoomTabs
                        rooms={rooms}
                        activeRoom={activeRoom}
                        onChange={onChange}
                    />
                </div>
            </div>
        </section>
    );
}
