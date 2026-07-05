import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Building2, Inbox, LayoutDashboard, LogOut, Menu, Moon, ShieldCheck, Sun, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { loggedOut } from '@/features/auth/authSlice';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme/useTheme';
import { cn } from '@/lib/utils';

const nav = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/tenants', label: 'Tenants', icon: Building2, end: false },
  { to: '/requests', label: 'Upgrade requests', icon: Inbox, end: false },
];

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <ShieldCheck className="h-5 w-5 text-primary" />
      <div>
        <p className="text-sm font-semibold leading-tight">MediPOS</p>
        <p className="text-xs text-muted-foreground">Owner Console</p>
      </div>
    </div>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-1 p-2">
      {nav.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )
          }
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export function AppLayout() {
  const dispatch = useAppDispatch();
  const email = useAppSelector((s) => s.auth.email);
  const { theme, toggle } = useTheme();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  // Safety net: close the drawer on any route change (incl. back/forward).
  useEffect(() => setMobileNavOpen(false), [location.pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileNavOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileNavOpen]);

  return (
    // h-screen + overflow-hidden pins the shell; only <main> scrolls, so the
    // sidebar and topbar stay put on long pages.
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="hidden w-56 shrink-0 overflow-y-auto border-r bg-card md:flex md:flex-col">
        {/* Same h-14 as the topbar so the two bottom borders align. */}
        <div className="flex h-14 shrink-0 items-center border-b px-4">
          <Brand />
        </div>
        <NavLinks />
      </aside>

      {/* Mobile nav drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            className="absolute left-0 top-0 flex h-full w-64 flex-col border-r bg-card shadow-lg duration-200 animate-in slide-in-from-left"
          >
            <div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
              <Brand />
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-sm opacity-70 transition-opacity hover:opacity-100"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-4">
          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <p className="text-sm font-medium">Owner Console</p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <span className="hidden text-sm text-muted-foreground sm:inline">{email}</span>
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => dispatch(loggedOut())}>
              <LogOut className="mr-1 h-4 w-4" /> Sign out
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
