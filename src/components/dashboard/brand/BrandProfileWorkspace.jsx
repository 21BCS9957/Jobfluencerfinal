'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import {
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Crown,
  Edit3,
  Globe2,
  LinkIcon,
  LogOut,
  MapPin,
  Share2,
  Star,
  WalletCards,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API } from '@/legacy_pages/dashboard/shared';
import styles from './BrandWorkspace.module.css';

const PLANS = [
  {
    key: 'pro',
    name: 'Pro',
    price: 999,
    copy: '15 campaigns, 20 invites, boosts, and advanced analytics.',
  },
  {
    key: 'premium',
    name: 'Premium',
    price: 1999,
    copy: 'Unlimited campaigns and invites, full analytics, contests, and priority support.',
  },
];

function unwrapReviews(payload) {
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload?.reviews) ? payload.reviews : [];
}

function initials(value) {
  const parts = String(value || 'Brand').trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part.charAt(0)).join('').toUpperCase();
}

function safeWebsite(value) {
  if (!value) return '';
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function websiteLabel(value) {
  if (!value) return '';
  try {
    return new URL(safeWebsite(value)).hostname.replace(/^www\./, '');
  } catch {
    return value;
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function BrandProfileWorkspace() {
  const { user, token, logout, subscription, fetchUser } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState({});
  const [reviews, setReviews] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [wallet, setWallet] = useState({});
  const [loading, setLoading] = useState(true);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [upgrading, setUpgrading] = useState(false);

  const headers = useMemo(() => token ? { Authorization: `Bearer ${token}` } : undefined, [token]);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    const reviewRequest = user?.id
      ? axios.get(`${API}/reviews/${user.id}`, { headers })
      : Promise.resolve({ data: [] });
    const [profileResult, reviewResult, analyticsResult, walletResult] = await Promise.allSettled([
      axios.get(`${API}/brands/profile`, { headers }),
      reviewRequest,
      axios.get(`${API}/analytics/dashboard`, { headers }),
      axios.get(`${API}/wallet`, { headers }),
    ]);

    const brandData = profileResult.status === 'fulfilled' ? profileResult.value.data : {};
    setProfile({ ...(user || {}), ...(brandData || {}) });
    setReviews(reviewResult.status === 'fulfilled' ? unwrapReviews(reviewResult.value.data) : []);
    setAnalytics(analyticsResult.status === 'fulfilled' ? analyticsResult.value.data || {} : {});
    setWallet(walletResult.status === 'fulfilled' ? walletResult.value.data || {} : {});
    setLoading(false);
  }, [headers, user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const brandName = profile.company_name || profile.name || user?.name || 'Your brand';
  const currentPlan = String(subscription?.plan || 'free').toLowerCase();
  const completionFields = [
    brandName !== 'Your brand',
    Boolean(profile.industry),
    Boolean(profile.description),
    Boolean(profile.website),
    Boolean(profile.logo_url),
  ];
  const completion = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);
  const averageRating = reviews.length
    ? (reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length).toFixed(1)
    : 'New';
  const metrics = [
    { label: 'Campaigns', value: analytics.total_campaigns || 0 },
    { label: 'Applicants', value: analytics.total_applicants || 0 },
    { label: 'Creators hired', value: analytics.total_hired || 0 },
    { label: 'Conversion', value: `${Number(analytics.conversion_rate || 0)}%` },
  ];

  const shareProfile = async () => {
    const url = `${window.location.origin}/brands/${user?.id || profile.user_id || ''}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${brandName} on Jobfluencer`, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Brand profile link copied');
      }
    } catch (error) {
      if (error?.name !== 'AbortError') toast.error('Could not share the profile');
    }
  };

  const openPlanModal = () => {
    setSelectedPlan(currentPlan === 'pro' ? 'premium' : 'pro');
    setPlanModalOpen(true);
  };

  const upgradePlan = async () => {
    if (selectedPlan === currentPlan) {
      toast('That plan is already active');
      return;
    }
    setUpgrading(true);
    try {
      await axios.post(`${API}/subscriptions/brand`, { plan: selectedPlan }, { headers });
      await fetchUser();
      toast.success(`Brand workspace upgraded to ${selectedPlan}`);
      setPlanModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Could not upgrade the plan');
    } finally {
      setUpgrading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (loading) {
    return <div className={styles.page}><div className={styles.loadingPanel}><div className={styles.spinner} aria-label="Loading brand profile" /></div></div>;
  }

  return (
    <div className={styles.page} data-testid="brand-profile-workspace">
      <header className={styles.header}>
        <div className={styles.headingGroup}>
          <div className={styles.kicker}>Brand passport</div>
          <h1 className={styles.title}>Your presence, at a glance.</h1>
          <p className={styles.lead}>The identity and operating record creators see when they decide whether to work with you.</p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.secondaryAction} onClick={shareProfile} data-testid="share-profile-btn">
            <Share2 /> Share
          </button>
          <Link href="/dashboard/brand/edit-profile" className={styles.primaryAction} data-testid="edit-profile-btn">
            <Edit3 /> Edit profile
          </Link>
        </div>
      </header>

      <section className={styles.passport} aria-label="Brand identity passport">
        <div className={styles.passportTop}>
          <div className={styles.brandIdentity}>
            <div className={styles.brandAvatar}>
              {profile.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.logo_url} alt={`${brandName} logo`} />
              ) : initials(brandName)}
            </div>
            <div>
              <small>Verified operating identity</small>
              <h1>{brandName}</h1>
              <div className={styles.brandMetaRow}>
                <span><BriefcaseBusiness /> {profile.industry || 'Industry not set'}</span>
                <span><MapPin /> {profile.city || user?.city || 'India'}</span>
                {profile.website && (
                  <a href={safeWebsite(profile.website)} target="_blank" rel="noreferrer">
                    <Globe2 /> {websiteLabel(profile.website)}
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className={styles.profileCompleteness}>
            <span>Profile readiness</span>
            <div>
              <div className={styles.completionValue}>{completion}%</div>
              <div className={styles.completionTrack}><i style={{ width: `${completion}%` }} /></div>
              <p>{completion === 100 ? 'Everything creators need is visible.' : 'Complete the remaining identity details to strengthen trust.'}</p>
            </div>
          </div>
        </div>
        <div className={styles.passportMetrics}>
          {metrics.map((metric) => (
            <div className={styles.passportMetric} key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.profileGrid}>
        <div className={styles.profileColumn}>
          <section className={styles.profilePanel}>
            <header className={styles.panelHeader}>
              <div><small>Positioning</small><h2>About the brand</h2></div>
              <Link href="/dashboard/brand/edit-profile" className={styles.textAction}>Refine <ChevronRight /></Link>
            </header>
            <div className={styles.panelBody}>
              <p className={styles.aboutText}>{profile.description || 'Add a concise brand story so creators understand the product, audience, and kind of work you value.'}</p>
            </div>
          </section>

          <section className={styles.profilePanel}>
            <header className={styles.panelHeader}>
              <div><small>Reputation</small><h2>Creator reviews</h2></div>
              <div className={styles.actionRow}><Star /> <strong>{averageRating}</strong></div>
            </header>
            {reviews.length === 0 ? (
              <div className={styles.panelBody}><p className={styles.aboutText}>Your first creator review will appear here after a completed collaboration.</p></div>
            ) : (
              <div className={styles.reviewList}>
                {reviews.slice(0, 5).map((review, index) => (
                  <article className={styles.reviewItem} key={review.id || index} data-testid={`brand-review-${review.id || index}`}>
                    <div className={styles.reviewTop}>
                      <div className={styles.reviewer}>
                        <span className={styles.avatar}>{initials(review.reviewer_name)}</span>
                        <div>
                          <strong>{review.reviewer_name || 'Creator'}</strong>
                          <span>{review.reviewer_role || 'creator'}</span>
                        </div>
                      </div>
                      <div className={styles.stars} aria-label={`${review.rating || 0} out of 5 stars`}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} fill={star <= Number(review.rating || 0) ? 'currentColor' : 'none'} />
                        ))}
                      </div>
                    </div>
                    {review.comment && <p>{review.comment}</p>}
                    <time>{formatDate(review.created_at)}</time>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className={styles.profileColumn}>
          <section className={styles.planBanner} data-plan={currentPlan}>
            <small>Current workspace</small>
            <h2>{currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} plan</h2>
            <p>{currentPlan === 'premium' ? 'Your complete hiring toolkit is active.' : 'Expand campaign volume, invitations, and decision intelligence.'}</p>
            <button type="button" className={styles.primaryAction} onClick={openPlanModal} data-testid="upgrade-plan-btn">
              <Crown /> {currentPlan === 'premium' ? 'Review plans' : 'Upgrade workspace'}
            </button>
          </section>

          <section className={styles.profilePanel}>
            <header className={styles.panelHeader}>
              <div><small>Resources</small><h2>Hiring wallet</h2></div>
              <WalletCards />
            </header>
            <div className={styles.panelBody}>
              <div className={styles.walletValues}>
                <div className={styles.walletValue}><span>Invite credits</span><strong>{Number(wallet.invite_credits || 0)}</strong></div>
                <div className={styles.walletValue}><span>Balance</span><strong>{formatCurrency(wallet.balance)}</strong></div>
              </div>
              <Link href="/buy-credits" className={styles.primaryAction} style={{ width: '100%', marginTop: 14 }}>Buy credits</Link>
            </div>
          </section>

          <section className={styles.profilePanel}>
            <header className={styles.panelHeader}>
              <div><small>Workspace</small><h2>Account controls</h2></div>
            </header>
            <div className={styles.accountActions}>
              <Link href="/dashboard/brand/edit-profile" className={styles.accountAction}>
                <span><Edit3 /></span>
                <div><strong>Edit brand details</strong><small>Identity, website, and story</small></div>
                <ChevronRight />
              </Link>
              <button type="button" className={styles.accountAction} onClick={shareProfile}>
                <span><LinkIcon /></span>
                <div><strong>Share public profile</strong><small>Send your brand passport</small></div>
                <ChevronRight />
              </button>
              <button type="button" className={`${styles.accountAction} ${styles.accountDanger}`} onClick={handleLogout} data-testid="logout-profile-btn">
                <span><LogOut /></span>
                <div><strong>Log out</strong><small>End this workspace session</small></div>
                <ChevronRight />
              </button>
            </div>
          </section>
        </aside>
      </div>

      {planModalOpen && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setPlanModalOpen(false);
        }}>
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="plan-title" data-testid="subscription-modal">
            <header className={styles.modalHeader}>
              <div>
                <div className={styles.modalEyebrow}>Workspace capacity</div>
                <h2 id="plan-title">Choose your operating plan</h2>
              </div>
              <button type="button" className={styles.closeButton} onClick={() => setPlanModalOpen(false)} aria-label="Close plan picker"><X /></button>
            </header>
            <div className={styles.modalBody}>
              <p className={styles.modalNote}>You are currently on the <strong>{currentPlan}</strong> plan.</p>
              <div className={styles.choiceGrid}>
                {PLANS.map((plan) => (
                  <button
                    type="button"
                    key={plan.key}
                    className={`${styles.choice} ${selectedPlan === plan.key ? styles.choiceActive : ''}`}
                    onClick={() => setSelectedPlan(plan.key)}
                    data-testid={`plan-${plan.key}`}
                  >
                    <div>
                      <strong>{plan.name}</strong>
                      <p>{plan.copy}</p>
                    </div>
                    <span>{formatCurrency(plan.price)}/mo</span>
                  </button>
                ))}
              </div>
              <div className={styles.breakdown}>
                <div className={styles.breakdownRow}><span>Selected plan</span><strong>{selectedPlan}</strong></div>
                <div className={`${styles.breakdownRow} ${styles.breakdownTotal}`}>
                  <span>Monthly total</span>
                  <strong>{formatCurrency(PLANS.find((plan) => plan.key === selectedPlan)?.price)}</strong>
                </div>
              </div>
            </div>
            <footer className={styles.modalFooter}>
              <button type="button" className={styles.secondaryAction} onClick={() => setPlanModalOpen(false)}>Cancel</button>
              <button type="button" className={styles.primaryAction} onClick={upgradePlan} disabled={upgrading} data-testid="confirm-upgrade-btn">
                <Check /> {upgrading ? 'Updating...' : `Choose ${selectedPlan}`}
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
