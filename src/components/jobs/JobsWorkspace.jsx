'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronRight,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API, CATEGORIES, CITIES } from '@/legacy_pages/dashboard/shared';
import OpportunityNavigation from './OpportunityNavigation';
import styles from './JobsWorkspace.module.css';

function listFrom(payload) {
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload?.campaigns) ? payload.campaigns : [];
}

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
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function JobsWorkspace() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState('latest');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (category) params.set('category', category);
    try {
      const response = await axios.get(`${API}/jobs?${params.toString()}`);
      const nextJobs = listFrom(response.data);
      setJobs(nextJobs);
      setTotal(Number(response.data?.total ?? nextJobs.length));
    } catch {
      setJobs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [category, city]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (city) params.set('city', city);
    if (category) params.set('category', category);
    const next = params.toString();
    router.replace(next ? `/jobs?${next}` : '/jobs', { scroll: false });
  }, [category, city, query, router]);

  const visibleJobs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = jobs.filter((job) => {
      const copy = `${job.title || ''} ${job.brand_name || ''} ${job.niche || ''} ${job.category || ''} ${job.city || ''}`.toLowerCase();
      return !needle || copy.includes(needle);
    });
    return [...filtered].sort((a, b) => {
      if (sort === 'budget-high') return Number(b.budget_max || b.budget_min || 0) - Number(a.budget_max || a.budget_min || 0);
      if (sort === 'budget-low') return Number(a.budget_min || 0) - Number(b.budget_min || 0);
      if (sort === 'deadline') return new Date(a.deadline || '2999-01-01').getTime() - new Date(b.deadline || '2999-01-01').getTime();
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [jobs, query, sort]);

  const activeFilterCount = Number(Boolean(city)) + Number(Boolean(category));

  function clearFilters() {
    setQuery('');
    setCity('');
    setCategory('');
    setSort('latest');
  }

  return (
    <div className={styles.jobsPage} data-testid="jobs-workspace">
      <OpportunityNavigation />

      <section className={styles.jobsHero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}><Sparkles /> Opportunity board</span>
            <h1>Paid creator opportunities.</h1>
            <p>Inspect the brief, understand the terms, and apply with proof that fits the work.</p>
          </div>
          <div className={styles.heroIndex}>
            <span>Open board</span>
            <strong>{loading ? '-' : total}</strong>
            <p>live briefs across creative disciplines</p>
            <div><i /><i /><i /><i /></div>
          </div>
        </div>
      </section>

      <section className={styles.filterBand} aria-label="Filter jobs">
        <div className={styles.filterInner}>
          <label className={styles.searchField}><Search /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search briefs, brands, or niches" aria-label="Search jobs" data-testid="search-jobs-input" /></label>
          <label className={styles.selectField}><MapPin /><select value={city} onChange={(event) => setCity(event.target.value)} aria-label="Filter by city" data-testid="filter-city-select"><option value="">All cities</option>{CITIES.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <label className={styles.selectField}><Users /><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category" data-testid="filter-category-select"><option value="">All categories</option>{CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <label className={styles.sortField}><SlidersHorizontal /><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort jobs"><option value="latest">Latest first</option><option value="deadline">Deadline soon</option><option value="budget-high">Budget: high to low</option><option value="budget-low">Budget: low to high</option></select></label>
          {(activeFilterCount > 0 || query) && <button type="button" className={styles.clearButton} onClick={clearFilters} title="Clear filters" aria-label="Clear filters" data-testid="clear-filters-btn"><X /></button>}
        </div>
      </section>

      <main className={styles.board}>
        <header className={styles.boardHeader}>
          <div><span className={styles.sectionNumber}>01</span><div><h2>Open briefs</h2><p>Current paid work from brands on Jobfluencer.</p></div></div>
          <span data-testid="jobs-count"><strong>{visibleJobs.length}</strong> shown{activeFilterCount ? ` / ${activeFilterCount} filters` : ''}</span>
        </header>

        <div className={styles.boardGrid}>
          <section className={styles.jobsList}>
            {loading ? (
              <div className={styles.jobSkeletons}>{[0, 1, 2, 3].map((item) => <i key={item} />)}</div>
            ) : visibleJobs.length ? (
              visibleJobs.map((job, index) => (
                <Link href={`/jobs/${job.id}`} className={styles.jobRow} key={job.id} data-testid={`job-card-${job.id}`}>
                  <span className={styles.rowIndex}>{String(index + 1).padStart(2, '0')}</span>
                  <span className={styles.brandMark}>{(job.brand_name || job.title || 'J').charAt(0)}</span>
                  <span className={styles.jobIdentity}>
                    <small>{job.brand_name || 'Jobfluencer brand'}{job.is_boosted && <b>Featured</b>}</small>
                    <strong>{job.title || 'Creator collaboration'}</strong>
                    <span>{job.niche || job.category || 'Creative work'} / {job.city || 'Remote'}</span>
                  </span>
                  <span className={styles.jobTerms}>
                    <strong>{formatBudget(job.budget_min, job.budget_max)}</strong>
                    <small>{job.budget_type || 'Project budget'}</small>
                  </span>
                  <span className={styles.jobSignals}>
                    <span><CalendarDays /> {formatDate(job.deadline)}</span>
                    <span><Users /> {job.applicants_count || 0} applied</span>
                  </span>
                  <span className={styles.rowArrow} data-testid={`view-job-${job.id}-btn`}><ChevronRight /></span>
                </Link>
              ))
            ) : (
              <div className={styles.emptyBoard}>
                <span><Search /></span>
                <div><h2>No briefs match this view.</h2><p>Clear a filter or broaden the search to reopen the board.</p></div>
                <button type="button" onClick={clearFilters}>Reset board <ArrowRight /></button>
              </div>
            )}
          </section>

          <aside className={styles.boardAside}>
            <section className={styles.boardNote}>
              <span className={styles.eyebrow}>A better brief</span>
              <h2>Know the work before you pitch.</h2>
              <p>Every listing keeps scope, budget, timeline, platform, and brand context close to the decision.</p>
              <ul><li><Check /> Transparent compensation</li><li><Check /> Defined deliverables</li><li><Check /> Direct application trail</li></ul>
            </section>
            <section className={styles.roleCallout}>
              <BriefcaseBusiness />
              <span className={styles.eyebrow}>{user?.role === 'brand' ? 'Hirer tools' : 'For brands'}</span>
              <h2>{user?.role === 'brand' ? 'Ready to add a brief?' : 'Hiring creative talent?'}</h2>
              <p>Publish clear work and receive creator applications in one workspace.</p>
              <Link href={user?.role === 'brand' ? '/dashboard/brand/post-job' : '/register?role=brand'} data-testid="post-job-cta-btn">{user?.role === 'brand' ? 'Post a brief' : 'Join as a hirer'} <ArrowUpRight /></Link>
            </section>
          </aside>
        </div>
      </main>

      {!user && (
        <section className={styles.joinBand}>
          <div><span className={styles.eyebrow}>Creator access</span><h2>Put your work where the right brands can find it.</h2></div>
          <Link href="/register?role=creator" data-testid="join-influencer-cta-btn">Build your creator profile <ArrowRight /></Link>
        </section>
      )}
    </div>
  );
}
