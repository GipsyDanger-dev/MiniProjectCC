import React from "react";
import { cn } from "../lib/utils";

export default function RoomTabs({ rooms, activeRoomId, onChange }) {
    return (
        <div className="flex bg-surface2 border-b border-edge overflow-x-auto">
            {rooms.map((room) => {
                const isActive = room.id === activeRoomId;
                return (
                    <button
                        key={room.id}
                        type="button"
                        onClick={() => onChange(room.id)}
                        className={cn(
                            "px-4 py-2 text-[10px] uppercase tracking-[0.08em] whitespace-nowrap border-b-2 transition-smooth",
                            isActive
                                ? "text-accent border-b-accent bg-surface"
                                : "text-ink3 border-b-transparent hover:text-ink2",
                        )}
                    >
                        {room.label}
                    </button>
                );
            })}
        </div>
    );
}
