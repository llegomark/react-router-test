// app/components/Timer.tsx
import { useState, useEffect } from "react";
import { Progress } from "../components/ui/progress";
import { Clock } from "lucide-react";

export function Timer({
    duration,
    onTimeUp
}: {
    duration: number,
    onTimeUp: () => void
}) {
    const [timeLeft, setTimeLeft] = useState(duration);

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp();
            return;
        }

        const timer = setTimeout(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [timeLeft, onTimeUp]);

    // Format time as mm:ss
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Calculate percentage for progress bar
    const percentage = (timeLeft / duration) * 100;
    const isRunningOutOfTime = timeLeft < 30;

    return (
        <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="h-3 w-3" />
                    <span>Time Remaining</span>
                </div>
                <span className={`font-medium ${isRunningOutOfTime ? 'text-red-500' : ''}`}>
                    {formattedTime}
                </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                    className={`h-1.5 rounded-full ${isRunningOutOfTime ? "bg-red-500" : "bg-blue-500"}`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
}