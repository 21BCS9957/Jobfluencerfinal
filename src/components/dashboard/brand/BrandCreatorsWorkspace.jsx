'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'sonner';
import {
  ArrowUpRight,
  Check,
  Eye,
  MapPin,
  MessageCircle,
  Search,
  Send,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API, CATEGORIES, CITIES } from '@/legacy_pages/dashboard/shared';
import styles from './BrandWorkspace.module.css';

function unwrapList(payload, key) {
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload?.[key]) ? payload[key] : [];
}

function formatFollowers(value) {
  const followers = Number(value || 0);
  if (followers >= 1_000_000) return `${(followers / 1_000_000).toFixed(1)}M`;
  if (followers >= 1_000) return `${(followers / 1_000).toFixed(1)}K`;
  return followers.toLocaleString('en-IN');
}

function formatRate(value) {
  const rate = Number(value || 0);
  if (!rate) return 'On request';
  return `${new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rate)}/day`;
}

function getNiches(creator) {
  if (Array.isArray(creator.niches)) return creator.niches.filter(Boolean);
  if (typeof creator.niches === 'string') {
    return creator.niches.split(',').map((niche) => niche.trim()).filter(Boolean);
  }
  return [];
}

export default function BrandCreatorsWorkspace() {
  const { token } = useAuth();
  const [creators, setCreators] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [inviteTarget, setInviteTarget] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [sending, setSending] = useState(false);

  const fetchWorkspace = useCallback(async () => {
    setLoading(true);
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const [creatorResult, campaignResult, walletResult] = await Promise.allSettled([
      axios.get(`${API}/creators`),
      axios.get(`${API}/jobs/my`, { headers }),
      axios.get(`${API}/wallet`, { headers }),
    ]);

    if (creatorResult.status === 'fulfilled') {
      setCreators(unwrapList(creatorResult.value.data, 'creators'));
    } else {
      toast.error('Could not load the creator directory');
    }

    if (campaignResult.status === 'fulfilled') {
      const jobs = unwrapList(campaignResult.value.data, 'jobs');
      setCampaigns(jobs.filter((job) => job.status === 'active' || job.status === 'open'));
    }

    if (walletResult.status === 'fulfilled') setWallet(walletResult.value.data);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchWorkspace();
  }, [fetchWorkspace]);

  const filteredCreators = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return creators.filter((creator) => {
      const name = creator.display_name || creator.name || '';
      const nicheText = getNiches(creator).join(' ');
      const searchable = `${name} ${creator.city || ''} ${creator.category || ''} ${nicheText}`.toLowerCase();
      const matchesQuery = !needle || searchable.includes(needle);
      const matchesCity = !city || creator.city === city;
      const matchesCategory = !category || creator.category === category;
      return matchesQuery && matchesCity && matchesCategory;
    });
  }, [category, city, creators, query]);

  const closeInvite = () => {
    setInviteTarget(null);
    setSelectedCampaign('');
    setInviteMessage('');
  };

  const sendInvite = async () => {
    if (!selectedCampaign || !inviteTarget) {
      toast.error('Choose a live campaign first');
      return;
    }

    setSending(true);
    try {
      await axios.post(`${API}/invites`, {
        campaign_id: selectedCampaign,
        influencer_id: inviteTarget.user_id || inviteTarget.id,
        message: inviteMessage.trim(),
      }, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      toast.success(`Invite sent to ${inviteTarget.display_name || inviteTarget.name}`);
      closeInvite();
      const walletResponse = await axios.get(`${API}/wallet`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setWallet(walletResponse.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Could not send this invite');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.page} data-testid="brand-creators-workspace">
      <header className={styles.header}>
        <div className={styles.headingGroup}>
          <div className={styles.kicker}>Talent index</div>
          <h1 className={styles.title}>Creators worth knowing.</h1>
          <p className={styles.lead}>Search the network, read the signal, then invite the right voice into a live campaign.</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/dashboard/brand/campaigns" className={styles.secondaryAction}>
            View campaigns <ArrowUpRight />
          </Link>
        </div>
      </header>

      <section className={styles.talentLens} data-testid="creator-discovery-lens">
        <div className={styles.talentCount}>
          <span>Current field</span>
          <strong>{filteredCreators.length}</strong>
          <small>creator profiles in focus</small>
        </div>
        <div className={styles.lensControls}>
          <div className={styles.lensLabel}>Tune the discovery lens</div>
          <div className={styles.lensControlGrid}>
            <label className={styles.darkSearch}>
              <Search />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Name, niche, or keyword"
                aria-label="Search creators"
                data-testid="creator-search"
              />
            </label>
            <select
              className={styles.darkSelect}
              value={city}
              onChange={(event) => setCity(event.target.value)}
              aria-label="Filter creators by city"
              data-testid="creator-city-filter"
            >
              <option value="">Every city</option>
              {CITIES.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <select
              className={styles.darkSelect}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              aria-label="Filter creators by category"
              data-testid="creator-category-filter"
            >
              <option value="">Every discipline</option>
              {CATEGORIES.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
        </div>
      </section>

      {loading ? (
        <div className={styles.loadingPanel}><div className={styles.spinner} aria-label="Loading creators" /></div>
      ) : filteredCreators.length === 0 ? (
        <section className={styles.emptyState}>
          <div>
            <div className={styles.emptyMark}><Users /></div>
            <h2>No creator matches that signal</h2>
            <p>Widen the city or discipline filters to bring more profiles into view.</p>
            <button
              type="button"
              className={styles.secondaryAction}
              onClick={() => { setQuery(''); setCity(''); setCategory(''); }}
            >
              Clear filters
            </button>
          </div>
        </section>
      ) : (
        <section className={`${styles.creatorGrid} ${styles.stagger}`} aria-label="Creator directory">
          {filteredCreators.map((creator, index) => {
            const creatorId = creator.user_id || creator.id;
            const creatorName = creator.display_name || creator.name || 'Creator';
            const niches = getNiches(creator);
            return (
              <article className={styles.creatorCard} key={creator.id || creatorId} data-testid={`creator-card-${creator.id || creatorId}`}>
                <div className={styles.creatorMedia}>
                  {creator.profile_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={creator.profile_image_url} alt={creatorName} />
                  ) : creatorName.charAt(0).toUpperCase()}
                  <span className={styles.creatorNumber}>#{String(index + 1).padStart(2, '0')}</span>
                  <span className={styles.verifiedMark} title="Profile ready"><Check /></span>
                </div>
                <div className={styles.creatorBody}>
                  <div className={styles.creatorHeading}>
                    <div>
                      <h2>{creatorName}</h2>
                      <small><MapPin /> {creator.city || 'India'}</small>
                    </div>
                  </div>
                  <div className={styles.creatorTags}>
                    <span className={styles.creatorTag}>{creator.category || 'Creator'}</span>
                    {niches.slice(0, 2).map((niche) => <span className={styles.creatorTag} key={niche}>{niche}</span>)}
                  </div>
                  <div className={styles.creatorStats}>
                    <div className={styles.creatorStat}>
                      <span>Audience</span>
                      <strong>{formatFollowers(creator.followers_count)} followers</strong>
                    </div>
                    <div className={styles.creatorStat}>
                      <span>Day rate</span>
                      <strong>{formatRate(creator.hourly_rate)}</strong>
                    </div>
                  </div>
                  <div className={styles.creatorActions}>
                    <Link
                      href={`/influencers/${creatorId}`}
                      className={styles.cardIconAction}
                      title={`View ${creatorName}`}
                      aria-label={`View ${creatorName}`}
                    >
                      <Eye />
                    </Link>
                    <Link
                      href={`/dashboard/brand/messages?to=${creatorId}`}
                      className={styles.cardAction}
                      data-testid={`chat-btn-${creator.id || creatorId}`}
                    >
                      <MessageCircle /> Chat
                    </Link>
                    <button
                      type="button"
                      className={styles.cardAction}
                      onClick={() => setInviteTarget(creator)}
                      data-testid={`hire-btn-${creator.id || creatorId}`}
                    >
                      <Send /> Invite
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {inviteTarget && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeInvite();
        }}>
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="invite-title" data-testid="invite-modal">
            <header className={styles.modalHeader}>
              <div>
                <div className={styles.modalEyebrow}>Direct invitation</div>
                <h2 id="invite-title">Invite {inviteTarget.display_name || inviteTarget.name}</h2>
              </div>
              <button type="button" className={styles.closeButton} onClick={closeInvite} aria-label="Close invite"><X /></button>
            </header>
            <div className={styles.modalBody}>
              <p className={styles.modalNote}>Attach this creator to a live brief. One invite credit is used when the signal is sent.</p>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Live campaign</span>
                <select
                  className={styles.select}
                  value={selectedCampaign}
                  onChange={(event) => setSelectedCampaign(event.target.value)}
                  data-testid="invite-campaign-select"
                >
                  <option value="">Select a campaign</option>
                  {campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.title}</option>)}
                </select>
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Personal note</span>
                <textarea
                  className={styles.textarea}
                  value={inviteMessage}
                  onChange={(event) => setInviteMessage(event.target.value)}
                  placeholder="We think your voice is a strong match for this campaign..."
                  data-testid="invite-message-input"
                />
              </label>
              <div className={styles.creditNote}>
                <span>Invite cost: 1 credit</span>
                <strong>{Number(wallet?.invite_credits || 0)} available</strong>
              </div>
              {campaigns.length === 0 && (
                <p className={styles.modalNote}>You need a live campaign before sending an invite.</p>
              )}
            </div>
            <footer className={styles.modalFooter}>
              <button type="button" className={styles.secondaryAction} onClick={closeInvite}>Cancel</button>
              <button
                type="button"
                className={styles.primaryAction}
                disabled={sending || !selectedCampaign}
                onClick={sendInvite}
                data-testid="send-invite-btn"
              >
                <Send /> {sending ? 'Sending...' : 'Send invitation'}
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
