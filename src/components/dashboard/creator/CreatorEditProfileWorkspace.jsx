'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, AtSign, Check, Save, Sparkles, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API, CATEGORIES, NICHES, PLATFORMS } from '@/legacy_pages/dashboard/shared';
import styles from './CreatorWorkspace.module.css';

const emptyForm = {
  display_name: '',
  category: '',
  bio: '',
  niches: [],
  platforms: [],
  portfolio_links: [],
  instagram_handle: '',
  youtube_handle: '',
  followers_count: 0,
  hourly_rate: 0,
  profile_image_url: '',
};

export default function CreatorEditProfileWorkspace() {
  const router = useRouter();
  const { token } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    axios.get(`${API}/creators/profile`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }).then((response) => {
      if (!active) return;
      const profile = response.data || {};
      setForm({
        ...emptyForm,
        ...profile,
        niches: profile.niches || [],
        platforms: profile.platforms || [],
        portfolio_links: profile.portfolio_links || [],
      });
    }).catch(() => toast.error('The profile could not be loaded.')).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [token]);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleItem(field, value) {
    setForm((current) => ({
      ...current,
      [field]: current[field].includes(value)
        ? current[field].filter((item) => item !== value)
        : [...current[field], value],
    }));
  }

  async function saveProfile(event) {
    event.preventDefault();
    if (!form.display_name.trim() || !form.category || !form.bio.trim()) {
      toast.error('Display name, category, and bio are required.');
      return;
    }
    setSaving(true);
    try {
      await axios.put(
        `${API}/creators/profile`,
        {
          ...form,
          followers_count: Number.parseInt(form.followers_count, 10) || 0,
          hourly_rate: Number.parseFloat(form.hourly_rate) || 0,
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
      );
      toast.success('Creator profile updated.');
      router.push('/dashboard/influencer/profile');
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'The profile could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className={styles.pageLoader}><span /><span /><span /></div>;

  const completed = [form.display_name, form.category, form.bio, form.niches.length, form.platforms.length, form.followers_count].filter(Boolean).length;
  const readiness = Math.round((completed / 6) * 100);

  return (
    <div className={styles.page} data-testid="creator-edit-profile-workspace">
      <header className={styles.editHeader}>
        <Link href="/dashboard/influencer/profile" aria-label="Back to profile" data-testid="back-btn"><ArrowLeft /></Link>
        <div className={styles.headingGroup}><span className={styles.kicker}>Creator identity</span><h1>Shape how brands understand your work.</h1><p>Keep your positioning specific, current, and easy to shortlist.</p></div>
        <div className={styles.readinessBadge}><span>{readiness}%</span><small>Profile ready</small></div>
      </header>

      <form className={styles.editGrid} onSubmit={saveProfile}>
        <main className={styles.editMain}>
          <section className={styles.formSection}>
            <header><span className={styles.sectionNumber}>01</span><div><h2>Core identity</h2><p>The first information brands scan.</p></div></header>
            <div className={styles.formFields}>
              <label className={styles.fieldLabel}>Display name<input value={form.display_name} onChange={(event) => setField('display_name', event.target.value)} placeholder="Your public creator name" data-testid="edit-display-name" /></label>
              <label className={styles.fieldLabel}>Creator category<select value={form.category} onChange={(event) => setField('category', event.target.value)} data-testid="edit-category"><option value="">Select a category</option>{CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
              <label className={styles.fieldLabel}>Short bio<textarea value={form.bio} onChange={(event) => setField('bio', event.target.value)} placeholder="What do you create, for whom, and what makes the work distinct?" data-testid="edit-bio" /></label>
            </div>
          </section>

          <section className={styles.formSection}>
            <header><span className={styles.sectionNumber}>02</span><div><h2>Niche and channel fit</h2><p>Choose the signals that improve relevant matching.</p></div></header>
            <div className={styles.optionGroup}><small>Platforms</small><div>{PLATFORMS.map((platform) => <button type="button" key={platform} onClick={() => toggleItem('platforms', platform)} className={form.platforms.includes(platform) ? styles.optionActive : ''} data-testid={`platform-${platform}`}>{form.platforms.includes(platform) && <Check />}{platform}</button>)}</div></div>
            <div className={styles.optionGroup}><small>Niches</small><div>{NICHES.map((niche) => <button type="button" key={niche} onClick={() => toggleItem('niches', niche)} className={form.niches.includes(niche) ? styles.optionActive : ''} data-testid={`niche-${niche}`}>{form.niches.includes(niche) && <Check />}{niche}</button>)}</div></div>
          </section>

          <section className={styles.formSection}>
            <header><span className={styles.sectionNumber}>03</span><div><h2>Commercial details</h2><p>Audience, rate, and social handles.</p></div></header>
            <div className={styles.twoFields}>
              <label className={styles.fieldLabel}>Followers<span className={styles.inputIcon}><Users /></span><input type="number" min="0" value={form.followers_count} onChange={(event) => setField('followers_count', event.target.value)} data-testid="edit-followers" /></label>
              <label className={styles.fieldLabel}>Base rate (Rs./day)<span className={styles.inputPrefix}>Rs.</span><input type="number" min="0" value={form.hourly_rate} onChange={(event) => setField('hourly_rate', event.target.value)} data-testid="edit-rate" /></label>
              <label className={styles.fieldLabel}>Instagram<span className={styles.inputIcon}><AtSign /></span><input value={form.instagram_handle} onChange={(event) => setField('instagram_handle', event.target.value)} placeholder="handle" data-testid="edit-instagram" /></label>
              <label className={styles.fieldLabel}>YouTube<span className={styles.inputIcon}><AtSign /></span><input value={form.youtube_handle} onChange={(event) => setField('youtube_handle', event.target.value)} placeholder="channel" data-testid="edit-youtube" /></label>
            </div>
          </section>
        </main>

        <aside className={styles.editAside}>
          <section className={styles.editPreview}><Sparkles /><span className={styles.kicker}>Live positioning</span><h2>{form.display_name || 'Your creator name'}</h2><p>{form.bio || 'Your bio preview will appear here as you write.'}</p><div>{form.niches.slice(0, 4).map((niche) => <span key={niche}>{niche}</span>)}</div></section>
          <div className={styles.savePanel}><p>Changes update your public profile and future brief matching.</p><button type="submit" disabled={saving} data-testid="save-profile-btn"><Save /> {saving ? 'Saving...' : 'Save profile'} <ArrowRight /></button></div>
        </aside>
      </form>
    </div>
  );
}
