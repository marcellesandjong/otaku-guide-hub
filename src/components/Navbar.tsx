import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bookmark, Calendar, Home, Library, Menu, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWatchlistContext } from '@/context/WatchlistContext';

const navLinks = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/browse', label: 'Browse', icon: Library },
  { to: '/schedule', label: 'Schedule', icon: Calendar },
  { to: '/watchlist', label: 'Watchlist', icon: Bookmark },
];

export function Navbar() {
  const location = useLocation();
  const { watchlist } = useWatchlistContext();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <header className="sticky top-0 z-50 w-full bg-card/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src="/logo.png"
            alt="Anime Plug"
            className="w-9 h-9 rounded-xl object-cover shadow-glow group-hover:scale-105 transition-transform duration-300"
          />
          <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent hidden sm:block">
            Anime Plug
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}>
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center gap-2 transition-all duration-200 ${
                  isActive(to)
                    ? 'bg-primary/10 text-primary hover:bg-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {to === '/watchlist' && watchlist.length > 0 && (
                  <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {watchlist.length}
                  </span>
                )}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-card/95 backdrop-blur-md border-b border-border/50 px-4 pb-4">
          <nav className="flex flex-col gap-1 pt-2">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setMobileOpen(false)}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-3 ${
                    isActive(to)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  {to === '/watchlist' && watchlist.length > 0 && (
                    <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {watchlist.length}
                    </span>
                  )}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
