import { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Brain, Play, Pause, RotateCcw, Coffee, Zap } from "lucide-react";
import { toast } from "sonner";

type TimerMode = 'focus' | 'break' | 'longBreak';

interface FocusTimerProps {
  onTimerEnd?: () => void;
}

export function FocusTimer({ onTimerEnd }: FocusTimerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const durations = {
    focus: 25 * 60,       // 25 minutes
    break: 5 * 60,        // 5 minutes
    longBreak: 15 * 60,   // 15 minutes
  };

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const handleTimerComplete = () => {
    setIsRunning(false);

    if (mode === 'focus') {
      const newSessions = sessionsCompleted + 1;
      setSessionsCompleted(newSessions);

      // Every 4 focus sessions, take a long break
      if (newSessions % 4 === 0) {
        setMode('longBreak');
        setTimeLeft(durations.longBreak);
        toast.success("🎉 Great work! Time for a long break!");
      } else {
        setMode('break');
        setTimeLeft(durations.break);
        toast.success("✅ Focus session complete! Take a short break.");
      }
    } else {
      setMode('focus');
      setTimeLeft(durations.focus);
      toast.success("⚡ Break's over! Ready to focus?");
    }

    // Play a notification sound (browser notification API)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Focus Timer', {
        body: mode === 'focus' ? 'Time for a break!' : 'Back to work!',
        icon: '/icon.png',
      });
    }

    onTimerEnd?.();
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    if (!isRunning) {
      toast.success(mode === 'focus' ? '🎯 Focus session started!' : '☕ Break time started!');
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(durations[mode]);
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(durations[newMode]);
    setIsRunning(false);
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          toast.success('Notifications enabled!');
        }
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const total = durations[mode];
    return ((total - timeLeft) / total) * 100;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          title="Focus Timer"
        >
          <Brain className={`w-4 h-4 ${isRunning ? 'text-purple-400 animate-pulse' : 'text-zinc-400'}`} />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            Focus Timer
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Pomodoro technique for better productivity
          </DialogDescription>
        </DialogHeader>

        {/* Mode Selector */}
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            variant={mode === 'focus' ? 'default' : 'outline'}
            onClick={() => switchMode('focus')}
            className={`flex-1 ${mode === 'focus' ? 'bg-purple-600 hover:bg-purple-700' : 'border-zinc-700 hover:bg-zinc-800'}`}
          >
            <Zap className="w-3 h-3 mr-1" />
            Focus
          </Button>
          <Button
            size="sm"
            variant={mode === 'break' ? 'default' : 'outline'}
            onClick={() => switchMode('break')}
            className={`flex-1 ${mode === 'break' ? 'bg-green-600 hover:bg-green-700' : 'border-zinc-700 hover:bg-zinc-800'}`}
          >
            <Coffee className="w-3 h-3 mr-1" />
            Break
          </Button>
          <Button
            size="sm"
            variant={mode === 'longBreak' ? 'default' : 'outline'}
            onClick={() => switchMode('longBreak')}
            className={`flex-1 ${mode === 'longBreak' ? 'bg-blue-600 hover:bg-blue-700' : 'border-zinc-700 hover:bg-zinc-800'}`}
          >
            Long
          </Button>
        </div>

        {/* Timer Display */}
        <Card className="bg-zinc-800/50 border-zinc-700 p-8 my-6">
          <div className="text-center">
            <div className="text-6xl font-bold mb-4 font-mono">
              {formatTime(timeLeft)}
            </div>
            <div className="w-full bg-zinc-700 rounded-full h-2 mb-4 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  mode === 'focus' ? 'bg-purple-600' : mode === 'break' ? 'bg-green-600' : 'bg-blue-600'
                }`}
                style={{ width: `${getProgress()}%` }}
              />
            </div>
            <p className="text-zinc-400 text-sm">
              {mode === 'focus' ? '🎯 Stay focused!' : mode === 'break' ? '☕ Short break' : '🌟 Long break'}
            </p>
          </div>
        </Card>

        {/* Controls */}
        <div className="flex gap-2">
          <Button
            onClick={toggleTimer}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start
              </>
            )}
          </Button>
          <Button
            onClick={resetTimer}
            variant="outline"
            className="border-zinc-700 hover:bg-zinc-800"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Sessions completed:</span>
            <span className="text-purple-400 font-semibold">{sessionsCompleted}</span>
          </div>
        </div>

        {/* Notification Permission */}
        {('Notification' in window && Notification.permission === 'default') && (
          <Button
            size="sm"
            variant="outline"
            onClick={requestNotificationPermission}
            className="w-full border-zinc-700 hover:bg-zinc-800 text-xs"
          >
            Enable notifications for timer alerts
          </Button>
        )}

        <p className="text-xs text-zinc-500 text-center">
          25 min focus • 5 min break • 15 min long break (every 4 sessions)
        </p>
      </DialogContent>
    </Dialog>
  );
}
