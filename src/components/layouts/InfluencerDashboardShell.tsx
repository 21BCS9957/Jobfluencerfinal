'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import axios from 'axios';
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircleUserRound,
  Crown,
  FolderKanban,
  Home,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  WalletCards,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API } from '@/legacy_pages/dashboard/shared';
import JobfluencerLogo from '@/components/brand/JobfluencerLogo';
import styles from './BrandDashboardShell.module.css';

type Notification = {
  id: string | number;
  title?: string;
  message?: string;
  read?: boolean;
  created_at?: string;
};

type NavItem = {
  href: string;
  label: string;
  icon: typeof Home;
  exact?: boolean;
};

type CreatorDashboardAuth = {
  user: { name?: string; display_name?: string } | null;
  loading: boolean;
  token: string | null;
  subscription: { plan?: string } | null;
};

const primaryNavigation: NavItem[] = [
  { href: '/dashboard/influencer', label: 'Overview', icon: Home, exact: true },
  { href: '/dashboard/influencer/applications', label: 'Applications', icon: BriefcaseBusiness },
  { href: '/dashboard/influencer/my-jobs', label: 'My work', icon: FolderKanban },
  { href: '/dashboard/influencer/messages', label: 'Messages', icon: MessageSquare },
];

const secondaryNavigation: NavItem[] = [
  { href: '/dashboard/influencer/portfolio', label: 'Portfolio', icon: Sparkles },
  { href: '/dashboard/influencer/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/influencer/profile', label: 'Creator profile', icon: CircleUserRound },
];

const mobileNavigation = [
  primaryNavigation[0],
  primaryNavigation[1],
  primaryNavigation[3],
  secondaryNavigation[0],
  secondaryNavigation[2],
];

function isRouteActive(pathname: string, item: NavItem) {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

function getPageLabel(pathname: string) {
  const active = [...primaryNavigation, ...secondaryNavigation].find((item) =>
    isRouteActive(pathname, item),
  );
  if (pathname.includes('/edit-profile')) return 'Edit creator profile';
  return active?.label || 'Creator studio';
}

function timeAgo(date?: string) {
  if (!date) return '';
  const seconds = Math.max(0, (Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function InfluencerDashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, loading, token, subscription } = useAuth() as CreatorDashboardAuth;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    async function fetchNotifications() {
      try {
        const response = await axios.get(`${API}/notifications`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!active) return;
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unread_count || 0);
      } catch {
        if (active) {
          setNotifications([]);
          setUnreadCount(0);
        }
      }
    }

    fetchNotifications();
    const interval = window.setInterval(fetchNotifications, 30000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [token]);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  async function markAllRead() {
    try {
      await axios.put(
        `${API}/notifications/read-all`,
        {},
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
      );
      setNotifications((items) => items.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
    } catch {
      // Leave the current unread state in place when the request fails.
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <JobfluencerLogo theme="dark" compact />
        <div className={styles.loadingBar} />
      </div>
    );
  }

  const displayName = user?.display_name || user?.name || 'Your studio';
  const initials = displayName
    .split(' ')
    .map((part: string) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const plan = subscription?.plan || 'Free';

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.brand} aria-label="Jobfluencer home">
          <JobfluencerLogo theme="dark" />
        </Link>

        <div className={styles.workspaceLabel}>Creator studio</div>
        <nav className={styles.sidebarNavigation} aria-label="Creator dashboard">
          {primaryNavigation.map((item) => {
            const Icon = item.icon;
            const active = isRouteActive(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
              >
                <Icon aria-hidden="true" />
                <span>{item.label}</span>
                {active && <ChevronRight className={styles.navChevron} aria-hidden="true" />}
              </Link>
            );
          })}
        </nav>

        <div className={styles.navDivider} />
        <nav className={styles.sidebarNavigation} aria-label="Creator tools">
          {secondaryNavigation.map((item) => {
            const Icon = item.icon;
            const active = isRouteActive(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
              >
                <Icon aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/pricing" className={styles.planCard}>
            <span className={styles.planIcon}><Crown aria-hidden="true" /></span>
            <span>
              <small>{plan} plan</small>
              <strong>Grow your studio</strong>
            </span>
            <ChevronRight aria-hidden="true" />
          </Link>
          <Link href="/dashboard/influencer/profile" className={styles.profileLink}>
            <span className={styles.avatar}>{initials || 'JF'}</span>
            <span className={styles.profileText}>
              <strong>{displayName}</strong>
              <small>View profile</small>
            </span>
            <ChevronRight aria-hidden="true" />
          </Link>
        </div>
      </aside>

      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <Link href="/" className={styles.mobileBrand} aria-label="Jobfluencer home">
            <JobfluencerLogo theme="light" />
          </Link>
          <div className={styles.pageContext}>
            <small>Dashboard</small>
            <strong>{getPageLabel(pathname)}</strong>
          </div>

          <div className={styles.topbarActions}>
            <Link href="/jobs" className={styles.searchAction} aria-label="Browse briefs" title="Browse briefs">
              <Search aria-hidden="true" />
              <span>Browse briefs</span>
            </Link>
            <Link href="/dashboard/influencer/portfolio" className={styles.createAction}>
              <Plus aria-hidden="true" />
              <span>Add work</span>
            </Link>

            <div className={styles.notificationWrap} ref={notificationsRef}>
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => setNotificationsOpen((open) => !open)}
                aria-label="Notifications"
                title="Notifications"
                aria-expanded={notificationsOpen}
              >
                <Bell aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className={styles.unreadBadge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>

              {notificationsOpen && (
                <div className={styles.notificationPanel}>
                  <div className={styles.notificationHeader}>
                    <div>
                      <small>Studio pulse</small>
                      <strong>Notifications</strong>
                    </div>
                    {unreadCount > 0 && (
                      <button type="button" onClick={markAllRead}>
                        <Check aria-hidden="true" /> Mark read
                      </button>
                    )}
                  </div>
                  <div className={styles.notificationList}>
                    {notifications.length > 0 ? (
                      notifications.slice(0, 8).map((notification) => (
                        <div
                          key={notification.id}
                          className={`${styles.notificationItem} ${notification.read ? '' : styles.notificationUnread}`}
                        >
                          <span className={styles.notificationDot} />
                          <div>
                            <strong>{notification.title || 'New update'}</strong>
                            <p>{notification.message || 'There is new activity in your creator studio.'}</p>
                            <small>{timeAgo(notification.created_at)}</small>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={styles.notificationEmpty}>
                        <Sparkles aria-hidden="true" />
                        <strong>You are all caught up</strong>
                        <p>Brief, invite, and collaboration updates will appear here.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link href="/buy-credits" className={styles.walletButton} aria-label="Credits and wallet" title="Credits and wallet">
              <WalletCards aria-hidden="true" />
            </Link>
            <Link href="/dashboard/influencer/profile" className={styles.mobileAvatar}>
              {initials || 'JF'}
            </Link>
          </div>
        </header>

        <main className={styles.main}>{children}</main>
      </div>

      <nav className={styles.mobileNavigation} aria-label="Mobile creator dashboard">
        {mobileNavigation.map((item) => {
          const Icon = item.icon;
          const active = isRouteActive(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.mobileNavLink} ${active ? styles.mobileNavLinkActive : ''}`}
            >
              <Icon aria-hidden="true" />
              <span>{item.label === 'Creator profile' ? 'Profile' : item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
