import React from "react";
import { cn } from "../lib/utils";

export default function RoomTabs({ rooms, activeRoomId, onChange }) {
    return (
        <div className="flex flex-wrap gap-2">
            {rooms.map((room) => {
                const isActive = room.id === activeRoomId;
                return (
                    <button
                        key={room.id}
                        type="button"
                        onClick={() => onChange(room.id)}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium border transition-smooth",
                            isActive
                                ? "bg-lime text-lime-foreground border-lime shadow-lime"
                                : "glass-pill text-foreground hover:border-lime/40",
                        )}
                    >
                        {room.label}
                    </button>
                );
            })}
        </div>
    );
}
