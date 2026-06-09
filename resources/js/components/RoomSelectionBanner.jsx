import React from "react";
import RoomTabs from "./RoomTabs";

export default function RoomSelectionBanner({
    rooms,
    activeRoomId,
    loading = false,
    onChange,
}) {
    return (
        <section className="py-3">
            <div className="bg-surface2 border border-edge">
                <div className="px-3 py-2 border-b border-edge flex items-center justify-between">
                    <p className="text-[10px] font-medium uppercase tracking-[0.10em] text-ink2">Monitoring Zone</p>
                    <span className="text-[10px] uppercase tracking-[0.08em] text-ink3">
                        {rooms.length ? `${rooms.length} room${rooms.length > 1 ? "s" : ""}` : ""}
                    </span>
                </div>
                <div className="px-3 py-2">
                    {rooms.length ? (
                        <RoomTabs
                            rooms={rooms}
                            activeRoomId={activeRoomId}
                            onChange={onChange}
                        />
                    ) : (
                        <p className="text-[10px] text-ink3 uppercase tracking-[0.06em]">
                            {loading ? "Loading rooms..." : "No rooms found"}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
