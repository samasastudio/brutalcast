import { useState, useEffect } from 'react';

interface RateLimitInfo {
    isRateLimited: boolean;
    remainingRequests: number;
    resetTime: number | null;
    incrementCount: () => void;
}

const LIMIT = 10;
const TIME_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

export function useRateLimit(): RateLimitInfo {
    const [requestCount, setRequestCount] = useState<number>(0);
    const [resetTime, setResetTime] = useState<number | null>(null);

    useEffect(() => {
        const storedData = localStorage.getItem('rateLimitData');
        if (storedData) {
            const { count, reset } = JSON.parse(storedData);
            const now = Date.now();

            if (now > reset) {
                // Reset window has passed
                setRequestCount(0);
                setResetTime(null);
                localStorage.removeItem('rateLimitData');
            } else {
                setRequestCount(count);
                setResetTime(reset);
            }
        }
    }, []);

    const incrementCount = () => {
        const now = Date.now();
        let newResetTime = resetTime;

        if (!resetTime || now > resetTime) {
            newResetTime = now + TIME_WINDOW;
            setResetTime(newResetTime);
        }

        const newCount = requestCount + 1;
        setRequestCount(newCount);

        localStorage.setItem('rateLimitData', JSON.stringify({
            count: newCount,
            reset: newResetTime
        }));
    };

    const isRateLimited = requestCount >= LIMIT;
    const remainingRequests = Math.max(0, LIMIT - requestCount);

    return {
        isRateLimited,
        remainingRequests,
        resetTime,
        incrementCount
    };
}
