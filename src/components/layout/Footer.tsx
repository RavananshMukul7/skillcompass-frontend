import { navigate } from '../../router/appRouter';
import { SvgIcon } from '../icons/SvgIcon';
import '../../footer.css';

function SkillCompassMark() {
  return (
    <span className="sc-footer-mark" aria-hidden="true">
      <svg width="38" height="38" viewBox="0 0 38 38" fill="none" focusable="false">
        <defs>
          <linearGradient id="footer-brand-gradient" x1="5" y1="5" x2="33" y2="34" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D9E8FF" />
            <stop offset="0.42" stopColor="#70B4FF" />
            <stop offset="1" stopColor="#2858D7" />
          </linearGradient>
        </defs>
        <path d="M19 3.4 23.7 14.3 34.6 19l-10.9 4.7L19 34.6l-4.7-10.9L3.4 19l10.9-4.7z" fill="url(#footer-brand-gradient)" />
        <circle cx="19" cy="19" r="3" fill="#FFF" />
      </svg>
    </span>
  );
}

function go(path: string) {
  navigate(path);
}

export default function Footer() {
  return (
    <footer className="sc-footer" aria-label="SkillCompass footer">
      <div className="sc-footer-glow sc-footer-glow-one" aria-hidden="true" />
      <div className="sc-footer-glow sc-footer-glow-two" aria-hidden="true" />
      <div className="sc-footer-grid" aria-hidden="true" />

      <div className="sc-footer-inner">
        <div className="sc-footer-brand">
          <button
            type="button"
            className="sc-footer-brand-button"
            onClick={() => go('/dashboard')}
            aria-label="Go to SkillCompass dashboard"
          >
            <SkillCompassMark />
            <span>
              <strong>SkillCompass</strong>
              <small>Your Code. A Brighter Tomorrow.</small>
            </span>
          </button>

          <p>
            Turn the work you have already created into clearer skills,
            stronger signals, and a more informed career direction.
          </p>

          <div className="sc-footer-socials" aria-label="SkillCompass links">
            <button
              type="button"
              className="sc-footer-social"
              onClick={() => go('/github')}
              aria-label="Open GitHub workspace"
              title="GitHub workspace"
            >
              <SvgIcon name="github" size={18} />
            </button>

            <button
              type="button"
              className="sc-footer-social"
              onClick={() => go('/help')}
              aria-label="Open SkillCompass help"
              title="Help"
            >
              <SvgIcon name="help" size={18} />
            </button>

            <button
              type="button"
              className="sc-footer-social"
              onClick={() => go('/settings')}
              aria-label="Open SkillCompass settings"
              title="Settings"
            >
              <SvgIcon name="settings" size={18} />
            </button>
          </div>
        </div>

        <nav className="sc-footer-column" aria-label="Platform links">
          <span className="sc-footer-heading">PLATFORM</span>

          <button type="button" onClick={() => go('/dashboard')}>
            Overview
          </button>

          <button type="button" onClick={() => go('/github')}>
            GitHub Workspace
          </button>

          <button type="button" onClick={() => go('/skills')}>
            Skills
          </button>

          <button type="button" onClick={() => go('/analysis')}>
            Analysis
          </button>

          <button type="button" onClick={() => go('/job-recommendations')}>
            Recommendations
          </button>
        </nav>

        <nav className="sc-footer-column" aria-label="Explore links">
          <span className="sc-footer-heading">EXPLORE</span>

          <button type="button" onClick={() => go('/job-profiles')}>
            Job Profiles
          </button>

          <button type="button" onClick={() => go('/analysis')}>
            Skill Intelligence
          </button>

          <button type="button" onClick={() => go('/github')}>
            Repository Evidence
          </button>

          <button type="button" onClick={() => go('/help')}>
            Help Center
          </button>

          <button type="button" onClick={() => go('/settings')}>
            Settings
          </button>
        </nav>

        <div className="sc-footer-column sc-footer-cta-column">
          <span className="sc-footer-heading">KEEP MOVING</span>

          <div className="sc-footer-mini-card">
            <span className="sc-footer-mini-icon">
              <SvgIcon name="sparkle" size={17} />
            </span>

            <div>
              <strong>Build with evidence.</strong>
              <span>Let your projects show what you can do.</span>
            </div>
          </div>

          <button
            type="button"
            className="sc-footer-arrow-link"
            onClick={() => go('/github')}
          >
            Open your workspace
            <span>
              <SvgIcon name="arrow" size={17} />
            </span>
          </button>
        </div>
      </div>

      <div className="sc-footer-bottom">
        <span>© 2026 SkillCompass. Built for clearer career direction.</span>

        <div className="sc-footer-bottom-links">
          <button type="button" onClick={() => go('/help')}>
            Privacy
          </button>

          <i aria-hidden="true" />

          <button type="button" onClick={() => go('/help')}>
            Terms
          </button>

          <i aria-hidden="true" />

          <button type="button" onClick={() => go('/help')}>
            Support
          </button>
        </div>
      </div>
    </footer>
  );
}
