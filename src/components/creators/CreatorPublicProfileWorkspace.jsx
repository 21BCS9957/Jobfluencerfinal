'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Check,
  Copy,
  ExternalLink,
  FileVideo2,
  Image as ImageIcon,
  Instagram,
  Link2,
  MapPin,
  MessageSquare,
  Share2,
  Sparkles,
  Star,
  Youtube,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API } from '@/legacy_pages/dashboard/shared';
import OpportunityNavigation from '@/components/jobs/OpportunityNavigation';
import styles from './CreatorsWorkspace.module.css';

function listFrom(payload, key) {
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload?.[key]) ? payload[key] : [];
}

function formatFollowers(value) {
  const count = Number(value || 0);
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
}

function workImage(item) {
  if (item?.type !== 'image' || !item?.storage_path) return null;
  if (/^https?:\/\//.test(item.storage_path)) return item.storage_path;
  return `${API}/files/${item.storage_path}`;
}

function servicePrice(value) {
  if (value === null || value === undefined || value === '') return 'On request';
  if (typeof value === 'number') return `Rs.${value.toLocaleString('en-IN')}`;
  return String(value).startsWith('Rs.') ? String(value) : `Rs.${value}`;
}

export default function CreatorPublicProfileWorkspace() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [creator, setCreator] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [links, setLinks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [services, setServices] = useState([]);
  const [activeTab, setActiveTab] = useState('work');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      setLoading(true);
      const [profileResult, portfolioResult, linksResult, reviewsResult, servicesResult] = await Promise.allSettled([
        axios.get(`${API}/creators/${id}`),
        axios.get(`${API}/portfolio/${id}`),
        axios.get(`${API}/portfolio/links/${id}`),
        axios.get(`${API}/reviews/${id}`),
        axios.get(`${API}/portfolio/services/${id}`),
      ]);
      if (cancelled) return;

      if (profileResult.status === 'fulfilled') {
        setCreator(profileResult.value.data?.creator || profileResult.value.data);
      } else {
        setCreator(null);
      }
      if (portfolioResult.status === 'fulfilled') setPortfolio(listFrom(portfolioResult.value.data, 'items'));
      if (linksResult.status === 'fulfilled') setLinks(listFrom(linksResult.value.data, 'links'));
      if (reviewsResult.status === 'fulfilled') setReviews(listFrom(reviewsResult.value.data, 'reviews'));
      if (servicesResult.status === 'fulfilled') setServices(listFrom(servicesResult.value.data, 'services'));
      setLoading(false);
    }

    fetchProfile();
    return () => { cancelled = true; };
  }, [id]);

  const socialLinks = useMemo(() => {
    if (!creator) return [];
    const items = [];
    if (creator.instagram_handle) {
      items.push({
        label: creator.instagram_handle,
        platform: 'Instagram',
        url: `https://instagram.com/${creator.instagram_handle.replace('@', '')}`,
        icon: Instagram,
      });
    }
    if (creator.youtube_handle) {
      items.push({
        label: creator.youtube_handle,
        platform: 'YouTube',
        url: creator.youtube_handle.startsWith('http') ? creator.youtube_handle : `https://youtube.com/@${creator.youtube_handle.replace('@', '')}`,
        icon: Youtube,
      });
    }
    return items;
  }, [creator]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Creator profile link copied.');
    } catch {
      toast.error('Could not copy the profile link.');
    }
  }

  async function shareProfile() {
    const url = window.location.href;
    const title = `${creator?.display_name || 'Creator'} on Jobfluencer`;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        return;
      }
      return;
    }
    copyLink();
  }

  function startConversation() {
    if (!user) {
      router.push('/login');
      return;
    }
    const base = user.role === 'brand' ? '/dashboard/brand/messages' : '/dashboard/influencer/messages';
    router.push(`${base}?to=${id}`);
  }

  if (loading) {
    return (
      <div className={styles.profilePage}>
        <OpportunityNavigation active="creators" />
        <div className={styles.profileLoader}><span /><span /><span /><p>Assembling creator dossier</p></div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className={styles.profilePage}>
        <OpportunityNavigation active="creators" />
        <main className={styles.missingProfile}>
          <span><Sparkles /></span>
          <p>Creator file unavailable</p>
          <h1>This profile is between chapters.</h1>
          <Link href="/influencers">Return to the talent index <ArrowRight /></Link>
        </main>
      </div>
    );
  }

  const name = creator.display_name || creator.name || 'Creator';
  const rating = Number(creator.avg_rating || 0);
  const portrait = creator.profile_image_url;
  const totalProof = portfolio.length + links.length;

  return (
    <div className={styles.profilePage} data-testid="creator-public-profile">
      <OpportunityNavigation active="creators" />

      <div className={styles.dossierBar}>
        <Link href="/influencers" data-testid="back-btn"><ArrowLeft /> Talent index</Link>
        <span>Public creator dossier / {id}</span>
        <div>
          <button type="button" onClick={copyLink} title="Copy profile link" data-testid="copy-link-btn"><Copy /><span>Copy link</span></button>
          <button type="button" onClick={shareProfile} title="Share profile" data-testid="share-btn"><Share2 /><span>Share</span></button>
        </div>
      </div>

      <section className={styles.profileHero}>
        <div className={styles.profileHeroInner}>
          <div className={styles.profilePortrait} style={portrait ? { backgroundImage: `url(${portrait})` } : undefined}>
            {!portrait && <span>{name.charAt(0)}</span>}
            <small>Portrait / 01</small>
          </div>

          <div className={styles.profileIdentity}>
            <span className={styles.eyebrow}><Sparkles /> Selected creator</span>
            <p className={styles.identityMeta}><MapPin /> {creator.city || 'India'} <i /> {creator.category || 'Independent creator'}</p>
            <div className={styles.identityName}>
              <h1>{name}</h1>
              {creator.is_verified && <BadgeCheck aria-label="Verified creator" />}
            </div>
            <p className={styles.identityStatement}>{creator.bio || `Independent ${creator.category || 'creator'} building memorable work for ambitious brands.`}</p>
            <div className={styles.identityTags}>{(creator.niches || []).slice(0, 5).map((niche) => <span key={niche}>{niche}</span>)}</div>
          </div>

          <aside className={styles.profileSignalRail} aria-label="Creator performance summary">
            <span>Working signal</span>
            <div><strong>{formatFollowers(creator.followers_count)}</strong><small>Audience</small></div>
            <div><strong>{rating ? rating.toFixed(1) : '-'}</strong><small>Rating</small></div>
            <div><strong>{creator.total_jobs || 0}</strong><small>Projects</small></div>
            <div><strong>{totalProof}</strong><small>Proof points</small></div>
          </aside>
        </div>
      </section>

      <div className={styles.profileLayout}>
        <main className={styles.profileMain}>
          <section className={styles.profileNarrative}>
            <header><span className={styles.sectionNumber}>01</span><div><p>Creator perspective</p><h2>Point of view before platform.</h2></div></header>
            <div className={styles.narrativeBody}>
              <p>{creator.bio || `${name} brings a clear visual point of view to brand collaborations and social storytelling.`}</p>
              <div>
                <span>Working range</span>
                <p>{(creator.platforms || []).length ? creator.platforms.map((platform) => <b key={platform}>{platform}</b>) : <em>Platform mix available on request</em>}</p>
              </div>
              <div>
                <span>Creative territory</span>
                <p>{(creator.niches || []).length ? creator.niches.map((niche) => <b key={niche}>{niche}</b>) : <em>Open to considered collaborations</em>}</p>
              </div>
            </div>
          </section>

          <section className={styles.proofSection}>
            <header className={styles.proofHeader}>
              <div><span className={styles.sectionNumber}>02</span><div><p>Proof wall</p><h2>Inspect the work in context.</h2></div></div>
              <nav className={styles.profileTabs} aria-label="Creator profile sections">
                <button type="button" className={activeTab === 'work' ? styles.activeProfileTab : ''} onClick={() => setActiveTab('work')} data-testid="public-tab-work">Work <span>{portfolio.length}</span></button>
                <button type="button" className={activeTab === 'links' ? styles.activeProfileTab : ''} onClick={() => setActiveTab('links')} data-testid="public-tab-links">Links <span>{links.length + socialLinks.length}</span></button>
                <button type="button" className={activeTab === 'reviews' ? styles.activeProfileTab : ''} onClick={() => setActiveTab('reviews')} data-testid="public-tab-reviews">Trust <span>{reviews.length}</span></button>
              </nav>
            </header>

            {activeTab === 'work' && (
              portfolio.length ? (
                <div className={styles.publicWorkGrid}>
                  {portfolio.map((item, index) => {
                    const imageUrl = workImage(item);
                    return (
                      <article className={`${styles.publicWorkItem} ${index === 0 ? styles.publicWorkLead : ''}`} key={item.id} data-testid={`public-portfolio-${item.id}`} style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}>
                        {!imageUrl && <div>{item.type === 'image' ? <ImageIcon /> : <FileVideo2 />}</div>}
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <footer><strong>{item.title || `Selected work ${index + 1}`}</strong><small>{item.type || 'Portfolio'}</small></footer>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.proofEmpty}><ImageIcon /><div><strong>The next proof belongs here.</strong><p>This creator is still arranging their public work wall.</p></div></div>
              )
            )}

            {activeTab === 'links' && (
              links.length || socialLinks.length ? (
                <div className={styles.publicLinkList}>
                  {socialLinks.map((link) => {
                    const Icon = link.icon;
                    return <a href={link.url} target="_blank" rel="noreferrer" key={link.platform}><span><Icon /></span><div><small>{link.platform}</small><strong>{link.label}</strong></div><ArrowUpRight /></a>;
                  })}
                  {links.map((link) => <a href={link.url} target="_blank" rel="noreferrer" key={link.id} data-testid={`public-link-${link.id}`}><span><Link2 /></span><div><small>{link.platform || 'Published work'}</small><strong>{link.title || link.url}</strong></div><ExternalLink /></a>)}
                </div>
              ) : (
                <div className={styles.proofEmpty}><Link2 /><div><strong>No live links in this edit.</strong><p>Ask the creator for private or in-progress work.</p></div></div>
              )
            )}

            {activeTab === 'reviews' && (
              reviews.length ? (
                <div className={styles.publicReviewList}>
                  {reviews.map((review, index) => <article key={review.id || index} data-testid={`public-review-${review.id}`}><header><span>{(review.reviewer_name || 'C').charAt(0)}</span><div><strong>{review.reviewer_name || 'Collaborator'}</strong><small>{review.reviewer_role || 'Verified project'}</small></div><p>{[1, 2, 3, 4, 5].map((star) => <Star key={star} className={star <= Number(review.rating || 0) ? styles.reviewStarFilled : ''} />)}</p></header><blockquote>{review.comment || 'A thoughtful and reliable creative collaborator.'}</blockquote></article>)}
                </div>
              ) : (
                <div className={styles.proofEmpty}><Star /><div><strong>Trust history starts after the work.</strong><p>Reviews appear when completed collaborations close.</p></div></div>
              )
            )}
          </section>
        </main>

        <aside className={styles.profileAside}>
          <section className={styles.hirePanel}>
            <span className={styles.eyebrow}>Collaboration desk</span>
            <div className={styles.rateLine}><small>Base rate</small><strong>{Number(creator.hourly_rate || 0) > 0 ? `Rs.${Number(creator.hourly_rate).toLocaleString('en-IN')} / day` : 'On request'}</strong></div>
            <div className={styles.availabilityLine}><i /><span><strong>Open to considered briefs</strong><small>Direct conversation through Jobfluencer</small></span></div>
            <button type="button" onClick={startConversation} data-testid={user ? 'message-influencer-btn' : 'login-to-hire-btn'}><MessageSquare /> {user ? 'Start a conversation' : 'Sign in to hire'} <ArrowRight /></button>
            <p><Check /> Review the work, then send a specific brief.</p>
          </section>

          <section className={styles.offerPanel}>
            <header><span>Offer menu</span><strong>{services.length || 'Open'}</strong></header>
            {services.length ? (
              <div className={styles.publicServiceList}>
                {services.map((service, index) => <article key={service.id || index} data-testid={`public-service-${service.id}`}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{service.name || 'Creator service'}</strong><p>{service.description || 'Scope shaped around the brief.'}</p></div><small>{servicePrice(service.price)}</small></article>)}
              </div>
            ) : (
              <div className={styles.offerEmpty}><Sparkles /><strong>Custom scope</strong><p>This creator shapes services around the campaign.</p></div>
            )}
          </section>

          <section className={styles.workingNote}>
            <span>Good brief / good work</span>
            <p>Share the objective, channel, deliverables, usage window, and timing before discussing execution.</p>
          </section>
        </aside>
      </div>

      <section className={styles.profileClosingBand}>
        <div><span className={styles.eyebrow}>Keep discovering</span><h2>Compare point of view, then choose with intent.</h2></div>
        <Link href="/influencers">Return to the casting board <ArrowUpRight /></Link>
      </section>
    </div>
  );
}
