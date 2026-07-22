'use client';

import Link from 'next/link';
import { ArrowRight, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import JobfluencerLogo from '@/components/brand/JobfluencerLogo';
import styles from './JobsWorkspace.module.css';

export default function OpportunityNavigation({ active = 'jobs' }) {
  const { user } = useAuth();
  const dashboardPath = user?.role === 'brand' ? '/dashboard/brand' : '/dashboard/influencer';

  return (
    <header className={styles.publicHeader} data-testid="main-header">
      <div className={styles.publicNavInner}>
        <Link href="/" className={styles.publicLogo} data-testid="header-logo" aria-label="Jobfluencer home">
          <JobfluencerLogo theme="light" />
        </Link>
        <nav className={styles.publicLinks} aria-label="Public navigation">
          <Link href="/jobs" className={active === 'jobs' ? styles.publicLinkActive : ''} data-testid="nav-jobs-link">Jobs</Link>
          <Link href="/influencers" className={active === 'creators' ? styles.publicLinkActive : ''} data-testid="nav-influencers-link">Creators</Link>
          <Link href="/pricing" className={active === 'pricing' ? styles.publicLinkActive : ''} data-testid="nav-pricing-link">Pricing</Link>
        </nav>
        <div className={styles.publicActions}>
          {user ? (
            <Link href={dashboardPath} className={styles.dashboardAction}><LayoutDashboard /><span>{user.role === 'brand' ? 'Hirer dashboard' : 'Creator studio'}</span></Link>
          ) : (
            <>
              <Link href="/login" className={styles.signInAction} data-testid="header-login-btn">Sign in</Link>
              <Link href="/register" className={styles.joinAction}>Join Jobfluencer <ArrowRight /></Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
