import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PlayerProvider } from "./contexts/PlayerContext";
import { GlobalPlayer } from "./components/GlobalPlayer";
import { OfflineIndicator } from "./components/OfflineIndicator";
import Home from "./pages/Home";
import Library from "./pages/Library";
import { Button } from "./components/ui/button";
import { Home as HomeIcon, Library as LibraryIcon, Keyboard } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";

function Router() {
  const [location, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white">
      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* Main Content */}
      <div className="pb-20">
        <Switch>
          <Route path={"/"} component={Home} />
          <Route path={"/library"} component={Library} />
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

            {/* Keyboard Shortcuts Help */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex flex-col items-center gap-1 h-auto py-2 px-6 text-zinc-400"
                >
                  <Keyboard className="w-6 h-6" />
                  <span className="text-xs">Shortcuts</span>
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
