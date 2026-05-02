import React from "react";
import { cn } from "../lib/utils";

export default function RoomTabs({ rooms, activeRoom, onChange }) {
    return (
        <div className="flex flex-wrap gap-2">
            {rooms.map((room) => {
                const isActive = room === activeRoom;
                return (
                    <button
                        key={room}
                        type="button"
                        onClick={() => onChange(room)}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium border transition-smooth",
                            isActive
                                ? "bg-lime text-lime-foreground border-lime shadow-lime"
                                : "bg-card/70 text-foreground border-border/50 hover:border-lime/40",
                        )}
                    >
                        {room}
                    </button>
                );
            })}
        </div>
    );
}
