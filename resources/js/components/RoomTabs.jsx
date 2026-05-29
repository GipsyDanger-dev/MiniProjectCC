import React from "react";
import { cn } from "../lib/utils";

export default function RoomTabs({ rooms, activeRoomId, onChange }) {
    return (
        <div className="flex flex-wrap gap-2">
            {rooms.map(room => (
                <button key={room.id} onClick={() => onChange(room.id)}
                    className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-smooth",
                        room.id === activeRoomId ? "bg-violet text-white border-violet" : "bg-white/[0.05] text-white/55 border-white/[0.08] hover:border-violet/40")}>
                    {room.label}
                </button>
            ))}
        </div>
    );
}
