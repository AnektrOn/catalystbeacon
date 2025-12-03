import React, { useState, useEffect, useRef } from 'react';
import { Clock, Play, Pause, RotateCcw, Coffee, Zap, Award, Maximize2, Minimize2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const TimerPage = () => {
    const { user } = useAuth();
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState('focus'); // 'focus', 'shortBreak', 'longBreak'
    const [sessionsCompleted, setSessionsCompleted] = useState(0);
    const [isCinemaMode, setIsCinemaMode] = useState(false);
    const timerRef = useRef(null);

    const MODES = {
        focus: { label: 'Focus', time: 25 * 60, color: '#B4833D', icon: Zap },
        shortBreak: { label: 'Short Break', time: 5 * 60, color: '#10B981', icon: Coffee },
        longBreak: { label: 'Long Break', time: 15 * 60, color: '#3B82F6', icon: Coffee },
    };

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            handleTimerComplete();
        }

        return () => clearInterval(timerRef.current);
    }, [isActive, timeLeft]);

    const handleTimerComplete = () => {
        setIsActive(false);
        clearInterval(timerRef.current);

        // Play sound (optional)

        if (mode === 'focus') {
            setSessionsCompleted(prev => prev + 1);
            toast.success('Focus session complete! +50 XP', {
                icon: '🔥',
                style: {
                    background: '#1e293b',
                    color: '#fff',
                }
            });
            // Here we would call an API to award XP
        } else {
            toast.success('Break over! Ready to focus?', {
                icon: '🔔',
            });
        }
    };

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(MODES[mode].time);
    };

    const changeMode = (newMode) => {
        setMode(newMode);
        setIsActive(false);
        setTimeLeft(MODES[newMode].time);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const calculateProgress = () => {
        const totalTime = MODES[mode].time;
        return ((totalTime - timeLeft) / totalTime) * 100;
    };

    const CurrentIcon = MODES[mode].icon;

    return (
        <div className={`transition-all duration-500 ${isCinemaMode ? 'fixed inset-0 z-50 bg-[#0f0f0f] flex items-center justify-center' : 'space-y-6'}`}>

            {/* Header (Hidden in Cinema Mode) */}
            {!isCinemaMode && (
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-heading">Focus Timer</h1>
                        <p className="text-gray-600 dark:text-gray-400">Stay in the zone and earn XP.</p>
                    </div>
                    <button
                        onClick={() => setIsCinemaMode(true)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                        title="Enter Focus Mode"
                    >
                        <Maximize2 size={24} className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>
            )}

            {/* Main Timer Card */}
            <div className={`glass-panel-floating relative overflow-hidden transition-all duration-500 ${isCinemaMode ? 'w-full max-w-2xl p-12 scale-110' : 'p-8'}`}>

                {isCinemaMode && (
                    <button
                        onClick={() => setIsCinemaMode(false)}
                        className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                        <Minimize2 size={24} />
                    </button>
                )}

                {/* Mode Toggles */}
                <div className="flex justify-center gap-4 mb-12">
                    {Object.entries(MODES).map(([key, value]) => (
                        <button
                            key={key}
                            onClick={() => changeMode(key)}
                            className={`px-6 py-2 rounded-full font-medium transition-all ${mode === key
                                    ? `bg-[${value.color}]/20 text-[${value.color}] ring-1 ring-[${value.color}]`
                                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'
                                }`}
                            style={mode === key ? { backgroundColor: `${value.color}20`, color: value.color, borderColor: value.color } : {}}
                        >
                            {value.label}
                        </button>
                    ))}
                </div>

                {/* Timer Display */}
                <div className="relative w-72 h-72 mx-auto mb-12 flex items-center justify-center">
                    {/* SVG Progress Circle */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            className="text-gray-200 dark:text-gray-700"
                        />
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke={MODES[mode].color}
                            strokeWidth="4"
                            strokeDasharray="283"
                            strokeDashoffset={283 - (283 * calculateProgress()) / 100}
                            className="transition-all duration-1000 ease-linear"
                            strokeLinecap="round"
                        />
                    </svg>

                    <div className="text-center z-10">
                        <div className="text-6xl font-bold text-gray-900 dark:text-white font-mono mb-2 tracking-wider">
                            {formatTime(timeLeft)}
                        </div>
                        <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
                            <CurrentIcon size={16} />
                            <span className="uppercase tracking-widest text-sm font-bold">{isActive ? 'Running' : 'Paused'}</span>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-6">
                    <button
                        onClick={toggleTimer}
                        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105 active:scale-95 ${isActive
                                ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                                : `bg-[${MODES[mode].color}] text-white`
                            }`}
                        style={!isActive ? { backgroundColor: MODES[mode].color } : {}}
                    >
                        {isActive ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                    </button>

                    <button
                        onClick={resetTimer}
                        className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-colors"
                    >
                        <RotateCcw size={24} />
                    </button>
                </div>
            </div>

            {/* Stats / History (Hidden in Cinema Mode) */}
            {!isCinemaMode && (
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="glass-card-premium p-6 flex items-center gap-4">
                        <div className="p-3 bg-[#B4833D]/10 rounded-xl text-[#B4833D]">
                            <Zap size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{sessionsCompleted}</div>
                            <div className="text-xs text-gray-500 uppercase font-bold">Sessions Today</div>
                        </div>
                    </div>

                    <div className="glass-card-premium p-6 flex items-center gap-4">
                        <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
                            <Clock size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(sessionsCompleted * 25)}m</div>
                            <div className="text-xs text-gray-500 uppercase font-bold">Focus Time</div>
                        </div>
                    </div>

                    <div className="glass-card-premium p-6 flex items-center gap-4">
                        <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                            <Award size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{sessionsCompleted * 50}</div>
                            <div className="text-xs text-gray-500 uppercase font-bold">XP Earned</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimerPage;
