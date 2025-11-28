import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PlayerProvider } from "./contexts/PlayerContext";
import { GlobalPlayer } from "./components/GlobalPlayer";
import Home from "./pages/Home";
import Library from "./pages/Library";
import { Button } from "./components/ui/button";
import { Home as HomeIcon, Library as LibraryIcon } from "lucide-react";

function Router() {
  const [location, setLocation] = useLocation();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white">
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
