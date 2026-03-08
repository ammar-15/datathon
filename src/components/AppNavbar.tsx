import { NavLink } from 'react-router-dom';
import { cn } from '../lib/ui';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/calc', label: 'Calc' },
];

export function AppNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-[color:var(--nav-bg)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <NavLink to="/" end className="flex min-w-0 flex-col">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Clinical Analytics
          </span>
          <span className="mt-1 text-base font-semibold tracking-[-0.03em] text-[var(--text-main)]">
            LiverScope
          </span>
        </NavLink>

        <nav className="flex items-center gap-2" aria-label="Primary">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'inline-flex h-10 items-center rounded-lg border px-3.5 text-sm font-medium transition',
                  isActive
                    ? 'border-[var(--border-contrast)] bg-[var(--surface-strong)] text-[var(--text-main)]'
                    : 'border-transparent text-[var(--text-soft)] hover:border-[var(--border-subtle)] hover:bg-[var(--surface)] hover:text-[var(--text-main)]',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
