import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PlayerProvider, usePlayer } from "./contexts/PlayerContext";
import { GlobalPlayer } from "./components/GlobalPlayer";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { AnimatedBackground } from "./components/AnimatedBackground";
import Home from "./pages/Home";
import Library from "./pages/Library";
import History from "./pages/History";
import Stats from "./pages/Stats";
import { Button } from "./components/ui/button";
import { Home as HomeIcon, Library as LibraryIcon, Clock, Keyboard, Palette, BarChart3 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { useTheme } from "./contexts/ThemeContext";
import { useState } from "react";

function Router() {
  const [location, setLocation] = useLocation();
  const { colorTheme, setColorTheme } = useTheme();
  const { currentTrack } = usePlayer();
  const [isPlaying, setIsPlaying] = useState(false);

  const themeOptions: Array<{ name: string; value: "purple" | "blue" | "green" | "orange" | "pink"; color: string }> = [
    { name: "Purple", value: "purple", color: "bg-purple-600" },
    { name: "Blue", value: "blue", color: "bg-blue-600" },
    { name: "Green", value: "green", color: "bg-green-600" },
    { name: "Orange", value: "orange", color: "bg-orange-600" },
    { name: "Pink", value: "pink", color: "bg-pink-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white">
      {/* Animated Background from Album Art */}
      {currentTrack && (
        <AnimatedBackground
          imageUrl={currentTrack.thumbnail}
          isPlaying={isPlaying}
        />
      )}

      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* Main Content */}
      <div className="pb-20">
        <Switch>
          <Route path={"/"} component={Home} />
          <Route path={"/library"} component={Library} />
          <Route path={"/history"} component={History} />
          <Route path={"/stats"} component={Stats} />
          <Route path={"/404"} component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </div>

      {/* Global Player - Persists across navigation */}
      <GlobalPlayer />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 border-t border-zinc-800 backdrop-blur-lg z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around py-3">
            <Button
              variant="ghost"
              className={`flex flex-col items-center gap-1 h-auto py-2 px-6 ${
                location === '/' ? 'text-purple-400' : 'text-zinc-400'
              }`}
              onClick={() => setLocation('/')}
            >
              <HomeIcon className="w-6 h-6" />
              <span className="text-xs">Home</span>
            </Button>
            <Button
              variant="ghost"
              className={`flex flex-col items-center gap-1 h-auto py-2 px-6 ${
                location === '/library' ? 'text-purple-400' : 'text-zinc-400'
              }`}
              onClick={() => setLocation('/library')}
            >
              <LibraryIcon className="w-6 h-6" />
              <span className="text-xs">Library</span>
            </Button>
            <Button
              variant="ghost"
              className={`flex flex-col items-center gap-1 h-auto py-2 px-6 ${
                location === '/history' ? 'text-purple-400' : 'text-zinc-400'
              }`}
              onClick={() => setLocation('/history')}
            >
              <Clock className="w-6 h-6" />
              <span className="text-xs">History</span>
            </Button>
            <Button
              variant="ghost"
              className={`flex flex-col items-center gap-1 h-auto py-2 px-6 ${
                location === '/stats' ? 'text-purple-400' : 'text-zinc-400'
              }`}
              onClick={() => setLocation('/stats')}
            >
              <BarChart3 className="w-6 h-6" />
              <span className="text-xs">Stats</span>
            </Button>

            {/* Theme Picker */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex flex-col items-center gap-1 h-auto py-2 px-4 text-zinc-400"
                >
                  <Palette className="w-6 h-6" />
                  <span className="text-xs">Theme</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                <DialogHeader>
                  <DialogTitle>Choose Theme</DialogTitle>
                  <DialogDescription className="text-zinc-400">
                    Select your preferred color theme
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {themeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setColorTheme(option.value)}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                        colorTheme === option.value
                          ? 'border-white bg-zinc-800'
                          : 'border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full ${option.color}`} />
                      <span className="font-medium">{option.name}</span>
                    </button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            {/* Keyboard Shortcuts Help */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex flex-col items-center gap-1 h-auto py-2 px-4 text-zinc-400"
                >
                  <Keyboard className="w-6 h-6" />
                  <span className="text-xs">Keys</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                <DialogHeader>
                  <DialogTitle>Keyboard Shortcuts</DialogTitle>
                  <DialogDescription className="text-zinc-400">
                    Use these shortcuts to control playback
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-300">Play / Pause</span>
                    <kbd className="px-2 py-1 text-xs bg-zinc-800 rounded border border-zinc-700">Space</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-300">Next Track</span>
                    <kbd className="px-2 py-1 text-xs bg-zinc-800 rounded border border-zinc-700">→</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-300">Previous Track</span>
                    <kbd className="px-2 py-1 text-xs bg-zinc-800 rounded border border-zinc-700">←</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-300">Volume Up</span>
                    <kbd className="px-2 py-1 text-xs bg-zinc-800 rounded border border-zinc-700">↑</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-300">Volume Down</span>
                    <kbd className="px-2 py-1 text-xs bg-zinc-800 rounded border border-zinc-700">↓</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-300">Toggle Mute</span>
                    <kbd className="px-2 py-1 text-xs bg-zinc-800 rounded border border-zinc-700">M</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-300">Focus Search</span>
                    <kbd className="px-2 py-1 text-xs bg-zinc-800 rounded border border-zinc-700">/</kbd>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </nav>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <PlayerProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </PlayerProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
