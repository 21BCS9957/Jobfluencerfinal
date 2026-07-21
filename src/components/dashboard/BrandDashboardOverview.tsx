'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Eye,
  MapPin,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  UserCheck,
  Users,
  WalletCards,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API } from '@/legacy_pages/dashboard/shared';
import styles from './BrandDashboardOverview.module.css';

type Campaign = {
  id: string | number;
  title?: string;
  category?: string;
  niche?: string;
  status?: string;
  applicants_count?: number;
  hired_count?: number;
  budget_min?: number;
  budget_max?: number;
  deadline?: string;
  created_at?: string;
};

type Creator = {
  id: string | number;
  user_id?: string | number;
  display_name?: string;
  name?: string;
  city?: string;
  category?: string;
  niche?: string;
  profile_image_url?: string;
  followers?: number;
  followers_count?: number;
};

type Wallet = {
  invite_credits?: number;
  balance?: number;
};

type DashboardAuth = {
  user: { name?: string; brand_name?: string } | null;
  token: string | null;
  subscription: { plan?: string } | null;
};

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('en-IN', {
    notation: value >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(value || 0);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatBudget(campaign: Campaign) {
  const minimum = Number(campaign.budget_min || 0);
  const maximum = Number(campaign.budget_max || 0);
  if (!minimum && !maximum) return 'Budget not set';
  if (!maximum || maximum === minimum) return formatCurrency(minimum);
  return `${formatCurrency(minimum)} - ${formatCurrency(maximum)}`;
}

function formatDate(date?: string) {
  if (!date) return 'No deadline';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(parsed);
}

function getStatusClass(status?: string) {
  if (status === 'active' || status === 'open') return styles.statusActive;
  if (status === 'completed') return styles.statusCompleted;
  if (status === 'draft') return styles.statusDraft;
  return styles.statusMuted;
}

function getCampaigns(payload: unknown): Campaign[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object') {
    const record = payload as { campaigns?: Campaign[]; jobs?: Campaign[] };
    return record.campaigns || record.jobs || [];
  }
  return [];
}

function getCreators(payload: unknown): Creator[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object') {
    return (payload as { creators?: Creator[] }).creators || [];
  }
  return [];
}

export default function BrandDashboardOverview() {
  const { user, token, subscription } = useAuth() as DashboardAuth;
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [wallet, setWallet] = useState<Wallet>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const results = await Promise.allSettled([
        axios.get(`${API}/jobs/my`, { headers }),
        axios.get(`${API}/creators`),
        axios.get(`${API}/wallet`, { headers }),
      ]);

      if (!active) return;
      const [campaignResult, creatorResult, walletResult] = results;

      if (campaignResult.status === 'fulfilled') {
        setCampaigns(getCampaigns(campaignResult.value.data));
      }
      if (creatorResult.status === 'fulfilled') {
        setCreators(getCreators(creatorResult.value.data));
      }
      if (walletResult.status === 'fulfilled') {
        setWallet(walletResult.value.data || {});
      }
      setLoading(false);
    }

    loadDashboard();
    return () => {
      active = false;
    };
  }, [token]);

  const dashboardStats = useMemo(() => {
    const activeCampaigns = campaigns.filter(
      (campaign) => campaign.status === 'active' || campaign.status === 'open',
    );
    const applicants = campaigns.reduce(
      (total, campaign) => total + Number(campaign.applicants_count || 0),
      0,
    );
    const hires = campaigns.reduce(
      (total, campaign) => total + Number(campaign.hired_count || 0),
      0,
    );
    const committedBudget = activeCampaigns.reduce(
      (total, campaign) =>
        total + Number(campaign.budget_max || campaign.budget_min || 0),
      0,
    );

    return { activeCampaigns, applicants, hires, committedBudget };
  }, [campaigns]);

  const firstName = (user?.name || user?.brand_name || 'Hirer').split(' ')[0];
  const recentCampaigns = campaigns.slice(0, 4);
  const featuredCreators = creators.slice(0, 4);
  const plan = subscription?.plan || 'Free';
  const runwayStage = dashboardStats.hires > 0
    ? 4
    : dashboardStats.applicants > 0
      ? 3
      : dashboardStats.activeCampaigns.length > 0
        ? 2
        : 1;
  const runwayStages = ['Brief', 'Discover', 'Shortlist', 'Hire'];
  const runwayStatus = dashboardStats.hires > 0
    ? `${dashboardStats.hires} creator${dashboardStats.hires === 1 ? '' : 's'} hired`
    : dashboardStats.applicants > 0
      ? `${dashboardStats.applicants} applications in motion`
      : dashboardStats.activeCampaigns.length > 0
        ? `${dashboardStats.activeCampaigns.length} campaign${dashboardStats.activeCampaigns.length === 1 ? '' : 's'} matching`
        : 'Ready for a fresh brief';

  const stats = [
    {
      label: 'Active campaigns',
      value: dashboardStats.activeCampaigns.length,
      note: `${campaigns.length} total campaigns`,
      icon: BriefcaseBusiness,
      tone: 'yellow',
    },
    {
      label: 'Applications',
      value: dashboardStats.applicants,
      note: 'Across all campaigns',
      icon: Users,
      tone: 'pink',
    },
    {
      label: 'Creators hired',
      value: dashboardStats.hires,
      note: 'Confirmed collaborations',
      icon: UserCheck,
      tone: 'green',
    },
    {
      label: 'Active budget',
      value: formatCurrency(dashboardStats.committedBudget),
      note: 'Maximum campaign value',
      icon: CircleDollarSign,
      tone: 'neutral',
    },
  ];

  return (
    <div className={styles.dashboard} data-testid="brand-dashboard-overview">
      <section className={styles.commandDeck} aria-label="Campaign command deck">
        <div className={styles.deckIntro}>
          <div className={styles.deckCoordinates}>
            <span>Hirer signal / {plan}</span>
            <span>JF-{String(campaigns.length + 1).padStart(3, '0')}</span>
          </div>
          <span className={styles.deckWelcome}>Good to see you, {firstName}</span>
          <h1>Your brief. Their audience. One good match.</h1>
          <p>Move from campaign idea to creator collaboration without losing the thread.</p>
          <div className={styles.deckActions}>
            <Link href="/dashboard/brand/post-job" className={styles.deckPrimaryAction}>
              <Plus aria-hidden="true" /> Launch a brief
            </Link>
            <Link href="/dashboard/brand/influencers" className={styles.deckSecondaryAction}>
              <Search aria-hidden="true" /> Scan creators
            </Link>
          </div>
        </div>

        <div className={styles.runway}>
          <div className={styles.runwayHeader}>
            <span>Brief-to-booking runway</span>
            <i aria-hidden="true" />
          </div>
          <ol className={styles.runwayStages}>
            {runwayStages.map((stage, index) => {
              const reached = index < runwayStage;
              const current = index === runwayStage - 1;
              return (
                <li
                  key={stage}
                  className={`${reached ? styles.runwayReached : ''} ${current ? styles.runwayCurrent : ''}`}
                >
                  <span className={styles.runwayNode}>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <strong>{stage}</strong>
                    <small>{current ? 'Current signal' : reached ? 'Passed' : 'Waiting'}</small>
                  </div>
                </li>
              );
            })}
          </ol>
          <div className={styles.runwayStatus}>
            <span>{String(runwayStage).padStart(2, '0')} / 04</span>
            <strong>{loading ? 'Reading your workspace...' : runwayStatus}</strong>
          </div>
        </div>

        <div className={styles.signalMetrics} aria-label="Campaign overview">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <article key={stat.label} className={styles.signalMetric}>
                <span className={styles.metricIndex}>0{index + 1}</span>
                <div className={`${styles.signalMetricIcon} ${styles[`tone${stat.tone}`]}`}>
                  <Icon aria-hidden="true" />
                </div>
                <div>
                  <span>{stat.label}</span>
                  <strong>{loading ? <i className={styles.valueSkeleton} /> : stat.value}</strong>
                  <small>{stat.note}</small>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <div className={styles.contentGrid}>
        <div className={styles.primaryColumn}>
          <section className={styles.panel}>
            <div className={styles.sectionHeader}>
              <div>
                <span className={styles.eyebrow}>Campaign desk</span>
                <h2>Recent campaigns</h2>
              </div>
              <Link href="/dashboard/brand/campaigns" className={styles.textLink}>
                View all <ArrowRight aria-hidden="true" />
              </Link>
            </div>

            {loading ? (
              <div className={styles.campaignSkeletons} aria-label="Loading campaigns">
                {[1, 2, 3].map((item) => <div key={item} />)}
              </div>
            ) : recentCampaigns.length > 0 ? (
              <div className={styles.campaignList}>
                {recentCampaigns.map((campaign) => (
                  <Link
                    href={`/dashboard/brand/jobs/${campaign.id}`}
                    key={campaign.id}
                    className={styles.campaignRow}
                  >
                    <div className={styles.campaignIdentity}>
                      <span className={styles.campaignMark}>
                        {(campaign.title || 'C').charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <strong>{campaign.title || 'Untitled campaign'}</strong>
                        <small>{campaign.niche || campaign.category || 'Creator campaign'}</small>
                      </div>
                    </div>
                    <div className={styles.campaignMeta}>
                      <span>
                        <Users aria-hidden="true" /> {campaign.applicants_count || 0} applicants
                      </span>
                      <span>{formatBudget(campaign)}</span>
                    </div>
                    <div className={styles.campaignDeadline}>
                      <small>Deadline</small>
                      <strong>{formatDate(campaign.deadline)}</strong>
                    </div>
                    <span className={`${styles.status} ${getStatusClass(campaign.status)}`}>
                      {campaign.status || 'inactive'}
                    </span>
                    <ChevronRight className={styles.rowChevron} aria-hidden="true" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className={styles.emptyCampaigns}>
                <div className={styles.emptyIcon}><BriefcaseBusiness aria-hidden="true" /></div>
                <div>
                  <strong>Your campaign desk is ready</strong>
                  <p>Publish your first brief to start receiving applications from local creators.</p>
                </div>
                <Link href="/dashboard/brand/post-job">Create first campaign <ArrowRight aria-hidden="true" /></Link>
              </div>
            )}
          </section>

          <section className={styles.panel}>
            <div className={styles.sectionHeader}>
              <div>
                <span className={styles.eyebrow}>Creator network</span>
                <h2>Creators to discover</h2>
              </div>
              <Link href="/dashboard/brand/influencers" className={styles.textLink}>
                Browse creators <ArrowRight aria-hidden="true" />
              </Link>
            </div>

            {loading ? (
              <div className={styles.creatorGrid} aria-label="Loading creators">
                {[1, 2, 3, 4].map((item) => <div key={item} className={styles.creatorSkeleton} />)}
              </div>
            ) : featuredCreators.length > 0 ? (
              <div className={styles.creatorGrid}>
                {featuredCreators.map((creator) => {
                  const creatorName = creator.display_name || creator.name || 'Creator';
                  const creatorId = creator.user_id || creator.id;
                  const followers = Number(creator.followers_count || creator.followers || 0);
                  return (
                    <Link
                      href={`/influencers/${creatorId}`}
                      key={creator.id}
                      className={styles.creatorCard}
                    >
                      <div className={styles.creatorImage}>
                        {creator.profile_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={creator.profile_image_url} alt={creatorName} />
                        ) : (
                          <span>{creatorName.charAt(0).toUpperCase()}</span>
                        )}
                        <span className={styles.verified}><CheckCircle2 aria-hidden="true" /></span>
                      </div>
                      <div className={styles.creatorDetails}>
                        <strong>{creatorName}</strong>
                        <span>{creator.niche || creator.category || 'Content creator'}</span>
                        <small>
                          {creator.city ? <><MapPin aria-hidden="true" /> {creator.city}</> : 'Location flexible'}
                        </small>
                        <div>
                          <b>{formatCompactNumber(followers)}</b>
                          <span>followers</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className={styles.emptyCreators}>
                <Users aria-hidden="true" />
                <div>
                  <strong>Your creator shortlist starts here</strong>
                  <p>Search the network by city and specialty, then invite the right talent to a campaign.</p>
                </div>
                <Link href="/dashboard/brand/influencers">Explore creators</Link>
              </div>
            )}
          </section>
        </div>

        <aside className={styles.sideColumn}>
          <section className={styles.launchPanel}>
            <span className={styles.launchIcon}><Sparkles aria-hidden="true" /></span>
            <span className={styles.eyebrow}>Next best action</span>
            <h2>{dashboardStats.activeCampaigns.length ? 'Review your campaign momentum.' : 'Turn a brief into a creator shortlist.'}</h2>
            <p>
              {dashboardStats.activeCampaigns.length
                ? `${dashboardStats.applicants} applications are waiting across your campaigns.`
                : 'Share the deliverables, location, and budget. Jobfluencer will take it from there.'}
            </p>
            <Link href={dashboardStats.activeCampaigns.length ? '/dashboard/brand/campaigns' : '/post-job'}>
              {dashboardStats.activeCampaigns.length ? 'Open campaign desk' : 'Start a campaign'}
              <ArrowRight aria-hidden="true" />
            </Link>
          </section>

          <section className={styles.sidePanel}>
            <div className={styles.sidePanelHeader}>
              <div className={styles.sidePanelIcon}><WalletCards aria-hidden="true" /></div>
              <div>
                <span className={styles.eyebrow}>Wallet</span>
                <h2>Credits & balance</h2>
              </div>
              <span className={styles.planBadge}>{plan}</span>
            </div>
            <div className={styles.walletGrid}>
              <div>
                <span>Invite credits</span>
                <strong>{loading ? '-' : wallet.invite_credits || 0}</strong>
              </div>
              <div>
                <span>Balance</span>
                <strong>{loading ? '-' : formatCurrency(wallet.balance || 0)}</strong>
              </div>
            </div>
            <Link href="/buy-credits" className={styles.outlineAction}>
              Manage wallet <ChevronRight aria-hidden="true" />
            </Link>
          </section>

          <section className={styles.sidePanel}>
            <div className={styles.sidePanelHeader}>
              <div>
                <span className={styles.eyebrow}>Shortcuts</span>
                <h2>Move work forward</h2>
              </div>
            </div>
            <div className={styles.quickLinks}>
              <Link href="/dashboard/brand/influencers">
                <span><Search aria-hidden="true" /></span>
                <div><strong>Find creators</strong><small>Filter local talent</small></div>
                <ChevronRight aria-hidden="true" />
              </Link>
              <Link href="/dashboard/brand/messages">
                <span><MessageSquare aria-hidden="true" /></span>
                <div><strong>Open messages</strong><small>Continue conversations</small></div>
                <ChevronRight aria-hidden="true" />
              </Link>
              <Link href="/dashboard/brand/analytics">
                <span><Eye aria-hidden="true" /></span>
                <div><strong>View performance</strong><small>Track campaign results</small></div>
                <ChevronRight aria-hidden="true" />
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
