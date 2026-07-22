'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'sonner';
import {
  ArrowRight,
  Copy,
  ExternalLink,
  FileVideo2,
  Image as ImageIcon,
  Link2,
  MapPin,
  Pencil,
  Plus,
  Share2,
  Sparkles,
  Star,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API } from '@/legacy_pages/dashboard/shared';
import styles from './CreatorWorkspace.module.css';

function listFrom(payload, key) {
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload?.[key]) ? payload[key] : [];
}

function followerCount(value) {
  const number = Number(value || 0);
  if (number >= 1_000_000) return `${(number / 1_000_000).toFixed(1)}M`;
  if (number >= 1_000) return `${(number / 1_000).toFixed(1)}K`;
  return String(number);
}

export default function CreatorPortfolioWorkspace() {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [links, setLinks] = useState([]);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [serviceEditor, setServiceEditor] = useState(null);
  const [linkEditorOpen, setLinkEditorOpen] = useState(false);
  const [linkDraft, setLinkDraft] = useState({ title: '', url: '', platform: 'other' });
  const fileInputRef = useRef(null);
  const headers = useMemo(() => token ? { Authorization: `Bearer ${token}` } : undefined, [token]);

  async function fetchPortfolio() {
    const id = user?.id;
    const [profileResult, portfolioResult, linksResult, servicesResult, reviewsResult] = await Promise.allSettled([
      axios.get(`${API}/creators/${id}`, { headers }),
      axios.get(`${API}/portfolio/${id}`, { headers }),
      axios.get(`${API}/portfolio/links/${id}`, { headers }),
      axios.get(`${API}/portfolio/services/${id}`, { headers }),
      axios.get(`${API}/reviews/${id}`, { headers }),
    ]);
    if (profileResult.status === 'fulfilled') setProfile(profileResult.value.data?.creator || profileResult.value.data);
    if (portfolioResult.status === 'fulfilled') setPortfolio(listFrom(portfolioResult.value.data, 'items'));
    if (linksResult.status === 'fulfilled') setLinks(listFrom(linksResult.value.data, 'links'));
    if (servicesResult.status === 'fulfilled') setServices(listFrom(servicesResult.value.data, 'services'));
    if (reviewsResult.status === 'fulfilled') setReviews(listFrom(reviewsResult.value.data, 'reviews'));
    setLoading(false);
  }

  useEffect(() => {
    fetchPortfolio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headers, user?.id]);

  function sharePortfolio() {
    const url = `${window.location.origin}/influencers/${user?.id}`;
    navigator.clipboard.writeText(url).then(() => toast.success('Portfolio link copied.')).catch(() => toast.error('Could not copy the portfolio link.'));
  }

  async function uploadFiles(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        await axios.post(`${API}/portfolio/upload?title=${encodeURIComponent(file.name)}`, formData, {
          headers: { ...(headers || {}), 'Content-Type': 'multipart/form-data' },
        });
      }
      toast.success(`${files.length} portfolio item${files.length === 1 ? '' : 's'} uploaded.`);
      const response = await axios.get(`${API}/portfolio/${user?.id}`, { headers });
      setPortfolio(listFrom(response.data, 'items'));
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'Upload failed.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  async function deleteItem(id) {
    try {
      await axios.delete(`${API}/portfolio/${id}`, { headers });
      setPortfolio((items) => items.filter((item) => item.id !== id));
      toast.success('Portfolio item removed.');
    } catch {
      toast.error('The item could not be removed.');
    }
  }

  async function saveService() {
    if (!serviceEditor?.name || !serviceEditor?.price) {
      toast.error('Service name and price are required.');
      return;
    }
    try {
      if (serviceEditor.id) {
        const response = await axios.put(`${API}/portfolio/services/${serviceEditor.id}`, serviceEditor, { headers });
        setServices((items) => items.map((item) => item.id === serviceEditor.id ? response.data : item));
        toast.success('Service updated.');
      } else {
        const response = await axios.post(`${API}/portfolio/services`, serviceEditor, { headers });
        setServices((items) => [response.data, ...items]);
        toast.success('Service added.');
      }
      setServiceEditor(null);
    } catch {
      toast.error('The service could not be saved.');
    }
  }

  async function deleteService(id) {
    try {
      await axios.delete(`${API}/portfolio/services/${id}`, { headers });
      setServices((items) => items.filter((item) => item.id !== id));
      toast.success('Service removed.');
    } catch {
      toast.error('The service could not be removed.');
    }
  }

  async function addLink() {
    if (!linkDraft.url.trim()) {
      toast.error('Add a valid content URL.');
      return;
    }
    try {
      const response = await axios.post(`${API}/portfolio/links`, linkDraft, { headers });
      setLinks((items) => [response.data, ...items]);
      setLinkDraft({ title: '', url: '', platform: 'other' });
      setLinkEditorOpen(false);
      toast.success('Content link added.');
    } catch {
      toast.error('The link could not be added.');
    }
  }

  async function deleteLink(id) {
    try {
      await axios.delete(`${API}/portfolio/links/${id}`, { headers });
      setLinks((items) => items.filter((item) => item.id !== id));
      toast.success('Content link removed.');
    } catch {
      toast.error('The link could not be removed.');
    }
  }

  if (loading) return <div className={styles.pageLoader}><span /><span /><span /></div>;

  const name = profile?.display_name || user?.name || 'Your creator studio';
  const initials = name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const profileImage = profile?.profile_image_url;

  return (
    <div className={styles.page} data-testid="portfolio-page">
      <header className={styles.pageHeader}>
        <div className={styles.headingGroup}><span className={styles.kicker}>Proof of work</span><h1>Your portfolio, arranged to win trust.</h1><p>Shape the public story brands see before they shortlist, message, or hire you.</p></div>
        <button type="button" className={styles.primaryButton} onClick={sharePortfolio} data-testid="share-btn"><Share2 /> Share portfolio</button>
      </header>

      <section className={styles.portfolioHero} data-testid="profile-overview">
        <div className={styles.portfolioIdentity}>
          <span className={styles.portfolioAvatar} style={profileImage ? { backgroundImage: `url(${profileImage})` } : undefined}>{!profileImage && initials}</span>
          <div><span className={styles.kicker}>Public creator profile</span><h2>{name}</h2><p><MapPin /> {profile?.city || user?.city || 'India'} <i /> {profile?.category || 'Creator'}</p><div>{(profile?.niches || []).slice(0, 4).map((niche) => <span key={niche}>{niche}</span>)}</div></div>
        </div>
        <div className={styles.portfolioStats} data-testid="key-stats">
          <div><strong>{followerCount(profile?.followers_count)}</strong><span>Audience</span></div>
          <div><strong>{Number(profile?.avg_rating || 0).toFixed(1)}</strong><span>Rating</span></div>
          <div><strong>{portfolio.length}</strong><span>Work samples</span></div>
          <div><strong>{reviews.length}</strong><span>Reviews</span></div>
        </div>
        <Link href="/dashboard/influencer/edit-profile" className={styles.heroEdit} data-testid="edit-profile-btn"><Pencil /> Edit profile</Link>
      </section>

      <div className={styles.portfolioGrid}>
        <main className={styles.portfolioMain}>
          <section className={styles.contentSection} data-testid="content-portfolio">
            <header className={styles.sectionTitle}><div><span className={styles.sectionNumber}>01</span><div><h2>Selected work</h2><p>Images and videos that make your range immediately visible.</p></div></div><input ref={fileInputRef} type="file" multiple accept="image/*,video/*" onChange={uploadFiles} hidden /><button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} data-testid="upload-btn"><Upload /> {uploading ? 'Uploading...' : 'Upload work'}</button></header>
            {portfolio.length ? (
              <div className={styles.workGrid}>
                {portfolio.map((item, index) => {
                  const imageUrl = item.type === 'image' ? `${API}/files/${item.storage_path}` : null;
                  return <article className={`${styles.workTile} ${index === 0 ? styles.workTileLead : ''}`} key={item.id} data-testid={`portfolio-item-${item.id}`} style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}><div className={styles.workFallback}>{item.type === 'image' ? <ImageIcon /> : <FileVideo2 />}</div><span>{item.title || `Work sample ${index + 1}`}</span><button type="button" onClick={() => deleteItem(item.id)} title="Remove item" data-testid={`delete-${item.id}`}><Trash2 /></button></article>;
                })}
              </div>
            ) : (
              <button type="button" className={styles.uploadEmpty} onClick={() => fileInputRef.current?.click()}><Upload /><span><strong>Build your first proof wall.</strong><small>Upload images or video from your strongest work.</small></span><ArrowRight /></button>
            )}
          </section>

          <section className={styles.contentSection} data-testid="content-links">
            <header className={styles.sectionTitle}><div><span className={styles.sectionNumber}>02</span><div><h2>Live work links</h2><p>Reels, channels, case studies, and published collaborations.</p></div></div><button type="button" onClick={() => setLinkEditorOpen(true)} data-testid="add-link-toggle"><Plus /> Add link</button></header>
            {links.length ? <div className={styles.linkList}>{links.map((link) => <article key={link.id} data-testid={`link-${link.id}`}><span><Link2 /></span><div><strong>{link.title || link.url}</strong><small>{link.platform || 'External work'}</small></div><a href={link.url} target="_blank" rel="noreferrer" aria-label="Open link"><ExternalLink /></a><button type="button" onClick={() => deleteLink(link.id)} aria-label="Delete link"><Trash2 /></button></article>)}</div> : <div className={styles.inlineEmpty}><Link2 /><div><strong>No live work linked yet.</strong><p>Add public work that brands can inspect in context.</p></div></div>}
          </section>

          <section className={styles.contentSection} data-testid="reviews-section">
            <header className={styles.sectionTitle}><div><span className={styles.sectionNumber}>03</span><div><h2>Trust history</h2><p>What previous collaborators say about the work.</p></div></div><span className={styles.reviewCount}>{reviews.length} reviews</span></header>
            {reviews.length ? <div className={styles.reviewList}>{reviews.slice(0, 4).map((review) => <article key={review.id} data-testid={`review-${review.id}`}><header><span>{(review.reviewer_name || '?').charAt(0)}</span><div><strong>{review.reviewer_name || 'Collaborator'}</strong><small>{review.reviewer_role || 'Brand'}</small></div><div>{[1, 2, 3, 4, 5].map((star) => <Star key={star} className={star <= review.rating ? styles.filledStar : ''} />)}</div></header><p>{review.comment}</p></article>)}</div> : <div className={styles.inlineEmpty}><Star /><div><strong>Your trust history starts with completed work.</strong><p>Reviews will appear here after a collaboration closes.</p></div></div>}
          </section>
        </main>

        <aside className={styles.portfolioSide}>
          <section className={styles.servicePanel} data-testid="services-section">
            <header><div><span className={styles.kicker}>Offer menu</span><h2>Services and pricing</h2></div><button type="button" onClick={() => setServiceEditor({ name: '', price: '', description: '' })} data-testid="add-service-toggle"><Plus /></button></header>
            {services.length ? <div className={styles.serviceList}>{services.map((service) => <article key={service.id} data-testid={`service-${service.id}`}><div><strong>{service.name}</strong><p>{service.description || 'Creator service'}</p></div><span>{service.price}</span><button type="button" onClick={() => setServiceEditor({ ...service })} title="Edit service" data-testid={`edit-service-${service.id}`}><Pencil /></button><button type="button" onClick={() => deleteService(service.id)} title="Delete service" data-testid={`delete-service-${service.id}`}><Trash2 /></button></article>)}</div> : <div className={styles.serviceEmpty}><Sparkles /><h3>Package your strongest work.</h3><p>Add clear services so brands know where to begin.</p><button type="button" onClick={() => setServiceEditor({ name: '', price: '', description: '' })}>Add first service</button></div>}
          </section>
          <section className={styles.sharePanel}><Copy /><span className={styles.kicker}>Public link</span><h2>One portfolio. Ready to send.</h2><p>Share the public version in pitches, email, or your social bio.</p><button type="button" onClick={sharePortfolio} data-testid="share-portfolio-btn">Copy portfolio link <ArrowRight /></button></section>
        </aside>
      </div>

      {serviceEditor && (
        <div className={styles.modalBackdrop} onClick={() => setServiceEditor(null)}>
          <div className={styles.editorModal} onClick={(event) => event.stopPropagation()} data-testid={serviceEditor.id ? 'edit-service-form' : 'add-service-form'}>
            <header><div><span className={styles.kicker}>Offer menu</span><h2>{serviceEditor.id ? 'Edit service' : 'Add a service'}</h2></div><button type="button" onClick={() => setServiceEditor(null)}><X /></button></header>
            <label className={styles.fieldLabel}>Service name<input value={serviceEditor.name} onChange={(event) => setServiceEditor({ ...serviceEditor, name: event.target.value })} placeholder="Instagram reel" data-testid="service-name-input" /></label>
            <label className={styles.fieldLabel}>Price or range<input value={serviceEditor.price} onChange={(event) => setServiceEditor({ ...serviceEditor, price: event.target.value })} placeholder="Rs.12,000" data-testid="service-price-input" /></label>
            <label className={styles.fieldLabel}>Short description<textarea value={serviceEditor.description || ''} onChange={(event) => setServiceEditor({ ...serviceEditor, description: event.target.value })} placeholder="What the brand receives" data-testid="service-desc-input" /></label>
            <button type="button" className={styles.modalSubmit} onClick={saveService} data-testid={serviceEditor.id ? 'update-service-btn' : 'save-service-btn'}>Save service <ArrowRight /></button>
          </div>
        </div>
      )}

      {linkEditorOpen && (
        <div className={styles.modalBackdrop} onClick={() => setLinkEditorOpen(false)}>
          <div className={styles.editorModal} onClick={(event) => event.stopPropagation()}>
            <header><div><span className={styles.kicker}>Live proof</span><h2>Add a work link</h2></div><button type="button" onClick={() => setLinkEditorOpen(false)}><X /></button></header>
            <label className={styles.fieldLabel}>Title<input value={linkDraft.title} onChange={(event) => setLinkDraft({ ...linkDraft, title: event.target.value })} placeholder="Campaign or content title" /></label>
            <label className={styles.fieldLabel}>URL<input value={linkDraft.url} onChange={(event) => setLinkDraft({ ...linkDraft, url: event.target.value })} placeholder="https://" /></label>
            <label className={styles.fieldLabel}>Platform<select value={linkDraft.platform} onChange={(event) => setLinkDraft({ ...linkDraft, platform: event.target.value })}><option value="instagram">Instagram</option><option value="youtube">YouTube</option><option value="behance">Behance</option><option value="website">Website</option><option value="other">Other</option></select></label>
            <button type="button" className={styles.modalSubmit} onClick={addLink}>Add link <ArrowRight /></button>
          </div>
        </div>
      )}
    </div>
  );
}
