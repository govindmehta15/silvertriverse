import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook that returns a live countdown from now until `endTime`.
 * Ticks every second. Returns hours, minutes, seconds, total ms remaining,
 * and boolean flags for urgency states.
 */
export default function useCountdown(endTime) {
    const calc = useCallback(() => {
        const diff = Math.max(0, endTime - Date.now());
        return {
            totalMs: diff,
            hours: Math.floor(diff / 3_600_000),
            minutes: Math.floor((diff / 60_000) % 60),
            seconds: Math.floor((diff / 1_000) % 60),
            isExpired: diff <= 0,
            isUrgent: diff > 0 && diff <= 60_000, // < 1 minute
            isWarning: diff > 60_000 && diff <= 300_000, // 1-5 minutes
        };
    }, [endTime]);

    const [time, setTime] = useState(calc);

    useEffect(() => {
        // Sync immediately
        setTime(calc());

        const id = setInterval(() => {
            const next = calc();
            setTime(next);
            if (next.isExpired) clearInterval(id);
        }, 1000);

        return () => clearInterval(id);
    }, [calc]);

    const pad = (n) => String(n).padStart(2, '0');
    const formatted = `${pad(time.hours)}:${pad(time.minutes)}:${pad(time.seconds)}`;

    return { ...time, formatted, pad };
}
