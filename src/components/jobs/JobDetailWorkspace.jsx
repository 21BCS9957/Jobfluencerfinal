'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Link2,
  MapPin,
  Plus,
  Send,
  Sparkles,
  Target,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API } from '@/legacy_pages/dashboard/shared';
import OpportunityNavigation from './OpportunityNavigation';
import styles from './JobsWorkspace.module.css';

function formatBudget(min, max) {
  if (min === undefined || min === null) return 'Open budget';
  const start = `Rs.${Number(min).toLocaleString('en-IN')}`;
  if (max === undefined || max === null || Number(min) === Number(max)) return start;
  return `${start} - Rs.${Number(max).toLocaleString('en-IN')}`;
}

function formatDate(value) {
  if (!value) return 'Flexible';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function postedAgo(value) {
  if (!value) return 'Recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  const days = Math.max(0, Math.floor((Date.now() - date.getTime()) / 86_400_000));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)} weeks ago`;
}

export default function JobDetailWorkspace() {
  const params = useParams();
  const id = String(params?.id || '');
  const { user, token } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [application, setApplication] = useState({ proposal: '', price: '', timeline: '', portfolio_links: [''] });
  const headers = useMemo(() => token ? { Authorization: `Bearer ${token}` } : undefined, [token]);

  const fetchJob = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/jobs/${id}`, { headers });
      setJob(response.data?.campaign || response.data);
      setNotFound(false);
    } catch {
      setJob(null);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [headers, id]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  useEffect(() => {
    if (user?.role !== 'creator' || !id) return;
    let active = true;
    axios.get(`${API}/applications/my`, { headers }).then((response) => {
      const applications = Array.isArray(response.data) ? response.data : response.data?.applications || [];
      if (active) setHasApplied(applications.some((item) => String(item.campaign_id) === id));
    }).catch(() => {
      if (active) setHasApplied(false);
    });
    return () => { active = false; };
  }, [headers, id, user?.role]);

  function setApplicationField(field, value) {
    setApplication((current) => ({ ...current, [field]: value }));
  }

  function setPortfolioLink(index, value) {
    setApplication((current) => ({
      ...current,
      portfolio_links: current.portfolio_links.map((link, itemIndex) => itemIndex === index ? value : link),
    }));
  }

  function addPortfolioLink() {
    setApplication((current) => ({ ...current, portfolio_links: [...current.portfolio_links, ''] }));
  }

  function removePortfolioLink(index) {
    setApplication((current) => ({ ...current, portfolio_links: current.portfolio_links.filter((_, itemIndex) => itemIndex !== index) }));
  }

  async function submitApplication(event) {
    event.preventDefault();
    if (!application.proposal.trim()) {
      toast.error('Write a short, relevant pitch.');
      return;
    }
    if (!application.price) {
      toast.error('Add your proposed rate.');
      return;
    }
    setApplying(true);
    try {
      await axios.post(
        `${API}/applications`,
        {
          campaign_id: id,
          proposal: application.proposal.trim(),
          price: Number.parseFloat(application.price),
          timeline: application.timeline.trim(),
          portfolio_links: application.portfolio_links.filter((link) => link.trim()),
        },
        { headers },
      );
      setHasApplied(true);
      setApplyOpen(false);
      toast.success('Application submitted.');
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'The application could not be submitted.');
    } finally {
      setApplying(false);
    }
  }

  if (loading) {
    return <div className={styles.detailPage}><OpportunityNavigation /><div className={styles.detailLoader}><span /><span /><span /></div></div>;
  }

  if (notFound || !job) {
    return (
      <div className={styles.detailPage}>
        <OpportunityNavigation />
        <main className={styles.missingBrief}><span><BriefcaseBusiness /></span><h1>This brief is no longer available.</h1><p>It may have closed or moved out of the public opportunity board.</p><Link href="/jobs">Return to open briefs <ArrowRight /></Link></main>
      </div>
    );
  }

  const open = job.status === 'open' || job.status === 'active';
  const deliverables = Array.isArray(job.deliverables) ? job.deliverables : [];
  const platforms = Array.isArray(job.platforms) ? job.platforms : [];

  return (
    <div className={styles.detailPage} data-testid="job-detail-workspace">
      <OpportunityNavigation />

      <section className={styles.detailHero}>
        <div className={styles.detailHeroInner}>
          <Link href="/jobs" className={styles.backLink} data-testid="back-btn"><ArrowLeft /> Opportunity board</Link>
          <div className={styles.detailHeroGrid}>
            <div className={styles.detailTitle}>
              <div className={styles.detailTags}><span><MapPin /> {job.city || 'Remote'}</span><span>{job.category || 'Creator'}</span>{job.niche && <span>{job.niche}</span>}</div>
              <h1>{job.title}</h1>
              <p><Building2 /> {job.brand_name || 'Jobfluencer brand'} <i /> <Clock3 /> Posted {postedAgo(job.created_at)}</p>
            </div>
            <div className={styles.briefStamp}>
              <span>{open ? 'Open brief' : 'Closed brief'}</span>
              <strong>{(job.brand_name || 'J').charAt(0)}</strong>
              <p>{job.brand_name || 'Brand partner'}</p>
              <div><i /><i className={open ? styles.stampActive : ''} /><i /></div>
            </div>
          </div>
        </div>
      </section>

      <main className={styles.detailBody}>
        <div className={styles.briefContent}>
          <section className={styles.briefSection}>
            <header><span className={styles.sectionNumber}>01</span><div><h2>The brief</h2><p>Context, objective, and the work behind the opportunity.</p></div></header>
            <div className={styles.description}>{job.description || 'The brand has not added a detailed description yet.'}</div>
          </section>

          <section className={styles.briefSection}>
            <header><span className={styles.sectionNumber}>02</span><div><h2>What you will deliver</h2><p>The expected creative output.</p></div></header>
            {deliverables.length ? (
              <ol className={styles.deliverableList}>{deliverables.map((item, index) => <li key={`${item}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span><p>{item}</p><Check /></li>)}</ol>
            ) : (
              <div className={styles.briefEmpty}><Target /><div><strong>Deliverables will be aligned with the selected creator.</strong><p>Use your application to clarify scope and working format.</p></div></div>
            )}
          </section>

          <section className={styles.briefSection}>
            <header><span className={styles.sectionNumber}>03</span><div><h2>Channel and creator fit</h2><p>Where the work will live and what the brand is looking for.</p></div></header>
            <div className={styles.fitGrid}>
              <div><small>Platforms</small><p>{platforms.length ? platforms.map((platform) => <span key={platform}>{platform}</span>) : <em>Platform flexible</em>}</p></div>
              <div><small>Creator type</small><strong>{job.category || 'Open creator category'}</strong><p className={styles.fitNote}>{job.niche || 'Best-fit niche welcomed'}</p></div>
            </div>
          </section>

          <section className={styles.brandContext}>
            <span className={styles.brandContextMark}>{(job.brand_name || 'B').charAt(0)}</span>
            <div><span className={styles.eyebrow}>Brand context</span><h2>{job.brand_name || 'Brand partner'}</h2><p>The application is shared directly with the hiring workspace attached to this brief.</p></div>
            {job.brand_id && <Link href={`/brands/${job.brand_id}`}>View brand <ArrowUpRight /></Link>}
          </section>
        </div>

        <aside className={styles.decisionColumn}>
          <section className={styles.decisionPanel}>
            <span className={styles.eyebrow}>Compensation</span>
            <h2>{formatBudget(job.budget_min, job.budget_max)}</h2>
            <p>{job.budget_type || 'Project budget'}</p>
            <div className={styles.decisionStats}>
              <div><Users /><span><small>Creators needed</small><strong>{job.creators_needed || 1}</strong></span></div>
              <div><BriefcaseBusiness /><span><small>Applications</small><strong>{job.applicants_count || 0}</strong></span></div>
              <div><CalendarDays /><span><small>Deadline</small><strong>{formatDate(job.deadline)}</strong></span></div>
              <div><CircleDollarSign /><span><small>Budget format</small><strong>{job.budget_type || 'Fixed'}</strong></span></div>
            </div>

            {user?.role === 'creator' && open && (
              hasApplied ? (
                <div className={styles.appliedState}><CheckCircle2 /><span><strong>Application sent</strong><small>Track it from your creator pipeline.</small></span></div>
              ) : (
                <button type="button" className={styles.applyButton} onClick={() => setApplyOpen(true)} data-testid="apply-btn"><Send /> Apply to this brief <ArrowRight /></button>
              )
            )}
            {!user && <Link href="/register?role=creator" className={styles.applyButton} data-testid="join-to-apply-btn"><Sparkles /> Join to apply <ArrowRight /></Link>}
            {user?.role === 'brand' && String(user.id) === String(job.brand_id) && <Link href={`/dashboard/brand/jobs/${job.id}`} className={styles.applyButton} data-testid="manage-job-btn"><BriefcaseBusiness /> Manage brief <ArrowRight /></Link>}
            {!open && <div className={styles.closedState}>This opportunity is no longer accepting applications.</div>}
          </section>

          <section className={styles.applicationNote}>
            <Sparkles />
            <span className={styles.eyebrow}>Strong applications</span>
            <h2>Lead with proof that matches the brief.</h2>
            <p>A short relevant pitch, realistic rate, and one or two specific work samples are enough.</p>
          </section>
        </aside>
      </main>

      {applyOpen && (
        <div className={styles.applyBackdrop} onClick={() => setApplyOpen(false)}>
          <form className={styles.applyModal} onSubmit={submitApplication} onClick={(event) => event.stopPropagation()}>
            <header><div><span className={styles.eyebrow}>Application composer</span><h2>Pitch for the work, not the room.</h2><p>{job.title} / {job.brand_name}</p></div><button type="button" onClick={() => setApplyOpen(false)} aria-label="Close application"><X /></button></header>
            <label className={styles.applicationField}>Your pitch<textarea value={application.proposal} onChange={(event) => setApplicationField('proposal', event.target.value)} placeholder="Why does your work fit this specific brief?" data-testid="proposal-input" /></label>
            <div className={styles.applicationTwoFields}>
              <label className={styles.applicationField}>Your rate (Rs.)<input type="number" min="0" value={application.price} onChange={(event) => setApplicationField('price', event.target.value)} placeholder="25000" data-testid="price-input" /></label>
              <label className={styles.applicationField}>Timeline<input value={application.timeline} onChange={(event) => setApplicationField('timeline', event.target.value)} placeholder="10 days" data-testid="timeline-input" /></label>
            </div>
            <div className={styles.linkFields}>
              <div><span>Relevant work links</span>{application.portfolio_links.length < 3 && <button type="button" onClick={addPortfolioLink}><Plus /> Add link</button>}</div>
              {application.portfolio_links.map((link, index) => <label key={index}><Link2 /><input value={link} onChange={(event) => setPortfolioLink(index, event.target.value)} placeholder="https://" data-testid={`portfolio-link-${index}`} />{application.portfolio_links.length > 1 && <button type="button" onClick={() => removePortfolioLink(index)} aria-label="Remove link"><X /></button>}</label>)}
            </div>
            <div className={styles.applyFooter}><p><Check /> Your application goes directly to the hiring brand.</p><button type="submit" disabled={applying} data-testid="submit-application-btn">{applying ? 'Submitting...' : 'Submit application'} <ArrowRight /></button></div>
          </form>
        </div>
      )}
    </div>
  );
}
