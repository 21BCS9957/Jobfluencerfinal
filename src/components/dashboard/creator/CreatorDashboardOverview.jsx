'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'sonner';
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  MapPin,
  Search,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API, CITIES } from '@/legacy_pages/dashboard/shared';
import styles from './CreatorDashboardOverview.module.css';

function listFrom(payload, key) {
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload?.[key]) ? payload[key] : [];
}

function formatMoney(value) {
  if (value === undefined || value === null || value === '') return 'Open budget';
  return `Rs.${Number(value).toLocaleString('en-IN')}`;
}

function formatDeadline(value) {
  if (!value) return 'Flexible';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function profileReadiness(profile) {
  if (!profile) return 0;
  const checks = [
    profile.display_name,
    profile.bio,
    profile.category,
    profile.city,
    profile.profile_image_url,
    profile.niches?.length,
    profile.platforms?.length,
    profile.followers_count,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export default function CreatorDashboardOverview() {
  const { user, token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [invites, setInvites] = useState([]);
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  useEffect(() => {
    let active = true;
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    async function fetchDashboard() {
      const requests = [
        axios.get(`${API}/jobs`),
        axios.get(`${API}/invites/received`, { headers }),
        axios.get(`${API}/applications/my`, { headers }),
        axios.get(`${API}/creators/${user?.id}`, { headers }),
        axios.get(`${API}/analytics/dashboard`, { headers }),
      ];
      const [jobsResult, invitesResult, appsResult, profileResult, analyticsResult] = await Promise.allSettled(requests);
      if (!active) return;

      if (jobsResult.status === 'fulfilled') setJobs(listFrom(jobsResult.value.data, 'campaigns'));
      if (invitesResult.status === 'fulfilled') setInvites(listFrom(invitesResult.value.data, 'invites'));
      if (appsResult.status === 'fulfilled') setApplications(listFrom(appsResult.value.data, 'applications'));
      if (profileResult.status === 'fulfilled') setProfile(profileResult.value.data?.creator || profileResult.value.data);
      if (analyticsResult.status === 'fulfilled') setAnalytics(analyticsResult.value.data);
      setLoading(false);
    }

    fetchDashboard();
    return () => { active = false; };
  }, [token, user?.id]);

  const pendingInvites = useMemo(() => invites.filter((invite) => invite.status === 'pending'), [invites]);
  const filteredJobs = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    return jobs.filter((job) => {
      const copy = `${job.title || ''} ${job.category || ''} ${job.niche || ''} ${job.brand_name || ''}`.toLowerCase();
      const open = !job.status || job.status === 'active' || job.status === 'open';
      return open && (!needle || copy.includes(needle)) && (!cityFilter || job.city === cityFilter);
    });
  }, [cityFilter, jobs, searchQuery]);

  const firstName = (profile?.display_name || user?.name || 'Creator').split(' ')[0];
  const readiness = profileReadiness(profile);
  const hiredCount = applications.filter((application) => application.status === 'hired').length;
  const shortlistedCount = applications.filter((application) => application.status === 'shortlisted').length;
  const rating = Number(profile?.avg_rating || analytics?.avg_rating || 0).toFixed(1);
  const opportunityCount = filteredJobs.length;

  async function respondToInvite(inviteId, response) {
    try {
      await axios.put(
        `${API}/invites/${inviteId}/respond`,
        { response },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
      );
      setInvites((items) => items.map((item) => item.id === inviteId ? { ...item, status: response } : item));
      toast.success(response === 'accepted' ? 'Invite accepted. It is now in your applications.' : 'Invite declined.');
    } catch {
      toast.error('The invite could not be updated.');
    }
  }

  return (
    <div className={styles.page} data-testid="creator-dashboard-overview">
      <section className={styles.commandDeck}>
        <div className={styles.deckIntro}>
          <div className={styles.eyebrow}><Sparkles /> Creator signal</div>
          <div className={styles.welcome}>Good to see you, {firstName}.</div>
          <h1>Your next best brief is already in motion.</h1>
          <p>Review the strongest opportunities, keep applications moving, and make your body of work easier to trust.</p>
          <div className={styles.deckActions}>
            <Link href="/jobs" className={styles.primaryAction}>Browse briefs <ArrowUpRight /></Link>
            <Link href="/dashboard/influencer/portfolio" className={styles.secondaryAction}>Update portfolio</Link>
          </div>
        </div>

        <div className={styles.signalPanel}>
          <div className={styles.signalHeader}>
            <span>Studio signal</span>
            <strong>{readiness >= 75 ? 'Visible' : 'Build visibility'}</strong>
          </div>
          <div className={styles.readinessValue}>{readiness}<span>%</span></div>
          <p>Profile readiness</p>
          <div className={styles.segmentMeter} aria-label={`${readiness}% profile readiness`}>
            {[20, 40, 60, 80, 100].map((point) => (
              <i key={point} className={readiness >= point ? styles.segmentActive : ''} />
            ))}
          </div>
          <div className={styles.signalNotes}>
            <div><Check /> <span>Public creator profile</span></div>
            <div className={readiness >= 75 ? styles.noteReady : ''}><Target /> <span>Brief match data</span></div>
            <div className={Number(rating) > 0 ? styles.noteReady : ''}><Star /> <span>Trust history</span></div>
          </div>
          <Link href="/dashboard/influencer/edit-profile">Strengthen your signal <ArrowRight /></Link>
        </div>
      </section>

      <section className={styles.metricRail} aria-label="Creator workspace metrics">
        {[
          { icon: BriefcaseBusiness, label: 'Applications', value: applications.length, detail: `${shortlistedCount} shortlisted` },
          { icon: Target, label: 'Active work', value: hiredCount, detail: hiredCount ? 'In collaboration' : 'Ready for a win' },
          { icon: Sparkles, label: 'Direct invites', value: pendingInvites.length, detail: pendingInvites.length ? 'Needs your reply' : 'Inbox clear' },
          { icon: TrendingUp, label: 'Creator rating', value: rating, detail: `${analytics?.total_reviews || 0} reviews` },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div className={styles.metric} key={metric.label}>
              <span><Icon /></span>
              <div><small>{metric.label}</small><strong>{loading ? '-' : metric.value}</strong><p>{metric.detail}</p></div>
            </div>
          );
        })}
      </section>

      <div className={styles.contentGrid}>
        <div className={styles.mainColumn}>
          {pendingInvites.length > 0 && (
            <section className={styles.inviteSection}>
              <header className={styles.sectionHeader}>
                <div><span className={styles.sectionIndex}>01</span><div><h2>Direct invitations</h2><p>Brands that have already raised their hand.</p></div></div>
                <span className={styles.countPill}>{pendingInvites.length} waiting</span>
              </header>
              <div className={styles.inviteList}>
                {pendingInvites.slice(0, 3).map((invite) => (
                  <article className={styles.inviteRow} key={invite.id} data-testid={`invite-${invite.id}`}>
                    <span className={styles.inviteMark}>{(invite.brand_name || 'B').charAt(0)}</span>
                    <div className={styles.inviteCopy}>
                      <small>{invite.brand_name || 'Brand invitation'}</small>
                      <h3>{invite.campaign_title || 'New collaboration brief'}</h3>
                      {invite.message && <p>{invite.message}</p>}
                    </div>
                    <div className={styles.inviteActions}>
                      <button type="button" onClick={() => respondToInvite(invite.id, 'accepted')} data-testid={`accept-invite-${invite.id}`} title="Accept invitation"><Check /></button>
                      <button type="button" onClick={() => respondToInvite(invite.id, 'declined')} data-testid={`decline-invite-${invite.id}`} title="Decline invitation"><X /></button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          <section className={styles.opportunitySection}>
            <header className={styles.sectionHeader}>
              <div><span className={styles.sectionIndex}>{pendingInvites.length ? '02' : '01'}</span><div><h2>Opportunity radar</h2><p>Open briefs, filtered for the work you want next.</p></div></div>
              <Link href="/jobs">View all <ArrowRight /></Link>
            </header>

            <div className={styles.searchBar}>
              <label><Search /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search briefs, brands, or niches" data-testid="search-jobs-input" /></label>
              <label className={styles.citySelect}><MapPin /><select value={cityFilter} onChange={(event) => setCityFilter(event.target.value)} data-testid="city-filter"><option value="">All cities</option>{CITIES.map((city) => <option key={city} value={city}>{city}</option>)}</select></label>
            </div>

            {loading ? (
              <div className={styles.loadingRows}>{[0, 1, 2].map((item) => <i key={item} />)}</div>
            ) : filteredJobs.length > 0 ? (
              <div className={styles.jobList}>
                {filteredJobs.slice(0, 5).map((job) => (
                  <Link href={`/jobs/${job.id}`} className={styles.jobRow} key={job.id} data-testid={`job-card-${job.id}`}>
                    <div className={styles.jobIdentity}>
                      <span className={styles.jobMark}>{(job.brand_name || job.title || 'J').charAt(0)}</span>
                      <div><small>{job.brand_name || 'Growing brand'}</small><h3>{job.title || 'Creator collaboration'}</h3><p>{job.niche || job.category || 'Creative campaign'} / {job.city || 'Remote'}</p></div>
                    </div>
                    <div className={styles.jobMeta}><span><CircleDollarSign /> {formatMoney(job.budget_min)}{job.budget_max ? ` - ${formatMoney(job.budget_max)}` : ''}</span><span><CalendarDays /> {formatDeadline(job.deadline)}</span></div>
                    <span className={styles.jobArrow}><ChevronRight /></span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}><Search /><div><h3>No brief matches this view.</h3><p>Clear a filter or browse the full opportunity board.</p></div><Link href="/jobs">Browse all briefs</Link></div>
            )}
          </section>
        </div>

        <aside className={styles.sideColumn}>
          <section className={styles.nextMove}>
            <span className={styles.sideEyebrow}>Next best move</span>
            <h2>{readiness < 75 ? 'Make your profile easier to shortlist.' : opportunityCount ? 'Turn attention into an application.' : 'Keep your portfolio current.'}</h2>
            <p>{readiness < 75 ? 'A complete profile gives brands the context they need before they message you.' : 'Small, tailored applications make your strongest proof visible immediately.'}</p>
            <Link href={readiness < 75 ? '/dashboard/influencer/edit-profile' : '/jobs'}>{readiness < 75 ? 'Complete profile' : 'Find a brief'} <ArrowUpRight /></Link>
          </section>

          <section className={styles.pipelinePanel}>
            <header><div><span className={styles.sideEyebrow}>Work pipeline</span><h2>Where the work stands</h2></div><Link href="/dashboard/influencer/applications"><ArrowRight /></Link></header>
            <ol>
              {[
                { label: 'Applied', value: applications.filter((item) => item.status === 'pending').length },
                { label: 'Shortlisted', value: shortlistedCount },
                { label: 'Active', value: hiredCount },
              ].map((stage, index) => <li key={stage.label}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{stage.label}</strong><small>{stage.value} briefs</small></div><b>{stage.value}</b></li>)}
            </ol>
          </section>

          <section className={styles.availabilityPanel}>
            <div className={styles.availabilityIcon}><Clock3 /></div>
            <div><span className={styles.sideEyebrow}>Availability</span><h2>Open to the right fit</h2><p>Keep your rate, niche, and turnaround current for better matches.</p></div>
            <Link href="/dashboard/influencer/edit-profile">Update details <ChevronRight /></Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
