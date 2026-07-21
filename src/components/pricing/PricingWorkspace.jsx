'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Check,
  Crown,
  Eye,
  ShieldCheck,
  Trophy,
  Users,
  WalletCards,
  X,
  Zap,
} from 'lucide-react';
import JobfluencerLogo from '@/components/brand/JobfluencerLogo';
import { useAuth } from '@/context/AuthContext';
import styles from './PricingWorkspace.module.css';

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;

const PLAN_SETS = {
  brand: [
    {
      key: 'free',
      code: 'B-00',
      name: 'Free',
      price: 0,
      tone: 'paper',
      headline: 'Build the first brief.',
      description: 'A clean starting point for occasional creator hiring.',
      features: ['3 campaigns each month', '3 direct invites', 'Basic applicant tracking', 'Core campaign analytics'],
      capacity: ['3 / month', '3 / month', 'Basic', 'Standard'],
    },
    {
      key: 'pro',
      code: 'B-01',
      name: 'Pro',
      price: 999,
      tone: 'signal',
      recommended: true,
      headline: 'Run a repeatable pipeline.',
      description: 'For brands that hire creators every week and need momentum.',
      features: ['15 campaigns each month', '20 direct invites', 'Campaign boost access', 'Advanced conversion analytics', 'Priority support'],
      capacity: ['15 / month', '20 / month', 'Advanced', 'Priority'],
    },
    {
      key: 'premium',
      code: 'B-02',
      name: 'Premium',
      price: 1999,
      tone: 'night',
      headline: 'Operate without limits.',
      description: 'The full creator hiring system for ambitious brand teams.',
      features: ['Unlimited campaigns', 'Unlimited direct invites', 'Every boost tier', 'Full ROI reporting', 'Contest mode', 'Dedicated support'],
      capacity: ['Unlimited', 'Unlimited', 'Full ROI', 'Dedicated'],
    },
  ],
  creator: [
    {
      key: 'free',
      code: 'C-00',
      name: 'Free',
      price: 0,
      tone: 'paper',
      headline: 'Enter the marketplace.',
      description: 'Create a profile and begin finding brand opportunities.',
      features: ['Complete creator profile', '5 applications each month', 'Portfolio and service listing', 'Standard search presence'],
      capacity: ['5 / month', 'Standard', 'Basic', 'Included'],
    },
    {
      key: 'pro',
      code: 'C-01',
      name: 'Pro',
      price: 499,
      tone: 'signal',
      recommended: true,
      headline: 'Turn visibility into work.',
      description: 'For active creators building a reliable opportunity flow.',
      features: ['50 applications each month', 'Higher search visibility', 'Performance analytics', 'Priority proposal placement'],
      capacity: ['50 / month', 'Elevated', 'Advanced', 'Priority'],
    },
    {
      key: 'premium',
      code: 'C-02',
      name: 'Premium',
      price: 999,
      tone: 'night',
      headline: 'Own the top of the list.',
      description: 'Maximum reach, trust, and insight for career creators.',
      features: ['Unlimited applications', 'Verified creator mark', 'Top search ranking', 'Full profile analytics', 'Featured creator placement'],
      capacity: ['Unlimited', 'Top rank', 'Full', 'Verified'],
    },
  ],
};

const COMPARISON_LABELS = {
  brand: ['Campaign volume', 'Direct invitations', 'Decision analytics', 'Support lane'],
  creator: ['Applications', 'Search visibility', 'Performance analytics', 'Profile trust'],
};

const ADD_ONS = [
  { icon: Eye, code: '01', name: 'Campaign boost', copy: 'Move a live brief into priority discovery.', price: 'Rs.299 - Rs.999' },
  { icon: ShieldCheck, code: '02', name: 'Verified identity', copy: 'Add a stronger trust signal to a creator profile.', price: 'Rs.499 - Rs.999' },
  { icon: Trophy, code: '03', name: 'Contest mode', copy: 'Collect submissions and pay the selected winner.', price: 'Rs.499 - Rs.1,999' },
  { icon: BarChart3, code: '04', name: 'Analytics pack', copy: 'Unlock deeper campaign and profile intelligence.', price: 'Rs.299 - Rs.799/mo' },
];

function formatPrice(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default function PricingWorkspace() {
  const { user, token, fetchUser } = useAuth();
  const router = useRouter();
  const initialRole = user?.role === 'creator' || user?.role === 'influencer' ? 'creator' : 'brand';
  const [role, setRole] = useState(initialRole);
  const [wallet, setWallet] = useState(null);
  const [currentSub, setCurrentSub] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [upgradePlan, setUpgradePlan] = useState(null);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    setRole(user?.role === 'creator' || user?.role === 'influencer' ? 'creator' : 'brand');
  }, [user?.role]);

  useEffect(() => {
    let active = true;
    if (!token) {
      setWallet(null);
      setCurrentSub(null);
      setDataLoading(false);
      return undefined;
    }

    setDataLoading(true);
    const headers = { Authorization: `Bearer ${token}` };
    Promise.allSettled([
      axios.get(`${API}/wallet`, { headers }),
      axios.get(`${API}/subscriptions/my`, { headers }),
    ]).then(([walletResult, subscriptionResult]) => {
      if (!active) return;
      if (walletResult.status === 'fulfilled') setWallet(walletResult.value.data);
      if (subscriptionResult.status === 'fulfilled') setCurrentSub(subscriptionResult.value.data);
      setDataLoading(false);
    });

    return () => { active = false; };
  }, [token]);

  const plans = PLAN_SETS[role];
  const roleMatchesAccount = useMemo(() => {
    if (!user) return false;
    if (role === 'brand') return user.role === 'brand';
    return user.role === 'creator' || user.role === 'influencer';
  }, [role, user]);
  const activePlan = roleMatchesAccount ? String(currentSub?.plan || 'free').toLowerCase() : null;

  const selectPlan = (plan) => {
    if (plan.key === 'free') {
      if (activePlan === 'free') toast('Free is your current plan');
      return;
    }
    if (!token) {
      router.push('/login');
      return;
    }
    if (activePlan === plan.key) {
      toast(`${plan.name} is already active`);
      return;
    }
    setUpgradePlan(plan);
  };

  const confirmUpgrade = async () => {
    if (!upgradePlan) return;
    setUpgrading(true);
    try {
      const endpoint = role === 'brand' ? 'subscriptions/brand' : 'subscriptions/creator';
      await axios.post(`${API}/${endpoint}`, { plan: upgradePlan.key }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentSub({ ...(currentSub || {}), plan: upgradePlan.key });
      await fetchUser();
      toast.success(`${upgradePlan.name} is now active`);
      setUpgradePlan(null);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Could not update the subscription');
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div className={styles.page} data-testid="pricing-workspace">
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <Link href="/" className={styles.logoLink} aria-label="Jobfluencer home">
            <JobfluencerLogo theme="light" />
          </Link>
          <div className={styles.topbarActions}>
            {token && (
              <Link href="/buy-credits" className={styles.walletPill} data-testid="pricing-wallet-bar">
                <WalletCards />
                <span>{dataLoading ? 'Loading credits' : `${Number(wallet?.invite_credits || 0)} credits`}</span>
              </Link>
            )}
            <Link href={user?.role === 'brand' ? '/dashboard/brand' : user ? '/dashboard/influencer' : '/login'} className={styles.dashboardLink}>
              <ArrowLeft /> {user ? 'Dashboard' : 'Sign in'}
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className={styles.hero} data-testid="pricing-hero">
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <div className={styles.kicker}>Workspace access</div>
              <h1>Plans and credits.</h1>
              <p>Choose the operating level that matches how often you create, hire, and move work forward.</p>
            </div>
            <div className={styles.heroLedger}>
              <div>
                <span>Viewing</span>
                <strong>{role === 'brand' ? 'Hirer plans' : 'Creator plans'}</strong>
              </div>
              <div>
                <span>Your plan</span>
                {dataLoading ? <i className={styles.loadingLine} /> : <strong>{activePlan || 'Not signed in'}</strong>}
              </div>
              <div>
                <span>Billing</span>
                <strong>Monthly, cancel anytime</strong>
              </div>
            </div>
            <div className={styles.roleSwitch} aria-label="Pricing audience">
              <button
                type="button"
                className={role === 'brand' ? styles.roleActive : ''}
                onClick={() => setRole('brand')}
                data-testid="pricing-role-brand"
              >
                <BriefcaseBusiness /> I&apos;m hiring
              </button>
              <button
                type="button"
                className={role === 'creator' ? styles.roleActive : ''}
                onClick={() => setRole('creator')}
                data-testid="pricing-role-creator"
              >
                <Users /> I&apos;m creating
              </button>
            </div>
          </div>
        </section>

        <section className={styles.planSection} data-testid="subscriptions-section">
          <div className={styles.sectionHeading}>
            <div>
              <span>Access passes / {role === 'brand' ? 'Hirer' : 'Creator'}</span>
              <h2>Pick your operating pace.</h2>
            </div>
            <p>Every plan keeps the core workflow simple. Upgrade when volume, visibility, or reporting becomes the constraint.</p>
          </div>

          <div className={`${styles.planGrid} ${styles.stagger}`}>
            {plans.map((plan) => {
              const current = activePlan === plan.key;
              return (
                <article
                  key={plan.key}
                  className={`${styles.planCard} ${styles[`tone_${plan.tone}`]} ${current ? styles.planCurrent : ''}`}
                  data-testid={`plan-${plan.key}`}
                >
                  <div className={styles.planRail}>
                    <span>{plan.code}</span>
                    <i />
                    <small>{plan.recommended ? 'Most chosen' : current ? 'Active' : 'Access'}</small>
                  </div>
                  <div className={styles.planContent}>
                    <div className={styles.planTopline}>
                      <span>{plan.name}</span>
                      {current && <strong><Check /> Current</strong>}
                      {!current && plan.recommended && <strong><Zap /> Recommended</strong>}
                    </div>
                    <div className={styles.planPrice}>
                      <strong>{formatPrice(plan.price)}</strong>
                      {plan.price > 0 && <span>/ month</span>}
                    </div>
                    <h3>{plan.headline}</h3>
                    <p className={styles.planDescription}>{plan.description}</p>
                    <div className={styles.planDivider} />
                    <ul>
                      {plan.features.map((feature) => <li key={feature}><Check /> {feature}</li>)}
                    </ul>
                    <button
                      type="button"
                      className={styles.planAction}
                      onClick={() => selectPlan(plan)}
                      disabled={current || (plan.key === 'free' && !current)}
                    >
                      {dataLoading && roleMatchesAccount ? (
                        <span className={styles.buttonLoading}>Checking access</span>
                      ) : current ? 'Current plan' : plan.key === 'free' ? 'Included' : `Choose ${plan.name}`}
                      {!current && plan.key !== 'free' && <ArrowRight />}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className={styles.compareSection}>
          <div className={styles.sectionHeading}>
            <div><span>Capacity map</span><h2>See the difference clearly.</h2></div>
          </div>
          <div className={styles.compareTable} role="table" aria-label={`${role} plan comparison`}>
            <div className={styles.compareHeader} role="row">
              <span role="columnheader">Capability</span>
              {plans.map((plan) => <strong role="columnheader" key={plan.key}>{plan.name}</strong>)}
            </div>
            {COMPARISON_LABELS[role].map((label, rowIndex) => (
              <div className={styles.compareRow} role="row" key={label}>
                <span role="rowheader">{label}</span>
                {plans.map((plan) => <strong role="cell" key={plan.key}>{plan.capacity[rowIndex]}</strong>)}
              </div>
            ))}
          </div>
        </section>

        <section className={styles.addOnSection} data-testid="paid-features-section">
          <div className={styles.addOnIntro}>
            <span>On-demand tools</span>
            <h2>Use more power only when the work calls for it.</h2>
            <p>One-off additions extend a campaign or profile without changing the entire workspace plan.</p>
          </div>
          <div className={styles.addOnRail}>
            {ADD_ONS.map((addOn, index) => {
              const Icon = addOn.icon;
              return (
                <article key={addOn.code} className={styles.addOn} data-testid={`feature-card-${index}`}>
                  <span className={styles.addOnCode}>{addOn.code}</span>
                  <span className={styles.addOnIcon}><Icon /></span>
                  <div><h3>{addOn.name}</h3><p>{addOn.copy}</p></div>
                  <strong>{addOn.price}</strong>
                </article>
              );
            })}
          </div>
        </section>

        <section className={styles.finalBand} data-testid="pricing-cta-section">
          <div>
            <span>Ready when the brief is.</span>
            <h2>Fund the next collaboration.</h2>
          </div>
          <div className={styles.finalActions}>
            <Link href="/buy-credits" className={styles.secondaryAction} data-testid="pricing-buy-credits-btn">Buy credits</Link>
            <Link href="/dashboard/brand/post-job" className={styles.primaryAction} data-testid="pricing-post-campaign-btn">
              Post a campaign <ArrowRight />
            </Link>
          </div>
        </section>
      </main>

      {upgradePlan && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setUpgradePlan(null);
        }}>
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="upgrade-title" data-testid="upgrade-modal">
            <header className={styles.modalHeader}>
              <div>
                <span>{role === 'brand' ? 'Hirer' : 'Creator'} access / {upgradePlan.code}</span>
                <h2 id="upgrade-title">Move to {upgradePlan.name}.</h2>
              </div>
              <button type="button" onClick={() => setUpgradePlan(null)} aria-label="Close plan confirmation"><X /></button>
            </header>
            <div className={styles.modalBody}>
              <div className={styles.modalPrice}>
                <span>Monthly workspace</span>
                <strong>{formatPrice(upgradePlan.price)} <small>/ month</small></strong>
              </div>
              <p>{upgradePlan.description}</p>
              <ul>{upgradePlan.features.map((feature) => <li key={feature}><Check /> {feature}</li>)}</ul>
            </div>
            <footer className={styles.modalFooter}>
              <button type="button" className={styles.secondaryAction} onClick={() => setUpgradePlan(null)}>Cancel</button>
              <button type="button" className={styles.primaryAction} onClick={confirmUpgrade} disabled={upgrading} data-testid="confirm-upgrade">
                <Crown /> {upgrading ? 'Activating...' : `Activate ${upgradePlan.name}`}
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
