import React from "react";
import { cn } from "../lib/utils";

export default function RoomTabs({ rooms, activeRoomId, onChange }) {
    return (
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {rooms.map(room => (
                <button key={room.id} onClick={() => onChange(room.id)}
                    className={cn("px-2 sm:px-3 py-1 sm:py-1.5 rounded-[9999px] text-[10px] sm:text-xs font-normal border transition-all duration-150",
                        room.id === activeRoomId
                            ? "bg-white text-[#0a0a0a] border-white"
                            : "bg-[rgba(10,10,10,0.6)] text-[#7d8187] border-[rgba(33,35,39,0.8)] hover:border-[rgba(54,58,63,0.8)] hover:text-white")}>
                    {room.label}
                </button>
            ))}
        </div>
    );
}
