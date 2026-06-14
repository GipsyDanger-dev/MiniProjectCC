import React from "react";
import { cn } from "../lib/utils";

export default function RoomTabs({ rooms, activeRoomId, onChange }) {
    return (
        <div className="flex gap-1 overflow-x-auto">
            {rooms.map((room) => {
                const isActive = room.id === activeRoomId;
                return (
                    <button
                        key={room.id}
                        type="button"
                        onClick={() => onChange(room.id)}
                        className={cn(
                            "px-3 py-1.5 text-[12px] rounded-md whitespace-nowrap transition-smooth",
                            isActive
                                ? "bg-accent/10 text-accent font-medium"
                                : "text-ink3 hover:text-ink2 hover:bg-surface3",
                        )}
                    >
                        {room.label}
                    </button>
                );
            })}
        </div>
    );
}
