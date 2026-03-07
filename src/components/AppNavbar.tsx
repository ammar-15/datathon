import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/calc', label: 'Calc' },
];

export function AppNavbar() {
  return (
    <header className="app-navbar">
      <div className="app-navbar__inner">
        <NavLink to="/" end className="app-navbar__brand">
          LiverScope
        </NavLink>

        <nav className="app-navbar__links" aria-label="Primary">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `app-navbar__link ${isActive ? 'app-navbar__link--active' : ''}`
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
