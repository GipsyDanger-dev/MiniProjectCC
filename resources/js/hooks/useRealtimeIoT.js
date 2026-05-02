import { useEffect, useMemo, useState } from "react";

export function useRealtimeIoT(deviceId, intervalMs = 3000) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        let active = true;

        async function fetchData() {
            try {
                const res = await fetch(`/api/dashboard/data?device_id=${deviceId}`, {
                    headers: { Accept: "application/json" },
                });
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                const payload = await res.json();
                if (!active) return;
                setData(payload);
                setError(null);
                setLastUpdated(new Date());
            } catch (err) {
                if (!active) return;
                setError(err.message || "Failed to load");
            } finally {
                if (active) setLoading(false);
            }
        }

        setLoading(true);
        fetchData();
        const timer = setInterval(fetchData, intervalMs);

        return () => {
            active = false;
            clearInterval(timer);
        };
    }, [deviceId, intervalMs]);

    const latestReading = useMemo(() => {
        const rows = data?.sensor_data || [];
        return rows.length ? rows[0] : null;
    }, [data]);

    return { data, latestReading, loading, error, lastUpdated };
}
