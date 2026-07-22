'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import {
  ArrowRight,
  BarChart3,
  Copy,
  Crown,
  Edit3,
  Link2,
  LogOut,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  WalletCards,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API } from '@/legacy_pages/dashboard/shared';
import { VerifiedBadgeModal } from '@/legacy_pages/dashboard/MonetizationModals';
import styles from './CreatorWorkspace.module.css';

function listFrom(payload, key) {
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload?.[key]) ? payload[key] : [];
}

export default function CreatorProfileWorkspace() {
  const router = useRouter();
  const { user, token, logout, subscription } = useAuth();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVerifiedModal, setShowVerifiedModal] = useState(false);
  const headers = useMemo(() => token ? { Authorization: `Bearer ${token}` } : undefined, [token]);

  async function fetchProfile() {
    const [profileResult, reviewsResult, analyticsResult, walletResult] = await Promise.allSettled([
      axios.get(`${API}/creators/${user?.id}`, { headers }),
      axios.get(`${API}/reviews/${user?.id}`, { headers }),
      axios.get(`${API}/analytics/dashboard`, { headers }),
      axios.get(`${API}/wallet`, { headers }),
    ]);
    if (profileResult.status === 'fulfilled') setProfile(profileResult.value.data?.creator || profileResult.value.data);
    if (reviewsResult.status === 'fulfilled') setReviews(listFrom(reviewsResult.value.data, 'reviews'));
    if (analyticsResult.status === 'fulfilled') setAnalytics(analyticsResult.value.data);
    if (walletResult.status === 'fulfilled') setWallet(walletResult.value.data);
    setLoading(false);
  }

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headers, user?.id]);

  function shareProfile() {
    const url = `${window.location.origin}/influencers/${user?.id}`;
    navigator.clipboard.writeText(url).then(() => toast.success('Public profile link copied.')).catch(() => toast.error('Could not copy the profile link.'));
  }

  function logOut() {
    logout();
    router.push('/login');
  }

  if (loading) return <div className={styles.pageLoader}><span /><span /><span /></div>;

  const name = profile?.display_name || user?.name || 'Creator';
  const initials = name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const image = profile?.profile_image_url;
  const plan = subscription?.plan || 'free';

  return (
    <div className={styles.page} data-testid="creator-profile-workspace">
      <header className={styles.pageHeader}>
        <div className={styles.headingGroup}><span className={styles.kicker}>Creator account</span><h1>Profile and studio settings</h1><p>Manage the identity, trust signals, and account details behind your public creator presence.</p></div>
        <Link href="/dashboard/influencer/edit-profile" className={styles.primaryButton} data-testid="edit-profile-btn"><Edit3 /> Edit profile</Link>
      </header>

      <section className={styles.profileStage}>
        <div className={styles.profileStageIdentity}>
          <span className={styles.profileAvatar} style={image ? { backgroundImage: `url(${image})` } : undefined}>{!image && initials}</span>
          <div>
            <span className={styles.kicker}>Public identity</span>
            <div className={styles.profileNameRow}><h2>{name}</h2>{profile?.is_verified && <span data-testid="verified-badge"><ShieldCheck /> Verified</span>}</div>
            <p><MapPin /> {profile?.city || user?.city || 'India'} <i /> {profile?.category || 'Creator'}</p>
          </div>
        </div>
        <p className={styles.profileBio}>{profile?.bio || 'Add a focused creator bio so brands understand your voice, niche, and working style before they reach out.'}</p>
        <div className={styles.profileStageActions}><button type="button" onClick={shareProfile} data-testid="share-portfolio-btn"><Copy /> Copy public link</button><Link href={`/influencers/${user?.id}`}><Link2 /> View public profile</Link></div>
      </section>

      <section className={styles.accountRail}>
        <div><span><Crown /></span><small>Plan</small><strong>{String(plan).charAt(0).toUpperCase() + String(plan).slice(1)}</strong><Link href="/pricing">Manage</Link></div>
        <div><span><WalletCards /></span><small>Credits</small><strong>{wallet?.invite_credits || 0}</strong><Link href="/buy-credits">Add credits</Link></div>
        <div><span><Sparkles /></span><small>Balance</small><strong>Rs.{Number(wallet?.balance || 0).toLocaleString('en-IN')}</strong><Link href="/buy-credits">Wallet</Link></div>
        <div><span><Star /></span><small>Rating</small><strong>{Number(profile?.avg_rating || analytics?.avg_rating || 0).toFixed(1)}</strong><Link href="/dashboard/influencer/portfolio">Portfolio</Link></div>
      </section>

      <div className={styles.profileGrid}>
        <main className={styles.profileMain}>
          <section className={styles.profileSection}>
            <header><div><span className={styles.sectionNumber}>01</span><div><h2>Creator positioning</h2><p>The signals brands use to understand fit.</p></div></div><Link href="/dashboard/influencer/edit-profile"><Edit3 /> Edit</Link></header>
            <div className={styles.profileFacts}>
              <div><small>Category</small><strong>{profile?.category || 'Not set'}</strong></div>
              <div><small>Audience</small><strong>{Number(profile?.followers_count || 0).toLocaleString('en-IN')}</strong></div>
              <div><small>Base rate</small><strong>Rs.{Number(profile?.hourly_rate || 0).toLocaleString('en-IN')}</strong></div>
              <div><small>Hire rate</small><strong>{analytics?.hire_rate || 0}%</strong></div>
            </div>
            <div className={styles.tagGroups}>
              <div><small>Niches</small><p>{(profile?.niches || []).length ? profile.niches.map((niche) => <span key={niche}>{niche}</span>) : <em>Add your strongest niches</em>}</p></div>
              <div><small>Platforms</small><p>{(profile?.platforms || []).length ? profile.platforms.map((platform) => <span key={platform}>{platform}</span>) : <em>Add the platforms you create for</em>}</p></div>
            </div>
          </section>

          <section className={styles.profileSection}>
            <header><div><span className={styles.sectionNumber}>02</span><div><h2>Recent trust signals</h2><p>Feedback attached to completed collaborations.</p></div></div><Link href="/dashboard/influencer/portfolio">View all <ArrowRight /></Link></header>
            {reviews.length ? <div className={styles.profileReviews}>{reviews.slice(0, 3).map((review) => <article key={review.id} data-testid={`review-${review.id}`}><span>{(review.reviewer_name || '?').charAt(0)}</span><div><header><strong>{review.reviewer_name || 'Brand partner'}</strong><small>{review.rating}/5</small></header><p>{review.comment}</p></div></article>)}</div> : <div className={styles.inlineEmpty}><Star /><div><strong>No reviews yet.</strong><p>Completed collaborations will build your trust history here.</p></div></div>}
          </section>
        </main>

        <aside className={styles.accountActions}>
          <section className={styles.analyticsCallout}><BarChart3 /><span className={styles.kicker}>Performance</span><h2>Know what is converting.</h2><p>Track application, shortlist, and hiring momentum.</p><Link href="/dashboard/influencer/analytics">Open analytics <ArrowRight /></Link></section>
          {!profile?.is_verified && <button type="button" className={styles.verifyAction} onClick={() => setShowVerifiedModal(true)} data-testid="get-verified-btn"><ShieldCheck /><span><strong>Get verified</strong><small>Add a stronger trust signal</small></span><ArrowRight /></button>}
          <Link href="/pricing" className={styles.accountAction}><Crown /><span><strong>Upgrade studio</strong><small>Unlock more creator tools</small></span><ArrowRight /></Link>
          <button type="button" className={styles.logoutAction} onClick={logOut} data-testid="logout-profile-btn"><LogOut /><span><strong>Log out</strong><small>End this workspace session</small></span></button>
        </aside>
      </div>

      {showVerifiedModal && <VerifiedBadgeModal onClose={() => setShowVerifiedModal(false)} onVerified={() => { fetchProfile(); setShowVerifiedModal(false); }} />}
    </div>
  );
}
