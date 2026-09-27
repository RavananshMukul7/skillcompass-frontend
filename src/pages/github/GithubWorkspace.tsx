import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { SvgIcon } from '../../components/icons/SvgIcon';
import GithubHero from '../../components/github/GithubHero';
import GithubSummary from '../../components/github/GithubSummary';
import RepositoryList from '../../components/github/RepositoryList';
import RepositoryDetails from '../../components/github/RepositoryDetails';
import GithubConnectionBenefits from '../../components/github/GithubConnectionBenefits';
import {
  ApiError,
  disconnectGithubConnection,
  formatCachedSyncTime,
  getCachedGithubRepositories,
  isGithubConnected,
  markGithubConnected,
  markGithubDisconnected,
  startGithubConnection,
  syncGithubRepositories,
  updateCachedGithubRepositories,
} from '../../api/github';
import {
  getAnalysisStatus,
  getRepositoryAnalysisRuns,
  startRepositoryAnalysis,
} from '../../api/analysis';
import type { Repository } from '../../types/github';
import './github-workspace.css';

type Filter = 'All' | 'Public' | 'Private' | 'Updated';

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ??
  'http://localhost:3000'
).replace(/\/+$/, '');

type GithubProfile = {
  name: string;
  avatarUrl: string;
};

type AuthMeResponse = {
  data?: {
    user?: {
      displayName?: unknown;
    };
  };
};

type GithubUserResponse = {
  name?: unknown;
  login?: unknown;
  avatar_url?: unknown;
};

function getInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return initials || 'SC';
}

export default function GithubWorkspace() {
  const cachedGithub = getCachedGithubRepositories();

  const [repositories, setRepositories] =
    useState<Repository[]>(
      cachedGithub.repositories,
    );

  const [selectedId, setSelectedId] =
    useState(
      cachedGithub.repositories[0]?.id ?? '',
    );

  const [query, setQuery] =
    useState('');

  const [filter, setFilter] =
    useState<Filter>('All');

  const [syncing, setSyncing] =
    useState(false);

  const [analyzingIds, setAnalyzingIds] =
    useState<Set<string>>(() => new Set());

  const [lastSynced, setLastSynced] =
    useState(
      formatCachedSyncTime(
        cachedGithub.lastSyncedAt,
      ),
    );

  const [toast, setToast] =
    useState('');

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  const [disconnectOpen, setDisconnectOpen] =
    useState(false);

  const [disconnecting, setDisconnecting] =
    useState(false);

  const [connected, setConnected] =
    useState(isGithubConnected());

  const [username, setUsername] =
    useState(
      cachedGithub.username ?? '',
    );

  const [profile, setProfile] =
    useState<GithubProfile>({
      name: '',
      avatarUrl: '',
    });

  const [avatarFailed, setAvatarFailed] =
    useState(false);

  const [focusMode, setFocusMode] =
    useState(false);

  const profileName =
    profile.name.trim() ||
    username.trim() ||
    'SkillCompass User';

  const profileInitials =
    getInitials(profileName);

  const profileAvatar =
    !avatarFailed
      ? profile.avatarUrl ||
        (
          username.trim()
            ? `https://github.com/${encodeURIComponent(username.trim())}.png?size=96`
            : ''
        )
      : '';

  const selected =
    repositories.find(
      repo => repo.id === selectedId,
    );

  const filtered = useMemo(() => {
    const normalized =
      query.trim().toLowerCase();

    let result =
      repositories.filter(repo => {
        const matchesQuery =
          !normalized ||
          [
            repo.name,
            repo.description,
            repo.language,
            ...repo.topics,
          ].some(value =>
            value
              .toLowerCase()
              .includes(normalized),
          );

        const matchesFilter =
          filter === 'All' ||
          (
            filter === 'Public' &&
            repo.visibility === 'Public'
          ) ||
          (
            filter === 'Private' &&
            repo.visibility === 'Private'
          ) ||
          (
            filter === 'Updated' &&
            repo.updatedHours <= 168
          );

        return (
          matchesQuery &&
          matchesFilter
        );
      });

    if (filter === 'Updated') {
      result = [...result].sort(
        (a, b) =>
          a.updatedHours -
          b.updatedHours,
      );
    }

    return result;
  }, [
    repositories,
    query,
    filter,
  ]);

  const notify = (
    message: string,
  ) => {
    setToast(message);

    window.setTimeout(
      () => setToast(''),
      2600,
    );
  };

  /*
   * Handle the OAuth callback redirect.
   *
   * The backend redirects to:
   * /github?github=connected
   *
   * We only mark the connection as active
   * here. We intentionally do NOT sync automatically.
   */
  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search,
      );

    const githubStatus =
      params.get('github');

    if (
      githubStatus === 'connected'
    ) {
      markGithubConnected();
      setConnected(true);

      /*
       * Remove the query parameter so
       * refreshing the page does not keep
       * replaying the callback state.
       */
      const cleanUrl =
        `${window.location.pathname}${
          window.location.hash
        }`;

      window.history.replaceState(
        {},
        document.title,
        cleanUrl,
      );

      notify(
        'GitHub connected. Click Sync to import your repositories.',
      );
    }

    if (
      githubStatus === 'error'
    ) {
      setConnected(false);

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname,
      );

      notify(
        'GitHub connection was not completed.',
      );
    }
  }, []);

  /*
   * Focus mode shortcut:
   * F toggles between Normal Mode
   * and Focus Mode.
   */
  useEffect(() => {
    const onKeyDown = (
      event: KeyboardEvent,
    ) => {
      const target =
        event.target as HTMLElement | null;

      const tagName =
        target?.tagName?.toLowerCase();

      if (
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        target?.isContentEditable
      ) {
        return;
      }

      if (
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      ) {
        return;
      }

      if (
        event.key.toLowerCase() === 'f'
      ) {
        event.preventDefault();

        setFocusMode(
          current => !current,
        );
      } else if (
        event.key === 'Escape'
      ) {
        setFocusMode(false);
      }
    };

    window.addEventListener(
      'keydown',
      onKeyDown,
    );

    return () =>
      window.removeEventListener(
        'keydown',
        onKeyDown,
      );
  }, []);

  /*
   * Load the real user identity for the top-right
   * profile control.
   *
   * The account name comes from the authenticated
   * SkillCompass session. When a GitHub username is
   * available, we also read the public GitHub profile
   * so the workspace can display the actual GitHub
   * avatar and profile name.
   *
   * This is read-only and does NOT connect or sync
   * GitHub automatically.
   */
  const loadProfile = async (
    githubUsername = username,
  ) => {
    let accountName = '';

    try {
      const response =
        await fetch(
          `${API_BASE_URL}/api/auth/me`,
          {
            credentials: 'include',
            headers: {
              Accept: 'application/json',
            },
          },
        );

      if (response.ok) {
        const payload =
          await response.json() as AuthMeResponse;

        if (
          typeof payload.data?.user?.displayName ===
          'string'
        ) {
          accountName =
            payload.data.user.displayName.trim();
        }
      }
    } catch {
      // GitHub identity below remains a valid fallback.
    }

    const normalizedGithubUsername =
      githubUsername.trim();

    if (normalizedGithubUsername) {
      try {
        const response =
          await fetch(
            `https://api.github.com/users/${encodeURIComponent(normalizedGithubUsername)}`,
            {
              headers: {
                Accept: 'application/vnd.github+json',
              },
            },
          );

        if (response.ok) {
          const githubUser =
            await response.json() as GithubUserResponse;

          const githubName =
            typeof githubUser.name === 'string'
              ? githubUser.name.trim()
              : '';

          const githubLogin =
            typeof githubUser.login === 'string'
              ? githubUser.login.trim()
              : normalizedGithubUsername;

          const githubAvatar =
            typeof githubUser.avatar_url === 'string'
              ? githubUser.avatar_url.trim()
              : '';

          setAvatarFailed(false);

          setProfile({
            name:
              githubName ||
              accountName ||
              githubLogin,
            avatarUrl: githubAvatar,
          });

          return;
        }
      } catch {
        // Fall back to the GitHub avatar URL and account name.
      }
    }

    setAvatarFailed(false);

    setProfile({
      name:
        accountName ||
        normalizedGithubUsername ||
        'SkillCompass User',
      avatarUrl: '',
    });
  };

  useEffect(() => {
    void loadProfile(
      cachedGithub.username ?? '',
    );
    // Profile loading is intentionally independent
    // from GitHub connection/sync actions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const performSync = async (
    showSuccess = true,
  ) => {
    if (syncing) return;

    setSyncing(true);

    try {
      const result =
        await syncGithubRepositories();

      /*
       * The sync endpoint returns the repositories discovered
       * during this GitHub connection. Repository ownership,
       * however, belongs to the SkillCompass user, not to the
       * currently connected GitHub account.
       *
       * Therefore, never replace the workspace repository list
       * with only the latest GitHub sync result. Merge the newly
       * synced repositories into the existing workspace list.
       *
       * GitHub repository IDs are globally unique, so using the
       * repository id as the merge key prevents duplicates when
       * the same repository is synced again.
       */
      setRepositories(current => {
        const merged = new Map(
          current.map(repository => [
            repository.id,
            repository,
          ]),
        );

        for (const repository of result.repositories) {
          merged.set(repository.id, repository);
        }

        const next = Array.from(merged.values());

        updateCachedGithubRepositories(next);

        return next;
      });

      setConnected(true);

      const syncedUsername =
        result.username ||
        username ||
        '';

      setUsername(
        syncedUsername ||
          'GitHub user',
      );

      if (syncedUsername) {
        void loadProfile(
          syncedUsername,
        );
      }

      setLastSynced(
        'just now',
      );

      setSelectedId(
        current =>
          result.repositories.some(
            repo => repo.id === current,
          )
            ? current
            : (
                result
                  .repositories[0]
                  ?.id ?? ''
              ),
      );

      if (showSuccess) {
        notify(
          result.repositories.length
            ? `Synced ${result.repositories.length} GitHub repositories.`
            : 'GitHub sync completed.',
        );
      }
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 401
      ) {
        setConnected(false);
        markGithubDisconnected();

        if (showSuccess) {
          notify(
            'GitHub connection is required. Connect GitHub to continue.',
          );
        }
      } else {
        if (showSuccess) {
          notify(
            error instanceof Error
              ? error.message
              : 'GitHub sync failed.',
          );
        }
      }
    } finally {
      setSyncing(false);
    }
  };

  const analyze = async (
    id: string,
  ) => {
    if (analyzingIds.has(id)) return;

    setAnalyzingIds(current => {
      const next = new Set(current);
      next.add(id);
      return next;
    });

    setRepositories(items => {
      const next =
        items.map(repo =>
          repo.id === id
            ? {
                ...repo,
                status:
                  'Analyzing' as const,
              }
            : repo,
        );

      updateCachedGithubRepositories(
        next,
      );

      return next;
    });

    try {
      let run;

      try {
        run =
          await startRepositoryAnalysis(
            id,
          );
      } catch (error) {
        /*
         * A previous run may still be
         * queued/running. Attach to that
         * run instead of creating a
         * duplicate.
         */
        if (
          !(
            error instanceof ApiError &&
            error.status === 409
          )
        ) {
          throw error;
        }

        const runs =
          await getRepositoryAnalysisRuns(
            id,
          );

        run = runs
          .filter(
            item =>
              item.status === 'QUEUED' ||
              item.status === 'RUNNING',
          )
          .sort((a, b) => {
            const aTime =
              new Date(
                a.createdAt ??
                  a.startedAt ??
                  0,
              ).getTime();

            const bTime =
              new Date(
                b.createdAt ??
                  b.startedAt ??
                  0,
              ).getTime();

            return bTime - aTime;
          })[0];

        if (!run) {
          throw error;
        }
      }

      let current = run;

      for (
        let attempt = 0;
        attempt < 30;
        attempt += 1
      ) {
        if (
          current.status ===
            'COMPLETED' ||
          current.status ===
            'FAILED' ||
          current.status ===
            'CANCELLED'
        ) {
          break;
        }

        await new Promise(
          resolve =>
            window.setTimeout(
              resolve,
              3000,
            ),
        );

        current =
          await getAnalysisStatus(
            run.id,
          );
      }

      if (
        current.status ===
        'COMPLETED'
      ) {
        setRepositories(items => {
          const next =
            items.map(repo =>
              repo.id === id
                ? {
                    ...repo,
                    status:
                      'Analyzed' as const,
                    analyzedAt:
                      current.completedAt ??
                      'just now',
                  }
                : repo,
            );

          updateCachedGithubRepositories(
            next,
          );

          return next;
        });

        notify(
          'Repository analysis completed. Skills are ready to review.',
        );
      } else if (
        current.status ===
        'FAILED'
      ) {
        setRepositories(items => {
          const next =
            items.map(repo =>
              repo.id === id
                ? {
                    ...repo,
                    status:
                      'Not Analyzed' as const,
                  }
                : repo,
            );

          updateCachedGithubRepositories(
            next,
          );

          return next;
        });

        notify(
          current.errorMessage ??
            'Repository analysis failed.',
        );
      } else if (
        current.status ===
        'CANCELLED'
      ) {
        setRepositories(items => {
          const next =
            items.map(repo =>
              repo.id === id
                ? {
                    ...repo,
                    status:
                      'Not Analyzed' as const,
                  }
                : repo,
            );

          updateCachedGithubRepositories(
            next,
          );

          return next;
        });

        notify(
          'Repository analysis was cancelled.',
        );
      } else {
        /*
         * Preserve an already completed
         * analysis when the new run did
         * not finish within the polling
         * window.
         */
        setRepositories(items => {
          const next =
            items.map(repo =>
              repo.id === id
                ? {
                    ...repo,
                    status:
                      repo.analyzedAt
                        ? 'Analyzed' as const
                        : 'Not Analyzed' as const,
                  }
                : repo,
            );

          updateCachedGithubRepositories(
            next,
          );

          return next;
        });

        notify(
          'Repository analysis did not complete. Check the analysis status.',
        );
      }
    } catch (error) {
      setRepositories(items => {
        const next =
          items.map(repo =>
            repo.id === id
              ? {
                  ...repo,
                  status:
                    repo.analyzedAt
                      ? 'Analyzed' as const
                      : 'Not Analyzed' as const,
                }
              : repo,
          );

        updateCachedGithubRepositories(
          next,
        );

        return next;
      });

      notify(
        error instanceof Error
          ? error.message
          : 'Repository analysis failed.',
      );
    } finally {
      setAnalyzingIds(current => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  };

  /*
   * REAL backend disconnect.
   *
   * Important:
   * We do not clear repositories.
   * We do not clear analysis history.
   * The backend detaches the GitHub
   * connection while preserving the
   * SkillCompass-owned repository data.
   */
  const disconnect = async () => {
    if (disconnecting) return;

    setDisconnecting(true);

    try {
      await disconnectGithubConnection();

      setDisconnectOpen(false);
      setConnected(false);

      /*
       * Keep the repositories visible.
       * They belong to the SkillCompass
       * workspace and are intentionally
       * preserved after disconnect.
       */
      setRepositories(
        current => current,
      );

      setUsername(
        '',
      );

      notify(
        'GitHub disconnected. Existing repositories and analysis remain available.',
      );
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : 'Unable to disconnect GitHub.',
      );
    } finally {
      setDisconnecting(false);
    }
  };

  const publicCount =
    repositories.filter(
      repo =>
        repo.visibility ===
        'Public',
    ).length;

  const privateCount =
    repositories.filter(
      repo =>
        repo.visibility ===
        'Private',
    ).length;

  const githubThemeStyle = {
    '--gh-bg':
      'var(--sc-bg)',

    '--gh-panel':
      'var(--sc-card)',

    '--gh-panel-soft':
      'var(--sc-card-soft)',

    '--gh-line':
      'var(--sc-line)',

    '--gh-text':
      'var(--sc-text)',

    '--gh-muted':
      'var(--sc-copy)',

    '--gh-dim':
      'var(--sc-dim)',

    '--gh-blue':
      'var(--sc-blue)',

    '--gh-cyan':
      'var(--sc-cyan)',

    '--gh-purple':
      'var(--sc-purple)',

    '--gh-mint':
      'var(--sc-mint)',
  } as CSSProperties;

  return (
    <main
      className="main-area github-workspace-page"
      style={githubThemeStyle}
    >
      <header className="gh-topbar gh-reveal">
        <div className="gh-account-actions">
          <div className="gh-popover-wrap">
            <button
              className="gh-icon-button"
              onClick={() => {
                setNotificationsOpen(
                  value => !value,
                );
                setProfileOpen(false);
              }}
              aria-label="Notifications"
            >
              <SvgIcon
                name="bell"
                size={23}
              />
              <i />
            </button>

            {notificationsOpen && (
              <div className="gh-popover gh-notification-pop">
                <strong>
                  Notifications
                </strong>

                <p>
                  {connected
                    ? 'Your GitHub workspace is connected.'
                    : repositories.length
                      ? 'GitHub is disconnected. Your saved repositories remain available.'
                      : 'Connect GitHub to start importing repositories.'}
                </p>

                <small>
                  {syncing
                    ? 'Repository synchronization is in progress.'
                    : connected
                      ? 'Sync when you want to import new GitHub changes.'
                      : 'Reconnect GitHub when you need to sync new changes.'}
                </small>
              </div>
            )}
          </div>

          <div className="gh-popover-wrap">
            <button
              className="gh-profile-button"
              onClick={() => {
                setProfileOpen(
                  value => !value,
                );
                setNotificationsOpen(
                  false,
                );
              }}
            >
              <span
                className="gh-avatar"
                aria-hidden="true"
              >
                {profileAvatar ? (
                  <img
                    className="gh-avatar-image"
                    src={profileAvatar}
                    alt=""
                    onError={() =>
                      setAvatarFailed(true)
                    }
                  />
                ) : (
                  profileInitials
                )}
              </span>

              <span className="gh-profile-copy">
                <strong
                  title={profileName}
                >
                  {profileName}
                </strong>

                <small
                  title={
                    username
                      ? `@${username}`
                      : 'SkillCompass account'
                  }
                >
                  {username
                    ? `@${username}`
                    : 'SkillCompass account'}
                </small>
              </span>

              <SvgIcon
                name="chevron"
                size={18}
              />
            </button>

            {profileOpen && (
              <div className="gh-popover gh-profile-pop">
                <button>
                  Profile
                </button>

                <button>
                  Workspace preferences
                </button>

                <button>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <GithubHero />

      <GithubSummary
        lastSynced={
          lastSynced
        }
        onSync={() =>
          void (
            connected
              ? performSync(true)
              : startGithubConnection()
          )
        }
        syncing={syncing}
        onDisconnect={() =>
          setDisconnectOpen(true)
        }
        onConnect={
          startGithubConnection
        }
        connected={connected}
        username={
          username ||
          'GitHub user'
        }
        repositoryCount={
          repositories.length
        }
        publicCount={
          publicCount
        }
        privateCount={
          privateCount
        }
      />

      <GithubConnectionBenefits />

      <div className="gh-focus-toolbar">
        <div className="gh-focus-control">
          <div className="gh-focus-copy">
            <strong>
              {focusMode
                ? 'Focus Mode'
                : 'Normal Mode'}
            </strong>

            <small>
              Press F to switch
            </small>
          </div>

          <button
            type="button"
            className={`gh-focus-switch ${
              focusMode
                ? 'is-active'
                : ''
            }`}
            onClick={() =>
              setFocusMode(
                current =>
                  !current,
              )
            }
            aria-pressed={
              focusMode
            }
            aria-label={`Switch to ${
              focusMode
                ? 'normal'
                : 'focus'
            } mode`}
            title="Toggle Focus Mode (F)"
          >
            <span className="gh-focus-thumb" />
          </button>
        </div>
      </div>

      <section
        className={`gh-workspace-grid ${
          focusMode
            ? 'gh-workspace-focus'
            : ''
        }`.trim()}
      >
        <RepositoryList
          repositories={filtered}
          selectedId={selectedId}
          query={query}
          filter={filter}
          onQuery={setQuery}
          onFilter={setFilter}
          onSelect={(
            repo: Repository,
          ) =>
            setSelectedId(
              repo.id,
            )
          }
        />

        {selected ? (
          <RepositoryDetails
            repository={selected}
            onAnalyze={analyze}
            analyzing={
              analyzingIds.has(selected.id)
            }
          />
        ) : (
          <section className="gh-panel gh-details-panel gh-reveal gh-delay-3 gh-empty-details">
            <div className="gh-empty">
              <SvgIcon
                name="github"
                size={28}
              />

              <strong>
                {repositories.length
                  ? 'No repository selected'
                  : connected
                    ? 'No repositories found'
                    : 'Connect GitHub to continue'}
              </strong>

              <span>
                {repositories.length
                  ? 'Choose a repository from the list to inspect it.'
                  : connected
                    ? 'Your GitHub account is connected, but no repositories were returned.'
                    : 'Use the Connect GitHub button above to fetch your repositories.'}
              </span>

              {!connected &&
                !repositories.length && (
                  <button
                    className="gh-primary-action"
                    onClick={
                      startGithubConnection
                    }
                  >
                    Connect GitHub
                  </button>
                )}
            </div>
          </section>
        )}
      </section>

      {disconnectOpen && (
        <div
          className="gh-modal-backdrop"
          onMouseDown={() =>
            !disconnecting &&
            setDisconnectOpen(
              false,
            )
          }
        >
          <div
            className="gh-modal"
            onMouseDown={event =>
              event.stopPropagation()
            }
          >
            <button
              className="gh-modal-close"
              onClick={() =>
                !disconnecting &&
                setDisconnectOpen(
                  false,
                )
              }
              disabled={
                disconnecting
              }
            >
              <SvgIcon
                name="x"
                size={18}
              />
            </button>

            <div className="gh-modal-icon">
              <SvgIcon
                name="link"
                size={25}
              />
            </div>

            <h3>
              Disconnect GitHub?
            </h3>

            <p>
              This disconnects GitHub
              syncing for this
              workspace. Your saved
              repositories, skills,
              and completed analyses
              remain available.
            </p>

            <div>
              <button
                className="gh-secondary-action"
                onClick={() =>
                  setDisconnectOpen(
                    false,
                  )
                }
                disabled={
                  disconnecting
                }
              >
                Cancel
              </button>

              <button
                className="gh-danger-action"
                onClick={() =>
                  void disconnect()
                }
                disabled={
                  disconnecting
                }
              >
                {disconnecting
                  ? 'Disconnecting...'
                  : 'Disconnect'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className="gh-toast"
          role="status"
        >
          <span>
            <SvgIcon
              name="check"
              size={16}
            />
          </span>

          {toast}
        </div>
      )}
    </main>
  );
}