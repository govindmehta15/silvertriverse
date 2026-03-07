import { useState, useEffect } from 'react';

export default function CountdownTimer({ endTime, className = '' }) {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        const diff = endTime - Date.now();
        if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
        return {
            hours: Math.floor(diff / (1000 * 60 * 60)),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
            seconds: Math.floor((diff / 1000) % 60),
        };
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, [endTime]);

    const pad = (n) => String(n).padStart(2, '0');

    return (
        <div className={`inline-flex items-center gap-0.5 bg-navy-800/80 rounded px-2 py-1 text-sm font-mono ${className}`}>
            <span className="text-gold">{pad(timeLeft.hours)}</span>
            <span className="text-gray-400">:</span>
            <span className="text-gold">{pad(timeLeft.minutes)}</span>
            <span className="text-gray-400">:</span>
            <span className="text-gold">{pad(timeLeft.seconds)}</span>
        </div>
    );
}
