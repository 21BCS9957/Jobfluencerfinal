'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'sonner';
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  CircleDollarSign,
  Eye,
  Plus,
  Search,
  ShieldCheck,
  Star,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API } from '@/legacy_pages/dashboard/shared';
import styles from './BrandWorkspace.module.css';

const TABS = [
  { key: 'active', label: 'Live' },
  { key: 'inactive', label: 'Paused' },
  { key: 'draft', label: 'Drafts' },
  { key: 'completed', label: 'Complete' },
];

const BOOST_TIERS = [
  { key: 'basic', name: 'Signal boost', credits: 10, copy: 'Priority search placement for 7 days.' },
  { key: 'premium', name: 'Feature boost', credits: 25, copy: 'Homepage placement and highlighting for 14 days.' },
  { key: 'top', name: 'Top placement', credits: 35, copy: 'Category leadership and notifications for 30 days.' },
];

function getJobs(payload) {
  if (Array.isArray(payload)) return payload;
  return payload?.jobs || payload?.campaigns || [];
}

function isActive(job) {
  return job.status === 'active' || job.status === 'open';
}

function formatBudget(minimum, maximum) {
  const format = (value) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: Number(value || 0) >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(Number(value || 0));
  if (!minimum && !maximum) return 'Not set';
  if (!maximum || minimum === maximum) return format(minimum);
  return `${format(minimum)} - ${format(maximum)}`;
}

function formatDeadline(value) {
  if (!value) return 'Open';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(date);
}

function getStatusClass(status) {
  if (status === 'active' || status === 'open') return styles.statusActive;
  if (status === 'completed') return styles.statusCompleted;
  if (status === 'draft') return styles.statusDraft;
  return styles.statusInactive;
}

function getCardClass(status) {
  if (status === 'active' || status === 'open') return styles.campaignCardActive;
  if (status === 'completed') return styles.campaignCardCompleted;
  if (status === 'draft') return styles.campaignCardDraft;
  return '';
}

export default function BrandCampaignsWorkspace() {
  const { token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [query, setQuery] = useState('');
  const [busyJob, setBusyJob] = useState(null);
  const [boostCampaign, setBoostCampaign] = useState(null);
  const [boostTier, setBoostTier] = useState('basic');
  const [escrowCampaign, setEscrowCampaign] = useState(null);
  const [reviewCampaign, setReviewCampaign] = useState(null);
  const [hiredCreators, setHiredCreators] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const headers = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token],
  );

  const fetchJobs = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/jobs/my`, { headers });
      setJobs(getJobs(response.data));
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const counts = useMemo(() => ({
    active: jobs.filter(isActive).length,
    inactive: jobs.filter((job) => job.status === 'inactive').length,
    draft: jobs.filter((job) => job.status === 'draft').length,
    completed: jobs.filter((job) => job.status === 'completed').length,
  }), [jobs]);

  const visibleJobs = useMemo(() => jobs.filter((job) => {
    const matchesTab = activeTab === 'active'
      ? isActive(job)
      : job.status === activeTab;
    const haystack = `${job.title || ''} ${job.description || ''} ${job.category || ''} ${job.niche || ''}`.toLowerCase();
    return matchesTab && haystack.includes(query.trim().toLowerCase());
  }), [activeTab, jobs, query]);

  async function toggleStatus(job) {
    const nextStatus = isActive(job) ? 'inactive' : 'active';
    setBusyJob(job.id);
    try {
      await axios.put(`${API}/jobs/${job.id}/status?status=${nextStatus}`, {}, { headers });
      setJobs((items) => items.map((item) => (
        item.id === job.id ? { ...item, status: nextStatus } : item
      )));
      toast.success(nextStatus === 'active' ? 'Campaign is live' : 'Campaign paused');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Could not update campaign');
    } finally {
      setBusyJob(null);
    }
  }

  async function confirmBoost() {
    if (!boostCampaign) return;
    setBusyJob(boostCampaign.id);
    try {
      await axios.post(
        `${API}/campaigns/${boostCampaign.id}/boost`,
        { level: boostTier },
        { headers },
      );
      toast.success('Campaign visibility boosted');
      setBoostCampaign(null);
      fetchJobs();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Could not boost campaign');
    } finally {
      setBusyJob(null);
    }
  }

  async function fundEscrow() {
    if (!escrowCampaign) return;
    const amount = Number(escrowCampaign.budget_max || escrowCampaign.budget_min || 0);
    setBusyJob(escrowCampaign.id);
    try {
      const response = await axios.post(`${API}/escrow`, {
        campaign_id: escrowCampaign.id,
        creator_id: '',
        amount,
      }, { headers });
      await axios.put(`${API}/escrow/${response.data.id}/fund`, {}, { headers });
      toast.success('Campaign payment secured in escrow');
      setEscrowCampaign(null);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Could not fund escrow');
    } finally {
      setBusyJob(null);
    }
  }

  async function openReviews(job) {
    setReviewCampaign(job);
    setHiredCreators([]);
    try {
      const response = await axios.get(`${API}/applications/campaign/${job.id}`, { headers });
      setHiredCreators((Array.isArray(response.data) ? response.data : []).filter(
        (application) => application.status === 'hired',
      ));
    } catch {
      setHiredCreators([]);
    }
  }

  async function submitReview(application) {
    if (!reviewComment.trim()) {
      toast.error('Add a short review first');
      return;
    }
    setBusyJob(application.id);
    try {
      await axios.post(`${API}/reviews`, {
        campaign_id: reviewCampaign.id,
        reviewee_id: application.creator_id,
        rating: reviewRating,
        comment: reviewComment,
      }, { headers });
      toast.success(`Review submitted for ${application.creator_name || 'creator'}`);
      setReviewComment('');
      setReviewRating(5);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Could not submit review');
    } finally {
      setBusyJob(null);
    }
  }

  return (
    <div className={styles.page} data-testid="brand-campaigns-workspace">
      <header className={styles.header}>
        <div className={styles.headingGroup}>
          <span className={styles.kicker}>Campaign operations</span>
          <h1 className={styles.title}>Campaign desk</h1>
          <p className={styles.lead}>Run every brief from first publish to final creator handoff.</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/dashboard/brand/analytics" className={styles.secondaryAction}>
            <Eye aria-hidden="true" /> Performance
          </Link>
          <Link href="/dashboard/brand/post-job" className={styles.primaryAction} data-testid="new-campaign-btn">
            <Plus aria-hidden="true" /> Post campaign
          </Link>
        </div>
      </header>

      <section className={styles.campaignControl}>
        <div className={styles.controlTop}>
          <div>
            <small>Campaign signal board</small>
            <h2>One desk for every brief in motion.</h2>
          </div>
          <div className={styles.controlCounter}>
            <strong>{jobs.length}</strong>
            <span>total briefs</span>
          </div>
        </div>
        <div className={styles.tabs} data-testid="campaigns-tabs">
          {TABS.map((tab) => (
            <button
              type="button"
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
              data-testid={`tab-${tab.key}`}
            >
              {tab.label}<span>{counts[tab.key]}</span>
            </button>
          ))}
        </div>
      </section>

      <div className={styles.toolbar}>
        <label className={styles.searchBox} data-testid="brand-jobs-search">
          <Search aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search briefs, niches, or categories"
            data-testid="search-jobs-input"
          />
        </label>
        <span className={styles.kicker}>{visibleJobs.length} visible</span>
      </div>

      {loading ? (
        <div className={styles.loadingPanel}><div className={styles.spinner} /></div>
      ) : visibleJobs.length === 0 ? (
        <div className={styles.emptyState}>
          <div>
            <span className={styles.emptyMark}><BriefcaseBusiness aria-hidden="true" /></span>
            <h2>No {activeTab} campaigns</h2>
            <p>{query ? 'No briefs match this search.' : 'The next creator collaboration can start with one sharp brief.'}</p>
            <Link href="/dashboard/brand/post-job" className={styles.primaryAction}>Create a campaign <ArrowRight aria-hidden="true" /></Link>
          </div>
        </div>
      ) : (
        <div className={`${styles.campaignGrid} ${styles.stagger}`}>
          {visibleJobs.map((job, index) => (
            <article
              key={job.id}
              className={`${styles.campaignCard} ${getCardClass(job.status)}`}
              data-testid={`campaign-card-${job.id}`}
            >
              <div className={styles.campaignAccent} />
              <div className={styles.campaignBody}>
                <div className={styles.campaignTop}>
                  <span className={styles.campaignSerial}>JF-C{String(index + 1).padStart(3, '0')}</span>
                  <span className={`${styles.status} ${getStatusClass(job.status)}`}>{job.status || 'inactive'}</span>
                </div>
                <h2>{job.title || 'Untitled campaign'}</h2>
                <p className={styles.campaignDescription}>{job.description || 'No campaign description yet.'}</p>
                <div className={styles.campaignTags}>
                  <span className={styles.campaignTag}>{job.niche || job.category || 'Creator campaign'}</span>
                  {job.is_boosted && <span className={styles.boostTag}><Zap aria-hidden="true" /> Boosted</span>}
                </div>
                <div className={styles.campaignMetrics}>
                  <div className={styles.campaignMetric}>
                    <small>Budget</small><strong>{formatBudget(job.budget_min, job.budget_max)}</strong>
                  </div>
                  <div className={styles.campaignMetric}>
                    <small>Applicants</small><strong>{job.applicants_count || 0}</strong>
                  </div>
                  <div className={styles.campaignMetric}>
                    <small>Deadline</small><strong>{formatDeadline(job.deadline)}</strong>
                  </div>
                </div>
              </div>
              <footer className={styles.campaignFooter}>
                <Link href={`/dashboard/brand/jobs/${job.id}`} className={styles.cardAction} data-testid={`view-campaign-${job.id}`}>
                  Manage <ArrowRight aria-hidden="true" />
                </Link>
                <Link href={`/dashboard/brand/jobs/${job.id}/applicants`} className={styles.cardIconAction} title="View applicants" aria-label="View applicants">
                  <Users aria-hidden="true" />
                </Link>
                {isActive(job) && !job.is_boosted && (
                  <button type="button" className={styles.cardIconAction} onClick={() => setBoostCampaign(job)} title="Boost campaign" aria-label="Boost campaign" data-testid={`boost-btn-${job.id}`}>
                    <Zap aria-hidden="true" />
                  </button>
                )}
                {isActive(job) && (
                  <button type="button" className={styles.cardIconAction} onClick={() => setEscrowCampaign(job)} title="Fund escrow" aria-label="Fund escrow" data-testid={`fund-escrow-btn-${job.id}`}>
                    <ShieldCheck aria-hidden="true" />
                  </button>
                )}
                {(job.hired_count > 0 || job.status === 'completed') && (
                  <button type="button" className={styles.cardIconAction} onClick={() => openReviews(job)} title="Review creators" aria-label="Review creators">
                    <Star aria-hidden="true" />
                  </button>
                )}
                <button
                  type="button"
                  className={`${styles.statusToggle} ${isActive(job) ? styles.statusToggleActive : ''}`}
                  onClick={() => toggleStatus(job)}
                  disabled={busyJob === job.id}
                  aria-label={isActive(job) ? 'Pause campaign' : 'Activate campaign'}
                  aria-pressed={isActive(job)}
                  title={isActive(job) ? 'Pause campaign' : 'Activate campaign'}
                  data-testid={`toggle-status-${job.id}`}
                />
              </footer>
            </article>
          ))}
        </div>
      )}

      {boostCampaign && (
        <div className={styles.modalBackdrop} onMouseDown={() => setBoostCampaign(null)}>
          <section className={styles.modal} onMouseDown={(event) => event.stopPropagation()} data-testid="boost-modal">
            <header className={styles.modalHeader}>
              <div><span className={styles.modalEyebrow}>Visibility</span><h2>Boost this campaign</h2></div>
              <button type="button" className={styles.closeButton} onClick={() => setBoostCampaign(null)} aria-label="Close boost dialog"><X /></button>
            </header>
            <div className={styles.modalBody}>
              <p className={styles.modalNote}>Choose the placement for “{boostCampaign.title}”.</p>
              <div className={styles.choiceGrid}>
                {BOOST_TIERS.map((tier) => (
                  <button type="button" key={tier.key} className={`${styles.choice} ${boostTier === tier.key ? styles.choiceActive : ''}`} onClick={() => setBoostTier(tier.key)} data-testid={`boost-tier-${tier.key}`}>
                    <div><strong>{tier.name}</strong><p>{tier.copy}</p></div><span>{tier.credits} cr</span>
                  </button>
                ))}
              </div>
            </div>
            <footer className={styles.modalFooter}>
              <button type="button" className={styles.secondaryAction} onClick={() => setBoostCampaign(null)}>Cancel</button>
              <button type="button" className={styles.primaryAction} onClick={confirmBoost} disabled={busyJob === boostCampaign.id} data-testid="confirm-boost-btn">
                <Zap /> {busyJob === boostCampaign.id ? 'Boosting...' : 'Confirm boost'}
              </button>
            </footer>
          </section>
        </div>
      )}

      {escrowCampaign && (() => {
        const amount = Number(escrowCampaign.budget_max || escrowCampaign.budget_min || 0);
        const fee = Math.round(amount * 0.15);
        return (
          <div className={styles.modalBackdrop} onMouseDown={() => setEscrowCampaign(null)}>
            <section className={styles.modal} onMouseDown={(event) => event.stopPropagation()} data-testid="escrow-modal">
              <header className={styles.modalHeader}>
                <div><span className={styles.modalEyebrow}>Protected payment</span><h2>Fund campaign escrow</h2></div>
                <button type="button" className={styles.closeButton} onClick={() => setEscrowCampaign(null)} aria-label="Close escrow dialog"><X /></button>
              </header>
              <div className={styles.modalBody}>
                <p className={styles.modalNote}>Funds stay protected until you approve the creator’s work.</p>
                <div className={styles.breakdown}>
                  <div className={styles.breakdownRow}><span>Campaign budget</span><strong>{formatBudget(amount, amount)}</strong></div>
                  <div className={styles.breakdownRow}><span>Platform fee (15%)</span><strong>- {formatBudget(fee, fee)}</strong></div>
                  <div className={`${styles.breakdownRow} ${styles.breakdownTotal}`}><span>Creator payout</span><strong>{formatBudget(amount - fee, amount - fee)}</strong></div>
                </div>
              </div>
              <footer className={styles.modalFooter}>
                <button type="button" className={styles.secondaryAction} onClick={() => setEscrowCampaign(null)}>Cancel</button>
                <button type="button" className={styles.primaryAction} onClick={fundEscrow} disabled={busyJob === escrowCampaign.id} data-testid="fund-escrow-confirm">
                  <CircleDollarSign /> {busyJob === escrowCampaign.id ? 'Processing...' : 'Secure funds'}
                </button>
              </footer>
            </section>
          </div>
        );
      })()}

      {reviewCampaign && (
        <div className={styles.modalBackdrop} onMouseDown={() => setReviewCampaign(null)}>
          <section className={`${styles.modal} ${styles.modalWide}`} onMouseDown={(event) => event.stopPropagation()} data-testid="brand-review-modal">
            <header className={styles.modalHeader}>
              <div><span className={styles.modalEyebrow}>Collaboration closeout</span><h2>Review hired creators</h2></div>
              <button type="button" className={styles.closeButton} onClick={() => setReviewCampaign(null)} aria-label="Close reviews"><X /></button>
            </header>
            <div className={styles.modalBody}>
              {hiredCreators.length === 0 ? (
                <p className={styles.modalNote}>No hired creators are ready for review yet.</p>
              ) : hiredCreators.map((application) => (
                <div key={application.id} className={styles.choiceGrid}>
                  <strong>{application.creator_name || 'Creator'}</strong>
                  <div className={styles.starPicker}>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button type="button" key={rating} onClick={() => setReviewRating(rating)} className={`${styles.starButton} ${rating <= reviewRating ? styles.starSelected : ''}`} aria-label={`${rating} stars`}>
                        <Star fill="currentColor" />
                      </button>
                    ))}
                  </div>
                  <textarea className={styles.textarea} value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} placeholder="How did the collaboration go?" />
                  <button type="button" className={styles.primaryAction} onClick={() => submitReview(application)} disabled={busyJob === application.id}>
                    <Check /> {busyJob === application.id ? 'Submitting...' : 'Submit review'}
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
