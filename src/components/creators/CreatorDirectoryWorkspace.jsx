'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Check,
  Eye,
  MapPin,
  MessageSquare,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API, CATEGORIES, CITIES, PLATFORMS } from '@/legacy_pages/dashboard/shared';
import OpportunityNavigation from '@/components/jobs/OpportunityNavigation';
import styles from './CreatorsWorkspace.module.css';

const FALLBACK_COLORS = ['#d83f87', '#176b5a', '#b06a16', '#4d5ea9', '#24778a', '#6c564d'];

function listFrom(payload) {
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload?.creators) ? payload.creators : [];
}

function formatFollowers(value) {
  const count = Number(value || 0);
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
}

function creatorId(creator) {
  return String(creator?.user_id || creator?.id || '');
}

export default function CreatorDirectoryWorkspace() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [platform, setPlatform] = useState(searchParams.get('platform') || '');
  const [sort, setSort] = useState('recommended');

  const fetchCreators = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (category) params.set('category', category);
    try {
      const response = await axios.get(`${API}/creators?${params.toString()}`);
      const nextCreators = listFrom(response.data);
      setCreators(nextCreators);
      setTotal(Number(response.data?.total ?? nextCreators.length));
    } catch {
      setCreators([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [category, city]);

  useEffect(() => {
    fetchCreators();
  }, [fetchCreators]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (city) params.set('city', city);
    if (category) params.set('category', category);
    if (platform) params.set('platform', platform);
    const next = params.toString();
    router.replace(next ? `/influencers?${next}` : '/influencers', { scroll: false });
  }, [category, city, platform, query, router]);

  const visibleCreators = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = creators.filter((creator) => {
      const copy = `${creator.display_name || ''} ${creator.category || ''} ${creator.city || ''} ${(creator.niches || []).join(' ')}`.toLowerCase();
      const platformMatch = !platform || (creator.platforms || []).some((item) => item.toLowerCase() === platform.toLowerCase());
      return (!needle || copy.includes(needle)) && platformMatch;
    });
    return [...filtered].sort((a, b) => {
      if (sort === 'rating') return Number(b.avg_rating || 0) - Number(a.avg_rating || 0);
      if (sort === 'audience') return Number(b.followers_count || 0) - Number(a.followers_count || 0);
      if (sort === 'rate-low') return Number(a.hourly_rate || 0) - Number(b.hourly_rate || 0);
      return Number(b.is_verified || 0) - Number(a.is_verified || 0) || Number(b.avg_rating || 0) - Number(a.avg_rating || 0);
    });
  }, [creators, platform, query, sort]);

  const activeFilterCount = Number(Boolean(city)) + Number(Boolean(category)) + Number(Boolean(platform));

  function clearFilters() {
    setQuery('');
    setCity('');
    setCategory('');
    setPlatform('');
    setSort('recommended');
  }

  function messagePath(creator) {
    const id = creatorId(creator);
    if (!user) return '/login';
    return user.role === 'brand' ? `/dashboard/brand/messages?to=${id}` : `/dashboard/influencer/messages?to=${id}`;
  }

  return (
    <div className={styles.directoryPage} data-testid="creator-directory-workspace">
      <OpportunityNavigation active="creators" />

      <section className={styles.directoryHero}>
        <div className={styles.directoryHeroInner}>
          <div className={styles.directoryHeroCopy}>
            <span className={styles.eyebrow}><Sparkles /> Talent index</span>
            <h1>Creator talent directory.</h1>
            <p>Find the person behind the numbers: their visual language, working range, audience, and proof.</p>
          </div>
          <div className={styles.signalKey}>
            <span>Discovery signal</span>
            <strong>{loading ? '-' : total}</strong>
            <p>creator profiles open for discovery</p>
            <ul><li><i className={styles.signalPink} /> Craft</li><li><i className={styles.signalYellow} /> Relevance</li><li><i /> Trust</li></ul>
          </div>
        </div>
      </section>

      <section className={styles.filterBand} aria-label="Filter creators">
        <div className={styles.filterInner}>
          <label className={styles.searchField}><Search /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search creators, niches, or disciplines" aria-label="Search creators" data-testid="search-creators-input" /></label>
          <label className={styles.selectField}><MapPin /><select value={city} onChange={(event) => setCity(event.target.value)} aria-label="Filter creators by city" data-testid="filter-city-select"><option value="">All cities</option>{CITIES.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <label className={styles.selectField}><Users /><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter creators by category" data-testid="filter-category-select"><option value="">All disciplines</option>{CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <label className={styles.selectField}><Eye /><select value={platform} onChange={(event) => setPlatform(event.target.value)} aria-label="Filter creators by platform"><option value="">All platforms</option>{PLATFORMS.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <label className={styles.sortField}><SlidersHorizontal /><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort creators"><option value="recommended">Recommended</option><option value="rating">Highest rated</option><option value="audience">Largest audience</option><option value="rate-low">Rate: low to high</option></select></label>
          {(activeFilterCount > 0 || query) && <button type="button" className={styles.clearButton} onClick={clearFilters} aria-label="Clear filters" title="Clear filters" data-testid="clear-filters-btn"><X /></button>}
        </div>
      </section>

      <main className={styles.talentBoard}>
        <header className={styles.boardHeader}>
          <div><span className={styles.sectionNumber}>01</span><div><h2>The casting board</h2><p>Talent arranged for inspection, not endless scrolling.</p></div></div>
          <span data-testid="influencers-count"><strong>{visibleCreators.length}</strong> shown{activeFilterCount ? ` / ${activeFilterCount} filters` : ''}</span>
        </header>

        {loading ? (
          <div className={styles.creatorSkeletons}>{[0, 1, 2, 3, 4].map((item) => <i key={item} />)}</div>
        ) : visibleCreators.length ? (
          <section className={styles.creatorGrid}>
            {visibleCreators.map((creator, index) => {
              const id = creatorId(creator);
              const name = creator.display_name || creator.name || 'Creator';
              const image = creator.profile_image_url;
              return (
                <article className={styles.creatorCard} key={id || index} data-testid={`influencer-card-${creator.id}`}>
                  <Link href={`/influencers/${id}`} className={styles.creatorVisual} style={image ? { backgroundImage: `url(${image})` } : { backgroundColor: FALLBACK_COLORS[index % FALLBACK_COLORS.length] }} aria-label={`View ${name}`}>
                    {!image && <span className={styles.creatorInitial}>{name.charAt(0)}</span>}
                    <span className={styles.creatorIndex}>{String(index + 1).padStart(2, '0')}</span>
                    {creator.is_verified && <span className={styles.verifiedMark} data-testid={`verified-badge-${creator.id}`}><BadgeCheck /></span>}
                    <span className={styles.visualDiscipline}>{creator.category || 'Creator'}</span>
                  </Link>
                  <div className={styles.creatorInfo}>
                    <div className={styles.creatorNameRow}><div><small>{creator.city || 'India'}</small><h3 data-testid={`influencer-name-${creator.id}`}>{name}</h3></div><Link href={`/influencers/${id}`} aria-label={`Open ${name}'s profile`}><ArrowUpRight /></Link></div>
                    <p>{creator.bio || `Independent ${creator.category || 'creator'} available for selected collaborations.`}</p>
                    <div className={styles.creatorSignals}><span><strong>{formatFollowers(creator.followers_count)}</strong><small>Audience</small></span><span><strong>{Number(creator.avg_rating || 0).toFixed(1)}</strong><small>Rating</small></span><span><strong>{creator.total_jobs || 0}</strong><small>Projects</small></span></div>
                    <div className={styles.creatorTags}>{(creator.niches || []).slice(0, 3).map((niche) => <span key={niche}>{niche}</span>)}</div>
                    <div className={styles.creatorActions}>
                      <Link href={messagePath(creator)} data-testid={`chat-${creator.id}-btn`}><MessageSquare /> Message</Link>
                      <Link href={`/influencers/${id}`} data-testid={`hire-${creator.id}-btn`}>View dossier <ArrowRight /></Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <section className={styles.emptyTalent}>
            <span><Search /></span>
            <div><h2>No creator matches this casting view.</h2><p>Reset the lens or broaden the discipline, platform, and city.</p></div>
            <button type="button" onClick={clearFilters}>Reset the index <ArrowRight /></button>
          </section>
        )}

        <section className={styles.discoveryRail}>
          <div><span className={styles.eyebrow}>Discovery standard</span><h2>Shortlist for the work, not the vanity metric.</h2></div>
          <ul><li><Check /> Inspect relevant proof</li><li><Check /> Compare working range</li><li><Check /> Read collaborator trust</li></ul>
          <Link href="/dashboard/brand/post-job">Post a clear brief <ArrowUpRight /></Link>
        </section>
      </main>

      <section className={styles.directoryCta}>
        <div><span className={styles.eyebrow}>{user?.role === 'brand' ? 'Hirer workspace' : 'Build your presence'}</span><h2>{user?.role === 'brand' ? 'Found the right point of view?' : 'Your work belongs in the index.'}</h2><p>{user?.role === 'brand' ? 'Move from discovery to a clear brief and direct conversation.' : 'Publish your creator profile, services, and strongest proof.'}</p></div>
        <Link href={user?.role === 'brand' ? '/dashboard/brand/post-job' : '/register?role=creator'} data-testid={user?.role === 'brand' ? 'post-job-cta-btn' : 'join-influencer-btn'}>{user?.role === 'brand' ? 'Post a brief' : 'Join as a creator'} <ArrowRight /></Link>
      </section>
    </div>
  );
}
