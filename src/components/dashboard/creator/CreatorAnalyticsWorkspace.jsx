'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'sonner';
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Crown,
  LockKeyhole,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API } from '@/legacy_pages/dashboard/shared';
import styles from './CreatorWorkspace.module.css';

export default function CreatorAnalyticsWorkspace() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    let active = true;
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    Promise.allSettled([
      axios.get(`${API}/analytics/dashboard`, { headers }),
      axios.get(`${API}/creators/profile`, { headers }),
    ]).then(([analyticsResult, profileResult]) => {
      if (!active) return;
      if (analyticsResult.status === 'fulfilled') setData(analyticsResult.value.data);
      if (profileResult.status === 'fulfilled') setHasAccess(Boolean(profileResult.value.data?.analytics_active));
      setLoading(false);
    });
    return () => { active = false; };
  }, [token]);

  async function activateAnalytics() {
    setActivating(true);
    try {
      await axios.post(
        `${API}/analytics/subscribe`,
        { credits: 10 },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
      );
      setHasAccess(true);
      toast.success('Creator analytics activated.');
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'You need more credits to activate analytics.');
    } finally {
      setActivating(false);
    }
  }

  const metrics = [
    { icon: BriefcaseBusiness, label: 'Applied', value: data?.total_applied || 0, note: 'Briefs entered' },
    { icon: Users, label: 'Shortlisted', value: data?.total_shortlisted || 0, note: 'Made the cut' },
    { icon: Target, label: 'Hired', value: data?.total_hired || 0, note: 'Work won' },
    { icon: TrendingUp, label: 'Hire rate', value: `${data?.hire_rate || 0}%`, note: 'Pitch conversion' },
    { icon: Star, label: 'Avg. rating', value: data?.avg_rating || '0.0', note: `${data?.total_reviews || 0} reviews` },
  ];

  if (loading) {
    return <div className={styles.pageLoader}><span /><span /><span /></div>;
  }

  if (!hasAccess) {
    return (
      <div className={styles.page} data-testid="analytics-locked">
        <header className={styles.pageHeader}>
          <div className={styles.headingGroup}><span className={styles.kicker}>Performance studio</span><h1>Creator analytics</h1><p>Understand which applications, niches, and profile signals are converting into real work.</p></div>
        </header>
        <section className={styles.analyticsLock}>
          <div className={styles.lockCopy}>
            <span className={styles.lockIcon}><LockKeyhole /></span>
            <span className={styles.kicker}>Private performance layer</span>
            <h2>See what is earning attention, not just what is getting views.</h2>
            <p>Track shortlist rate, hiring conversion, review momentum, and the strength of your creator profile from one focused workspace.</p>
            <button type="button" onClick={activateAnalytics} disabled={activating} data-testid="activate-analytics-btn"><Zap /> {activating ? 'Activating...' : 'Activate for 10 credits'} <ArrowRight /></button>
          </div>
          <div className={styles.lockPreview} aria-hidden="true">
            <div className={styles.previewHeader}><span>Conversion signal</span><TrendingUp /></div>
            <strong>24%</strong>
            <p>Applications becoming paid work</p>
            <div className={styles.previewBars}><i style={{ width: '92%' }} /><i style={{ width: '68%' }} /><i style={{ width: '44%' }} /><i style={{ width: '24%' }} /></div>
            <div className={styles.previewFoot}><span>Applied</span><span>Shortlisted</span><span>Hired</span></div>
          </div>
        </section>
        <section className={styles.unlockStrip}><Crown /><div><strong>Built for working creators.</strong><p>Analytics remains private to your account and updates with your pipeline.</p></div><Link href="/pricing">Compare plans</Link></section>
      </div>
    );
  }

  const maxFunnel = Math.max(Number(data?.total_applied || 0), 1);
  const funnel = [
    { label: 'Applied', value: Number(data?.total_applied || 0) },
    { label: 'Shortlisted', value: Number(data?.total_shortlisted || 0) },
    { label: 'Hired', value: Number(data?.total_hired || 0) },
  ];

  return (
    <div className={styles.page} data-testid="creator-analytics-workspace">
      <header className={styles.pageHeader}>
        <div className={styles.headingGroup}><span className={styles.kicker}>Performance studio</span><h1>Creator analytics</h1><p>Read the signal behind your applications and use it to choose the next brief with more confidence.</p></div>
        <Link href="/dashboard/influencer/applications" className={styles.secondaryButton}><BriefcaseBusiness /> View pipeline</Link>
      </header>

      <section className={styles.analyticsMetrics}>
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return <div key={metric.label} className={index === 3 ? styles.analyticsMetricAccent : ''}><span><Icon /></span><small>{metric.label}</small><strong>{metric.value}</strong><p>{metric.note}</p></div>;
        })}
      </section>

      <div className={styles.analyticsGrid}>
        <section className={styles.funnelPanel}>
          <header><div><span className={styles.kicker}>Application funnel</span><h2>How attention becomes work</h2></div><BarChart3 /></header>
          <div className={styles.funnelRows}>
            {funnel.map((stage, index) => (
              <div key={stage.label}><span>{String(index + 1).padStart(2, '0')}</span><strong>{stage.label}</strong><div><i style={{ width: `${Math.max((stage.value / maxFunnel) * 100, stage.value ? 8 : 0)}%` }} /></div><b>{stage.value}</b></div>
            ))}
          </div>
        </section>
        <section className={styles.insightPanel}>
          <span className={styles.kicker}><Sparkles /> Current signal</span>
          <h2>{Number(data?.hire_rate || 0) >= 20 ? 'Your application quality is converting.' : 'A tighter fit can lift your conversion.'}</h2>
          <p>{Number(data?.hire_rate || 0) >= 20 ? 'Keep leading with work that matches the brief and make your availability explicit.' : 'Prioritize briefs that match your strongest niche and put the most relevant proof first.'}</p>
          <Link href="/jobs">Find a matched brief <ArrowRight /></Link>
        </section>
      </div>
    </div>
  );
}
