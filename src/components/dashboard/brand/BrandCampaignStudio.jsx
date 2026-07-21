'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import {
  AtSign,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Instagram,
  Layers3,
  Linkedin,
  LoaderCircle,
  MapPin,
  Megaphone,
  Minus,
  MonitorPlay,
  Plus,
  Save,
  Scissors,
  Send,
  Share2,
  Smartphone,
  Video,
  Youtube,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { CITIES, NICHES } from '@/legacy_pages/dashboard/shared';
import styles from './BrandCampaignStudio.module.css';

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;
const DRAFT_KEY = 'jobfluencer_campaign_studio_draft';

const STEPS = [
  { id: 1, label: 'Direction', copy: 'What needs to happen' },
  { id: 2, label: 'Talent fit', copy: 'Who should make it' },
  { id: 3, label: 'Channels', copy: 'Where it should live' },
  { id: 4, label: 'Terms', copy: 'Budget and delivery' },
  { id: 5, label: 'Review', copy: 'Polish and publish' },
];

const CATEGORY_OPTIONS = [
  { id: 'Influencer', label: 'Influencer', copy: 'Audience-led social promotion', icon: Megaphone },
  { id: 'Photographer', label: 'Photographer', copy: 'Product, event, and lifestyle shoots', icon: Camera },
  { id: 'Videographer', label: 'Videographer', copy: 'Campaign films, reels, and commercials', icon: Video },
  { id: 'UGC Creator', label: 'UGC creator', copy: 'Native content for ads and feeds', icon: Smartphone },
  { id: 'Social Media Manager', label: 'Social manager', copy: 'Planning, publishing, and community', icon: Share2 },
  { id: 'Editor', label: 'Editor', copy: 'Post-production for video and imagery', icon: Scissors },
];

const PLATFORM_OPTIONS = [
  { id: 'Instagram', label: 'Instagram', copy: 'Reels, stories, and posts', icon: Instagram },
  { id: 'YouTube', label: 'YouTube', copy: 'Long-form, shorts, and integrations', icon: Youtube },
  { id: 'TikTok', label: 'TikTok', copy: 'Native short-form video', icon: MonitorPlay },
  { id: 'Twitter', label: 'X / Twitter', copy: 'Posts, launches, and threads', icon: AtSign },
  { id: 'LinkedIn', label: 'LinkedIn', copy: 'Professional and founder content', icon: Linkedin },
  { id: 'Multiple', label: 'Cross-platform', copy: 'A coordinated channel mix', icon: Layers3 },
];

const EMPTY_FORM = {
  brief: '',
  category: '',
  platforms: [],
  city: '',
  niche: '',
  title: '',
  description: '',
  budget_min: '',
  budget_max: '',
  creators_needed: 1,
  deadline: '',
  deliverables: [''],
};

function buildCampaignCopy(form) {
  const category = form.category || 'creator';
  const niche = form.niche || 'Lifestyle';
  const city = form.city || 'India';
  const channels = form.platforms.includes('Multiple')
    ? 'Instagram, YouTube, and TikTok'
    : form.platforms.join(', ');
  const title = `${niche} ${category} campaign in ${city}`;
  const description = [
    form.brief.trim(),
    `We are looking for a ${category.toLowerCase()} for a ${niche.toLowerCase()} campaign based in ${city}.`,
    channels ? `The work will run across ${channels}.` : '',
    'The right collaborator should bring a clear point of view, reliable communication, and work that feels native to the selected channels.',
  ].filter(Boolean).join('\n\n');
  return { title, description };
}

function formatBudget(minimum, maximum) {
  if (!minimum) return 'Budget pending';
  const format = (value) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
  if (!maximum || minimum === maximum) return format(minimum);
  return `${format(minimum)} - ${format(maximum)}`;
}

export default function BrandCampaignStudio() {
  const { token } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [publishing, setPublishing] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(DRAFT_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      setFormData({ ...EMPTY_FORM, ...(parsed.formData || {}) });
      setStep(Math.min(5, Math.max(1, Number(parsed.step || 1))));
      setDraftRestored(true);
    } catch {
      window.localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  const completion = useMemo(() => {
    const signals = [
      formData.brief,
      formData.category,
      formData.platforms.length,
      formData.city,
      formData.title,
      formData.description,
      formData.budget_min,
      formData.deadline,
    ];
    return Math.round((signals.filter(Boolean).length / signals.length) * 100);
  }, [formData]);

  const updateField = (field, value) => setFormData((current) => ({ ...current, [field]: value }));

  const togglePlatform = (platform) => {
    setFormData((current) => {
      if (platform === 'Multiple') {
        return { ...current, platforms: current.platforms.includes('Multiple') ? [] : ['Multiple'] };
      }
      const selected = current.platforms.filter((item) => item !== 'Multiple');
      return {
        ...current,
        platforms: selected.includes(platform)
          ? selected.filter((item) => item !== platform)
          : [...selected, platform],
      };
    });
  };

  const validateStep = () => {
    if (step === 1 && !formData.brief.trim()) {
      toast.error('Add the campaign direction before continuing');
      return false;
    }
    if (step === 2 && (!formData.category || !formData.city)) {
      toast.error('Choose a creator discipline and location');
      return false;
    }
    if (step === 3 && formData.platforms.length === 0) {
      toast.error('Choose at least one channel');
      return false;
    }
    if (step === 4 && (!formData.budget_min || !formData.deadline)) {
      toast.error('Set the starting budget and deadline');
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    if (step === 3 && (!formData.title || !formData.description)) {
      const generated = buildCampaignCopy(formData);
      setFormData((current) => ({
        ...current,
        title: current.title || generated.title,
        description: current.description || generated.description,
      }));
    }
    setStep((current) => Math.min(5, current + 1));
  };

  const saveDraft = () => {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ step, formData }));
    setDraftRestored(false);
    toast.success('Campaign draft saved on this device');
  };

  const addDeliverable = () => {
    setFormData((current) => ({ ...current, deliverables: [...current.deliverables, ''] }));
  };

  const updateDeliverable = (index, value) => {
    setFormData((current) => ({
      ...current,
      deliverables: current.deliverables.map((item, itemIndex) => itemIndex === index ? value : item),
    }));
  };

  const removeDeliverable = (index) => {
    setFormData((current) => ({
      ...current,
      deliverables: current.deliverables.length === 1
        ? ['']
        : current.deliverables.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const publishCampaign = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Give the final brief a title and description');
      return;
    }

    setPublishing(true);
    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      platforms: formData.platforms.includes('Multiple')
        ? ['Instagram', 'YouTube', 'TikTok']
        : formData.platforms,
      budget_type: 'fixed',
      budget_min: Number(formData.budget_min),
      budget_max: Number(formData.budget_max || formData.budget_min),
      creators_needed: Number(formData.creators_needed || 1),
      deadline: formData.deadline,
      deliverables: formData.deliverables.map((item) => item.trim()).filter(Boolean),
      niche: formData.niche || 'Lifestyle',
      city: formData.city,
    };

    try {
      await axios.post(`${API}/jobs`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      window.localStorage.removeItem(DRAFT_KEY);
      toast.success('Campaign published');
      router.push('/dashboard/brand/campaigns');
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Sign in as a hirer to publish this campaign');
        router.push('/login');
      } else {
        toast.error(error.response?.data?.detail || 'Could not publish the campaign');
      }
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className={styles.page} data-testid="post-job-wizard">
      <header className={styles.pageHeader}>
        <div>
          <div className={styles.kicker}>Campaign brief studio</div>
          <h1>Build a brief people want to join.</h1>
          <p>Shape the direction, talent fit, channels, and terms while the finished campaign takes form beside you.</p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.secondaryAction} onClick={saveDraft} data-testid="save-draft-btn">
            <Save /> Save draft
          </button>
          <Link href="/dashboard/brand/campaigns" className={styles.iconButton} aria-label="Close campaign studio" title="Close">
            <X />
          </Link>
        </div>
      </header>

      {draftRestored && (
        <div className={styles.draftNotice}>
          <FileText /> <span>Your saved campaign draft is back in the studio.</span>
          <button type="button" onClick={() => setDraftRestored(false)} aria-label="Dismiss draft notice"><X /></button>
        </div>
      )}

      <div className={styles.studioGrid}>
        <nav className={styles.stageRail} aria-label="Campaign brief progress">
          <div className={styles.stageRailHeader}>
            <span>Brief route</span>
            <strong>{completion}%</strong>
          </div>
          <div className={styles.stageProgress}><i style={{ height: `${completion}%` }} /></div>
          <div className={styles.stageList}>
            {STEPS.map((stage) => {
              const active = step === stage.id;
              const complete = step > stage.id;
              return (
                <button
                  type="button"
                  key={stage.id}
                  className={`${styles.stageStep} ${active ? styles.stageActive : ''} ${complete ? styles.stageComplete : ''}`}
                  onClick={() => complete && setStep(stage.id)}
                  disabled={!complete && !active}
                >
                  <span>{complete ? <Check /> : String(stage.id).padStart(2, '0')}</span>
                  <span><strong>{stage.label}</strong><small>{stage.copy}</small></span>
                </button>
              );
            })}
          </div>
        </nav>

        <section className={styles.editor} aria-label={`Step ${step}: ${STEPS[step - 1].label}`}>
          <div className={styles.editorHeader}>
            <span>{String(step).padStart(2, '0')} / 05</span>
            <div className={styles.editorProgress}><i style={{ width: `${(step / 5) * 100}%` }} /></div>
          </div>

          <div className={styles.editorBody}>
            {step === 1 && (
              <div className={styles.stepContent} data-testid="step-1">
                <div className={styles.stepHeading}>
                  <span>Direction</span>
                  <h2>What should this campaign accomplish?</h2>
                  <p>Write the useful version: the product, audience, outcome, and any non-negotiables.</p>
                </div>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Campaign direction</span>
                  <textarea
                    className={`${styles.textarea} ${styles.briefTextarea}`}
                    value={formData.brief}
                    onChange={(event) => updateField('brief', event.target.value)}
                    placeholder="Example: Launch our new fitness snack with credible city-based creators. We need energetic short-form content that demonstrates the product during a real workout..."
                    data-testid="brief-input"
                  />
                  <small>{formData.brief.length} characters</small>
                </label>
                <div className={styles.promptStrip}>
                  <span>Strong briefs answer</span>
                  <strong>What is changing?</strong>
                  <strong>Who should care?</strong>
                  <strong>What must be delivered?</strong>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className={styles.stepContent} data-testid="step-2">
                <div className={styles.stepHeading}>
                  <span>Talent fit</span>
                  <h2>Choose the maker, market, and context.</h2>
                  <p>This shapes who discovers the brief and how relevant it feels to them.</p>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Creator discipline</span>
                  <div className={styles.choiceGrid}>
                    {CATEGORY_OPTIONS.map((category) => {
                      const Icon = category.icon;
                      const selected = formData.category === category.id;
                      return (
                        <button
                          type="button"
                          key={category.id}
                          className={`${styles.choice} ${selected ? styles.choiceSelected : ''}`}
                          onClick={() => updateField('category', category.id)}
                          data-testid={`category-${category.id}-btn`}
                        >
                          <span><Icon /></span>
                          <span><strong>{category.label}</strong><small>{category.copy}</small></span>
                          {selected && <Check />}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className={styles.twoFields}>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Primary city</span>
                    <span className={styles.selectWrap}><MapPin /><select value={formData.city} onChange={(event) => updateField('city', event.target.value)} data-testid="city-select"><option value="">Choose a city</option>{CITIES.map((city) => <option value={city} key={city}>{city}</option>)}</select></span>
                  </label>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Campaign niche</span>
                    <select className={styles.select} value={formData.niche} onChange={(event) => updateField('niche', event.target.value)} data-testid="niche-select"><option value="">Choose a niche</option>{NICHES.map((niche) => <option value={niche} key={niche}>{niche}</option>)}</select>
                  </label>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className={styles.stepContent} data-testid="step-3">
                <div className={styles.stepHeading}>
                  <span>Channel mix</span>
                  <h2>Where should the work earn attention?</h2>
                  <p>Select every channel that belongs in the campaign. Cross-platform replaces individual selections.</p>
                </div>
                <div className={styles.channelGrid}>
                  {PLATFORM_OPTIONS.map((platform) => {
                    const Icon = platform.icon;
                    const selected = formData.platforms.includes(platform.id);
                    return (
                      <button
                        type="button"
                        className={`${styles.channel} ${selected ? styles.channelSelected : ''}`}
                        key={platform.id}
                        onClick={() => togglePlatform(platform.id)}
                        data-testid={`platform-${platform.id}-btn`}
                      >
                        <span><Icon /></span>
                        <span><strong>{platform.label}</strong><small>{platform.copy}</small></span>
                        <i>{selected ? <Check /> : <Plus />}</i>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className={styles.stepContent} data-testid="step-4">
                <div className={styles.stepHeading}>
                  <span>Commercial terms</span>
                  <h2>Make the scope easy to trust.</h2>
                  <p>Transparent budget, timing, and deliverables help the right creators decide faster.</p>
                </div>
                <div className={styles.twoFields}>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Starting budget (Rs.)</span>
                    <input className={styles.input} type="number" min="0" value={formData.budget_min} onChange={(event) => updateField('budget_min', event.target.value)} placeholder="10000" data-testid="budget-min-input" />
                  </label>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Maximum budget (Rs.)</span>
                    <input className={styles.input} type="number" min="0" value={formData.budget_max} onChange={(event) => updateField('budget_max', event.target.value)} placeholder="50000" data-testid="budget-max-input" />
                  </label>
                </div>
                <div className={styles.twoFields}>
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>Creators needed</span>
                    <div className={styles.stepper}>
                      <button type="button" onClick={() => updateField('creators_needed', Math.max(1, Number(formData.creators_needed) - 1))} aria-label="Remove one creator"><Minus /></button>
                      <input type="number" min="1" value={formData.creators_needed} onChange={(event) => updateField('creators_needed', Math.max(1, Number(event.target.value)))} data-testid="spots-input" />
                      <button type="button" onClick={() => updateField('creators_needed', Number(formData.creators_needed) + 1)} aria-label="Add one creator"><Plus /></button>
                    </div>
                  </div>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Application deadline</span>
                    <input className={styles.input} type="date" value={formData.deadline} onInput={(event) => updateField('deadline', event.currentTarget.value)} data-testid="deadline-input" />
                  </label>
                </div>
                <div className={styles.field}>
                  <div className={styles.deliverableHeader}>
                    <span className={styles.fieldLabel}>Deliverables</span>
                    <button type="button" onClick={addDeliverable}><Plus /> Add line</button>
                  </div>
                  <div className={styles.deliverableList}>
                    {formData.deliverables.map((deliverable, index) => (
                      <div className={styles.deliverable} key={index}>
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <input value={deliverable} onChange={(event) => updateDeliverable(index, event.target.value)} placeholder="Example: 1 edited 30-second reel" />
                        <button type="button" onClick={() => removeDeliverable(index)} aria-label={`Remove deliverable ${index + 1}`}><X /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className={styles.stepContent} data-testid="step-5">
                <div className={styles.stepHeading}>
                  <span>Final review</span>
                  <h2>Polish the public brief.</h2>
                  <p>This is the title and description creators will read before they apply.</p>
                </div>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Campaign title</span>
                  <input className={styles.input} value={formData.title} onChange={(event) => updateField('title', event.target.value)} data-testid="title-input" />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Campaign description</span>
                  <textarea className={`${styles.textarea} ${styles.descriptionTextarea}`} value={formData.description} onChange={(event) => updateField('description', event.target.value)} data-testid="description-input" />
                </label>
                <div className={styles.reviewRows}>
                  <div><span>Talent</span><strong>{formData.category} / {formData.niche || 'Lifestyle'}</strong></div>
                  <div><span>Market</span><strong>{formData.city}</strong></div>
                  <div><span>Channels</span><strong>{formData.platforms.join(', ')}</strong></div>
                  <div><span>Commercials</span><strong>{formatBudget(formData.budget_min, formData.budget_max)}</strong></div>
                </div>
              </div>
            )}
          </div>

          <footer className={styles.editorFooter}>
            <button type="button" className={styles.backAction} onClick={() => setStep((current) => Math.max(1, current - 1))} disabled={step === 1} data-testid="back-btn">
              <ChevronLeft /> Back
            </button>
            {step < 5 ? (
              <button type="button" className={styles.primaryAction} onClick={nextStep} data-testid="next-btn">
                Continue <ChevronRight />
              </button>
            ) : (
              <button type="button" className={styles.publishAction} onClick={publishCampaign} disabled={publishing} data-testid="post-job-btn">
                {publishing ? <LoaderCircle className={styles.spin} /> : <Send />} {publishing ? 'Publishing...' : 'Publish campaign'}
              </button>
            )}
          </footer>
        </section>

        <aside className={styles.preview} aria-label="Live campaign preview">
          <div className={styles.previewTopline}>
            <span>Brief receipt</span>
            <strong>JF / {String(step).padStart(2, '0')}</strong>
          </div>
          <div className={styles.previewStatus}><i /> Live preview</div>
          <h2>{formData.title || 'Your campaign title will appear here.'}</h2>
          <div className={styles.previewTags}>
            <span>{formData.category || 'Discipline'}</span>
            <span>{formData.niche || 'Niche'}</span>
            <span>{formData.city || 'Market'}</span>
          </div>
          <p className={styles.previewCopy}>{formData.description || formData.brief || 'The working campaign summary updates as you shape the brief.'}</p>
          <div className={styles.previewMetrics}>
            <div><span>Budget</span><strong>{formatBudget(formData.budget_min, formData.budget_max)}</strong></div>
            <div><span>Creators</span><strong>{formData.creators_needed}</strong></div>
            <div><span>Deadline</span><strong>{formData.deadline || 'Not set'}</strong></div>
          </div>
          <div className={styles.previewChannels}>
            <span>Channel signal</span>
            <div>{formData.platforms.length ? formData.platforms.map((platform) => <strong key={platform}>{platform}</strong>) : <small>No channels selected</small>}</div>
          </div>
          <div className={styles.previewFooter}>
            <div><span>Brief readiness</span><strong>{completion}%</strong></div>
            <div className={styles.previewTrack}><i style={{ width: `${completion}%` }} /></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
