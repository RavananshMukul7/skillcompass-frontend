import { useEffect, useState } from 'react';

import { navigate } from '../../router/appRouter';
import { useAuth } from '../../context/AuthContext';
import { SvgIcon } from '../icons/SvgIcon';

type NavItem = {
  id: string;
  label: string;
  icon: string;
  path?: string;
};

const navItems: NavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: 'home',
    path: '/dashboard',
  },
  {
    id: 'github',
    label: 'GitHub',
    icon: 'github',
    path: '/github',
  },
  {
    id: 'skills',
    label: 'Skills',
    icon: 'layers',
    path: '/skills',
  },
  {
    id: 'analysis',
    label: 'Analysis',
    icon: 'chart',
    path: '/analysis',
  },
  {
    id: 'job-profiles',
    label: 'Job Profiles',
    icon: 'briefcase',
    path: '/job-profiles',
  },
  {
    id: 'job-recommendations',
    label: 'Recommendations',
    icon: 'target',
    path: '/job-recommendations',
  },
];

const settingsItems: NavItem[] = [
  {
    id: 'settings',
    label: 'Settings',
    icon: 'settings',
    path: '/settings',
  },
  {
    id: 'help',
    label: 'Help',
    icon: 'help',
    path: '/help',
  },
];

function getActiveId(path: string): string {
  if (
    path === '/github' ||
    path.startsWith('/github/')
  ) {
    return 'github';
  }

  if (
    path === '/analysis' ||
    path.startsWith('/analysis/') ||
    path === '/analysis-history'
  ) {
    return 'analysis';
  }

  if (
    path === '/skills' ||
    path.startsWith('/skills/')
  ) {
    return 'skills';
  }

  if (
    path === '/job-profiles' ||
    path.startsWith('/job-profiles/')
  ) {
    return 'job-profiles';
  }

  if (
    path === '/job-recommendations' ||
    path.startsWith('/job-recommendations/')
  ) {
    return 'job-recommendations';
  }

  if (
    path === '/settings' ||
    path.startsWith('/settings/')
  ) {
    return 'settings';
  }

  if (
    path === '/help' ||
    path.startsWith('/help/')
  ) {
    return 'help';
  }

  return 'overview';
}

function SkillCompassLogo({
  onClick,
  isCollapsed,
}: {
  onClick: () => void;
  isCollapsed: boolean;
}) {
  return (
    <button
      type="button"
      className="sidebar-logo-toggle"
      onClick={onClick}
      aria-label={
        isCollapsed
          ? 'Expand sidebar'
          : 'Collapse sidebar'
      }
      aria-expanded={!isCollapsed}
      title={
        isCollapsed
          ? 'Expand sidebar (B)'
          : 'Collapse sidebar (B)'
      }
    >
      <span
        className="sidebar-logo"
        aria-hidden="true"
      >
        <svg
          width="30"
          height="30"
          viewBox="0 0 30 30"
          fill="none"
          focusable="false"
        >
          <defs>
            <linearGradient
              id="sidebar-brand-gradient"
              x1="4"
              y1="4"
              x2="25"
              y2="27"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#BBD7FF" />
              <stop
                offset="0.45"
                stopColor="#5D9EFF"
              />
              <stop
                offset="1"
                stopColor="#2056CD"
              />
            </linearGradient>
          </defs>

          <path
            d="M15 2.7 18.7 11.3 27.2 15l-8.5 3.7L15 27.3l-3.7-8.6L2.8 15l8.5-3.7z"
            fill="url(#sidebar-brand-gradient)"
          />

          <circle
            cx="15"
            cy="15"
            r="2.4"
            fill="#FFF"
          />
        </svg>
      </span>
    </button>
  );
}

function LogoutIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H9" />
      <path d="M15 16l4-4-4-4" />
      <path d="M19 12H9" />
    </svg>
  );
}

export default function Sidebar({
  path,
}: {
  path: string;
}) {
  const [notice, setNotice] = useState('');
  const [loggingOut, setLoggingOut] =
    useState(false);
  const [isCollapsed, setIsCollapsed] =
    useState(false);

  const { logout } = useAuth();
  const active = getActiveId(path);

  const toggleSidebar = () => {
    setIsCollapsed((previous) => !previous);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;

      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable;

      if (isTyping) {
        return;
      }

      if (
        event.key === 'b' ||
        event.key === 'B'
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, []);

  const select = (item: NavItem) => {
    setNotice('');

    if (item.path) {
      navigate(item.path);
      return;
    }

    setNotice(
      `${item.label} is the next SkillCompass workspace.`,
    );
  };

  const handleLogout = async () => {
    if (loggingOut) {
      return;
    }

    setNotice('');
    setLoggingOut(true);

    try {
      await logout();
      navigate('/login');
    } catch {
      setNotice(
        'Unable to log out. Please try again.',
      );
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <aside
      className={`sidebar clay-card ${
        isCollapsed
          ? 'sidebar-collapsed'
          : 'sidebar-expanded'
      }`}
      style={{
        height: '100vh',
        minHeight: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        overflowY: 'hidden',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        flexShrink: 0,
      }}
      aria-label="SkillCompass sidebar"
    >
      <div className="sidebar-header">
        <div className="brand-lockup">
          <SkillCompassLogo
            onClick={toggleSidebar}
            isCollapsed={isCollapsed}
          />

          <div className="brand-copy">
            <div className="brand-name">
              SkillCompass
            </div>

            <div className="brand-tagline">
              Your Code. A Brighter Tomorrow.
            </div>
          </div>
        </div>
      </div>

      <nav
        className="nav-stack"
        aria-label="Primary navigation"
      >
        {navItems.map((item) => {
          const isActive =
            active === item.id;

          return (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${
                isActive ? 'active' : ''
              }`}
              aria-current={
                isActive
                  ? 'page'
                  : undefined
              }
              onClick={() => select(item)}
            >
              <span
                className="nav-icon"
                aria-hidden="true"
              >
                <SvgIcon
                  name={item.icon}
                  size={22}
                />
              </span>

              <span className="sidebar-nav-label">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-divider" />

      <nav
        className="nav-stack bottom-nav"
        aria-label="Secondary navigation"
      >
        {settingsItems.map((item) => {
          const isActive =
            active === item.id;

          return (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${
                isActive ? 'active' : ''
              }`}
              aria-current={
                isActive
                  ? 'page'
                  : undefined
              }
              onClick={() => select(item)}
            >
              <span
                className="nav-icon"
                aria-hidden="true"
              >
                <SvgIcon
                  name={item.icon}
                  size={21}
                />
              </span>

              <span className="sidebar-nav-label">
                {item.label}
              </span>
            </button>
          );
        })}

        <button
          type="button"
          className="nav-item logout-item"
          onClick={handleLogout}
          disabled={loggingOut}
          aria-label="Log out of SkillCompass"
        >
          <span
            className="nav-icon"
            aria-hidden="true"
          >
            <LogoutIcon />
          </span>

          <span className="sidebar-nav-label">
            {loggingOut
              ? 'Logging out...'
              : 'Logout'}
          </span>
        </button>
      </nav>

      <button
        type="button"
        className="build-card"
        style={{
          minHeight: '210px',
          height: '210px',
          flexShrink: 0,
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
        onClick={() =>
          setNotice(
            'Your next growth step is one analysis away.',
          )
        }
      >
        <div
          className="build-title"
          style={{
            position: 'relative',
            zIndex: 2,
          }}
        >
          Build Today
          <br />
          A Better You
        </div>

        <div
          className="build-copy"
          style={{
            position: 'relative',
            zIndex: 2,
          }}
        >
          Your skills have
          <br />
          more potential
          <br />
          than you think.
        </div>

        <div
          className="build-arrow"
          aria-hidden="true"
          style={{
            position: 'relative',
            zIndex: 3,
          }}
        >
          <SvgIcon
            name="arrow"
            size={23}
          />
        </div>

        <div
          className="build-orb orb-blue"
          aria-hidden="true"
        />

        <div
          className="build-orb orb-purple"
          aria-hidden="true"
        />

        <div
          className="build-orb orb-violet"
          aria-hidden="true"
        />
      </button>

      {notice && (
        <div
          className="sidebar-notice"
          role="status"
        >
          {notice}
        </div>
      )}
    </aside>
  );
}
