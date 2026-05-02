import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WatchlistProvider } from '@/context/WatchlistContext';
import { Navbar } from '@/components/Navbar';
import Index from './pages/Index';
import BrowsePage from './pages/BrowsePage';
import SchedulePage from './pages/SchedulePage';
import WatchlistPage from './pages/WatchlistPage';
import AnimeDetailPage from './pages/AnimeDetailPage';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WatchlistProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/browse" element={<BrowsePage />} />
                <Route path="/schedule" element={<SchedulePage />} />
                <Route path="/watchlist" element={<WatchlistPage />} />
                <Route path="/anime/:id" element={<AnimeDetailPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </WatchlistProvider>
  </QueryClientProvider>
);

export default App;
