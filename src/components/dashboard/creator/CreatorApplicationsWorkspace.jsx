'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'sonner';
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  MessageSquare,
  Search,
  Star,
  Target,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API } from '@/legacy_pages/dashboard/shared';
import styles from './CreatorWorkspace.module.css';

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Applied' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'hired', label: 'Active' },
  { key: 'rejected', label: 'Archived' },
];

const statusLabels = {
  pending: 'Applied',
  shortlisted: 'Shortlisted',
  hired: 'Active',
  rejected: 'Not selected',
};

function listFrom(payload) {
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload?.applications) ? payload.applications : [];
}

function formatMoney(value) {
  if (value === undefined || value === null) return 'Open budget';
  return `Rs.${Number(value).toLocaleString('en-IN')}`;
}

function formatDate(value) {
  if (!value) return 'Flexible deadline';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CreatorApplicationsWorkspace({ defaultView = 'all', title = 'Application pipeline' }) {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState(defaultView);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    let active = true;
    axios.get(`${API}/applications/my`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }).then((response) => {
      if (active) setApplications(listFrom(response.data));
    }).catch(() => {
      if (active) setApplications([]);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [token]);

  const counts = useMemo(() => Object.fromEntries(tabs.map((tab) => [tab.key, tab.key === 'all' ? applications.length : applications.filter((item) => item.status === tab.key).length])), [applications]);
  const visibleApplications = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return applications.filter((application) => {
      const campaign = application.campaign || {};
      const copy = `${campaign.title || ''} ${campaign.brand_name || ''} ${campaign.category || ''}`.toLowerCase();
      return (activeTab === 'all' || application.status === activeTab) && (!needle || copy.includes(needle));
    });
  }, [activeTab, applications, query]);

  const hired = counts.hired || 0;
  const shortlisted = counts.shortlisted || 0;
  const conversion = applications.length ? Math.round((hired / applications.length) * 100) : 0;

  async function submitReview() {
    if (!reviewComment.trim()) {
      toast.error('Please write a short comment.');
      return;
    }
    setSubmittingReview(true);
    try {
      await axios.post(
        `${API}/reviews`,
        {
          campaign_id: reviewModal.campaign_id,
          reviewee_id: reviewModal.brand_id,
          rating: reviewRating,
          comment: reviewComment.trim(),
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
      );
      toast.success('Review submitted.');
      setReviewModal(null);
      setReviewRating(5);
      setReviewComment('');
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'The review could not be submitted.');
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <div className={styles.page} data-testid="creator-applications-workspace">
      <header className={styles.pageHeader}>
        <div className={styles.headingGroup}>
          <span className={styles.kicker}>Work pipeline</span>
          <h1>{title}</h1>
          <p>See every pitch, decision, and active collaboration without losing the context around the brief.</p>
        </div>
        <Link href="/jobs" className={styles.primaryButton}><Search /> Find new briefs</Link>
      </header>

      <section className={styles.darkSummary}>
        <div><span>Applications sent</span><strong>{applications.length}</strong><small>Your complete opportunity history</small></div>
        <div><span>Shortlisted</span><strong>{shortlisted}</strong><small>Brands reviewing your fit</small></div>
        <div><span>Active work</span><strong>{hired}</strong><small>Collaborations in motion</small></div>
        <div className={styles.accentSummary}><span>Win rate</span><strong>{conversion}%</strong><small>Applications converted to work</small></div>
      </section>

      <section className={styles.listPanel}>
        <header className={styles.listToolbar}>
          <div className={styles.tabs} data-testid="my-jobs-tabs">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab.key}
                className={activeTab === tab.key ? styles.tabActive : ''}
                onClick={() => setActiveTab(tab.key)}
                data-testid={`tab-${tab.key}`}
              >
                {tab.label}<span>{counts[tab.key] || 0}</span>
              </button>
            ))}
          </div>
          <label className={styles.compactSearch}><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search applications" /></label>
        </header>

        {loading ? (
          <div className={styles.loadingList}>{[0, 1, 2].map((item) => <i key={item} />)}</div>
        ) : visibleApplications.length === 0 ? (
          <div className={styles.emptyPanel}>
            <span><BriefcaseBusiness /></span>
            <div><h2>No applications in this view.</h2><p>Your next well-matched brief can change that.</p></div>
            <Link href="/jobs">Browse briefs <ArrowRight /></Link>
          </div>
        ) : (
          <div className={styles.applicationList}>
            {visibleApplications.map((application) => {
              const campaign = application.campaign || {};
              return (
                <article className={styles.applicationRow} key={application.id} data-testid={`app-card-${application.id}`}>
                  <div className={styles.applicationIdentity}>
                    <span>{(campaign.brand_name || campaign.title || 'B').charAt(0)}</span>
                    <div><small>{campaign.brand_name || 'Brand collaboration'}</small><h2>{campaign.title || 'Campaign brief'}</h2><p>{campaign.category || 'Creative work'} / {campaign.city || 'Remote'}</p></div>
                  </div>
                  <div className={styles.applicationMeta}>
                    <span><CircleDollarSign /> {formatMoney(campaign.budget_min)}{campaign.budget_max ? ` - ${formatMoney(campaign.budget_max)}` : ''}</span>
                    <span><CalendarDays /> {formatDate(campaign.deadline)}</span>
                  </div>
                  <span className={`${styles.statusBadge} ${styles[`status_${application.status}`] || ''}`}>{statusLabels[application.status] || application.status}</span>
                  <div className={styles.rowActions}>
                    {application.status === 'hired' && (
                      <button
                        type="button"
                        onClick={() => setReviewModal({ campaign_id: application.campaign_id, brand_id: campaign.brand_id, brand_name: campaign.brand_name || 'the brand' })}
                        title="Write a review"
                        data-testid={`write-review-${application.id}`}
                      ><Star /></button>
                    )}
                    {campaign.brand_id && <Link href={`/dashboard/influencer/messages?to=${campaign.brand_id}`} title="Message brand"><MessageSquare /></Link>}
                    <Link href={`/jobs/${application.campaign_id}`} title="View brief" data-testid={`view-job-${application.id}`}><ArrowRight /></Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className={styles.pipelineNote}>
        <Target />
        <div><strong>Keep your pipeline honest.</strong><p>Shortlist status reflects the brand&apos;s latest decision. Messages stay attached to the same collaboration context.</p></div>
        <CheckCircle2 />
      </section>

      {reviewModal && (
        <div className={styles.modalBackdrop} onClick={() => setReviewModal(null)}>
          <div className={styles.reviewModal} onClick={(event) => event.stopPropagation()} data-testid="review-modal">
            <header><div><span className={styles.kicker}>Close the loop</span><h2>Review {reviewModal.brand_name}</h2></div><button type="button" onClick={() => setReviewModal(null)} aria-label="Close review"><X /></button></header>
            <p>Your review helps other creators understand what it is like to work with this brand.</p>
            <div className={styles.starPicker}>
              {[1, 2, 3, 4, 5].map((star) => <button type="button" key={star} onClick={() => setReviewRating(star)} data-testid={`star-${star}`} className={star <= reviewRating ? styles.starActive : ''}><Star /></button>)}
            </div>
            <label className={styles.fieldLabel}>Your experience<textarea value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} placeholder="What worked well?" data-testid="review-comment" /></label>
            <button type="button" className={styles.modalSubmit} onClick={submitReview} disabled={submittingReview} data-testid="submit-review-btn">{submittingReview ? 'Submitting...' : 'Submit review'} <ArrowRight /></button>
          </div>
        </div>
      )}
    </div>
  );
}
