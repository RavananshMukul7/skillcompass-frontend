import {
  useState,
  type CSSProperties,
  type FormEvent,
} from 'react';

import { navigate } from '../../router/appRouter';
import { useAuth } from '../../context/AuthContext';
import { SvgIcon } from '../../components/icons/SvgIcon';
import { api, ApiError } from '../../lib/api';

import './login.css';

function BrandLogo() {
  return (
    <button
      className="login-brand"
      type="button"
      onClick={() => navigate('/landing')}
    >
      <span className="login-brand-mark" aria-hidden="true">
        <svg
          width="34"
          height="34"
          viewBox="0 0 34 34"
          fill="none"
        >
          <defs>
            <linearGradient
              id="login-logo-gradient"
              x1="5"
              y1="5"
              x2="29"
              y2="30"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#D7F7FF" />
              <stop offset=".42" stopColor="#5DE5FF" />
              <stop offset="1" stopColor="#735CFF" />
            </linearGradient>
          </defs>

          <path
            d="M17 2.5 21 13l10.5 4-10.5 4L17 31.5 13 21 2.5 17 13 13 17 2.5Z"
            fill="url(#login-logo-gradient)"
          />

          <circle
            cx="17"
            cy="17"
            r="2.6"
            fill="#FFF"
          />
        </svg>
      </span>

      <span className="login-brand-copy">
        <strong>SkillCompass</strong>
        <small>Your Code. A Brighter Tomorrow.</small>
      </span>
    </button>
  );
}

type LoginResponse = {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      displayName: string | null;
    };
  };
};

export default function LoginPage() {
  const [showPassword, setShowPassword] =
    useState(false);

  const [remember, setRemember] =
    useState(true);

  const [error, setError] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const { refreshUser } = useAuth();

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError('');

    const form = new FormData(
      event.currentTarget,
    );

    const email = String(
      form.get('email') || '',
    ).trim();

    const password = String(
      form.get('password') || '',
    );

    if (!email) {
      setError(
        'Enter your email to continue.',
      );
      return;
    }

    if (!password) {
      setError(
        'Enter your password to continue.',
      );
      return;
    }

    try {
      setLoading(true);

      await api<LoginResponse>(
        '/api/auth/login',
        {
          method: 'POST',
          body: {
            email,
            password,
          },
        },
      );

      /*
       * The backend has created the session
       * and sent the HttpOnly session cookie.
       *
       * Refresh the React authentication state
       * before navigating to a protected page.
       */
      const authenticatedUser =
        await refreshUser();

      if (!authenticatedUser) {
        setError(
          'Login succeeded, but your authenticated session could not be verified.',
        );
        return;
      }

      navigate('/github');
    } catch (requestError) {
      if (
        requestError instanceof ApiError
      ) {
        setError(requestError.message);
      } else {
        setError(
          'Unable to connect to SkillCompass. Please try again.',
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <div
        className="login-grid"
        aria-hidden="true"
      />

      <div
        className="login-glow login-glow-one"
        aria-hidden="true"
      />

      <div
        className="login-glow login-glow-two"
        aria-hidden="true"
      />

      <div
        className="login-glow login-glow-three"
        aria-hidden="true"
      />

      <div
        className="login-orbit login-orbit-one"
        aria-hidden="true"
      />

      <div
        className="login-orbit login-orbit-two"
        aria-hidden="true"
      />

      <div
        className="login-particles"
        aria-hidden="true"
      >
        {Array.from(
          { length: 20 },
          (_, index) => (
            <i
              key={index}
              style={
                {
                  '--i': index,
                } as CSSProperties
              }
            />
          ),
        )}
      </div>

      <header className="login-header">
        <BrandLogo />

        <button
          className="login-back"
          type="button"
          onClick={() => navigate('/landing')}
        >
          <SvgIcon
            name="arrow"
            size={18}
            className="login-back-icon"
          />
          Back to website
        </button>
      </header>

      <section className="login-shell">
        <aside className="login-story">
          <div className="login-story-kicker">
            <span /> WELCOME BACK
          </div>

          <h1>
            Continue your
            <span> developer</span>
            <strong>journey.</strong>
          </h1>

          <p>
            Pick up where you left off. Your
            SkillCompass workspace turns your real
            project evidence into a clearer view of
            your technical strengths and career
            direction.
          </p>

          <div className="login-intelligence-card">
            <div className="login-intel-top">
              <span>
                <i /> INTELLIGENCE SNAPSHOT
              </span>
              <b>SYNCED</b>
            </div>

            <div className="login-intel-main">
              <div className="login-ring">
                <div>
                  <strong>87</strong>
                  <span>profile</span>
                </div>
              </div>

              <div className="login-intel-copy">
                <strong>
                  Your profile is waiting.
                </strong>

                <span>
                  Skills, projects and career signals
                  stay together in one workspace.
                </span>
              </div>
            </div>

            <div className="login-signal-row">
              <span>
                <b>24</b> skill signals
              </span>

              <span>
                <b>07</b> repositories
              </span>

              <span>
                <b>03</b> role matches
              </span>
            </div>
          </div>

          <div className="login-points">
            <span>
              <SvgIcon
                name="check"
                size={17}
              />
              Continue from your existing workspace
            </span>

            <span>
              <SvgIcon
                name="check"
                size={17}
              />
              Keep your project evidence connected
            </span>

            <span>
              <SvgIcon
                name="check"
                size={17}
              />
              Explore your next career move
            </span>
          </div>
        </aside>

        <section className="login-card">
          <div className="login-card-heading">
            <div className="login-card-icon">
              <SvgIcon
                name="sparkle"
                size={22}
              />
            </div>

            <div>
              <span>
                SKILLCOMPASS ACCOUNT
              </span>

              <h2>Sign in</h2>

              <p>
                Access your developer intelligence
                workspace.
              </p>
            </div>
          </div>

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >
            <label className="login-field">
              <span>Email</span>

              <div className="login-input-wrap">
                <SvgIcon
                  name="users"
                  size={19}
                />

                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            <label className="login-field">
              <div className="login-field-label-row">
                <span>Password</span>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      '/forgot-password',
                    )
                  }
                >
                  Forgot password?
                </button>
              </div>

              <div className="login-input-wrap">
                <SvgIcon
                  name="settings"
                  size={18}
                />

                <input
                  name="password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="login-visibility"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value,
                    )
                  }
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  <SvgIcon
                    name={
                      showPassword
                        ? 'x'
                        : 'help'
                    }
                    size={18}
                  />
                </button>
              </div>
            </label>

            <label className="login-remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) =>
                  setRemember(
                    event.target.checked,
                  )
                }
              />

              <span className="login-checkmark">
                <SvgIcon
                  name="check"
                  size={15}
                />
              </span>

              <span>
                Keep me signed in
              </span>
            </label>

            {error && (
              <div
                className="login-error"
                role="alert"
              >
                {error}
              </div>
            )}

            <button
              className="login-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? 'Signing in...'
                : 'Sign in to SkillCompass'}

              <SvgIcon
                name="arrow"
                size={20}
              />
            </button>
          </form>

          <div className="login-divider">
            <span>
              OR CONTINUE WITH
            </span>
          </div>

          <button
            className="login-github"
            type="button"
            onClick={() =>
              navigate('/github')
            }
          >
            <SvgIcon
              name="github"
              size={21}
            />
            Continue with GitHub
          </button>

          <div className="login-signup">
            <span>
              Don't have an account?
            </span>

            <button
              type="button"
              onClick={() =>
                navigate('/register')
              }
            >
              Create one
            </button>
          </div>

          <p className="login-note">
            By signing in, you agree to the
            SkillCompass terms and privacy policy.
          </p>
        </section>
      </section>

      <footer className="login-footer">
        <span>SKILLCOMPASS</span>
        <i />
        <span>AI CAREER INTELLIGENCE</span>
      </footer>
    </main>
  );
}