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
            <div className="bg-surface2 border border-edge rounded-lg shadow-card">
                <div className="px-4 py-3 border-b border-edge flex items-center justify-between">
                    <p className="text-[12px] font-medium text-ink2">Monitoring Zone</p>
                    <span className="text-[11px] text-ink3">
                        {rooms.length ? `${rooms.length} room${rooms.length > 1 ? "s" : ""}` : ""}
                    </span>
                </div>
                <div className="px-4 py-2">
                    {rooms.length ? (
                        <RoomTabs
                            rooms={rooms}
                            activeRoomId={activeRoomId}
                            onChange={onChange}
                        />
                    ) : (
                        <p className="text-[11px] text-ink3">
                            {loading ? "Loading rooms..." : "No rooms found"}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
